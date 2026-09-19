import os
import json 
import faiss

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from utils.database import (
    create_tables,
    register_user,
    get_user_by_email,
    get_user_by_id,
    update_user_password,
    save_document,
    save_quiz_attempt,
    save_quiz_answer,
    get_quiz_history,
    get_topic_performance,
    get_weak_topics,
)

from utils.auth import (
    hash_password,
    login_user,
)

import bcrypt

from utils.pdf_reader import extract_text
from utils.text_chunker import create_chunks
from utils.embeddings import create_embeddings, create_query_embedding
from utils.gemini import (
    get_answer,
    generate_quiz,
    generate_flashcards,
)
from utils.topic_normalizer import normalize_topic


# =========================================================
# APP CONFIGURATION
# =========================================================

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "https://edu-genie-pi.vercel.app",
    ],
)


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

create_tables()


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def get_logged_in_user():
    """
    Get the currently logged-in user using the
    X-User-ID request header.
    """

    user_id = request.headers.get("X-User-ID")

    if not user_id:
        return None

    try:
        user_id = int(user_id)
    except ValueError:
        return None

    return user_id


# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "EduGenie backend is running"
    })


# =========================================================
# REGISTER
# =========================================================

@app.route("/api/register", methods=["POST"])
def register():

    try:

        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:

            return jsonify({
                "success": False,
                "message": "All fields are required."
            }), 400

        existing_user = get_user_by_email(email)

        if existing_user:

            return jsonify({
                "success": False,
                "message": "Email already registered."
            }), 409

        password_hash = hash_password(password)

        user = register_user(
            name,
            email,
            password_hash
        )

        return jsonify({
            "success": True,
            "message": "Registration successful.",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        }), 201

    except Exception as error:

        print("REGISTER ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Registration failed."
        }), 500


# =========================================================
# LOGIN
# =========================================================

@app.route("/api/login", methods=["POST"])
def login():

    try:

        data = request.get_json()

        email = data.get("email")
        password = data.get("password")

        if not email or not password:

            return jsonify({
                "success": False,
                "message": "Email and password are required."
            }), 400

        user = login_user(
            email,
            password
        )

        if user is None:

            return jsonify({
                "success": False,
                "message": "Invalid email or password."
            }), 401

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "user": {
                "id": user[0],
                "name": user[1],
                "email": user[2]
            }
        })

    except Exception as error:

        print("LOGIN ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Login failed."
        }), 500


# =========================================================
# DOCUMENT UPLOAD
# =========================================================

@app.route("/api/documents/upload", methods=["POST"])
def upload_document():

    try:

        user_id = get_logged_in_user()

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "User is not logged in."
            }), 401

        if "file" not in request.files:

            return jsonify({
                "success": False,
                "message": "No file uploaded."
            }), 400

        uploaded_file = request.files["file"]

        if uploaded_file.filename == "":

            return jsonify({
                "success": False,
                "message": "No file selected."
            }), 400

        filename = uploaded_file.filename

        if not filename.lower().endswith(".pdf"):

            return jsonify({
                "success": False,
                "message": "Only PDF files are supported."
            }), 400

        # -------------------------------------------------
        # STORAGE PATH
        # -------------------------------------------------

        document_folder = os.path.join(
            "storage",
            str(user_id),
            "temp"
        )

        os.makedirs(
            document_folder,
            exist_ok=True
        )

        pdf_path = os.path.join(
            document_folder,
            filename
        )

        uploaded_file.save(pdf_path)

        # -------------------------------------------------
        # EXTRACT TEXT
        # -------------------------------------------------

        text = extract_text(pdf_path)

        if not text.strip():

            return jsonify({
                "success": False,
                "message": "Could not extract text from PDF."
            }), 400

        # -------------------------------------------------
        # CREATE CHUNKS
        # -------------------------------------------------

        chunks = create_chunks(text)

        if not chunks:

            return jsonify({
                "success": False,
                "message": "No text chunks were created."
            }), 400

        # -------------------------------------------------
        # CREATE EMBEDDINGS
        # -------------------------------------------------

        embeddings = create_embeddings(chunks)

        # -------------------------------------------------
        # CREATE FAISS INDEX
        # -------------------------------------------------

        embeddings_float = embeddings.astype("float32")

        dimension = embeddings_float.shape[1]

        index = faiss.IndexFlatL2(dimension)

        index.add(embeddings_float)

        # -------------------------------------------------
        # SAVE DOCUMENT IN DATABASE
        # -------------------------------------------------

        document_id = save_document(
            user_id,
            filename
        )

        # -------------------------------------------------
        # FINAL DOCUMENT STORAGE
        # -------------------------------------------------

        final_folder = os.path.join(
            "storage",
            str(user_id),
            str(document_id)
        )

        os.makedirs(
            final_folder,
            exist_ok=True
        )

        # Save extracted text

        text_path = os.path.join(
            final_folder,
            "text.txt"
        )

        with open(
            text_path,
            "w",
            encoding="utf-8"
        ) as file:

            file.write(text)

        # Save chunks

        chunks_path = os.path.join(
            final_folder,
            "chunks.json"
        )

        with open(
            chunks_path,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                chunks,
                file,
                ensure_ascii=False,
                indent=2
            )

        # Save FAISS index

        index_path = os.path.join(
            final_folder,
            "index.faiss"
        )

        faiss.write_index(
            index,
            index_path
        )

        # Remove temporary PDF

        try:

            os.remove(pdf_path)

        except Exception:

            pass

        return jsonify({
            "success": True,
            "message": "PDF uploaded and processed successfully.",
            "document": {
                "id": document_id,
                "filename": filename
            }
        })

    except Exception as error:

        print("UPLOAD ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Document upload failed."
        }), 500


