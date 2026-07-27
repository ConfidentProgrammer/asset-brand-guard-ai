from app.config import genai_client, vector_index
from google.genai import types
from app.config import genai_client,pinecone_client
from app.schema.schema import AuditRequest

def get_rules(payload: AuditRequest):

    index = pinecone_client.Index("asset-brand-guard")
    query_response = genai_client.models.embed_content(
                model="models/gemini-embedding-001",
                contents=payload.copy_text,
                config=types.EmbedContentConfig(
                task_type="RETRIEVAL_QUERY"
                )
            )
    
    query_vector = query_response.embeddings[0].values

    search_results = index.query(
            vector=query_vector,
            top_k=3,
            include_metadata=True,
            filter={"product_line": payload.product_line},
            )

    retrieved_rules = [match["metadata"]["text"] for match in search_results["matches"]]

    return {"retrieved_rules": retrieved_rules}
    
