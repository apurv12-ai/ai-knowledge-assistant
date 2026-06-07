import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.vector_store import retrieve_relevant
from services.llm import ask_llm

router = APIRouter()

class GraphRequest(BaseModel):
    doc_id: str

@router.post("/graph")
async def generate_knowledge_graph(req: GraphRequest):
    try:
        chunks = retrieve_relevant(req.doc_id, "concepts definitions relationships topics", n=8)
        context = "\n\n".join(chunks)

        prompt = f"""Extract key concepts and their relationships from this content.
Return ONLY valid JSON, no extra text:
{{
  "nodes": [
    {{"id": "Merge Sort", "group": "algorithm"}},
    {{"id": "Divide and Conquer", "group": "technique"}}
  ],
  "links": [
    {{"source": "Merge Sort", "target": "Divide and Conquer", "label": "uses"}}
  ]
}}

Rules:
- Extract 10-15 important concepts as nodes
- group must be one of: algorithm, technique, concept, datastructure, property
- Create meaningful links showing relationships
- Keep node names short (2-3 words max)

Content:
{context}"""

        response = ask_llm(prompt)
        clean = response.strip().strip("```json").strip("```").strip()
        data = json.loads(clean)
        return data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))