import os
from dotenv import load_dotenv
from google import genai
from pinecone import Pinecone

load_dotenv()

genai_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
pinecone_client = Pinecone(api_key=os.environ["PINECONE_API_KEY"])
vector_index = pinecone_client.Index("asset-brand-guard")