const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');

/**
 * UTILITY SCRIPT TO ADD A NEW COURSE
 * 
 * How to use:
 * 1. Edit the 'courseData' object below with your new course details.
 * 2. Run this command in your terminal:
 *    cd backend
 *    node add-course.js
 */

const courseData = {
    id: 9, // Make sure this is a unique ID number
    name: "React JS Basics",
    icon: "⚛️",
    tag: "Frontend",
    tagClass: "frontend",
    description: "Learn building modern user interfaces with React.",
    content: "Introduction to Hooks, Components, and State management.",
    fullContent: "# React JS - Modern Frontend\n\nReact is a JavaSript library for building user interfaces. \n\n## What you will learn:\n- Components & Props\n- State & Hooks\n- Virtual DOM\n- React Router\n"
};

const addCourse = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const newCourse = new Course(courseData);
        await newCourse.save();

        console.log(`✓ Successfully added: ${courseData.name}`);
        process.exit(0);
    } catch (error) {
        if (error.code === 11000) {
            console.error('✗ Error: This ID already exists! Please use a unique ID.');
        } else {
            console.error('✗ Error adding course:', error.message);
        }
        process.exit(1);
    }
};

addCourse();