# =========================================================
# GET DOCUMENTS
# =========================================================

@app.route("/api/documents", methods=["GET"])
def get_documents():

    try:

        user_id = get_logged_in_user()

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "User is not logged in."
            }), 401

        from utils.database import get_user_documents

        documents = get_user_documents(user_id)

        result = []

        for document in documents:

            result.append({
                "id": document[0],
                "filename": document[2],
                "uploaded_at": document[3]
            })

        return jsonify({
            "success": True,
            "documents": result
        })

    except Exception as error:

        print("GET DOCUMENTS ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to load documents."
        }), 500


# =========================================================
# DELETE DOCUMENT
# =========================================================

@app.route(
    "/api/documents/<int:document_id>",
    methods=["DELETE"]
)
def delete_document(document_id):

    try:

        user_id = get_logged_in_user()

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "User is not logged in."
            }), 401

        from utils.database import delete_document

        deleted = delete_document(
            document_id,
            user_id
        )

        if not deleted:

            return jsonify({
                "success": False,
                "message": "Document not found."
            }), 404

        # Delete storage directory

        storage_path = os.path.join(
            "storage",
            str(user_id),
            str(document_id)
        )

        if os.path.exists(storage_path):

            import shutil

            shutil.rmtree(
                storage_path
            )

        return jsonify({
            "success": True,
            "message": "Document deleted successfully."
        })

    except Exception as error:

        print("DELETE DOCUMENT ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to delete document."
        }), 500


# =========================================================
# TUTOR / RAG QUESTION ANSWERING
# =========================================================

@app.route("/api/tutor/ask", methods=["POST"])
def tutor_ask():

    try:

        user_id = get_logged_in_user()

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "User is not logged in."
            }), 401

        data = request.get_json()

        document_id = data.get("document_id")
        question = data.get("question")
        difficulty = data.get("difficulty", "Intermediate")
        language = data.get("language", "English")
        if difficulty not in {"Beginner", "Intermediate", "Advanced"}:
            difficulty = "Intermediate"
        if language not in {"English", "Hindi"}:
            language = "English"

        if not document_id or not question:

            return jsonify({
                "success": False,
                "message": "Document and question are required."
            }), 400

        from utils.database import get_document_by_id

        document = get_document_by_id(
            document_id,
            user_id
        )

        if document is None:

            return jsonify({
                "success": False,
                "message": "Document not found."
            }), 404

        document_folder = os.path.join(
            "storage",
            str(user_id),
            str(document_id)
        )

        chunks_path = os.path.join(
            document_folder,
            "chunks.json"
        )

        index_path = os.path.join(
            document_folder,
            "index.faiss"
        )

        if not os.path.exists(chunks_path):

            return jsonify({
                "success": False,
                "message": "Document chunks not found."
            }), 404

        if not os.path.exists(index_path):

            return jsonify({
                "success": False,
                "message": "Document index not found."
            }), 404

        # Load chunks

        with open(
            chunks_path,
            "r",
            encoding="utf-8"
        ) as file:

            chunks = json.load(file)

        # Load FAISS

        index = faiss.read_index(
            index_path
        )

        # Create question embedding

        question_embedding = create_query_embedding(
            question
        )

        question_embedding = question_embedding.astype(
            "float32"
        )

        # Retrieve top 3 chunks

        distances, indices = index.search(
            question_embedding,
            3
        )

        retrieved_chunks = []

        for index_number in indices[0]:

            if index_number >= 0 and index_number < len(chunks):

                retrieved_chunks.append(
                    chunks[index_number]
                )

        context = "\n\n".join(
            retrieved_chunks
        )

        preference_instruction = (
            f"AI LEARNING PREFERENCES: Difficulty={difficulty}; Language={language}. "
            "Adjust the explanation to the selected difficulty and answer in the selected language. "
            "Keep the answer grounded in the retrieved study material.\n\n"
        )
        answer = get_answer(
            preference_instruction + context,
            question
        )

        return jsonify({
            "success": True,
            "answer": answer
        })

    except Exception as error:

        print("TUTOR ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to generate answer."
        }), 500


