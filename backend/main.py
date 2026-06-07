from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, qa, summarize, quiz, graph
from routes import auth_routes

app = FastAPI(title="AI Knowledge Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://ai-knowledge-assistant-frontend-est9.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api", tags=["Auth"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(qa.router, prefix="/api", tags=["Q&A"])
app.include_router(summarize.router, prefix="/api", tags=["Summarize"])
app.include_router(quiz.router, prefix="/api", tags=["Quiz"])
app.include_router(graph.router, prefix="/api", tags=["Graph"])

@app.get("/")
def root():
    return {"message": "AI Knowledge Assistant API is running!"}