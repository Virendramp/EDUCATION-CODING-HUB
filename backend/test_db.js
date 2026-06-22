const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    const courses = await Course.find();
    console.log(JSON.stringify(courses, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
