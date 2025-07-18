from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import zipfile
import os
import tempfile
import shutil
import re
from docx import Document
from PyPDF2 import PdfReader
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Extract text from DOCX
def extract_text_from_docx(docx_file):
    doc = Document(docx_file)
    return "\n".join([para.text for para in doc.paragraphs])

# Extract text from PDF
def extract_text_from_pdf(pdf_file):
    reader = PdfReader(pdf_file)
    return "\n".join([page.extract_text() or "" for page in reader.pages])

# Extract years of experience
def extract_experience(text):
    matches = re.findall(r'(\d+)\+?\s*(?:years|yrs)', text.lower())
    return max([int(m) for m in matches]) if matches else 0

# Check for education
def extract_education(text):
    keywords = ["b.tech", "bachelor", "computer science", "b.e", "bsc computer", "bca"]
    return any(kw in text.lower() for kw in keywords)

@app.post("/api/screen")
async def screen_resumes(
    resumes: UploadFile = File(...),
    job_description: str = Form(...)
):
    job_desc_text = job_description.lower()

    # Extract keywords from job description
    job_desc_keywords = re.findall(r'\b[a-zA-Z0-9\+\#\.]{2,}\b', job_desc_text)

    temp_dir = tempfile.mkdtemp()

    zip_path = os.path.join(temp_dir, "resumes.zip")
    with open(zip_path, "wb") as f:
        f.write(await resumes.read())

    with zipfile.ZipFile(zip_path, "r") as zip_ref:
        zip_ref.extractall(temp_dir)

    resume_texts = []
    file_data = []

    for file_name in os.listdir(temp_dir):
        if not file_name.lower().endswith((".docx", ".pdf")):
            continue

        file_path = os.path.join(temp_dir, file_name)
        try:
            if file_name.lower().endswith(".docx"):
                text = extract_text_from_docx(file_path)
            else:
                text = extract_text_from_pdf(file_path)

            lower_text = text.lower()

            matched_skills = [skill for skill in job_desc_keywords if skill in lower_text]
            experience_years = extract_experience(lower_text)
            has_degree = extract_education(lower_text)

            skill_score = len(matched_skills) / len(job_desc_keywords) if job_desc_keywords else 0
            exp_score = min(experience_years, 10) / 10
            edu_score = 1 if has_degree else 0

            resume_texts.append(lower_text)
            file_data.append({
                "name": os.path.splitext(file_name)[0],
                "matched_skills": matched_skills,
                "experience_years": experience_years,
                "education": has_degree,
                "skill_score": skill_score,
                "exp_score": exp_score,
                "edu_score": edu_score,
                "caution": len(matched_skills) > 5
            })

        except Exception as e:
            print(f"Error processing {file_name}: {e}")
            continue

    # Calculate TF-IDF similarity with job description
    if resume_texts:
        tfidf = TfidfVectorizer(stop_words="english")
        tfidf_matrix = tfidf.fit_transform([job_desc_text] + resume_texts)
        cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()

        for i, data in enumerate(file_data):
            jd_similarity = cosine_similarities[i]
            final_score = (
                data["skill_score"] * 0.5 +
                data["exp_score"] * 0.2 +
                data["edu_score"] * 0.1 +
                jd_similarity * 0.2
            )
            data["score"] = round(final_score, 3)

    top_candidates = sorted(file_data, key=lambda x: x["score"], reverse=True)[:20]

    response = [
        {
            "name": item["name"].replace("_resume", "").replace("resume", "").strip("_- "),
            "matched_skills": item["matched_skills"],
            "score": item["score"],
            "experience_years": item["experience_years"],
            "education": item["education"],
            "caution": item.get("caution", False)
        }
        for item in top_candidates
    ]

    shutil.rmtree(temp_dir)
    return JSONResponse(content={"matches": response})