# =========================================================
# GENERATE QUIZ
# =========================================================

@app.route(
    "/api/quiz/generate",
    methods=["POST"]
)
def quiz_generate():

    try:

        user_id = get_logged_in_user()

        if user_id is None:

            return jsonify({
                "success": False,
                "message": "User is not logged in."
            }), 401

        data = request.get_json()

        document_id = data.get("document_id")
        difficulty = data.get("difficulty", "Intermediate")
        language = data.get("language", "English")
        if difficulty not in {"Beginner", "Intermediate", "Advanced"}:
            difficulty = "Intermediate"
        if language not in {"English", "Hindi"}:
            language = "English"

        if not document_id:

            return jsonify({
                "success": False,
                "message": "Document ID is required."
            }), 400

        from utils.database import get_document_by_id

        document = get_document_by_id(
            document_id,
            user_id
        )

        if document is None:

            return jsonify({
                "success": False,
                "message": "Document not found."
            }), 404

        document_folder = os.path.join(
            "storage",
            str(user_id),
            str(document_id)
        )

        chunks_path = os.path.join(
            document_folder,
            "chunks.json"
        )

        if not os.path.exists(chunks_path):

            return jsonify({
                "success": False,
                "message": "Document chunks not found."
            }), 404

        with open(
            chunks_path,
            "r",
            encoding="utf-8"
        ) as file:

            chunks = json.load(file)

        # Use the first 10 chunks
        # matching the original project logic

        context = "\n\n".join(
            chunks[:10]
        )

        preference_instruction = (
            f"AI LEARNING PREFERENCES: Difficulty={difficulty}; Language={language}. "
            "Generate questions appropriate for the selected difficulty. Write question text and options "
            "in the selected language. Keep all questions grounded in the study material.\n\n"
        )
        quiz_data = generate_quiz(
            preference_instruction + context,
            num_questions=5
        )

        # Normalize topic names

        for question in quiz_data:

            if "topic" in question:

                question["topic"] = normalize_topic(
                    question["topic"]
                )

        return jsonify({
            "success": True,
            "quiz": quiz_data,
            "document": {
                "id": document[0],
                "filename": document[2]
            }
        })

    except Exception as error:

        print("QUIZ GENERATE ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to generate quiz."
        }), 500


# =========================================================
# GENERATE FLASHCARDS
# =========================================================

