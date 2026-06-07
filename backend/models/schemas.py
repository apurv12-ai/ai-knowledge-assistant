from pydantic import BaseModel

class QARequest(BaseModel):
    doc_id: str
    question: str

class SummarizeRequest(BaseModel):
    doc_id: str

class QuizRequest(BaseModel):
    doc_id: str
    num_questions: int = 10

class FlashcardRequest(BaseModel):
    doc_id: str