import os
import psycopg
from dotenv import load_dotenv


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()


# =========================================================
# DATABASE CONNECTION
# =========================================================

def get_connection():

    connection = psycopg.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )

    return connection


# =========================================================
# CREATE TABLES
# =========================================================

def create_tables():

    connection = get_connection()
    cursor = connection.cursor()

    # -----------------------------------------------------
    # USERS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # -----------------------------------------------------
    # DOCUMENTS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            filename VARCHAR(255) NOT NULL,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        );
    """)

    # -----------------------------------------------------
    # QUIZ ATTEMPTS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_attempts (
            id SERIAL PRIMARY KEY,

            user_id INTEGER NOT NULL,
            document_id INTEGER NOT NULL,

            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,

            attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE,

            FOREIGN KEY (document_id)
                REFERENCES documents(id)
                ON DELETE CASCADE
        );
    """)

    # -----------------------------------------------------
    # QUIZ ANSWERS
    # -----------------------------------------------------

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quiz_answers (
            id SERIAL PRIMARY KEY,

            attempt_id INTEGER NOT NULL,
            topic VARCHAR(255) NOT NULL,
            is_correct BOOLEAN NOT NULL,

            FOREIGN KEY (attempt_id)
                REFERENCES quiz_attempts(id)
                ON DELETE CASCADE
        );
    """)

    connection.commit()

    cursor.close()
    connection.close()


# =========================================================
# REGISTER USER
# =========================================================

def register_user(name, email, password_hash):

    connection = get_connection()
    cursor = connection.cursor()

    try:

        cursor.execute(
            """
            INSERT INTO users
                (name, email, password_hash)
            VALUES
                (%s, %s, %s)
            RETURNING id;
            """,
            (
                name,
                email,
                password_hash
            )
        )

        user_id = cursor.fetchone()[0]

        connection.commit()

        return user_id

    except psycopg.errors.UniqueViolation:

        connection.rollback()

        return None

    finally:

        cursor.close()
        connection.close()


# =========================================================
# GET USER BY EMAIL
# =========================================================

def get_user_by_email(email):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            name,
            email,
            password_hash
        FROM users
        WHERE email = %s;
        """,
        (email,)
    )

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    return user


# =========================================================
# GET USER BY ID
# =========================================================

def get_user_by_id(user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            name,
            email,
            password_hash,
            created_at
        FROM users
        WHERE id = %s;
        """,
        (user_id,)
    )

    user = cursor.fetchone()

    cursor.close()
    connection.close()

    return user


# =========================================================
# UPDATE USER PASSWORD
# =========================================================

def update_user_password(user_id, new_password_hash):

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s
            WHERE id = %s;
            """,
            (
                new_password_hash,
                user_id
            )
        )

        updated = cursor.rowcount > 0
        connection.commit()

        return updated

    except Exception:
        connection.rollback()
        raise

    finally:
        cursor.close()
        connection.close()


# =========================================================
# SAVE DOCUMENT
# =========================================================

def save_document(user_id, filename):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO documents
            (user_id, filename)
        VALUES
            (%s, %s)
        RETURNING id;
        """,
        (
            user_id,
            filename
        )
    )

    document_id = cursor.fetchone()[0]

    connection.commit()

    cursor.close()
    connection.close()

    return document_id


# =========================================================
# GET USER DOCUMENTS
# =========================================================

def get_user_documents(user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            user_id,
            filename,
            uploaded_at
        FROM documents
        WHERE user_id = %s
        ORDER BY uploaded_at DESC;
        """,
        (user_id,)
    )

    documents = cursor.fetchall()

    cursor.close()
    connection.close()

    return documents


# =========================================================
# GET DOCUMENT BY ID
# =========================================================

def get_document_by_id(document_id, user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            user_id,
            filename,
            uploaded_at
        FROM documents
        WHERE id = %s
          AND user_id = %s;
        """,
        (
            document_id,
            user_id
        )
    )

    document = cursor.fetchone()

    cursor.close()
    connection.close()

    return document


# =========================================================
# DELETE DOCUMENT
# =========================================================

def delete_document(document_id, user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM documents
        WHERE id = %s
          AND user_id = %s
        RETURNING id;
        """,
        (
            document_id,
            user_id
        )
    )

    deleted = cursor.fetchone()

    connection.commit()

    cursor.close()
    connection.close()

    return deleted is not None


# =========================================================
# SAVE QUIZ ATTEMPT
# =========================================================

def save_quiz_attempt(
    user_id,
    document_id,
    score,
    total_questions
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO quiz_attempts
            (
                user_id,
                document_id,
                score,
                total_questions
            )
        VALUES
            (%s, %s, %s, %s)
        RETURNING id;
        """,
        (
            user_id,
            document_id,
            score,
            total_questions
        )
    )

    attempt_id = cursor.fetchone()[0]

    connection.commit()

    cursor.close()
    connection.close()

    return attempt_id


# =========================================================
# SAVE QUIZ ANSWER
# =========================================================

def save_quiz_answer(
    attempt_id,
    topic,
    is_correct
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO quiz_answers
            (
                attempt_id,
                topic,
                is_correct
            )
        VALUES
            (%s, %s, %s);
        """,
        (
            attempt_id,
            topic,
            is_correct
        )
    )

    connection.commit()

    cursor.close()
    connection.close()


# =========================================================
# GET TOPIC PERFORMANCE
# =========================================================

def get_topic_performance(user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            qa.topic,
            COUNT(*) AS attempted,
            COUNT(*) FILTER (
                WHERE qa.is_correct = TRUE
            ) AS correct
        FROM quiz_answers qa

        JOIN quiz_attempts q
            ON qa.attempt_id = q.id

        WHERE q.user_id = %s

        GROUP BY qa.topic

        ORDER BY qa.topic;
        """,
        (user_id,)
    )

    performance = cursor.fetchall()

    cursor.close()
    connection.close()

    return performance


# =========================================================
# GET QUIZ HISTORY
# =========================================================

def get_quiz_history(user_id):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            q.id,
            d.filename,
            q.score,
            q.total_questions,
            q.attempted_at

        FROM quiz_attempts q

        JOIN documents d
            ON q.document_id = d.id

        WHERE q.user_id = %s

        ORDER BY q.attempted_at DESC;
        """,
        (user_id,)
    )

    history = cursor.fetchall()

    cursor.close()
    connection.close()

    return history


# =========================================================
# GET WEAK TOPICS
# =========================================================

def get_weak_topics(
    user_id,
    min_attempts=3,
    threshold=60
):

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            qa.topic,
            COUNT(*) AS attempted,

            COUNT(*) FILTER (
                WHERE qa.is_correct = TRUE
            ) AS correct

        FROM quiz_answers qa

        JOIN quiz_attempts q
            ON qa.attempt_id = q.id

        WHERE q.user_id = %s

        GROUP BY qa.topic

        HAVING COUNT(*) >= %s

           AND (
                COUNT(*) FILTER (
                    WHERE qa.is_correct = TRUE
                ) * 100.0 / COUNT(*)
           ) < %s

        ORDER BY
            (
                COUNT(*) FILTER (
                    WHERE qa.is_correct = TRUE
                ) * 100.0 / COUNT(*)
            ) ASC;
        """,
        (
            user_id,
            min_attempts,
            threshold
        )
    )

    weak_topics = cursor.fetchall()

    cursor.close()
    connection.close()

    return weak_topics