# 🧠 AI Knowledge Assistant

> Upload any PDF — textbook, research paper, or notes — and instantly get AI-powered Q&A, summaries, quizzes, and flashcards.

![Python](https://img.shields.io/badge/Python-3.14-blue?style=flat-square&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?style=flat-square&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-orange?style=flat-square)
![LLaMA3](https://img.shields.io/badge/LLaMA_3-Groq_API-purple?style=flat-square)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **PDF Upload** | Upload any textbook, notes, or research paper |
| 💬 **AI Q&A** | Ask questions — get answers from your document using RAG |
| 📋 **Summarization** | Generate structured bullet-point summaries instantly |
| 🧪 **Quiz Generation** | Auto-generate MCQ quizzes with explanations |
| 🃏 **Flashcards** | Create Anki-style study flashcards from any document |

---

## 🛠️ Tech Stack

```
Frontend        →  React + Vite + CSS
Backend         →  FastAPI (Python)
Vector Database →  ChromaDB
Embeddings      →  Sentence Transformers (all-MiniLM-L6-v2)
LLM             →  LLaMA 3.3 70B via Groq API
PDF Parsing     →  PyMuPDF (fitz)
```

---

## 🏗️ Architecture

```
User uploads PDF
       ↓
PyMuPDF extracts text
       ↓
Text split into 400-word chunks (50-word overlap)
       ↓
Sentence Transformers generate embeddings
       ↓
Embeddings stored in ChromaDB (persistent)
       ↓
User asks question / requests quiz / summary
       ↓
ChromaDB retrieves top-5 relevant chunks
       ↓
LLaMA 3 generates answer using retrieved context (RAG)
       ↓
Response sent to React frontend
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/apurv12-ai/ai-knowledge-assistant.git
cd ai-knowledge-assistant
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure Environment
Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Run Backend
```bash
uvicorn main:app --reload
# API running at http://127.0.0.1:8000
# Docs at http://127.0.0.1:8000/docs
```

### 5. Setup & Run Frontend
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## 📁 Project Structure

```
ai-knowledge-assistant/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── requirements.txt
│   ├── routes/
│   │   ├── upload.py           # PDF upload endpoint
│   │   ├── qa.py               # Q&A endpoint
│   │   ├── summarize.py        # Summarization endpoint
│   │   └── quiz.py             # Quiz & flashcard endpoints
│   ├── services/
│   │   ├── pdf_parser.py       # Extract text from PDFs
│   │   ├── chunker.py          # Split text into chunks
│   │   ├── vector_store.py     # ChromaDB operations
│   │   └── llm.py              # Groq LLM API calls
│   └── models/
│       └── schemas.py          # Pydantic request/response models
├── frontend/
│   └── src/
│       ├── App.jsx             # Main React app
│       └── index.css           # Styles
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload and process a PDF |
| POST | `/api/ask` | Ask a question about the document |
| POST | `/api/summarize` | Generate document summary |
| POST | `/api/quiz` | Generate MCQ quiz questions |
| POST | `/api/flashcards` | Generate flashcards |

---

## 💡 How RAG Works

**RAG (Retrieval-Augmented Generation)** is the core technique powering this app:

1. **Retrieval** — When you ask a question, ChromaDB finds the most relevant chunks from your document using vector similarity search
2. **Augmentation** — Those chunks are added as context to the LLM prompt
3. **Generation** — LLaMA 3 generates an accurate answer based only on your document's content

This prevents hallucination and ensures answers are grounded in your actual document.

---

## 🗺️ Roadmap

- [x] PDF Upload & Processing
- [x] RAG-based Q&A
- [x] Document Summarization
- [x] MCQ Quiz Generation
- [x] Flashcard Generation
- [ ] Knowledge Graph Visualization
- [ ] User Authentication (JWT)
- [ ] Learning Progress Tracker
- [ ] Voice Input Support
- [ ] Cloud Deployment (Render/Railway)

---

## 👨‍💻 Author

**Apurv** — [@apurv12-ai](https://github.com/apurv12-ai)

> Built as a portfolio project demonstrating full-stack AI development with RAG, vector databases, and LLM integration.
