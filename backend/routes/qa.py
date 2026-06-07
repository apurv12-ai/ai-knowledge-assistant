from fastapi import APIRouter, HTTPException
from models.schemas import QARequest
from services.vector_store import retrieve_relevant
from services.llm import ask_llm

router = APIRouter()

@router.post("/ask")
async def ask_question(req: QARequest):
    try:
        chunks = retrieve_relevant(req.doc_id, req.question)
        context = "\n\n".join(chunks)
        prompt = f"""Answer the question based ONLY on the context below.
If the answer is not in the context, say "I couldn't find this in the document."

Context:
{context}

Question: {req.question}

Answer:"""
        answer = ask_llm(prompt)
        return {"answer": answer, "sources": chunks}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))