@app.route("/api/flashcards/generate", methods=["POST"])
def flashcards_generate():
    try:
        user_id = get_logged_in_user()

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "User is not logged in."
            }), 401

        data = request.get_json(silent=True) or {}
        document_id = data.get("document_id") or data.get("documentId")
        difficulty = data.get("difficulty", "Intermediate")
        language = data.get("language", "English")
        if difficulty not in {"Beginner", "Intermediate", "Advanced"}:
            difficulty = "Intermediate"
        if language not in {"English", "Hindi"}:
            language = "English"

        if not document_id:
            return jsonify({
                "success": False,
                "message": "Document ID is required."
            }), 400

        from utils.database import get_document_by_id

        document = get_document_by_id(
            document_id,
            user_id
        )

        if document is None:
            return jsonify({
                "success": False,
                "message": "Document not found."
            }), 404

        document_folder = os.path.join(
            "storage",
            str(user_id),
            str(document_id)
        )

        chunks_path = os.path.join(
            document_folder,
            "chunks.json"
        )

        if not os.path.exists(chunks_path):
            return jsonify({
                "success": False,
                "message": "Document chunks not found."
            }), 404

        with open(
            chunks_path,
            "r",
            encoding="utf-8"
        ) as file:
            chunks = json.load(file)

        if not chunks:
            return jsonify({
                "success": False,
                "message": "No document content is available."
            }), 400

        # Use the same document-processing strategy as the quiz module:
        # provide the first 10 chunks as context to Gemini.
        context = "\n\n".join(chunks[:10])

        preference_instruction = (
            f"AI LEARNING PREFERENCES: Difficulty={difficulty}; Language={language}. "
            "Generate flashcards appropriate for the selected difficulty. Write the question, answer and topic "
            "in the selected language. Keep all content grounded in the study material.\n\n"
        )
        flashcard_data = generate_flashcards(
            preference_instruction + context,
            num_flashcards=10
        )

        if not isinstance(flashcard_data, list):
            flashcard_data = []

        normalized_cards = []

        for index, card in enumerate(flashcard_data):
            if not isinstance(card, dict):
                continue

            question = str(card.get("question", "")).strip()
            answer = str(card.get("answer", "")).strip()
            topic = str(card.get("topic", "General")).strip()

            if not question or not answer:
                continue

            normalized_cards.append({
                "id": index + 1,
                "question": question,
                "answer": answer,
                "topic": topic or "General"
            })

        return jsonify({
            "success": True,
            "flashcards": normalized_cards,
            "document": {
                "id": document[0],
                "filename": document[2]
            }
        })

    except Exception as error:
        print("FLASHCARDS GENERATE ERROR:", error)
        return jsonify({
            "success": False,
            "message": "Unable to generate flashcards."
        }), 500


# =========================================================
# SUBMIT QUIZ
# =========================================================

