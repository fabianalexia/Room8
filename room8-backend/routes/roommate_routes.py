import os
from datetime import datetime

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_mail import Message as MailMessage

from extensions import mail
from room8_models import db
from room8_models.user import User
from room8_models.swipe import Swipe
from room8_models.roommate_confirmation import RoommateConfirmation
from room8_models.notification import Notification

roommate_bp = Blueprint("roommate", __name__, url_prefix="/api/roommate")

PARTNER_EMAIL = os.environ.get("HOUSING_OFFICE_EMAIL", "partner@swiperoom8.com")

SCHOOL_HOUSING_EMAILS = {
    "Whitman College": "on_campus_housing@whitman.edu",
    "Evergreen State College": "rad@evergreen.edu",
    "Columbia Basin College": "mrogers@columbiabasin.edu",
    "Yakima Valley College": "src@yvcc.edu",
    "Big Bend Community College": "housing@bigbend.edu",
}


# ── helpers ────────────────────────────────────────────────────────────────────

def _pair(a, b):
    """Return (smaller_id, larger_id) for consistent DB key ordering."""
    return (min(a, b), max(a, b))


def _is_matched(uid, pid):
    a_likes_b = Swipe.query.filter_by(user_id=uid, target_id=pid, action="like").first()
    b_likes_a = Swipe.query.filter_by(user_id=pid, target_id=uid, action="like").first()
    return bool(a_likes_b and b_likes_a)


def _upsert_notification(user_id, from_user_id, notif_type):
    """Create or update a notification, avoiding duplicates."""
    existing = Notification.query.filter_by(
        user_id=user_id, from_user_id=from_user_id
    ).first()
    if existing:
        existing.type = notif_type
        existing.read = False
        existing.created_at = datetime.utcnow()
    else:
        db.session.add(Notification(
            user_id=user_id,
            from_user_id=from_user_id,
            type=notif_type,
        ))


# ── routes ─────────────────────────────────────────────────────────────────────

@roommate_bp.route("/status/<int:peer_id>", methods=["GET"])
@jwt_required()
def get_status(peer_id):
    user_id = int(get_jwt_identity())
    a_id, b_id = _pair(user_id, peer_id)
    rec = RoommateConfirmation.query.filter_by(user_a_id=a_id, user_b_id=b_id).first()

    if not rec:
        return jsonify({
            "status": "none",
            "i_confirmed": False,
            "they_confirmed": False,
            "both_confirmed": False,
            "confirmed_at": None,
        })

    i_am_a = (user_id == a_id)
    i_confirmed    = rec.a_confirmed if i_am_a else rec.b_confirmed
    they_confirmed = rec.b_confirmed if i_am_a else rec.a_confirmed

    return jsonify({
        "status": "confirmed" if rec.is_confirmed else "pending",
        "i_confirmed":    i_confirmed,
        "they_confirmed": they_confirmed,
        "both_confirmed": rec.is_confirmed,
        "confirmed_at":   rec.confirmed_at.isoformat() if rec.confirmed_at else None,
    })


@roommate_bp.route("/confirm/<int:peer_id>", methods=["POST"])
@jwt_required()
def confirm_roommate(peer_id):
    user_id = int(get_jwt_identity())

    if user_id == peer_id:
        return jsonify({"error": "Cannot confirm yourself"}), 400

    if not _is_matched(user_id, peer_id):
        return jsonify({"error": "You must be matched to confirm as roommates"}), 403

    user = db.session.get(User, user_id)
    peer = db.session.get(User, peer_id)
    if not user or not peer:
        return jsonify({"error": "User not found"}), 404

    a_id, b_id = _pair(user_id, peer_id)
    i_am_a = (user_id == a_id)

    rec = RoommateConfirmation.query.filter_by(user_a_id=a_id, user_b_id=b_id).first()
    if not rec:
        rec = RoommateConfirmation(user_a_id=a_id, user_b_id=b_id)
        db.session.add(rec)

    # Mark this user's side confirmed
    if i_am_a:
        rec.a_confirmed = True
    else:
        rec.b_confirmed = True

    just_completed = rec.a_confirmed and rec.b_confirmed
    if just_completed and not rec.confirmed_at:
        rec.confirmed_at = datetime.utcnow()

    db.session.flush()  # get rec.id before notifications

    # Notifications
    if just_completed:
        # Both sides get a "roommate_confirmed" notification
        _upsert_notification(peer_id,  user_id, "roommate_confirmed")
        _upsert_notification(user_id,  peer_id, "roommate_confirmed")
    else:
        # Only send request notification to peer (don't create one for self)
        _upsert_notification(peer_id, user_id, "roommate_request")

    db.session.commit()

    # Email housing office when both confirm
    if just_completed:
        _send_housing_email(user, peer, rec.confirmed_at)

    i_confirmed    = rec.a_confirmed if i_am_a else rec.b_confirmed
    they_confirmed = rec.b_confirmed if i_am_a else rec.a_confirmed

    return jsonify({
        "ok": True,
        "i_confirmed":    i_confirmed,
        "they_confirmed": they_confirmed,
        "both_confirmed": just_completed,
    })


