const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    icon: { type: String, required: true },
    tag: { type: String, required: true },
    tagClass: { type: String, required: true },
    description: { type: String, required: true },
    topics: [{ type: String, required: true }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
