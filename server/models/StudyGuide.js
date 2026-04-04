const mongoose = require('mongoose');

const studyGuideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: String,
  moduleCode: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploaderName: String,
  uploaderRole: { type: String, default: 'student' },
  content: { type: String, required: true },
  fileType: String,
  fileName: String,
  fileSize: Number,
  tags: [String],
  description: String,
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  downloads: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 }
});

studyGuideSchema.index({ content: 'text', title: 'text', tags: 'text', moduleCode: 'text' });

module.exports = mongoose.model('StudyGuide', studyGuideSchema);