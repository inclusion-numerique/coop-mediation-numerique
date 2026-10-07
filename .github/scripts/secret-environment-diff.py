import json
import sys

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

plan = json.load(open(sys.argv[1]))
hasher = PasswordHasher()


def matches(value, stored):
    if not isinstance(stored, str) or not stored.startswith("$argon2"):
        return value == stored
    try:
        return hasher.verify(stored, value or "")
    except (VerificationError, InvalidHashError):
        return False


for change in plan.get("resource_changes", []):
    if change["change"]["actions"] == ["no-op"]:
        continue
    before = (change["change"].get("before") or {}).get("secret_environment_variables") or {}
    after = (change["change"].get("after") or {}).get("secret_environment_variables") or {}
    print(
        change["address"],
        "avant :", {k: (type(v).__name__, str(v)[:9] if isinstance(v, str) and v.startswith("$") else len(str(v))) for k, v in before.items()},
        "après :", {k: type(v).__name__ for k, v in after.items()},
        "inconnues :", (change["change"].get("after_unknown") or {}).get("secret_environment_variables"),
    )
    for key in sorted(set(before) | set(after)):
        if key not in before or key not in after or not matches(after[key], before[key]):
            print(f"{change['address']} : la variable secrète {key} change")
