import os
from dotenv import load_dotenv
from google import genai
from pinecone import Pinecone, ServerlessSpec
from rules import brand_documents
# 1. Load environment variables from .env
load_dotenv()

# 2. Initialize Google GenAI Client
# (Pulls GEMINI_API_KEY from environment variables automatically)
ai_client = genai.Client()

# 3. Initialize Pinecone Client
pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
index_name = "asset-brand-guard"

# Create Pinecone index if it doesn't exist already (Gemini text-embedding-001 uses 768 dimensions)
if index_name not in [i.name for i in pc.list_indexes()]:
    pc.create_index(
        name=index_name,
        dimension=3072 , 
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )

index = pc.Index(index_name)

def ingest_guidelines():
    print("Starting brand guideline ingestion pipeline...")
    for doc in brand_documents:
        print(f"Processing document ID: {doc['id']} for product line: {doc['product_line']}")
        
        # A. Generate vector embedding using Google's text-embedding-001 model
        response = ai_client.models.embed_content(
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