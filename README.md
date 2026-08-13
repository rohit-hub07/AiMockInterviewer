# AI Mock Interviewer

An AI-powered mock interview platform where users can upload their resume, get personalized interview questions, practice with a video-based interview flow, and receive strict scoring and feedback.

## Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- React Hot Toast

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication (cookies)
- Multer (file uploads)
- Google Gemini AI (`@google/genai`)
- PDF parsing (`pdf-parse`, `mammoth`)

## Project Flow

```
1. Signup / Login
        |
2. Upload Resume (PDF/DOCX)
        |
3. Backend extracts text → Gemini generates 10 questions
        |
4. Interview Session Created
        |
5. Camera/Mic permission requested
        |
6. For each question:
   - AI speaks the question (Web Speech API)
   - User records video answer (MediaRecorder API)
   - Skip option available
        |
7. Interview ends:
   - All answers submitted to backend
   - Gemini evaluates answers and returns feedback JSON
   - Backend computes final score = (answeredCount / totalQuestions) * 100
   - Score saved to InterviewSession
   - Feedback, strengths, improvements saved to Feedback document
        |
8. Redirect to Dashboard
   - View interview history
   - Click "View Feedback" to see score, strengths, weaknesses, Q&A
```

## Scoring Logic

- Score is computed **locally** on the backend based purely on participation:
  - `score = (answeredCount / totalQuestions) * 100`
- A question is considered **answered** if:
  - A video recording was captured (blob size > 50KB), AND
  - The answer text is not empty and not the default skipped message
- A question is considered **skipped** if:
  - No recording was made, OR
  - Recording was too short, OR
  - User explicitly skipped
- **0 answered questions = 0% score**
- Gemini is used only for qualitative feedback (strengths, weaknesses, detailed text), NOT for the numerical score.
- The feedback prompt is configured to be strict: missing answers receive zero credit, and the AI is instructed not to hallucinate positive feedback for absent content.

## Folder Structure

```
frontend/
  src/
    components/       # Reusable UI components
    context/          # AuthContext
    hooks/            # useCamera, useMediaRecorder
    lib/              # API calls, interview helpers
    pages/            # Home, Login, Signup, Upload, Interview, Dashboard
    types/            # TypeScript interfaces

backend/
  src/
    controllers/      # Route handlers
    db/               # MongoDB connection
    middlewares/       # Auth, Multer
    models/           # Mongoose schemas
    routes/           # Express routers
    utils/            # Gemini prompts, score calculator, text cleaning
```

## Setup Instructions

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Google Gemini API key

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment variables

#### Backend (`backend/.env`)
```
PORT=8000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ai-mock-interviewer
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API=your-gemini-api-key-here
NODE_ENV=development
```

#### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:8000
```

### 3. Run the application

```bash
# Backend (from backend/ directory)
npm run dev

# Frontend (from frontend/ directory)
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

### 4. Build for production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## Key Environment Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `8000` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/your-database-name` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `GEMINI_API` | Google Gemini API key | Required |
| `NODE_ENV` | Environment mode | `development` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:8000` |

## Interview Flow Details

1. **Resume Upload**: User uploads a PDF or DOCX resume. The backend extracts text using `pdf-parse` or `mammoth`, sends it to Gemini, and stores the generated questions.

2. **Interview Session**: A session is created in MongoDB. Questions are linked to this session.

3. **Question Playback**: Each question is spoken aloud using the browser's `Web Speech API` (TTS). A visual indicator shows when the AI is speaking.

4. **Answer Recording**: The browser captures camera and microphone via `getUserMedia`. The `MediaRecorder` API records the user's answer as a webm video.

5. **Skipping**: Users can skip questions. Skipped questions receive a default answer text (`"I don't know the answer of this question"`).

6. **Submission**: At the end of the interview, all answers are submitted to the backend as text. The backend creates `Answer` and `Feedback` documents, calculates the score, and updates the `InterviewSession`.

7. **Feedback**: Gemini evaluates the answers and returns a strict JSON response containing `score` (used only for qualitative reference), `strengths`, `improvements`, and `detailedFeedback`. The final numerical score is always the participation-based calculation.

## Auth Flow

- Registration and login use JWT stored in HTTP-only cookies.
- Protected routes on the frontend (`ProtectedRoute`) redirect unauthenticated users to `/login`.
- Backend middleware (`isLoggedIn`) verifies the JWT cookie and attaches `req.userId`.

## Notes

- Video uploads are not yet fully implemented; answers are currently stored as text with a skip flag based on recording presence.
- The camera stream is automatically released when the interview ends or the user navigates away.
- MongoDB model names: `User`, `InterviewSession`, `Question`, `Answer`, `Feedback`.
