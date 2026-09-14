from langchain_text_splitters import RecursiveCharacterTextSplitter

def create_chunks(text):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=100
    )
    chunks = splitter.split_text(text) 
    return chunks 

def sample_chunks(chunks, num_chunks=10):

    if len(chunks) <= num_chunks:
        return chunks

    step = len(chunks) / num_chunks

    sampled = []

    for i in range(num_chunks):
        index = int(i * step)
        sampled.append(chunks[index])

    return sampled 