# ── notifications ───────────────────────────────────────────────────────────────

@roommate_bp.route("/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs = (
        Notification.query
        .filter_by(user_id=user_id)
        .order_by(Notification.created_at.desc())
        .limit(30)
        .all()
    )

    result = []
    for n in notifs:
        sender = db.session.get(User, n.from_user_id)
        result.append({
            "id":           n.id,
            "type":         n.type,
            "from_user_id": n.from_user_id,
            "from_name":    f"{sender.first_name or ''} {sender.last_name or ''}".strip() if sender else "Someone",
            "from_photo":   sender.photo if sender else None,
            "read":         n.read,
            "created_at":   n.created_at.isoformat(),
        })

    return jsonify(result)


@roommate_bp.route("/notifications/<int:notif_id>/read", methods=["POST"])
@jwt_required()
def mark_read(notif_id):
    user_id = int(get_jwt_identity())
    notif = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Not found"}), 404
    notif.read = True
    db.session.commit()
    return jsonify({"ok": True})


# ── email ───────────────────────────────────────────────────────────────────────

def _profile_rows(u):
    dorm = u.get_dorm_prefs() if hasattr(u, "get_dorm_prefs") else {}
    dorm_str = ", ".join(f"{k}: {v}" for k, v in dorm.items()) if dorm else "—"
    return f"""
    <tr>
      <td colspan="2" style="padding:14px 0 6px;font-weight:700;color:#0F2D5E;
          font-size:1rem;border-top:2px solid #e5e7eb;">
        {u.first_name or ''} {u.last_name or ''}
      </td>
    </tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;width:140px;">Email</td>
        <td style="padding:4px 0;">{u.email}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">School</td>
        <td style="padding:4px 0;">{u.school or '—'}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Class Year</td>
        <td style="padding:4px 0;">{u.class_year or '—'}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Major</td>
        <td style="padding:4px 0;">{u.major or '—'}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Budget</td>
        <td style="padding:4px 0;">{u.budget or '—'}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Housing Type</td>
        <td style="padding:4px 0;">{u.housing_type or '—'}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Room Type</td>
        <td style="padding:4px 0;">{u.room_type or '—'}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Lifestyle Prefs</td>
        <td style="padding:4px 0;">{dorm_str}</td></tr>
    <tr><td style="padding:4px 16px 4px 0;color:#6b7280;">Bio</td>
        <td style="padding:4px 0;">{u.bio or '—'}</td></tr>
    """


def _send_housing_email(user_a, user_b, confirmed_at):
    date_str = confirmed_at.strftime("%B %d, %Y at %I:%M %p UTC") if confirmed_at else "N/A"
    html = f"""
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:620px;
                margin:0 auto;padding:0;background:#ffffff;">
      <!-- Header -->
      <div style="background:#0F2D5E;padding:28px 32px;border-radius:12px 12px 0 0;text-align:center;">
        <div style="color:#F59E0B;font-size:1.6rem;font-weight:800;letter-spacing:-0.025em;">Room8</div>
        <div style="color:rgba(255,255,255,0.75);font-size:0.9rem;margin-top:6px;">
          Confirmed Roommate Pair
        </div>
      </div>
      <!-- Body -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;
                  border-radius:0 0 12px 12px;padding:32px;">
        <p style="color:#111827;font-size:0.95rem;margin:0 0 6px;line-height:1.7;">
          The following two students mutually confirmed each other as roommates on
          <strong>Room8</strong>.
        </p>
        <p style="color:#6b7280;font-size:0.85rem;margin:0 0 24px;">
          Confirmed on: <strong style="color:#111827;">{date_str}</strong>
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:0.88rem;color:#374151;">
          {_profile_rows(user_a)}
          {_profile_rows(user_b)}
        </table>
        <p style="color:#9ca3af;font-size:0.78rem;margin:28px 0 0;line-height:1.6;
                  border-top:1px solid #e5e7eb;padding-top:16px;">
          This email was automatically generated by Room8 (findroom8.com).
          No action is required — this is for your records.
        </p>
      </div>
    </div>
    """
    # Determine recipient: use school-specific housing email if available,
    # otherwise fall back to the partner email.
    school = (user_a.school or user_b.school or "").strip()
    school_email = SCHOOL_HOUSING_EMAILS.get(school)

    if school_email:
        recipients = [school_email]
        cc = [PARTNER_EMAIL]
    else:
        recipients = [PARTNER_EMAIL]
        cc = []

    try:
        msg = MailMessage(
            subject=(
                f"Confirmed Roommate Pair: "
                f"{user_a.first_name} {user_a.last_name} & "
                f"{user_b.first_name} {user_b.last_name}"
            ),
            recipients=recipients,
            cc=cc,
            html=html,
        )
        mail.send(msg)
    except Exception as e:
        print(f"[mail] housing office email failed: {e}")
