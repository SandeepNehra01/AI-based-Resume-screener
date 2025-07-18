# 🧠 AI-Based Resume Screener

An AI-powered Resume Screener built with **React**, **FastAPI**, **Python**, and **Tailwind CSS**. This tool helps HR teams automatically rank resumes based on skills, experience, education, and job-description similarity using NLP.

---

## 🚀 Features

- 📄 Upload a ZIP file of multiple resumes (PDF/DOCX)
- 🧠 Extract skills, years of experience, and education level
- 🔍 NLP-based keyword matching and TF-IDF similarity scoring
- 🏆 Returns top 20 ranked candidates based on a weighted scoring model
- ⚡ Responsive frontend built with React and Tailwind CSS
- 🌐 RESTful API powered by FastAPI and Python

---

## ⚙️ Tech Stack

| Component  | Technology |
|------------|------------|
| Frontend   | React.js, Tailwind CSS |
| Backend    | FastAPI, Python |
| NLP Engine | Scikit-learn, TF-IDF, Cosine Similarity |
| Parsing    | PyPDF2, python-docx |
| Deployment | (Add when deployed: e.g., Render, Vercel, etc.) |

---

## 📁 Project Structure
ai-resume-screener/
├── backend/
│ ├── main.py # FastAPI backend
│ ├── requirements.txt # Python dependencies
│ └── ...
├── frontend/
│ ├── src/
│ │ ├── App.jsx
│ │ └── components/
│ ├── tailwind.config.js
│ └── ...
└── README.md


---

## 🧪 How It Works

1. **Upload resumes (as ZIP of PDFs/DOCX) and enter job description**.
2. Backend:
   - Extracts text using PyPDF2 and python-docx.
   - Extracts relevant info: skills, experience, and education.
   - Performs keyword matching with the job description.
   - Computes a weighted score based on:
     - Skill match: `50%`
     - Experience: `20%`
     - Education: `10%`
     - JD similarity (TF-IDF + cosine): `20%`
3. Returns top 20 candidates sorted by score.

---

## 🧠 Backend Scoring Logic

```python
final_score = (
    skill_score * 0.5 +
    experience_score * 0.2 +
    education_score * 0.1 +
    jd_similarity_score * 0.2
)
📈 Future Improvements

🔁 Feedback loop to enhance ranking logic
🤖 Use GPT or transformer-based models for better semantic matching
🔒 User authentication & role-based access (HR/Admin)
📊 Resume analytics and dashboard
📃 License

This project is open-source and available under the MIT License.

👨‍💻 Author

Sandeep Nehra
GitHub: @SandeepNehra01


