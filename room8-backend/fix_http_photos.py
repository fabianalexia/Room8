#!/usr/bin/env python3
"""
Migration: nullify any user photo URLs that start with http://room8
(non-HTTPS Render upload URLs) so the frontend falls back to the default avatar.
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

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor(cursor_factory=RealDictCursor)

# Find affected rows first
cur.execute("""
    SELECT id, email, photo FROM users
    WHERE photo LIKE 'http://room8%'
""")
affected = cur.fetchall()
print(f"=== Users with http:// Render photo URLs: {len(affected)} ===")
for row in affected:
    print(f"  id={row['id']}  email={row['email']}  photo={row['photo']}")

if not affected:
    print("Nothing to fix.")
    cur.close()
    conn.close()
    sys.exit(0)

# Nullify them
cur.execute("""
    UPDATE users SET photo = NULL
    WHERE photo LIKE 'http://room8%'
""")
print(f"\nUpdated {cur.rowcount} row(s) — photo set to NULL.")
conn.commit()

# Verify
cur.execute("""
    SELECT id, email, photo FROM users
    WHERE id = ANY(%s)
""", ([row["id"] for row in affected],))
print("\n=== Verification ===")
for row in cur.fetchall():
    print(f"  id={row['id']}  email={row['email']}  photo={row['photo']}")

cur.close()
conn.close()
print("\nDone.")
