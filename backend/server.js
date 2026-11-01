const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Course = require('./models/Course');
const TopicContent = require('./models/TopicContent');
const ytSearch = require('yt-search');

// Local file-backed cache for instant responses
const CONTENT_CACHE_FILE = path.join(__dirname, 'content_cache.json');
let topicCache = {};
function loadTopicCache() {
  try {
    if (fs.existsSync(CONTENT_CACHE_FILE)) {
      topicCache = JSON.parse(fs.readFileSync(CONTENT_CACHE_FILE, 'utf8'));
      console.log(`[Cache] Loaded ${Object.keys(topicCache).length} pre-cached topics`);
    }
  } catch (e) {
    console.warn('[Cache] Could not load content_cache.json:', e.message);
  }
}
loadTopicCache();

function normalizeTopicKey(topic) {
  if (!topic) return '';
  return String(topic).toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function getCachedTopic(topic) {
  if (!topic) return null;
  const rawKey = topic.trim().toLowerCase();
  if (topicCache[rawKey]) return topicCache[rawKey];
  
  const normKey = normalizeTopicKey(topic);
  for (const [k, v] of Object.entries(topicCache)) {
    if (normalizeTopicKey(k) === normKey) {
      return v;
    }
  }
  return null;
}

function setCachedTopic(topic, content) {
  if (!topic || !content) return;
  const rawKey = topic.trim().toLowerCase();
  topicCache[rawKey] = content;
  try {
    fs.writeFileSync(CONTENT_CACHE_FILE, JSON.stringify(topicCache, null, 2), 'utf8');
  } catch (e) {
    console.warn('[Cache Save Error]:', e.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - permissive CORS so file://, localhost:3000, localhost:5000, 127.0.0.1 work smoothly
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

app.use(express.static('../firstp', {
  etag: false,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  }
})); // Serve static files without caching


// Database Connection — cached for Vercel serverless (avoids new connection per request)
let cachedConnection = null;

async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  cachedConnection = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  }).then((mongooseInstance) => {
    console.log('✓ Connected to MongoDB');
    return mongooseInstance;
  }).catch((err) => {
    cachedConnection = null;
    throw err;
  });

  return cachedConnection;
}

// Global middleware to ensure database connection before processing requests
const ensureDbConnection = async (req, res, next) => {
  const dbFreeRoutes = ['/youtube-search', '/ask-ai', '/debug-db', '/generate-content', '/submit-idea', '/generate-course'];
  console.log(`[ensureDbConnection] path=${req.path}, skip=${dbFreeRoutes.includes(req.path)}`);
  if (dbFreeRoutes.includes(req.path)) {
    return next();
  }
  try {
    await connectDB();
    req.dbConnected = true;
    next();
  } catch (err) {
    console.warn('Database connection warning (proceeding with fallback):', err.message);
    req.dbConnected = false;
    next();
  }
};
app.use('/api', ensureDbConnection);

// Helper to get fallback courses from courses.json
function getFallbackCourses() {
  try {
    const fs = require('fs');
    const coursesFilePath = path.join(__dirname, 'courses.json');
    if (fs.existsSync(coursesFilePath)) {
      const fileData = fs.readFileSync(coursesFilePath, 'utf8');
      const parsed = JSON.parse(fileData);
      return Array.isArray(parsed) ? parsed : (parsed.courses || []);
    }
  } catch (e) {
    console.error('Error reading fallback courses.json:', e);
  }
  return [];
}

