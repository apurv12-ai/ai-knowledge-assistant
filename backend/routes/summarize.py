from fastapi import APIRouter, HTTPException
from models.schemas import SummarizeRequest
from services.vector_store import retrieve_relevant
from services.llm import ask_llm

router = APIRouter()

@router.post("/summarize")
async def summarize_document(req: SummarizeRequest):
    try:
        chunks = retrieve_relevant(req.doc_id, "main topics key concepts summary", n=8)
        context = "\n\n".join(chunks)
        prompt = f"""Create a clear structured summary with bullet points covering main topics and key concepts.

Content:
{context}

Summary:"""
        summary = ask_llm(prompt)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))