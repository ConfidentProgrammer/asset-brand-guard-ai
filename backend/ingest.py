import os
from dotenv import load_dotenv
from google import genai
from pinecone import Pinecone, ServerlessSpec
from rules import brand_documents
from app.config import genai_client,pinecone_client

load_dotenv()

index_name = "asset-brand-guard"

if index_name not in [i.name for i in pinecone_client.list_indexes()]:
    pinecone_client.create_index(
        name=index_name,
        dimension=3072 , 
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

index = pinecone_client.Index(index_name)

def ingest_guidelines():
    print("Starting brand guideline ingestion pipeline...")
    for doc in brand_documents:
        print(f"Processing document ID: {doc['id']} for product line: {doc['product_line']}")
        
        # A. Generate vector embedding using Google's text-embedding-001 model
        response = genai_client.models.embed_content(
            model="models/gemini-embedding-001",
            contents=doc["text"]
        )
        vector_values = response.embeddings[0].values
        
        # B. Upsert vector + metadata into Pinecone
        index.upsert(
            vectors=[
                {
                    "id": doc["id"],
                    "values": vector_values,
                    "metadata": {
                        "product_line": doc["product_line"],
                        "text": doc["text"]
                    }
                }
            ]
        )
    
    print("Ingestion complete! All guidelines successfully vectorized and stored in Pinecone.")

if __name__ == "__main__":
    ingest_guidelines()