import os
from typing import List, Dict, Any
from pathlib import Path
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
import tiktoken
from pypdf import PdfReader

class DocumentIndexer:
    def __init__(self, persist_dir: str = "./data/chroma"):
        self.persist_dir = persist_dir
        self.chunk_size = 500  # tokens per chunk
        self.chunk_overlap = 50  # token overlap between chunks
        
        # Initialize ChromaDB
        self.chroma_client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Create collections for HR and IT documents
        self.hr_collection = self.chroma_client.get_or_create_collection("hr_docs")
        self.it_collection = self.chroma_client.get_or_create_collection("it_docs")
        
        # Initialize the sentence transformer model
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
    
    def count_tokens(self, text: str) -> int:
        """Count the number of tokens in a text string."""
        return len(self.tokenizer.encode(text))
    
    def chunk_text(self, text: str) -> List[str]:
        """Split text into chunks based on token count."""
        chunks = []
        tokens = self.tokenizer.encode(text)
        
        i = 0
        while i < len(tokens):
            chunk_end = min(i + self.chunk_size, len(tokens))
            chunk = self.tokenizer.decode(tokens[i:chunk_end])
            chunks.append(chunk)
            i += self.chunk_size - self.chunk_overlap
            
        return chunks
    
    def process_pdf(self, file_path: str) -> str:
        """Extract text from PDF file."""
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    def process_text_file(self, file_path: str) -> str:
        """Read text from a text file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def index_document(self, file_path: str, doc_type: str, metadata: Dict[str, Any] = None):
        """Index a document into the appropriate collection."""
        if not metadata:
            metadata = {}
            
        # Process the document based on file type
        file_path = Path(file_path)
        if file_path.suffix.lower() == '.pdf':
            text = self.process_pdf(str(file_path))
        else:
            text = self.process_text_file(str(file_path))
            
        # Chunk the document
        chunks = self.chunk_text(text)
        
        # Generate embeddings and metadata for each chunk
        embeddings = self.embedder.encode(chunks).tolist()
        
        # Add document chunks to appropriate collection
        collection = self.hr_collection if doc_type.lower() == 'hr' else self.it_collection
        
        # Create metadata for each chunk
        metadatas = [{
            **metadata,
            'source': file_path.name,
            'chunk_index': i,
            'doc_type': doc_type
        } for i in range(len(chunks))]
        
        # Generate IDs for chunks
        ids = [f"{file_path.stem}_chunk_{i}" for i in range(len(chunks))]
        
        # Add to collection
        collection.add(
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        
        return len(chunks)
    
    def search(self, query: str, doc_type: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Search for relevant document chunks."""
        collection = self.hr_collection if doc_type.lower() == 'hr' else self.it_collection
        
        # Get query embedding
        query_embedding = self.embedder.encode(query).tolist()
        
        # Search in the collection
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=['documents', 'metadatas', 'distances']
        )
        
        # Format results
        formatted_results = []
        for i in range(len(results['documents'][0])):
            formatted_results.append({
                'text': results['documents'][0][i],
                'metadata': results['metadatas'][0][i],
                'distance': results['distances'][0][i]
            })
            
        return formatted_results 