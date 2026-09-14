from utils.pdf_reader import extract_text
from utils.text_chunker import create_chunks
from utils.embeddings import create_embeddings,model
from utils.vector_store import create_vector_store, search
from utils.gemini import get_answer

pdf_path = "pdfs/sample.pdf"
text = extract_text(pdf_path)
chunks = create_chunks(text)
embeddings = create_embeddings(chunks)
index = create_vector_store(embeddings)

question = "What are the hardware requirements?"

question_embedding = model.encode([question]).astype("float32")
distances, indices = search(index, question_embedding)

retrieved_chunks = [chunks[idx] for idx in indices[0]] 
context = "\n\n".join(retrieved_chunks)

answer = get_answer(context, question)
print("\nGemini Answer:\n")
print(answer) 