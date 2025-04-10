from typing import List, Dict, Any
import ollama
from doc_indexer import DocumentIndexer

class RetrievalPipeline:
    def __init__(self):
        self.indexer = DocumentIndexer()
        self.model_name = "mistral"
        
    def format_prompt(self, query: str, contexts: List[Dict[str, Any]]) -> str:
        """Format the prompt with retrieved contexts."""
        context_text = "\n\n".join([
            f"Document {i+1} (Source: {ctx['metadata']['source']}):\n{ctx['text']}"
            for i, ctx in enumerate(contexts)
        ])
        
        prompt = f"""You are an assistant trained to answer HR and IT FAQs. Use the context below to respond accurately and concisely.
If you cannot find a relevant answer in the context, say so - do not make up information.

Context:
{context_text}

Question:
{query}

Answer:"""
        
        return prompt
    
    def generate_response(self, query: str, doc_type: str, top_k: int = 3) -> Dict[str, Any]:
        """Generate a response using RAG."""
        # Retrieve relevant contexts
        contexts = self.indexer.search(query, doc_type, top_k)
        
        # Format prompt with contexts
        prompt = self.format_prompt(query, contexts)
        
        # Generate response using Ollama
        response = ollama.chat(model=self.model_name, messages=[
            {
                "role": "system",
                "content": "You are an HR/IT assistant that provides accurate and concise answers based on the given context."
            },
            {
                "role": "user",
                "content": prompt
            }
        ])
        
        return {
            'answer': response['message']['content'],
            'contexts': contexts,
            'prompt': prompt
        }
    
    def add_document(self, file_path: str, doc_type: str, metadata: Dict[str, Any] = None) -> int:
        """Add a new document to the knowledge base."""
        return self.indexer.index_document(file_path, doc_type, metadata) 