import { useState } from "react"
import axios from "axios"
import "./index.css"

const API = "http://127.0.0.1:8000/api"

export default function App() {
  const [docId, setDocId] = useState(null)
  const [filename, setFilename] = useState("")
  const [page, setPage] = useState("upload")
  const [uploading, setUploading] = useState(false)

  // Q&A state
  const [question, setQuestion] = useState("")
  const [chat, setChat] = useState([])
  const [asking, setAsking] = useState(false)

  // Summary state
  const [summary, setSummary] = useState("")
  const [summarizing, setSummarizing] = useState(false)

  // Quiz state
  const [quiz, setQuiz] = useState([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(null)

  // Flashcard state
  const [flashcards, setFlashcards] = useState([])
  const [flashLoading, setFlashLoading] = useState(false)
  const [flipped, setFlipped] = useState({})

  const handleUpload = async (file) => {
    if (!file || !file.name.endsWith(".pdf")) return alert("Please upload a PDF file")
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await axios.post(`${API}/upload`, form)
      setDocId(res.data.doc_id)
      setFilename(res.data.filename)
      setPage("qa")
      setChat([])
      setSummary("")
      setQuiz([])
      setFlashcards([])
    } catch (e) {
      alert("Upload failed: " + e.message)
    }
    setUploading(false)
  }

  const handleAsk = async () => {
    if (!question.trim()) return
    const q = question
    setQuestion("")
    setChat(c => [...c, { type: "user", text: q }])
    setAsking(true)
    try {
      const res = await axios.post(`${API}/ask`, { doc_id: docId, question: q })
      setChat(c => [...c, { type: "ai", text: res.data.answer }])
    } catch (e) {
      setChat(c => [...c, { type: "ai", text: "Error getting answer." }])
    }
    setAsking(false)
  }

  const handleSummarize = async () => {
    setSummarizing(true)
    setSummary("")
    try {
      const res = await axios.post(`${API}/summarize`, { doc_id: docId })
      setSummary(res.data.summary)
    } catch (e) {
      setSummary("Error generating summary.")
    }
    setSummarizing(false)
  }

  const handleQuiz = async () => {
    setQuizLoading(true)
    setQuiz([])
    setAnswers({})
    setScore(null)
    try {
      const res = await axios.post(`${API}/quiz`, { doc_id: docId, num_questions: 5 })
      setQuiz(res.data.questions)
    } catch (e) {
      alert("Error generating quiz.")
    }
    setQuizLoading(false)
  }

  const handleAnswer = (qi, option) => {
    if (answers[qi] !== undefined) return
    setAnswers(a => ({ ...a, [qi]: option }))
  }

  const handleSubmitQuiz = () => {
    let correct = 0
    quiz.forEach((q, i) => {
      if (answers[i] && answers[i][0] === q.answer) correct++
    })
    setScore(correct)
  }

  const handleFlashcards = async () => {
    setFlashLoading(true)
    setFlashcards([])
    setFlipped({})
    try {
      const res = await axios.post(`${API}/flashcards`, { doc_id: docId })
      setFlashcards(res.data.flashcards)
    } catch (e) {
      alert("Error generating flashcards.")
    }
    setFlashLoading(false)
  }

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <h1>🧠 AI Knowledge Assistant</h1>
        <button className={`nav-btn ${page === "upload" ? "active" : ""}`} onClick={() => setPage("upload")}>📤 Upload PDF</button>
        {docId && <>
          <button className={`nav-btn ${page === "qa" ? "active" : ""}`} onClick={() => setPage("qa")}>💬 Ask Questions</button>
          <button className={`nav-btn ${page === "summary" ? "active" : ""}`} onClick={() => setPage("summary")}>📋 Summary</button>
          <button className={`nav-btn ${page === "quiz" ? "active" : ""}`} onClick={() => setPage("quiz")}>🧪 Quiz</button>
          <button className={`nav-btn ${page === "flashcards" ? "active" : ""}`} onClick={() => setPage("flashcards")}>🃏 Flashcards</button>
        </>}
      </div>

      {/* Main */}
      <div className="main">

        {/* Upload Page */}
        {page === "upload" && (
          <>
            <div className="page-title">Upload a Document</div>
            <div className="upload-zone"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dragover") }}
              onDragLeave={e => e.currentTarget.classList.remove("dragover")}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("dragover"); handleUpload(e.dataTransfer.files[0]) }}
              onClick={() => document.getElementById("fileInput").click()}>
              <div className="upload-icon">📄</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
                {uploading ? "Processing..." : "Drop your PDF here or click to browse"}
              </div>
              <p>Supports PDF files — textbooks, notes, research papers</p>
              <input id="fileInput" type="file" accept=".pdf" style={{ display: "none" }}
                onChange={e => handleUpload(e.target.files[0])} />
            </div>
            {uploading && <div className="loading"><div className="spinner" /> Extracting text and building knowledge base...</div>}
          </>
        )}

        {/* Q&A Page */}
        {page === "qa" && (
          <>
            <div className="page-title">Ask Questions</div>
            {docId && <div className="doc-badge">📄 {filename} <span style={{ color: "#aaa", fontSize: 12 }}>({docId})</span></div>}
            <div style={{ marginBottom: 20 }}>
              {chat.map((m, i) => (
                <div key={i}>
                  <div className="label">{m.type === "user" ? "You" : "AI"}</div>
                  <div className={`answer-box ${m.type === "user" ? "user" : ""}`}>{m.text}</div>
                </div>
              ))}
              {asking && <div className="loading"><div className="spinner" /> Thinking...</div>}
            </div>
            <div className="input-row">
              <input value={question} onChange={e => setQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAsk()}
                placeholder="Ask anything about your document..." />
              <button className="btn" onClick={handleAsk} disabled={asking || !question.trim()}>Ask</button>
            </div>
          </>
        )}

        {/* Summary Page */}
        {page === "summary" && (
          <>
            <div className="page-title">Document Summary</div>
            {docId && <div className="doc-badge">📄 {filename}</div>}
            {!summary && !summarizing && (
              <button className="btn" onClick={handleSummarize}>Generate Summary</button>
            )}
            {summarizing && <div className="loading"><div className="spinner" /> Summarizing document...</div>}
            {summary && (
              <div className="answer-box">
                <div className="label">Summary</div>
                <div className="summary-text"
  dangerouslySetInnerHTML={{
    __html: summary
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^\* /gm, "• ")
      .replace(/\n/g, "<br/>")
  }}
/>
              </div>
            )}
          </>
        )}

        {/* Quiz Page */}
        {page === "quiz" && (
          <>
            <div className="page-title">Quiz</div>
            {docId && <div className="doc-badge">📄 {filename}</div>}
            {!quiz.length && !quizLoading && (
              <button className="btn" onClick={handleQuiz}>Generate 5-Question Quiz</button>
            )}
            {quizLoading && <div className="loading"><div className="spinner" /> Generating quiz questions...</div>}
            {quiz.length > 0 && (
              <>
                {score !== null && (
                  <div className="score-badge">Score: {score} / {quiz.length} correct</div>
                )}
                {quiz.map((q, i) => (
                  <div className="quiz-card" key={i}>
                    <h3>Q{i + 1}. {q.question}</h3>
                    {q.options.map((opt, j) => {
                      const selected = answers[i] === opt
                      const revealed = answers[i] !== undefined
                      const isCorrect = opt[0] === q.answer
                      let cls = "option"
                      if (revealed && isCorrect) cls += " correct"
                      else if (selected && !isCorrect) cls += " wrong"
                      return <button key={j} className={cls} onClick={() => handleAnswer(i, opt)}>{opt}</button>
                    })}
                    {answers[i] !== undefined && (
                      <div className="explanation">💡 {q.explanation}</div>
                    )}
                  </div>
                ))}
                {score === null && Object.keys(answers).length === quiz.length && (
                  <button className="btn" onClick={handleSubmitQuiz}>Submit Quiz</button>
                )}
                <button className="btn secondary" style={{ marginTop: 12 }} onClick={handleQuiz}>New Quiz</button>
              </>
            )}
          </>
        )}

        {/* Flashcards Page */}
        {page === "flashcards" && (
          <>
            <div className="page-title">Flashcards</div>
            {docId && <div className="doc-badge">📄 {filename}</div>}
            {!flashcards.length && !flashLoading && (
              <button className="btn" onClick={handleFlashcards}>Generate Flashcards</button>
            )}
            {flashLoading && <div className="loading"><div className="spinner" /> Creating flashcards...</div>}
            {flashcards.length > 0 && (
              <>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>Click a card to reveal the answer</p>
                {flashcards.map((fc, i) => (
                  <div key={i} className={`flashcard ${flipped[i] ? "flipped" : ""}`}
                    onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))}>
                    <div className="front">Q: {fc.front}</div>
                    <div className="back">A: {fc.back}</div>
                  </div>
                ))}
                <button className="btn secondary" style={{ marginTop: 12 }} onClick={handleFlashcards}>New Set</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}