const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Course = require('./models/Course');

async function syncJava() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✓ Connected to MongoDB');

        const coursesPath = path.join(__dirname, 'courses.json');
        const data = JSON.parse(fs.readFileSync(coursesPath, 'utf8'));
        const javaCourse = data.courses.find(c => c.id === 1);

        if (!javaCourse) {
            console.error('✗ Java course not found in courses.json');
            process.exit(1);
        }

        const result = await Course.findOneAndUpdate(
            { id: 1 },
            {
                tag: javaCourse.tag,
                description: javaCourse.description,
                content: javaCourse.content,
                fullContent: javaCourse.fullContent
            },
            { new: true }
        );

        if (result) {
            console.log('✓ Java course updated in MongoDB');
        } else {
            console.log('✗ Java course not found in MongoDB, creating it...');
            await Course.create(javaCourse);
            console.log('✓ Java course created in MongoDB');
        }

        await mongoose.disconnect();
        console.log('✓ Disconnected from MongoDB');
    } catch (err) {
        console.error('✗ Sync error:', err);
        process.exit(1);
    }
}

syncJava();