@app.route(
    "/api/quiz/submit",
    methods=["POST"]
)
def quiz_submit():

    try:

        # -------------------------------------------------
        # GET LOGGED-IN USER
        # -------------------------------------------------

        user_id = get_logged_in_user()

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "User is not logged in."
            }), 401

        # -------------------------------------------------
        # GET REQUEST DATA
        # -------------------------------------------------

        data = request.get_json(silent=True) or {}

        # Support both frontend naming conventions
        document_id = (
            data.get("document_id")
            or data.get("documentId")
        )

        quiz = (
            data.get("quiz")
            or data.get("questions")
        )

        answers = (
            data.get("answers")
            if data.get("answers") is not None
            else data.get("user_answers")
        )

        # -------------------------------------------------
        # NORMALIZE DOCUMENT ID
        # -------------------------------------------------

        if isinstance(document_id, dict):
            document_id = (
                document_id.get("id")
                or document_id.get("document_id")
            )

        try:
            if document_id is not None:
                document_id = int(document_id)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Invalid document ID."
            }), 400

        # -------------------------------------------------
        # VALIDATE REQUEST
        # -------------------------------------------------

        if document_id is None:
            return jsonify({
                "success": False,
                "message": "Document ID is required."
            }), 400

        if not isinstance(quiz, list) or len(quiz) == 0:
            return jsonify({
                "success": False,
                "message": "Quiz questions are required."
            }), 400

        if answers is None:
            return jsonify({
                "success": False,
                "message": "Quiz answers are required."
            }), 400

        # -------------------------------------------------
        # NORMALIZE ANSWERS
        # -------------------------------------------------

        if isinstance(answers, dict):

            normalized_answers = []

            for index in range(len(quiz)):

                value = answers.get(str(index))

                if value is None:
                    value = answers.get(index)

                normalized_answers.append(value)

            answers = normalized_answers

        if not isinstance(answers, list):
            return jsonify({
                "success": False,
                "message": "Answers must be a list."
            }), 400

        if len(quiz) != len(answers):
            return jsonify({
                "success": False,
                "message": (
                    f"Quiz contains {len(quiz)} questions "
                    f"but {len(answers)} answers were received."
                )
            }), 400

        # -------------------------------------------------
        # VERIFY DOCUMENT BELONGS TO USER
        # -------------------------------------------------

        from utils.database import get_document_by_id

        document = get_document_by_id(
            document_id,
            user_id
        )

        if document is None:
            return jsonify({
                "success": False,
                "message": "Document not found."
            }), 404

        # -------------------------------------------------
        # CHECK ANSWERS
        # -------------------------------------------------

        score = 0
        answer_results = []

        for index, question in enumerate(quiz):

            selected_answer = answers[index]

            if not isinstance(question, dict):

                answer_results.append({
                    "question": "",
                    "selected_answer": selected_answer,
                    "correct_answer": None,
                    "is_correct": False
                })

                continue

            options = question.get("options") or []

            correct_index = question.get("answer")

            try:
                if correct_index is not None:
                    correct_index = int(correct_index)
            except (ValueError, TypeError):
                correct_index = None

            correct_answer = None

            if (
                correct_index is not None
                and 0 <= correct_index < len(options)
            ):
                correct_answer = options[correct_index]

            # -------------------------------------------------
            # SUPPORT BOTH:
            # 1. Actual option text
            # 2. Option index
            # -------------------------------------------------

            is_correct = False

            if selected_answer is not None:

                if (
                    correct_answer is not None
                    and str(selected_answer).strip()
                    == str(correct_answer).strip()
                ):
                    is_correct = True

                else:

                    try:
                        selected_index = int(selected_answer)

                        if (
                            correct_index is not None
                            and selected_index == correct_index
                        ):
                            is_correct = True

                    except (ValueError, TypeError):
                        pass

            if is_correct:
                score += 1

            answer_results.append({
                "question": question.get(
                    "question",
                    ""
                ),
                "selected_answer": selected_answer,
                "correct_answer": correct_answer,
                "is_correct": is_correct
            })

        # -------------------------------------------------
        # CALCULATE SCORE
        # -------------------------------------------------

        total_questions = len(quiz)

        percentage = (
            (score / total_questions) * 100
            if total_questions > 0
            else 0
        )

        # -------------------------------------------------
        # SAVE QUIZ ATTEMPT
        # -------------------------------------------------

        attempt_id = save_quiz_attempt(
            user_id,
            document_id,
            score,
            total_questions
        )

        # -------------------------------------------------
        # SAVE QUESTION-WISE ANSWERS
        # -------------------------------------------------

        for index, question in enumerate(quiz):

            selected_answer = answers[index]

            if isinstance(question, dict):
                options = question.get("options") or []
                correct_index = question.get("answer")
                topic_value = question.get(
                    "topic",
                    "General"
                )
            else:
                options = []
                correct_index = None
                topic_value = "General"

            try:
                if correct_index is not None:
                    correct_index = int(correct_index)
            except (ValueError, TypeError):
                correct_index = None

            correct_answer = None

            if (
                correct_index is not None
                and 0 <= correct_index < len(options)
            ):
                correct_answer = options[correct_index]

            is_correct = False

            if selected_answer is not None:

                if (
                    correct_answer is not None
                    and str(selected_answer).strip()
                    == str(correct_answer).strip()
                ):
                    is_correct = True

                else:

                    try:
                        selected_index = int(selected_answer)

                        if (
                            correct_index is not None
                            and selected_index == correct_index
                        ):
                            is_correct = True

                    except (ValueError, TypeError):
                        pass

            topic = normalize_topic(topic_value)

            save_quiz_answer(
                attempt_id,
                topic,
                is_correct
            )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return jsonify({
            "success": True,
            "message": "Quiz submitted successfully.",
            "attempt_id": attempt_id,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "answers": answer_results
        })

    except Exception as error:

        print("QUIZ SUBMIT ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to submit quiz."
        }), 500


# =========================================================
# CHANGE PASSWORD
# =========================================================

