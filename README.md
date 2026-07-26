```markdown
# AssetBrandGuard: Enterprise AI Compliance & RAG Pipeline

An enterprise-grade, RAG-powered microservice built with **FastAPI**, **Pinecone Vector Database**, and the **Google GenAI SDK**. It automatically audits, evaluates, and rewrites global marketing copy against strict corporate brand guidelines and regional legal rules.

---

## 🏗️ Architecture Overview

```text
[ Incoming Marketing Copy ] 
          │
          ▼
┌──────────────────┐      Semantic Query      ┌──────────────────┐
│  FastAPI Router  │ ───────────────────────► │ Pinecone Vector  │
└──────────────────┘                          │     Database     │
          │                                   └──────────────────┘
          │ (Injects Context & Rules)                 │
          ▼                                           │ (Returns Top-K Rules)
┌─────────────────────────────────────────────┐       │
│ Google GenAI (Gemini Flash)                 │ ◄─────┘
│ Structured Output (Pydantic Schema Enforced)│
└─────────────────────────────────────────────┘
          │
          ▼
[ Strict JSON Audit Response ]

```

---

## 🚀 Key Features

* **Semantic Guideline Retrieval:** Uses Google's embedding models (`models/gemini-embedding-001`) and **Pinecone** metadata filtering to pull precise product-line brand rules dynamically.
* **Guaranteed Structured Outputs:** Leverages native Gemini configuration (`response_mime_type="application/json"` combined with **Pydantic schemas**) to ensure zero hallucination of data types or JSON keys.
* **Asynchronous REST API:** Built with **FastAPI** to handle high-throughput validation requests with sub-second latency.
* **Automated Remediation:** Not only flags compliance failures and confidence scores, but instantly generates brand-safe rewrites.

---

## 🛠️ Tech Stack

* **Backend Framework:** FastAPI, Uvicorn, Pydantic v2
* **AI & LLM SDK:** Google GenAI SDK (`google-genai`), Gemini Model
* **Vector Database:** Pinecone (Serverless Index with cosine similarity)
* **Environment Management:** Python-Dotenv

---

## ⚙️ Setup & Installation

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/AssetBrandGuard.git](https://github.com/your-username/AssetBrandGuard.git)
cd AssetBrandGuard

```

### 2. Create a Virtual Environment & Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install fastapi uvicorn pydantic google-genai python-dotenv pinecone-client

```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add your credentials:

```env
GEMINI_API_KEY=your_google_genai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here

```

### 4. Ingest Brand Guidelines

Run the ingestion script to vectorize and upload your brand rules into Pinecone:

```bash
python ingest.py

```

### 5. Run the FastAPI Server

```bash
python main.py
# Server will start on [http://127.0.0.1:8000](http://127.0.0.1:8000)

```

---


```

```

```
