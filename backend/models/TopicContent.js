const mongoose = require('mongoose');

const TopicContentSchema = new mongoose.Schema({
    topicName: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    videoId: { type: String, required: false }
}, { timestamps: true });

module.exports = mongoose.model('TopicContent', TopicContentSchema);
