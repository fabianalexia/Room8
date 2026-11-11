# moderation.py: minimal objectionable-content filter for user text.
# Blocks severe slurs and direct threats; ordinary swearing is allowed.
import re

# Kept deliberately short and severe. Matched as whole words, case-insensitive,
# with simple character substitutions undone first.
_BLOCKED_WORDS = {
    "nigger", "nigga", "faggot", "fag", "retard", "tranny", "chink", "spic",
    "kike", "wetback", "beaner", "coon", "dyke", "gook", "raghead", "towelhead",
}
_BLOCKED_PHRASES = [
    r"\bkill\s+yourself\b", r"\bkys\b", r"\bi\s*(?:'|wi)?ll\s+kill\s+you\b", r"\bgo\s+die\b",
]
_SUBS = str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i"})


def is_objectionable(text: str | None) -> bool:
    if not text:
        return False
    norm = text.lower().translate(_SUBS)
    words = set(re.findall(r"[a-z]+", norm))
    if words & _BLOCKED_WORDS:
        return True
    return any(re.search(p, norm) for p in _BLOCKED_PHRASES)


BLOCKED_MESSAGE = "That message breaks Room8's community rules and wasn't sent."