// Diagnostics endpoint to verify environment variables and database connectivity
app.get('/api/debug-db', async (req, res) => {
  try {
    const mongoUriDefined = !!process.env.MONGODB_URI;
    const connectionState = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    let dbError = null;
    let dbStatus = 'Not Attempted';
    if (mongoUriDefined) {
      try {
        await connectDB();
        dbStatus = 'Successfully Connected';
      } catch (err) {
        dbStatus = 'Connection Failed';
        dbError = err.message;
      }
    }

    res.json({
      env: {
        MONGODB_URI_DEFINED: mongoUriDefined,
        MONGODB_URI_VAL: mongoUriDefined ? `${process.env.MONGODB_URI.substring(0, Math.min(25, process.env.MONGODB_URI.length))}...` : null,
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL || 'not_running_on_vercel'
      },
      connection: {
        readyState: connectionState,
        currentState: states[connectionState] || 'unknown',
        status: dbStatus,
        error: dbError
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Node.js Backend with MongoDB!' });
});

// Get all courses from MongoDB (or fallback to courses.json)
app.get('/api/courses', async (req, res) => {
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const courses = await Course.find();
      if (courses && courses.length > 0) {
        return res.json(courses);
      }
    }
    console.log('[Courses] DB disconnected or empty, returning courses.json fallback');
    const fallback = getFallbackCourses();
    res.json(fallback);
  } catch (err) {
    console.error('Error fetching courses from DB, using fallback:', err.message);
    const fallback = getFallbackCourses();
    res.json(fallback);
  }
});

// Get single course by ID (using the custom 'id' field)
app.get('/api/courses/:id', async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const course = await Course.findOne({ id: targetId });
      if (course) {
        return res.json(course);
      }
    }
    
    // Fallback to courses.json
    const fallbackCourses = getFallbackCourses();
    const course = fallbackCourses.find(c => c.id === targetId || c.id === String(targetId));
    if (course) {
      return res.json(course);
    }
    
    res.status(404).json({ error: 'Course not found' });
  } catch (err) {
    console.error('Error fetching course by ID:', err.message);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Create a new course (Save to MongoDB)
app.post('/api/courses', async (req, res) => {
  try {
    const newCourse = await Course.create(req.body);
    res.status(201).json(newCourse);
  } catch (err) {
    console.error('Error saving course:', err);
    res.status(400).json({ error: 'Could not save course.' });
  }
});

// Helper to escape regex special characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper for OpenRouter API with multiple resilient fallback models
async function callOpenRouter(messages, maxTokens = 2000) {
  const apiKey = process.env.API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("API Key is missing in backend/.env file.");

  const modelCandidates = [
    "openrouter/free",
    "nvidia/nemotron-3.5-lightning:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free"
  ];

  let lastError = null;
  for (const model of modelCandidates) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          max_tokens: maxTokens,
          messages: messages
        })
      });

      const data = await response.json();
      if (response.ok && data.choices && data.choices[0] && data.choices[0].message) {
        const content = data.choices[0].message.content || data.choices[0].message.reasoning;
        if (content && typeof content === 'string' && content.trim().length > 0) {
          return content.trim();
        }
      }
      lastError = data.error ? (data.error.message || JSON.stringify(data.error)) : `HTTP ${response.status}`;
      console.warn(`[OpenRouter] Model ${model} failed:`, lastError);
    } catch (e) {
      lastError = e.message;
      console.warn(`[OpenRouter] Error calling ${model}:`, e.message);
    }
  }

  throw new Error(lastError || "All free AI models currently unavailable.");
}

