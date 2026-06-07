import chromadb
from chromadb.utils import embedding_functions

client = chromadb.PersistentClient(path="./chroma_data")

ef = embedding_functions.DefaultEmbeddingFunction()

def store_chunks(doc_id: str, chunks: list[str]):
    collection = client.get_or_create_collection(
        name=doc_id,
        embedding_function=ef
    )
    collection.add(
        documents=chunks,
        ids=[f"{doc_id}_chunk_{i}" for i in range(len(chunks))]
    )
    return len(chunks)

def retrieve_relevant(doc_id: str, query: str, n: int = 5) -> list[str]:
    collection = client.get_collection(name=doc_id, embedding_function=ef)
    results = collection.query(query_texts=[query], n_results=n)
    return results["documents"][0]

def delete_document(doc_id: str):
    client.delete_collection(name=doc_id)