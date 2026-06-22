const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Course = require('./models/Course');

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for migration...');

        const coursesPath = path.join(__dirname, 'courses.json');
        const fileContent = fs.readFileSync(coursesPath, 'utf8');
        const { courses } = JSON.parse(fileContent);

        // Clear existing data
        await Course.deleteMany({});
        console.log('Cleared existing courses.');

        // Insert fresh data
        await Course.insertMany(courses);
        console.log(`Successfully migrated ${courses.length} courses to MongoDB!`);

        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