// Dynamic AI Course Generator
app.post('/api/generate-course', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'A valid course prompt/topic is required.' });
    }

    const cleanPrompt = prompt.trim();
    console.log(`[Course Generator] Received request for topic: "${cleanPrompt}"`);

    // Check if matching course already exists in MongoDB
    let existingCourse = null;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const escapedPrompt = escapeRegExp(cleanPrompt);
        existingCourse = await Course.findOne({ 
          name: { $regex: new RegExp(`^${escapedPrompt}$`, 'i') } 
        });
      }
    } catch (dbErr) {
      console.warn(`[DB Warning] Failed checking existing course: ${dbErr.message}`);
    }

    if (existingCourse) {
      console.log(`[Cache Hit] Returning existing course ID: ${existingCourse.id}`);
      return res.json({ course: existingCourse, cached: true });
    }

    // Attempt AI Generation via OpenRouter API
    const apiKey = process.env.API_KEY || process.env.OPENAI_API_KEY;
    let generatedCourseData = null;


    if (apiKey) {
      try {
        const rawText = await callOpenRouter([
          {
            role: "system",
            content: "You are an expert educational curriculum architect. Create a structured coding/technology course based on the user's prompt. Respond ONLY with raw valid JSON in this exact structure: {\"name\": \"Course Title\", \"icon\": \"Emoji Icon\", \"tag\": \"Short Category Tag\", \"tagClass\": \"script\", \"description\": \"Detailed 2-sentence description.\", \"topics\": [\"Topic 1\", \"Topic 2\", \"Topic 3\", \"Topic 4\", \"Topic 5\"]}"
          }, {
            role: "user",
            content: `Design a comprehensive beginner-to-advanced curriculum for: "${cleanPrompt}". Provide 5 to 7 logical topic modules.`
          }
        ], 1500);

        if (rawText) {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            generatedCourseData = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (aiErr) {
        console.error('[AI Error] Course generation failed, utilizing fallback template generator:', aiErr.message);
      }
    }

    // Intelligent Fallback Generator if AI key is unavailable or fails
    if (!generatedCourseData || !generatedCourseData.name || !Array.isArray(generatedCourseData.topics)) {
      const capitalizedTitle = cleanPrompt.charAt(0).toUpperCase() + cleanPrompt.slice(1);
      const lowerPrompt = cleanPrompt.toLowerCase();
      const isAI = lowerPrompt.includes('ai') || lowerPrompt.includes('ml') || lowerPrompt.includes('machine learning') || lowerPrompt.includes('intelligence');
      
      generatedCourseData = {
        name: capitalizedTitle,
        icon: isAI ? '🤖' : '🚀',
        tag: isAI ? 'AI & ML Track' : 'Custom Track',
        tagClass: 'script',
        description: `Comprehensive course track on ${capitalizedTitle}. Master core fundamentals, practical applications, and advanced real-world concepts.`,
        topics: [
          `Introduction to ${capitalizedTitle}`,
          `Core Principles & Fundamentals of ${capitalizedTitle}`,
          `Tools, Frameworks & Setup for ${capitalizedTitle}`,
          `Practical Hands-on Building & Workflows`,
          `Advanced Concepts & Best Practices`,
          `Real-World Projects & Future Outlook`
        ]
      };
    }

    // Assign a unique numeric ID
    let nextId = Math.floor(Date.now() / 1000) % 100000;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const lastCourse = await Course.findOne().sort({ id: -1 });
        if (lastCourse && typeof lastCourse.id === 'number') {
          nextId = Math.max(lastCourse.id + 1, 10);
        }
      }
    } catch (e) {
      console.warn('Using timestamp fallback ID:', nextId);
    }

    const finalCourse = {
      id: nextId,
      name: generatedCourseData.name || cleanPrompt,
      icon: generatedCourseData.icon || '🎓',
      tag: generatedCourseData.tag || 'Custom Track',
      tagClass: generatedCourseData.tagClass || 'script',
      description: generatedCourseData.description || `Comprehensive course on ${cleanPrompt}.`,
      topics: Array.isArray(generatedCourseData.topics) && generatedCourseData.topics.length > 0 
        ? generatedCourseData.topics 
        : [`Overview of ${cleanPrompt}`, `Getting Started`, `Core Modules`, `Summary`]
    };

    // Save to MongoDB if connected
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        await Course.create(finalCourse);
        console.log(`[Saved DB] Course created successfully with ID: ${finalCourse.id}`);
      }
    } catch (saveErr) {
      console.warn(`[DB Save Warning] ${saveErr.message}`);
    }

    return res.status(201).json({ course: finalCourse, success: true });
  } catch (err) {
    console.error('Error generating course:', err);
    // Return structured course fallback even on unexpected outer exceptions
    const fallbackTitle = (req.body && req.body.prompt) ? req.body.prompt.trim() : 'Custom Course';
    const emergencyCourse = {
      id: Math.floor(Date.now() / 1000) % 100000,
      name: fallbackTitle,
      icon: '🤖',
      tag: 'Custom Track',
      tagClass: 'script',
      description: `Comprehensive study track for ${fallbackTitle}.`,
      topics: [`Introduction to ${fallbackTitle}`, `Core Fundamentals`, `Practical Applications`, `Advanced Concepts`]
    };
    return res.status(201).json({ course: emergencyCourse, success: true });
  }
});

