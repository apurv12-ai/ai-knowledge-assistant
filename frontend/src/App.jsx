import { useState } from "react"
import axios from "axios"
import ForceGraph2D from "react-force-graph-2d"
import "./index.css"

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"

export default function App() {
  // Auth state
  const [token, setToken] = useState(localStorage.getItem("token") || null)
  const [username, setUsername] = useState(localStorage.getItem("username") || null)
  const [authMode, setAuthMode] = useState("login")
  const [authForm, setAuthForm] = useState({ username: "", password: "" })
  const [authError, setAuthError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)

  // App state
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

  // Graph state
  const [graph, setGraph] = useState(null)
  const [graphLoading, setGraphLoading] = useState(false)

  // Auth handlers
  const handleAuth = async () => {
    setAuthError("")
    setAuthLoading(true)
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/signup"
      const res = await axios.post(`${API}${endpoint}`, authForm)
      localStorage.setItem("token", res.data.token)
      localStorage.setItem("username", res.data.username)
      setToken(res.data.token)
      setUsername(res.data.username)
    } catch (e) {
      setAuthError(e.response?.data?.detail || "Something went wrong")
    }
    setAuthLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    setToken(null)
    setUsername(null)
    setDocId(null)
    setPage("upload")
  }

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } })

  const handleUpload = async (file) => {
    if (!file || !file.name.endsWith(".pdf")) return alert("Please upload a PDF file")
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await axios.post(`${API}/upload`, form, authHeaders())
      setDocId(res.data.doc_id)
      setFilename(res.data.filename)
      setPage("qa")
      setChat([])
      setSummary("")
      setQuiz([])
      setFlashcards([])
      setGraph(null)
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
      const res = await axios.post(`${API}/ask`, { doc_id: docId, question: q }, authHeaders())
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
      const res = await axios.post(`${API}/summarize`, { doc_id: docId }, authHeaders())
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
      const res = await axios.post(`${API}/quiz`, { doc_id: docId, num_questions: 5 }, authHeaders())
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
      const res = await axios.post(`${API}/flashcards`, { doc_id: docId }, authHeaders())
      setFlashcards(res.data.flashcards)
    } catch (e) {
      alert("Error generating flashcards.")
    }
    setFlashLoading(false)
  }

  const handleGraph = async () => {
    setGraphLoading(true)
    setGraph(null)
    try {
      const res = await axios.post(`${API}/graph`, { doc_id: docId }, authHeaders())
      setGraph(res.data)
    } catch (e) {
      alert("Error generating graph.")
    }
    setGraphLoading(false)
  }

  // Auth screen
  if (!token) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0f1117",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          background: "#1a1d27", border: "1px solid #2a2d3a",
          borderRadius: 16, padding: 40, width: 380
        }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🧠</div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>AI Knowledge Assistant</h1>
            <p style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
              {authMode === "login" ? "Welcome back!" : "Create your account"}
            </p>
          </div>

          {/* Toggle */}
          <div style={{ display: "flex", background: "#0f1117", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login", "signup"].map(mode => (
              <button key={mode} onClick={() => { setAuthMode(mode); setAuthError("") }}
                style={{
                  flex: 1, padding: "8px 0", border: "none", borderRadius: 8, cursor: "pointer",
                  fontWeight: 600, fontSize: 14, transition: "all 0.2s",
                  background: authMode === mode ? "#7c6af7" : "transparent",
                  color: authMode === mode ? "#fff" : "#888"
                }}>
                {mode === "login" ? "Login" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              placeholder="Username"
              value={authForm.username}
              onChange={e => setAuthForm(f => ({ ...f, username: e.target.value }))}
              style={{
                background: "#0f1117", border: "1px solid #2a2d3a", borderRadius: 10,
                padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none"
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && handleAuth()}
              style={{
                background: "#0f1117", border: "1px solid #2a2d3a", borderRadius: 10,
                padding: "12px 16px", color: "#fff", fontSize: 14, outline: "none"
              }}
            />
            {authError && (
              <div style={{ color: "#ff6b6b", fontSize: 13, padding: "8px 12px", background: "#2a1a1a", borderRadius: 8 }}>
                ⚠️ {authError}
              </div>
            )}
            <button onClick={handleAuth} disabled={authLoading}
              style={{
                background: "#7c6af7", color: "#fff", border: "none", borderRadius: 10,
                padding: "13px", fontSize: 15, fontWeight: 700, cursor: "pointer", marginTop: 4
              }}>
              {authLoading ? "Please wait..." : authMode === "login" ? "Login" : "Create Account"}
            </button>
          </div>

          <p style={{ color: "#666", fontSize: 12, textAlign: "center", marginTop: 20 }}>
            {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: "#7c6af7", cursor: "pointer" }}
              onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError("") }}>
              {authMode === "login" ? "Sign up" : "Login"}
            </span>
          </p>
        </div>
      </div>
    )
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
          <button className={`nav-btn ${page === "graph" ? "active" : ""}`} onClick={() => setPage("graph")}>🕸️ Knowledge Graph</button>
        </>}
        <div style={{ marginTop: "auto", borderTop: "1px solid #2a2d3a", paddingTop: 16 }}>
          <div style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>👤 {username}</div>
          <button className="nav-btn" onClick={handleLogout} style={{ color: "#ff6b6b", width: "100%" }}>
            🚪 Logout
          </button>
        </div>
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

        {/* Knowledge Graph Page */}
        {page === "graph" && (
          <>
            <div className="page-title">Knowledge Graph</div>
            {docId && <div className="doc-badge">📄 {filename}</div>}
            {!graph && !graphLoading && (
              <button className="btn" onClick={handleGraph}>Generate Knowledge Graph</button>
            )}
            {graphLoading && <div className="loading"><div className="spinner" /> Extracting concepts and building graph...</div>}
            {graph && (
              <>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
                  {graph.nodes.length} concepts · {graph.links.length} relationships · drag to explore
                </p>
                <div style={{ border: "1px solid #2a2d3a", borderRadius: 12, overflow: "hidden", height: 500 }}>
                  <ForceGraph2D
                    graphData={graph}
                    width={800}
                    height={500}
                    backgroundColor="#0f1117"
                    nodeLabel="id"
                    nodeAutoColorBy="group"
                    nodeCanvasObject={(node, ctx, globalScale) => {
                      const label = node.id
                      const fontSize = 12 / globalScale
                      ctx.font = `${fontSize}px Sans-Serif`
                      ctx.fillStyle = node.color
                      ctx.beginPath()
                      ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI)
                      ctx.fill()
                      ctx.fillStyle = "#ffffff"
                      ctx.textAlign = "center"
                      ctx.textBaseline = "middle"
                      ctx.fillText(label, node.x, node.y + 12)
                    }}
                    linkLabel="label"
                    linkColor={() => "#3a3d4a"}
                    linkDirectionalArrowLength={4}
                    linkDirectionalArrowRelPos={1}
                  />
                </div>
                <button className="btn secondary" style={{ marginTop: 12 }} onClick={handleGraph}>Regenerate</button>
              </>
            )}
          </>
        )}

      </div>
    </div>
  )
}
