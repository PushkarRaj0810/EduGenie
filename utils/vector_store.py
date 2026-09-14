import faiss
import numpy as np

def create_vector_store(embeddings):
    embeddings = np.array(embeddings).astype("float32")
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    return index 

def search(index, question_embedding, k=3):

    distances, indices = index.search(question_embedding, k)

    return distances, indices