// Generate content via ChatGPT API (Fast cache first, no DB blocking delay)
app.post('/api/generate-content', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'Valid topic name is required.' });
    }

    const cleanTopic = topic.trim();

    // 1. Instant check in local cache (sub-millisecond response)
    const cachedLocal = getCachedTopic(cleanTopic);
    if (cachedLocal) {
      console.log(`[Cache Hit - Local] Serving instant content for: "${cleanTopic}"`);
      return res.json({ content: cachedLocal, source: 'cache' });
    }

    // 2. Check MongoDB cache only if DB is currently connected (never block on connectDB)
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const existingContent = await TopicContent.findOne({ topicName: cleanTopic });
        if (existingContent && existingContent.content) {
          console.log(`[Cache Hit - DB] Serving cached content for: "${cleanTopic}"`);
          setCachedTopic(cleanTopic, existingContent.content);
          return res.json({ content: existingContent.content, source: 'db' });
        }
      } catch (dbErr) {
        console.warn(`[DB Cache Check Warning] ${dbErr.message}`);
      }
    }

    console.log(`[Cache Miss] Generating new content for topic: "${cleanTopic}"`);

    let generatedContent = '';
    try {
      generatedContent = await callOpenRouter([
        {
          role: "system",
          content: "You are an expert coding tutor. Explain concepts exceptionally well with practical examples and code snippets. Output cleanly formatted using markdown."
        }, {
          role: "user",
          content: `Write a high-quality coding tutorial about "${cleanTopic}" for a student. Include clear explanations, bullet points, and code snippets with comments. Keep it focused and concise (~350-500 words).`
        }
      ], 1200);
    } catch (aiErr) {
      console.error('[AI Error] Generate content failed:', aiErr.message);
      // Fallback educational content so client never breaks or stays waiting
      generatedContent = `## Overview: ${cleanTopic}\n\n**${cleanTopic}** is a core concept in programming. Mastering it will help you write cleaner, more efficient, and robust software.\n\n### Key Principles\n- **Foundations**: Understand the underlying syntax, semantics, and execution flow.\n- **Practical Application**: Apply this concept to write modular, reusable code.\n- **Best Practices**: Focus on readability, performance, clean naming, and thorough testing.\n\n### Practical Code Pattern\n\`\`\`java\n// Key pattern for ${cleanTopic}\npublic class Demonstration {\n    public static void main(String[] args) {\n        System.out.println("Exploring ${cleanTopic}");\n    }\n}\n\`\`\`\n\n*Follow along with the video tutorial below for a comprehensive step-by-step walkthrough!*`;
    }

    // Save newly generated content to local cache so subsequent requests are instant
    setCachedTopic(cleanTopic, generatedContent);

    // Save to DB asynchronously if connected
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      TopicContent.create({ topicName: cleanTopic, content: generatedContent })
        .then(() => console.log(`[Saved to DB] Stored content for: "${cleanTopic}"`))
        .catch(dbErr => console.warn('[DB Save Warning]:', dbErr.message));
    }

    return res.json({ content: generatedContent, source: 'generated' });
  } catch (err) {
    console.error('Error generating AI content:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Ask AI for General Queries
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    try {
      const answer = await callOpenRouter([
        {
          role: "system",
          content: "You are a helpful educational coding assistant. Answer the user's question with excellent quality and practical examples. Keep the answer medium length (around 200-400 words). Do not use large headings like `#`, just bolding."
        }, {
          role: "user",
          content: question
        }
      ], 1500);

      res.json({ answer: answer });
    } catch (aiErr) {
      console.error('[Ask AI Error]:', aiErr.message);
      res.json({ 
        answer: `**${question}** is an important programming and technology topic.\n\nHere are the core fundamentals:\n1. **Core Concept**: It plays a central role in modern software development and computer science.\n2. **Practical Usage**: Developers use this to write clean, reusable, and performant code.\n3. **Recommended Next Step**: Review the related video tutorial below for a visual deep dive and hands-on code examples.`
      });
    }
  } catch (err) {
    console.error('Error in Ask AI:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Submit Idea API
app.post('/api/submit-idea', async (req, res) => {
  try {
    const { name, email, idea } = req.body;

    if (!name || !email || !idea) {
      return res.status(400).json({ error: 'Name, email, and idea are required.' });
    }

    let transporter;
    const hasRealCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;

    if (hasRealCredentials) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `New Idea Submission from ${name}`,
        text: `You have received a new idea submission.\n\nName: ${name}\nEmail: ${email}\n\nIdea:\n${idea}`
      };
  
      await transporter.sendMail(mailOptions);
    } else {
      // Fallback to console log if no real credentials are provided
      console.log("=========================================");
      console.log(`[TESTING] Idea received but no email credentials in .env!`);
      console.log(`Name: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Idea: ${idea}`);
      console.log("=========================================");
      
      // Artificial delay to simulate processing
      await new Promise(r => setTimeout(r, 800));
    }

    res.status(200).json({ message: 'Idea submitted successfully!' });
  } catch (err) {
    console.error('Error submitting idea:', err);
    res.status(500).json({ error: 'Failed to submit idea. Ensure email credentials are configured in .env.' });
  }
});

// YouTube Video Search API
app.get('/api/youtube-search', async (req, res) => {
  try {
    const rawQuery = req.query.q;
    if (!rawQuery || typeof rawQuery !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    const query = rawQuery.trim();
    console.log(`[YouTube Search] Query: "${query}"`);

    let result = null;
    try {
      result = await ytSearch(query);
    } catch (ytErr) {
      console.warn(`[YouTube Search Warning] Primary search failed:`, ytErr.message);
    }

    if (result && Array.isArray(result.videos) && result.videos.length > 0) {
      const topVideo = result.videos[0];
      return res.json({ 
        videoId: topVideo.videoId,
        title: topVideo.title,
        url: topVideo.url,
        thumbnail: topVideo.thumbnail
      });
    }

    // Fallback: simplified search query if initial query gave no results
    try {
      const simplified = query.replace(/(tutorial|programming|hindi|course)/gi, '').trim();
      if (simplified && simplified.toLowerCase() !== query.toLowerCase()) {
        const fallbackRes = await ytSearch(simplified + ' programming tutorial');
        if (fallbackRes && Array.isArray(fallbackRes.videos) && fallbackRes.videos.length > 0) {
          const topVideo = fallbackRes.videos[0];
          return res.json({ 
            videoId: topVideo.videoId,
            title: topVideo.title,
            url: topVideo.url,
            thumbnail: topVideo.thumbnail
          });
        }
      }
    } catch (fallbackErr) {
      console.warn(`[YouTube Search Warning] Fallback search failed:`, fallbackErr.message);
    }

    res.status(404).json({ error: 'Video not found' });
  } catch (err) {
    console.error('Error in YouTube search:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server (only when running directly, not when required as a module or on Vercel)
if (process.env.VERCEL !== '1' && require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
