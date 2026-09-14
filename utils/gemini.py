import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

def get_answer(context, question):

    prompt = f"""
You are an AI tutor.

Answer the user's question using only the given context.

If the answer is not present in the context, say:
"I couldn't find the answer in the provided document."

Context:
{context}

Question:
{question}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
    )

    return response.text 

def get_summary(chunks):

    partial_summaries = []

    group_size = 10

    for i in range(0, len(chunks), group_size):

        group = chunks[i:i + group_size]
        group_text = "\n\n".join(group)

        prompt = f"""
You are an AI study assistant.

Summarize the following section of study material.

Instructions:
- Cover the important concepts.
- Use simple language.
- Keep important facts.
- Use bullet points where appropriate.
- Use only the provided study material.

Study Material:

{group_text}
"""

        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=prompt
        )

        partial_summaries.append(response.text)

    combined_summary = "\n\n".join(partial_summaries)

    final_prompt = f"""
You are an AI study assistant.

Below are summaries of different sections of one study document.

Create one final well-organized summary of the entire document.

Instructions:
- Remove repeated information.
- Preserve important concepts and facts.
- Organize related topics together.
- Use simple language.
- Use headings and bullet points where useful.
- Do not introduce information that is not present in the section summaries.

Section Summaries:

{combined_summary}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=final_prompt
    )

    return response.text

import json

def generate_quiz(context, num_questions=5):

    prompt = f"""
You are an AI quiz generator.

Create {num_questions} multiple-choice questions using ONLY the study material provided below.

Each question must:
- Have exactly 4 options
- Have exactly one correct answer
- Include the topic of the question
- Be based only on the provided material

For the "topic" field:
- Use a short topic name, preferably 1 to 4 words.
- Use the main concept being tested, not a description of the question.
- Keep topic names consistent across questions covering the same concept.
- Do not use phrases such as "Types of", "Key Components of",
  "Introduction to", or "Basics of" unless they are essential to the concept.

Examples:
"Key Components of Web Development" -> "Web Development"
"Types of Web Development" -> "Web Development"
"Introduction to Neural Networks" -> "Neural Networks"
"Basics of Neural Networks" -> "Neural Networks"

Return ONLY valid JSON.
Do not use markdown.
Do not use ```json.

Use this exact structure:

[
    {{
        "question": "Question text",
        "options": [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
        ],
        "answer": 0,
        "topic": "Topic name"
    }}
]

The answer must be the index of the correct option:
0 = first option
1 = second option
2 = third option
3 = fourth option

Study Material:

{context}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return json.loads(response.text)

def generate_flashcards(context, num_flashcards=10):

    prompt = f"""
You are an AI study assistant.

Create {num_flashcards} useful flashcards using ONLY the study material provided below.

Each flashcard should:
- Focus on an important concept
- Have a clear question
- Have a concise but useful answer
- Include the topic
- Use only information from the provided material
- Avoid duplicate flashcards

Return ONLY valid JSON.
Do not use markdown.
Do not use ```json.

Use exactly this structure:

[
    {{
        "question": "What is RAG?",
        "answer": "Retrieval-Augmented Generation combines information retrieval with language model generation.",
        "topic": "RAG Fundamentals"
    }}
]

Study Material:

{context}
"""

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt
    )

    return json.loads(response.text)