@app.route("/api/change-password", methods=["POST"])
def change_password():

    try:
        user_id = get_logged_in_user()

        if user_id is None:
            return jsonify({
                "success": False,
                "message": "User is not logged in."
            }), 401

        data = request.get_json(silent=True) or {}

        current_password = data.get("current_password", "")
        new_password = data.get("new_password", "")

        if not current_password or not new_password:
            return jsonify({
                "success": False,
                "message": "Current and new password are required."
            }), 400

        if len(new_password) < 6:
            return jsonify({
                "success": False,
                "message": "New password must contain at least 6 characters."
            }), 400

        if current_password == new_password:
            return jsonify({
                "success": False,
                "message": "New password must be different from current password."
            }), 400

        user = get_user_by_id(user_id)

        if user is None:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        # get_user_by_id returns:
        # (id, name, email, password_hash, created_at)
        stored_hash = user[3]

        if not bcrypt.checkpw(
            current_password.encode("utf-8"),
            stored_hash.encode("utf-8")
        ):
            return jsonify({
                "success": False,
                "message": "Current password is incorrect."
            }), 401

        new_hash = hash_password(new_password)

        if not update_user_password(user_id, new_hash):
            return jsonify({
                "success": False,
                "message": "Password could not be updated."
            }), 500

        return jsonify({
            "success": True,
            "message": "Password changed successfully."
        }), 200

    except Exception as error:
        print("CHANGE PASSWORD ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to change password."
        }), 500


# =========================================================
# DASHBOARD
# =========================================================

@app.route(
    "/api/dashboard/<int:user_id>",
    methods=["GET"]
)
def dashboard(user_id):

    try:

        # -------------------------------------------------
        # VERIFY USER
        # -------------------------------------------------

        user = get_user_by_email

        from utils.database import get_user_by_id

        user_data = get_user_by_id(
            user_id
        )

        if user_data is None:

            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        # -------------------------------------------------
        # GET QUIZ HISTORY
        # -------------------------------------------------

        history = get_quiz_history(
            user_id
        )

        # -------------------------------------------------
        # GET TOPIC PERFORMANCE
        # -------------------------------------------------

        topic_data = get_topic_performance(
            user_id
        )

        # -------------------------------------------------
        # GET WEAK TOPICS
        # -------------------------------------------------

        weak_data = get_weak_topics(
            user_id
        )

        # -------------------------------------------------
        # CALCULATE STATISTICS
        # -------------------------------------------------

        quiz_attempts = len(history)

        percentages = []

        for attempt in history:

            score = attempt[2]
            total_questions = attempt[3]

            if total_questions > 0:

                percentage = (
                    score /
                    total_questions
                ) * 100

                percentages.append(
                    percentage
                )

        if percentages:

            average_score = sum(
                percentages
            ) / len(percentages)

            best_score = max(
                percentages
            )

        else:

            average_score = 0
            best_score = 0

        # -------------------------------------------------
        # DOCUMENT COUNT
        # -------------------------------------------------

        from utils.database import get_user_documents

        documents = get_user_documents(
            user_id
        )

        document_count = len(
            documents
        )

        # -------------------------------------------------
        # FORMAT TOPIC DATA
        # -------------------------------------------------

        topics = []

        for topic, attempted, correct in topic_data:

            accuracy = (
                (correct / attempted) * 100
                if attempted > 0
                else 0
            )

            topics.append({
                "topic": topic,
                "attempted": attempted,
                "correct": correct,
                "accuracy": round(
                    accuracy,
                    1
                )
            })

        # -------------------------------------------------
        # FORMAT WEAK TOPICS
        # -------------------------------------------------

        weak_topics = []

        for topic, attempted, correct in weak_data:

            accuracy = (
                (correct / attempted) * 100
                if attempted > 0
                else 0
            )

            weak_topics.append({
                "topic": topic,
                "attempted": attempted,
                "correct": correct,
                "accuracy": round(
                    accuracy,
                    1
                )
            })

        # -------------------------------------------------
        # FORMAT RECENT ATTEMPTS
        # -------------------------------------------------

        recent_attempts = []

        for attempt in history[:5]:

            recent_attempts.append({
                "id": attempt[0],
                "score": attempt[2],
                "total_questions": attempt[3],
                "attempted_at": attempt[4]
            })

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return jsonify({
            "success": True,

            "user": {
                "id": user_data[0],
                "name": user_data[1],
                "email": user_data[2]
            },

            "stats": {
                "quiz_attempts": quiz_attempts,
                "average_score": round(
                    average_score,
                    1
                ),
                "best_score": round(
                    best_score,
                    1
                ),
                "documents": document_count
            },

            "topics": topics,

            "weak_topics": weak_topics,

            "recent_attempts": recent_attempts
        })

    except Exception as error:

        print("DASHBOARD ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to load dashboard."
        }), 500


# =========================================================
# START SERVER
# =========================================================

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )