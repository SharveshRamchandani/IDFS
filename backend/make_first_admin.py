import sqlite3

# Connect to database
conn = sqlite3.connect('idfs_development.db')
cursor = conn.cursor()

# Get all users
cursor.execute("SELECT id, email, role FROM user")
users = cursor.fetchall()

print("\n=== Current Users ===")
for user in users:
    print(f"ID: {user[0]}, Email: {user[1]}, Role: {user[2]}")

if users:
    # Make first user admin
    first_user_id = users[0][0]
    cursor.execute("UPDATE user SET role = 'admin' WHERE id = ?", (first_user_id,))
    conn.commit()
    print(f"\n✅ Made user ID {first_user_id} ({users[0][1]}) an ADMIN!")
else:
    print("\n❌ No users found. Sign up first!")

conn.close()
