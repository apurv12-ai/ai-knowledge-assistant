import os, shutil, uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pdf_parser import extract_text_from_pdf
from services.chunker import chunk_text
from services.vector_store import store_chunks

router = APIRouter()
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    doc_id = str(uuid.uuid4())[:8]
    file_path = f"{UPLOAD_DIR}/{doc_id}.pdf"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)
    num_chunks = store_chunks(doc_id, chunks)
    return {"doc_id": doc_id, "filename": file.filename, "num_chunks": num_chunks, "message": "PDF processed successfully"}