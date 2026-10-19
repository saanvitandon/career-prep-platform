# Ascend — AI Career Preparation Platform

Ascend is an AI-powered career preparation platform that helps students prepare for internships and placements through resume analysis, job description matching, interview preparation, personalized learning roadmaps, and AI-powered document assistance.

**[Try Ascend here](https://ascend-ai-prep.vercel.app/dashboard)**

## Features

- **AI Resume Analyzer** — Generates an AI-powered ATS-style score, resume strengths, and improvement suggestions using Google Gemini.
- **Resume–Job Description Matcher** — Evaluates how well a resume aligns with a job description, identifying matching skills, missing skills, and areas for improvement.
- **Interview Preparation** — Generates AI-powered interview questions to help students practice for technical and behavioral interviews.
- **Personalized Learning Roadmap** — Helps students structure their career preparation with personalized learning plans.
- **PDF Question Answering** — Allows users to upload PDF documents and ask questions about their content using Retrieval-Augmented Generation (RAG) with keyword-based text retrieval and Gemini-generated answers.
- **AI Career Assistant** — Provides AI-powered assistance for career preparation.
- **User Dashboard** — Provides centralized access to the platform's career preparation tools.
- **User Authentication** — Supports registration, login, JWT-based authentication, and protected API endpoints.

## Tech Stack

- **Frontend:** React.js, JavaScript, Tailwind CSS, Vite, React Router
- **Backend:** Node.js, Express.js, REST APIs
- **Database:** PostgreSQL, Supabase
- **AI Integration:** Google Gemini API
- **Authentication:** JSON Web Tokens (JWT)
- **PDF Processing:** `pdf-parse`, Multer
- **Deployment:** Vercel (frontend), Render (backend), Supabase (database)
- **Version Control:** Git, GitHub

## AI Concepts

- **Large Language Models (LLMs)** — Generate resume feedback, job compatibility assessments, interview questions, and document-based answers.
- **Natural Language Processing (NLP)** — Supports the analysis and interpretation of resume content and job descriptions.
- **Retrieval-Augmented Generation (RAG)** — Combines retrieved document text with an AI language model to generate context-based answers.
- **Prompt Engineering** — Uses structured prompts to guide Gemini's outputs for specific career preparation tasks.
- **AI-Based Resume Evaluation** — Produces ATS-style resume scores and actionable feedback.
- **Resume–Job Matching** — Evaluates resume alignment with job requirements, including skills and keyword matching.

## Deployment

- **Live Application:** [ascend-ai-prep.vercel.app](https://ascend-ai-prep.vercel.app)
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database Hosting:** Supabase PostgreSQL

## Security

- Sensitive credentials and API keys are managed through environment variables.
- Gemini API calls are handled by the backend.
- Protected API endpoints use JWT-based authentication.
- Environment files containing secrets should never be committed to version control.