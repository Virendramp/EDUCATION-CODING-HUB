# 🎓 Education Coding Hub

An interactive web application designed to help students master coding concepts through structured course modules, interactive topic guides, AI-powered tutoring, dynamic content generation, and embedded video search.

---

## ✨ Features

- **📚 Interactive Courses & Topic Guides**: Explore diverse programming languages and technology tracks with detailed lesson topics and interactive guides.
- **🤖 AI-Powered Coding Assistant**: Powered by OpenRouter API (supporting models like Gemma and Llama) to answer coding queries and generate dynamic content for topics on-demand.
- **🎥 Integrated Video Search**: Automatically finds relevant YouTube tutorial videos for topics using `yt-search`.
- **💡 Idea & Feedback Submission**: Allows users to submit new topic/feature ideas directly to administrators with automated email processing (`Nodemailer`).
- **🕒 User Learning History**: Tracks viewed topics and learning history for students.
- **⚡ Vercel Serverless Ready**: Configured for effortless full-stack serverless deployment on Vercel.

---

## 🏗️ Repository Architecture

```
Rproject/
├── backend/                  # Node.js & Express REST API backend
│   ├── models/               # Mongoose schema definitions
│   │   ├── Course.js         # Course data model
│   │   └── TopicContent.js   # Cached AI-generated topic content model
│   ├── server.js             # Main Express application & API routing
│   ├── courses.json          # Seed/Fallback course data
│   ├── package.json          # Backend dependencies & scripts
│   └── .env                  # Environment configuration (DB, API Keys)
├── firstp/                   # Frontend client web app (Static HTML/CSS/JS)
│   ├── index.html            # Main landing page & courses grid
│   ├── course.html           # Detailed course module viewer
│   ├── topic.html            # Individual topic learning interface
│   ├── history.html          # User learning history page
│   ├── ai-search.html        # Interactive AI search interface
│   ├── script.js             # Client-side app logic & API integration
│   ├── style.css             # Main stylesheet & custom UI design
│   └── courses.json          # Client fallback data store
├── vercel.json               # Serverless deployment configuration for Vercel
└── README.md                 # Project documentation
```

---

## 🛠️ Tech Stack

### **Frontend**
- **HTML5 & Vanilla CSS3**: Responsive design with CSS Grid, Flexbox, custom animations, and glassmorphism styling.
- **JavaScript (ES6+)**: Dynamic DOM manipulation, fetch API integration, and local storage state handling.
- **FontAwesome & Google Fonts (Outfit)**: Clean visual aesthetics and modern typography.

### **Backend**
- **Node.js & Express.js**: RESTful API server.
- **MongoDB & Mongoose**: Object Data Modeling (ODM) for database management and cached topic contents.
- **OpenRouter API**: AI text generation for course topics and assistant search queries.
- **Nodemailer**: Email notifications for idea submissions.
- **yt-search**: YouTube search integration for fetching top relevant tutorial videos.

---

## 🚀 Quick Start Guide

### **Prerequisites**
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or MongoDB Atlas cluster)
- An OpenRouter API Key (or OpenAI-compatible API key) for AI features

---

### **1. Clone the Repository & Install Dependencies**

```bash
git clone https://github.com/Virendramp/EDUCATION-CODING-HUB.git
cd Rproject/backend
npm install
```

---

### **2. Configure Environment Variables**

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/education_hub?retryWrites=true&w=majority
API_KEY=your_openrouter_api_key_here
EMAIL_USER=your_email@gmail.com    # Optional: for Nodemailer email notifications
EMAIL_PASS=your_email_app_password  # Optional: Gmail App Password
```

---

### **3. Start the Server**

#### **Development Mode (with auto-reload):**
```bash
cd backend
npm run dev
```

#### **Production Mode:**
```bash
cd backend
npm start
```

Once running, access the web application in your browser at:
👉 **`http://localhost:5000`**

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/courses` | Retrieve all courses from MongoDB |
| `GET` | `/api/courses/:id` | Get details for a specific course by ID |
| `POST` | `/api/courses` | Create a new course record |
| `POST` | `/api/generate-content` | Generate or retrieve cached AI tutorial content for a topic |
| `POST` | `/api/ask-ai` | Submit general questions to the AI assistant |
| `POST` | `/api/submit-idea` | Submit feature/course ideas (triggers email or server log) |
| `GET` | `/api/youtube-search` | Fetch top YouTube video ID for a search query |
| `GET` | `/api/debug-db` | Diagnostics endpoint checking DB connection & env variables |

---

## 🌐 Deployment (Vercel)

The repository includes a pre-configured `vercel.json` for serverless deployment:

1. Push your repository to GitHub.
2. Import the project in your [Vercel Dashboard](https://vercel.com).
3. Configure the environment variables (`MONGODB_URI`, `API_KEY`, `EMAIL_USER`, `EMAIL_PASS`) in Vercel settings.
4. Deploy!

---

## 📄 License

This project is open-source and available under the **MIT License**.
