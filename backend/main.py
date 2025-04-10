from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
from pathlib import Path
from retrieval_pipeline import RetrievalPipeline

app = FastAPI(title="HR/IT FAQ Chatbot")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the RAG pipeline
pipeline = RetrievalPipeline()

# Create data directory if it doesn't exist
os.makedirs("data/documents", exist_ok=True)

class ChatRequest(BaseModel):
    query: str
    doc_type: str
    top_k: Optional[int] = 3

class UploadRequest(BaseModel):
    doc_type: str
    metadata: Optional[Dict[str, Any]] = None

@app.post("/chat")
async def chat(request: ChatRequest):
    """Generate a response to a user query."""
    try:
        result = pipeline.generate_response(
            query=request.query,
            doc_type=request.doc_type,
            top_k=request.top_k
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = "hr"  # or "it"
):
    """Upload and index a new document."""
    if file.filename == "":
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate document type
    if doc_type.lower() not in ["hr", "it"]:
        raise HTTPException(status_code=400, detail="Invalid document type. Must be 'hr' or 'it'")
    
    try:
        # Save the file
        file_path = Path("data/documents") / file.filename
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Index the document
        num_chunks = pipeline.add_document(
            str(file_path),
            doc_type,
            metadata={"original_filename": file.filename}
        )
        
        return {
            "message": "Document uploaded and indexed successfully",
            "filename": file.filename,
            "chunks_created": num_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Check if the server is running."""
    return {"status": "healthy"} 