# AI-Powered Tutoring Platform

![Platform Banner](https://your-image-link-here.com/banner.png)  
*Professional AI-driven tutoring platform built with Next.js, TypeScript, React, MongoDB, and LLM integration via OpenRouter.*

---

## 🚀 Overview

This repository hosts a **full-stack AI tutoring platform** that transforms raw content into interactive lessons and assessments. Users can upload documents, generate AI-powered lesson modules, interact via chat, take quizzes, and track progress. The system supports multiple LLMs, providing a personalized learning experience.

**Project Highlights:**
- Secure authentication (Email/Password + OAuth)  
- Document ingestion pipeline with PDF/DOCX parsing  
- AI-powered lesson module generation and chat  
- Dynamic quizzes with AI grading  
- Multi-model LLM selection (GPT-4, LLaMA, Gemini, DeepSeek)  
- Dashboard for progress tracking and historical analytics  

---

## ✨ Features

<details>
<summary>Authentication & User Management</summary>

- NextAuth-powered sign-up/sign-in  
- OAuth integration (Google, GitHub)  
- Persistent session management in MongoDB  

</details>

<details>
<summary>Document Upload & Processing</summary>

- Upload PDFs or DOCXs  
- Automatic text extraction using `pdf-parse` and `mammoth`  
- Metadata storage linked to authenticated users  

</details>

<details>
<summary>AI Chat Interface</summary>

- Lesson-specific conversational AI  
- Persistent conversation history  
- Real-time AI responses via OpenRouter  

</details>

<details>
<summary>Lesson Module Generation</summary>

- Automatic content outlining into structured lessons  
- Introduction, key concepts, explanations, examples, and summary  
- Isolated chat histories per lesson  

</details>

<details>
<summary>Assessment & Progress Tracking</summary>

- Dynamic quiz generation (MCQs, theoretical, practical)  
- Hybrid grading: rule-based + AI for free-text answers  
- Track attempts, averages, and historical performance  

</details>

<details>
<summary>Multi-Model AI Support</summary>

- Users can select preferred AI engine: GPT-4, LLaMA, Gemini, DeepSeek  
- Transparent failover handling  
- Personalized tutoring experience  

</details>

<details>
<summary>Dashboard & UX Enhancements</summary>

- Overview of all topics and completion rates  
- Drill-down into lessons and quizzes  
- Edit/delete topics/tests with real-time updates  

</details>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Next.js, TypeScript |
| Backend | Node.js, Next.js API routes |
| Authentication | NextAuth.js (OAuth + Credentials) |
| Database | MongoDB with Mongoose |
| AI Integration | OpenRouter API (GPT-4, LLaMA, Gemini, DeepSeek) |
| Document Processing | `pdf-parse`, `mammoth` |
| UI Components | React Modals, Collapsible Panels, Progress Bars |

---

## 🏗 Architecture Overview

The platform uses a **layered architecture**:

1. **Presentation Layer:** React components (Dashboard, TopicProgress, ChatBox, TestComponent)  
2. **Controller Layer:** API endpoints (AuthController, FileController, ChatAPI, TestAPI)  
3. **Service Layer:** Business logic for authentication, file handling, AI prompts, and assessments  
4. **Persistence Layer:** MongoDB schemas for Users, Files, Topics, Lessons, Tests, and Chat histories  

> This separation ensures maintainable, scalable, and testable code.

---

## ⚡ Installation

```bash
git clone https://github.com/yourusername/ai-tutoring-platform.git
cd ai-tutoring-platform
npm install
```
Create a .env.local file at the root of your project with the following variables:
```
MONGO_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
OPENROUTER_API_KEY=your_openrouter_api_key

```
Run the development server:
```
npm run dev

```
Open http://localhost:3000
 in your browser to see the app.

---

## 🧩 Usage

1. Sign up or log in using email or OAuth (Google/GitHub).  
2. Upload PDF or DOCX files as learning material.  
3. Generate AI-powered lesson modules automatically.  
4. Chat with AI per lesson, with persistent conversation history.  
5. Take dynamic quizzes with hybrid AI grading.  
6. Track progress and view detailed analytics on the dashboard.  
7. Select your preferred AI model for a personalized learning experience.

---

## 📈 Contributions

Contributions are welcome! You can:

- Enhance AI capabilities or integrate new LLMs.  
- Improve UI/UX for lessons, chat, and dashboard.  
- Add new features like gamification or content recommendations.  

Please open an issue or submit a pull request for any changes.

---

## 📝 License

This project is licensed under the **MIT License** © 2025 [Your Name]

---

## 📬 Contact

- LinkedIn: [Your LinkedIn](https://www.linkedin.com/in/yourprofile)  
- Email: your.email@example.com  
- GitHub: [github.com/yourusername](https://github.com/yourusername)

---

## ⭐ Acknowledgements

- [Next.js](https://nextjs.org/) for full-stack React framework.  
- [NextAuth.js](https://next-auth.js.org/) for authentication.  
- [MongoDB](https://www.mongodb.com/) for database storage.  
- [OpenRouter](https://openrouter.ai/) for LLM integration.  
- [`pdf-parse`](https://www.npmjs.com/package/pdf-parse) and [`mammoth`](https://www.npmjs.com/package/mammoth) for document processing.

---

## 🏆 Skills Demonstrated

- Full-stack development with TypeScript, React, and Next.js.  
- Secure authentication with OAuth and credentials-based login.  
- API design and integration with AI models via OpenRouter.  
- Dynamic content generation and processing from uploaded documents.  
- AI-powered assessments and hybrid grading systems.  
- Data persistence and relational management using MongoDB and Mongoose.  
- Responsive and interactive UI/UX with dashboards, modals, and progress tracking.  

