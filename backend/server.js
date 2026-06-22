const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');
const TopicContent = require('./models/TopicContent');
const ytSearch = require('yt-search');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or file://)
    if (!origin || origin === 'null') {
      return callback(null, true);
    }
    return callback(null, true); // Allow all other origins as well
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('../firstp')); // Serve static files from the firstp directory


// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => console.error('✗ MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Node.js Backend with MongoDB!' });
});

// Get all courses from MongoDB
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get single course by ID (using the custom 'id' field)
app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findOne({ id: parseInt(req.params.id) });

    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ error: 'Course not found' });
    }
  } catch (err) {
    console.error('Error fetching course:', err);
    res.status(500).json({ error: 'Internal Server Error' });
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

// Generate content via ChatGPT API
app.post('/api/generate-content', async (req, res) => {
  try {
    const { topic } = req.body;
    
    // First, check if the content already exists in the database
    const existingContent = await TopicContent.findOne({ topicName: topic });
    if (existingContent) {
      console.log(`[Cache Hit] Serving pre-generated content for topic: ${topic}`);
      return res.json({ content: existingContent.content });
    }
    
    console.log(`[Cache Miss] Generating new content for topic: ${topic}`);
    const apiKey = process.env.API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "API Key is missing in backend/.env file." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        models: ["google/gemma-3-27b-it:free", "meta-llama/llama-3.3-70b-instruct:free", "openrouter/free"],
        max_tokens: 2500,
        messages: [{
          role: "system",
          content: "You are an expert coding tutor. Explain concepts exceptionally well with practical examples. Output cleanly formatted using markdown."
        }, {
          role: "user",
          content: `Write a high-quality, well-structured coding tutorial about "${topic}" for a student. Provide clear explanations and a few practical examples. Keep it medium length: highly informative but not overwhelmingly long.`
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("OpenAI Error:", data.error);
      return res.status(500).json({ error: data.error.message || "OpenAI API Error" });
    }

    const generatedContent = data.choices[0].message.content;

    // Save the newly generated content to the database for future use
    try {
      await TopicContent.create({ topicName: topic, content: generatedContent });
      console.log(`[Saved] Successfully stored content for topic: ${topic}`);
    } catch (dbErr) {
      console.error('Error saving generated content to DB:', dbErr);
    }

    res.json({ content: generatedContent });
  } catch (err) {
    console.error('Error generating AI content:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ask AI for General Queries
app.post('/api/ask-ai', async (req, res) => {
  try {
    const { question } = req.body;
    const apiKey = process.env.API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "API Key is missing in backend/.env file." });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5000",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        models: ["google/gemma-3-27b-it:free", "meta-llama/llama-3.3-70b-instruct:free", "openrouter/free"],
        max_tokens: 1500,
        messages: [{
          role: "system",
          content: "You are a helpful educational coding assistant. Answer the user's question with excellent quality and practical examples. Keep the answer medium length (around 200-400 words). Do not use large headings like `#`, just bolding."
        }, {
          role: "user",
          content: question
        }]
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error("OpenAI Error:", data.error);
      return res.status(500).json({ error: data.error.message || "OpenAI API Error" });
    }

    res.json({ answer: data.choices[0].message.content });
  } catch (err) {
    console.error('Error in Ask AI:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// YouTube Video Search API
app.get('/api/youtube-search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const result = await ytSearch(query);
    if (result && result.videos.length > 0) {
      res.json({ videoId: result.videos[0].videoId });
    } else {
      res.status(404).json({ error: 'Video not found' });
    }
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
