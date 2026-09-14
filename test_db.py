from utils.database import get_connection

connection = get_connection()
cursor = connection.cursor()

cursor.execute("SELECT current_database();")

database = cursor.fetchone()

print("Connected database:", database[0])

cursor.close()
connection.close()

from utils.database import create_tables

create_tables()

print("Tables created successfully!")

from utils.database import register_user
from utils.auth import hash_password


name = "Test User"
email = "test@example.com"
password = "hello123"

password_hash = hash_password(password)

user_id = register_user(
    name,
    email,
    password_hash
)

if user_id is None:
    print("Email already registered.")
else:
    print("User registered successfully!")
    print("User ID:", user_id)


from utils.auth import login_user


email = "test2222@example.com"
password = "wrongpassword"

user = login_user(email, password)

if user:
    print("Login successful!")
    print("User ID:", user[0])
    print("Name:", user[1])
    print("Email:", user[2])

else:
    print("Invalid email or password.")

from utils.database import save_document

document_id = save_document(
    1,
    "test.pdf"
)

print("Document saved!")
print("Document ID:", document_id)

from utils.database import get_quiz_history

history = get_quiz_history(5)

for attempt in history:
    print(attempt)

from utils.database import get_topic_performance

performance = get_topic_performance(5)

for row in performance:
    print(row)