import json
from fastapi import APIRouter, HTTPException
from models.schemas import QuizRequest, FlashcardRequest
from services.vector_store import retrieve_relevant
from services.llm import ask_llm

router = APIRouter()

@router.post("/quiz")
async def generate_quiz(req: QuizRequest):
    try:
        chunks = retrieve_relevant(req.doc_id, "concepts definitions topics", n=8)
        context = "\n\n".join(chunks)
        prompt = f"""Generate {req.num_questions} MCQ questions. Return ONLY valid JSON:
{{"questions": [{{"question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ..."], "answer": "A", "explanation": "..."}}]}}

Content:
{context}"""
        response = ask_llm(prompt)
        clean = response.strip().strip("```json").strip("```").strip()
        return json.loads(clean)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flashcards")
async def generate_flashcards(req: FlashcardRequest):
    try:
        chunks = retrieve_relevant(req.doc_id, "key terms definitions", n=8)
        context = "\n\n".join(chunks)
        prompt = f"""Create flashcards. Return ONLY valid JSON:
{{"flashcards": [{{"front": "term", "back": "definition"}}]}}

Content:
{context}"""
        response = ask_llm(prompt)
        clean = response.strip().strip("```json").strip("```").strip()
        return json.loads(clean)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))