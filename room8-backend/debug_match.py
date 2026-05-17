#!/usr/bin/env python3
"""
Debug script: prints all swipe and match records involving
lilla@demo.com and alexia.fabian@evergreen.edu.
Connects to the production DB via DATABASE_URL env var.
"""

import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    print("ERROR: DATABASE_URL env var not set")
    sys.exit(1)

# Render uses postgres:// but psycopg2 needs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor(cursor_factory=RealDictCursor)

EMAILS = ["lilla@demo.com", "alexia.fabian@evergreen.edu"]

# ── 1. Look up user IDs ────────────────────────────────────────────────────────
cur.execute("SELECT id, email FROM users WHERE email = ANY(%s)", (EMAILS,))
users = {row["email"]: row["id"] for row in cur.fetchall()}
print("=== Users ===")
for email, uid in users.items():
    print(f"  {email} → id={uid}")

if len(users) < 2:
    missing = [e for e in EMAILS if e not in users]
    print(f"\nWARNING: could not find user(s): {missing}")
    sys.exit(1)

lilla_id = users["lilla@demo.com"]
alexia_id = users["alexia.fabian@evergreen.edu"]

# ── 2. All swipes involving either user ───────────────────────────────────────
cur.execute("""
    SELECT s.id, u1.email AS swiped_by, u2.email AS target, s.action, s.created_at
    FROM swipes s
    JOIN users u1 ON u1.id = s.user_id
    JOIN users u2 ON u2.id = s.target_id
    WHERE s.user_id IN (%s, %s) OR s.target_id IN (%s, %s)
    ORDER BY s.created_at
""", (lilla_id, alexia_id, lilla_id, alexia_id))
swipes = cur.fetchall()
print(f"\n=== All swipes involving these users ({len(swipes)} rows) ===")
for row in swipes:
    print(f"  [{row['id']}] {row['swiped_by']} → {row['target']}  action={row['action']}  at={row['created_at']}")

# ── 3. Mutual likes (i.e. matches) between the two ────────────────────────────
cur.execute("""
    SELECT COUNT(*) AS cnt FROM swipes
    WHERE user_id = %s AND target_id = %s AND action = 'like'
""", (lilla_id, alexia_id))
lilla_liked_alexia = cur.fetchone()["cnt"]

cur.execute("""
    SELECT COUNT(*) AS cnt FROM swipes
    WHERE user_id = %s AND target_id = %s AND action = 'like'
""", (alexia_id, lilla_id))
alexia_liked_lilla = cur.fetchone()["cnt"]

print(f"\n=== Match status ===")
print(f"  lilla liked alexia : {bool(lilla_liked_alexia)}  (rows: {lilla_liked_alexia})")
print(f"  alexia liked lilla : {bool(alexia_liked_lilla)}  (rows: {alexia_liked_lilla})")
is_match = bool(lilla_liked_alexia) and bool(alexia_liked_lilla)
print(f"  mutual match       : {is_match}")

# ── 4. Insert missing swipe records if needed ─────────────────────────────────
if not is_match:
    print("\n=== Inserting missing swipe record(s) ===")

    if not lilla_liked_alexia:
        cur.execute("""
            INSERT INTO swipes (user_id, target_id, action, created_at)
            VALUES (%s, %s, 'like', NOW())
            ON CONFLICT DO NOTHING
        """, (lilla_id, alexia_id))
        print(f"  Inserted: lilla ({lilla_id}) liked alexia ({alexia_id})")

    if not alexia_liked_lilla:
        cur.execute("""
            INSERT INTO swipes (user_id, target_id, action, created_at)
            VALUES (%s, %s, 'like', NOW())
            ON CONFLICT DO NOTHING
        """, (alexia_id, lilla_id))
        print(f"  Inserted: alexia ({alexia_id}) liked lilla ({lilla_id})")

    conn.commit()
    print("  Committed.")

    # Verify
    cur.execute("""
        SELECT s.id, u1.email AS swiped_by, u2.email AS target, s.action
        FROM swipes s
        JOIN users u1 ON u1.id = s.user_id
        JOIN users u2 ON u2.id = s.target_id
        WHERE (s.user_id = %s AND s.target_id = %s)
           OR (s.user_id = %s AND s.target_id = %s)
    """, (lilla_id, alexia_id, alexia_id, lilla_id))
    print("\n=== Verification — swipes between the two users ===")
    for row in cur.fetchall():
        print(f"  [{row['id']}] {row['swiped_by']} → {row['target']}  action={row['action']}")
else:
    print("\nMatch already exists — no inserts needed.")

cur.close()
conn.close()
