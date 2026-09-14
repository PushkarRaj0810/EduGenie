\# 🎓 EduGenie – Intelligent Personalized Learning Platform



EduGenie is an AI-powered personalized learning platform that helps students learn from their own study materials using Generative AI and Retrieval-Augmented Generation (RAG).



\## 🚀 Features



\- 🔐 User Registration \& Login

\- 📄 PDF Upload \& Management

\- 🤖 AI Tutor using RAG

\- 📝 AI-Generated Quizzes

\- 🧠 AI-Generated Flashcards

\- 📊 Learning Analytics

\- 🎯 Topic-wise Performance

\- ⚠️ Weak Topic Identification

\- ⚙️ Learning Preferences

\- 🔑 Change Password



\## 🛠️ Tech Stack



\### 🎨 Frontend

\- React

\- Vite

\- JavaScript

\- CSS



\### ⚙️ Backend

\- Python

\- Flask

\- Flask-CORS



\### 🤖 AI / ML

\- Google Gemini API

\- Sentence Transformers

\- FAISS

\- LangChain



\### 🗄️ Database

\- PostgreSQL

\- Psycopg



\### 📄 PDF Processing

\- PyMuPDF



\## 🧠 RAG Pipeline



```text

PDF Upload

&#x20;   ↓

Text Extraction

&#x20;   ↓

Text Chunking

&#x20;   ↓

Embeddings

&#x20;   ↓

FAISS Vector Store

&#x20;   ↓

User Question

&#x20;   ↓

Relevant Chunks

&#x20;   ↓

Google Gemini

&#x20;   ↓

AI Answer

```



\## 📂 Project Structure



```text

EduGenie/

│

├── frontend/

│   ├── src/

│   │   ├── components/

│   │   ├── layouts/

│   │   ├── pages/

│   │   └── utils/

│   ├── public/

│   ├── package.json

│   └── vite.config.js

│

├── utils/

│   ├── auth.py

│   ├── database.py

│   ├── embeddings.py

│   ├── gemini.py

│   ├── pdf\_reader.py

│   ├── text\_chunker.py

│   ├── topic\_normalizer.py

│   └── vector\_store.py

│

├── api\_server.py

├── app.py

├── requirements.txt

├── test\_db.py

├── list\_models.py

├── .gitignore

└── README.md

```



\## 💻 Requirements



\- Python 3.11+

\- Node.js \& npm

\- PostgreSQL

\- Git

\- Google Gemini API Key



\## ⚙️ Installation



\### 1. Clone the Repository



```bash

git clone https://github.com/PushkarRaj0810/EduGenie.git

cd EduGenie

```



\### 2. Backend Setup



```powershell

python -m venv .venv

.venv\\Scripts\\Activate.ps1

pip install -r requirements.txt

```



\### 3. Frontend Setup



```powershell

cd frontend

npm install

```



\## 🔑 Environment Variables



Create a `.env` file in the project root:



```env

GEMINI\_API\_KEY=your\_gemini\_api\_key



DB\_HOST=localhost

DB\_PORT=5432

DB\_NAME=edugenie

DB\_USER=postgres

DB\_PASSWORD=your\_postgresql\_password

```



⚠️ \*\*Never upload `.env` to GitHub.\*\*



\## 🗄️ Database Setup



Create a PostgreSQL database:



```sql

CREATE DATABASE edugenie;

```



Make sure PostgreSQL is running before starting the application.



\## ▶️ Running the Project



EduGenie requires \*\*two terminals\*\*.



\### Terminal 1 – Backend



From the project root:



```powershell

.venv\\Scripts\\Activate.ps1

python api\_server.py

```



Backend:



```text

http://127.0.0.1:5000

```



\### Terminal 2 – Frontend



```powershell

cd frontend

npm run dev

```



Frontend:



```text

http://localhost:5173

```



Open the frontend URL in your browser.



\## 📚 Main Modules



| Module | Description |

|---|---|

| Dashboard | Personalized learning overview |

| Documents | Upload and manage PDFs |

| AI Tutor | Ask questions about documents |

| Quiz | Generate and attempt AI quizzes |

| Flashcards | Generate revision flashcards |

| Analytics | Track scores and topic performance |

| Settings | Manage preferences and password |



\## 📊 Analytics



EduGenie tracks:



\- Quiz attempts

\- Average score

\- Best score

\- Correct answers

\- Topic-wise performance

\- Weak topics

\- Recent activity



\## 🔐 Security



\- Passwords are stored as hashes.

\- User documents are associated with individual users.

\- Document ownership is verified by the backend.

\- API keys and database credentials are stored in environment variables.

\- Sensitive files are excluded using `.gitignore`.



\## 🚧 Future Improvements



\- 🌐 Full cloud deployment

\- ☁️ Cloud document storage

\- 🧠 Advanced AI personalization

\- 📈 Advanced learning analytics

\- 🎯 Adaptive quiz difficulty

\- 📄 Support for more document formats

\- 🎤 Voice-based AI Tutor



\## 👨‍💻 Author



\*\*Pushkar Raj\*\*



GitHub:  

https://github.com/PushkarRaj0810



\## ⭐ EduGenie



\*\*Learn from your documents. Ask questions. Practice with AI. Improve your learning.\*\*

