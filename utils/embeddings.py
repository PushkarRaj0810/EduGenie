import os

import numpy as np
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set.")

client = genai.Client(api_key=api_key)

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSION = 768


def _normalize(embeddings):
    embeddings = np.asarray(embeddings, dtype="float32")
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    return embeddings / np.maximum(norms, 1e-12)


def create_embeddings(chunks):
    if not chunks:
        return np.empty((0, EMBEDDING_DIMENSION), dtype="float32")

    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=chunks,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_DOCUMENT",
            output_dimensionality=EMBEDDING_DIMENSION,
        ),
    )

    embeddings = [embedding.values for embedding in result.embeddings]
    return _normalize(embeddings)


def create_query_embedding(question):
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=question,
        config=types.EmbedContentConfig(
            task_type="RETRIEVAL_QUERY",
            output_dimensionality=EMBEDDING_DIMENSION,
        ),
    )

    return _normalize([result.embeddings[0].values])
