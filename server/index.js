require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Groq = require('groq-sdk');
const StudyGuide = require('./models/StudyGuide');
const pdfParseLib = require('pdf-parse');
const pdfParse = pdfParseLib.default || pdfParseLib;
const mammoth = require('mammoth');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { User, FriendRequest, Message, Post, MarketplaceItem, LostFound, GroupChat, StudyResource, NewsPost, ExamThread, ConnectionProfile, ConnectionLike, ConnectionMatch } = require('./models');

// New model for Single and Mingle
const SingleAndMingleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  relationshipStatus: { type: String, enum: ['single', 'in-relationship', 'married', 'complicated'], required: true },
  joinReason: { type: String }, // For those in relationship
  isApproved: { type: Boolean, default: false }, // Admin approval for those in relationship
  bio: { type: String, maxlength: 500 },
  interests: [{ type: String }],
  age: { type: Number },
  photos: [{ type: String }],
  lookingFor: { type: String },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
});

const SingleAndMingle = mongoose.model('SingleAndMingle', SingleAndMingleSchema);

// Mingle Request Schema
const MingleRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  senderGender: { type: String, required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverName: { type: String, required: true },
  receiverGender: { type: String, required: true },
  message: { type: String, maxlength: 500 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  respondedAt: { type: Date }
});

const MingleRequest = mongoose.model('MingleRequest', MingleRequestSchema);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://your-app.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// File upload setup
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://rodtechcomputerservices_db_user:Ko8CWgYyxOG2OHpu@cluster0.asdxcle.mongodb.net/univen-chat?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => { console.log("✅ MongoDB Connected"); })
  .catch(err => { console.log("❌ MongoDB Error:", err.message); });

// === AUTH ENDPOINTS ===
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, displayName, gender, relationshipStatus, age } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      password: hashedPassword, 
      displayName: displayName || username, 
      role: 'student',
      gender: gender || 'other',
      relationshipStatus: relationshipStatus || 'single',
      age: age || null
    });
    
    await newUser.save();

    // Auto-join Single and Mingle if single and wants to join
    if (relationshipStatus === 'single' && req.body.joinSingleAndMingle) {
      const mingleProfile = new SingleAndMingle({
        user: newUser._id,
        username: newUser.username,
        displayName: newUser.displayName,
        gender: gender || 'other',
        relationshipStatus: 'single',
        bio: req.body.bio || '',
        interests: req.body.interests || [],
        age: age || null,
        photos: req.body.photos || [],
        lookingFor: req.body.lookingFor || '',
        isApproved: true
      });
      await mingleProfile.save();
    }

    res.json({ 
      message: 'User created!', 
      user: { 
        username, 
        displayName, 
        id: newUser._id, 
        role: 'student',
        gender: gender,
        relationshipStatus: relationshipStatus
      } 
    });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    res.json({ 
      message: 'Login successful!', 
      user: { 
        username, 
        displayName: user.displayName, 
        id: user._id, 
        role: user.role || 'student',
        gender: user.gender,
        relationshipStatus: user.relationshipStatus
      } 
    });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// === SET FOUNDER ROLE ===
app.post('/api/set-founder', async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOneAndUpdate({ username }, { role: 'founder' }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `✅ ${username} is now a FOUNDER!`, user: { username: user.username, role: user.role } });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// === ROOM ENDPOINTS ===
app.get('/api/rooms', (req, res) => {
  const rooms = [
    { id: 'cafeteria', name: '🏪 The Cafeteria', description: 'General social chat', type: 'public' },
    { id: 'library', name: '📚 The Library', description: 'Quiet study mode', type: 'quiet' },
    { id: 'lost-found', name: '🔍 Lost & Found', description: 'Find lost items', type: 'public' },
    { id: 'exam-prep', name: '📝 Exam Prep', description: 'Auto-clears every 24hrs', type: 'temporary' },
    { id: 'marketplace', name: '💼 Marketplace', description: 'Buy & sell stuff', type: 'market' },
    { id: 'single-mingle', name: '💕 Single & Mingle', description: 'Meet new people', type: 'dating' }
  ];
  res.json(rooms);
});

// === SINGLE AND MINGLE ENDPOINTS ===

// Join Single and Mingle
app.post('/api/single-mingle/join', async (req, res) => {
  try {
    const { userId, username, displayName, gender, relationshipStatus, bio, interests, age, photos, lookingFor, joinReason } = req.body;

    // Check if already in Single and Mingle
    const existing = await SingleAndMingle.findOne({ user: userId });
    if (existing) return res.status(400).json({ error: 'Already in Single and Mingle' });

    // If in relationship, needs admin approval
    const isApproved = relationshipStatus === 'single';

    const mingleProfile = new SingleAndMingle({
      user: userId,
      username,
      displayName,
      gender,
      relationshipStatus,
      joinReason: relationshipStatus !== 'single' ? joinReason : null,
      bio: bio || '',
      interests: interests || [],
      age: age || null,
      photos: photos || [],
      lookingFor: lookingFor || '',
      isApproved
    });

    await mingleProfile.save();

    res.json({ 
      message: isApproved ? '✅ Joined Single and Mingle!' : '⏳ Request submitted for approval',
      profile: mingleProfile 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all Single and Mingle profiles (opposite gender only)
app.get('/api/single-mingle/profiles', async (req, res) => {
  try {
    const { userId, gender } = req.query;
    
    // Find opposite gender profiles
    const oppositeGender = gender === 'male' ? 'female' : gender === 'female' ? 'male' : null;
    
    let query = { isApproved: true };
    if (oppositeGender) {
      query.gender = oppositeGender;
    }

    const profiles = await SingleAndMingle.find(query)
      .populate('user', 'username displayName avatar status')
      .sort({ lastActive: -1 });

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send mingle request
app.post('/api/single-mingle/request', async (req, res) => {
  try {
    const { senderId, senderName, senderGender, receiverId, receiverName, receiverGender, message } = req.body;

    // Validate opposite gender
    if (senderGender === receiverGender) {
      return res.status(400).json({ error: 'You can only send requests to opposite gender' });
    }

    // Check if request already exists
    const existing = await MingleRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (existing) {
      return res.status(400).json({ error: 'Request already exists' });
    }

    const request = new MingleRequest({
      sender: senderId,
      senderName,
      senderGender,
      receiver: receiverId,
      receiverName,
      receiverGender,
      message: message || ''
    });

    await request.save();
    await request.populate('sender', 'username displayName');
    await request.populate('receiver', 'username displayName');

    res.json({ message: 'Request sent!', request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending requests
app.get('/api/single-mingle/requests/:userId', async (req, res) => {
  try {
    const requests = await MingleRequest.find({ 
      receiver: req.params.userId, 
      status: 'pending' 
    }).sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Accept/Reject request
app.put('/api/single-mingle/request/:requestId', async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    
    const request = await MingleRequest.findByIdAndUpdate(
      req.params.requestId,
      { 
        status,
        respondedAt: new Date()
      },
      { new: true }
    );

    if (!request) return res.status(404).json({ error: 'Request not found' });

    // If accepted, create a match
    if (status === 'accepted') {
      const match = new ConnectionMatch({
        user1: request.sender,
        user2: request.receiver,
        matchedAt: new Date(),
        matchedVia: 'single-mingle'
      });
      await match.save();
    }

    res.json({ message: `Request ${status}`, request });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my matches
app.get('/api/single-mingle/matches/:userId', async (req, res) => {
  try {
    const acceptedRequests = await MingleRequest.find({
      $or: [
        { sender: req.params.userId, status: 'accepted' },
        { receiver: req.params.userId, status: 'accepted' }
      ]
    }).populate('sender', 'username displayName avatar').populate('receiver', 'username displayName avatar');

    res.json(acceptedRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update profile
app.put('/api/single-mingle/profile/:userId', async (req, res) => {
  try {
    const { bio, interests, lookingFor, photos } = req.body;
    
    const profile = await SingleAndMingle.findOneAndUpdate(
      { user: req.params.userId },
      { 
        bio,
        interests,
        lookingFor,
        photos,
        lastActive: new Date()
      },
      { new: true }
    );

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json({ message: 'Profile updated', profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Leave Single and Mingle
app.delete('/api/single-mingle/leave/:userId', async (req, res) => {
  try {
    await SingleAndMingle.findOneAndDelete({ user: req.params.userId });
    res.json({ message: 'Left Single and Mingle' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Approve profiles (for those in relationship)
app.get('/api/single-mingle/admin/pending', async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'founder') {
      return res.status(403).json({ error: 'Founder only' });
    }

    const pending = await SingleAndMingle.find({ isApproved: false })
      .populate('user', 'username displayName');

    res.json(pending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/single-mingle/admin/approve/:profileId', async (req, res) => {
  try {
    const { userId, approve } = req.body;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'founder') {
      return res.status(403).json({ error: 'Founder only' });
    }

    const profile = await SingleAndMingle.findByIdAndUpdate(
      req.params.profileId,
      { isApproved: approve === true },
      { new: true }
    );

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json({ message: `Profile ${approve ? 'approved' : 'rejected'}`, profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === USER ENDPOINTS ===
app.get('/api/users', async (req, res) => {
  try { 
    const users = await User.find().select('-password'); 
    res.json(users); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// === FRIEND REQUEST ENDPOINTS ===
app.post('/api/friend-request', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const existing = await FriendRequest.findOne({ 
      $or: [
        { sender: senderId, receiver: receiverId }, 
        { sender: receiverId, receiver: senderId }
      ] 
    });
    
    if (existing) return res.status(400).json({ error: 'Friend request already exists' });

    const request = new FriendRequest({ sender: senderId, receiver: receiverId });
    await request.save();
    await request.populate('sender', 'username displayName avatar');
    
    res.json({ message: 'Friend request sent', request });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/friend-requests/:userId', async (req, res) => {
  try { 
    const requests = await FriendRequest.find({ 
      receiver: req.params.userId, 
      status: 'pending' 
    }).populate('sender', 'username displayName avatar'); 
    res.json(requests); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.put('/api/friend-request/:requestId', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await FriendRequest.findById(req.params.requestId);
    
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    request.status = status;
    await request.save();
    
    if (status === 'accepted') {
      await User.findByIdAndUpdate(request.sender, { $push: { friends: request.receiver } });
      await User.findByIdAndUpdate(request.receiver, { $push: { friends: request.sender } });
    }
    
    res.json({ message: `Request ${status}`, request });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/friends/:userId', async (req, res) => {
  try { 
    const user = await User.findById(req.params.userId).populate('friends', 'username displayName avatar status'); 
    res.json(user.friends || []); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/block', async (req, res) => {
  try { 
    const { userId, blockedUserId } = req.body; 
    await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: blockedUserId } }); 
    res.json({ message: 'User blocked' }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// === MESSAGING ENDPOINTS ===
app.get('/api/messages/:userId/:friendId', async (req, res) => {
  try { 
    const messages = await Message.find({ 
      $or: [
        { sender: req.params.userId, receiver: req.params.friendId }, 
        { sender: req.params.friendId, receiver: req.params.userId }
      ] 
    }).sort({ createdAt: 1 }).populate('sender', 'username displayName'); 
    res.json(messages); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.put('/api/message/:messageId/read', async (req, res) => {
  try { 
    const message = await Message.findByIdAndUpdate(
      req.params.messageId, 
      { read: true, readAt: new Date() }, 
      { new: true }
    ); 
    res.json(message); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// === POSTS ENDPOINTS ===
app.get('/api/posts', async (req, res) => { 
  try { 
    const posts = await Post.find().sort({ timestamp: -1 }); 
    res.json(posts); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/posts', async (req, res) => { 
  try { 
    const newPost = new Post({ author: req.body.author, content: req.body.content }); 
    await newPost.save(); 
    res.json(newPost); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.put('/api/posts/:id/like', async (req, res) => { 
  try { 
    const { username } = req.body; 
    const post = await Post.findById(req.params.id); 
    
    if (post.likedBy.includes(username)) { 
      post.likes -= 1; 
      post.likedBy = post.likedBy.filter(u => u !== username); 
    } else { 
      post.likes += 1; 
      post.likedBy.push(username); 
    } 
    
    await post.save(); 
    res.json(post); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.delete('/api/posts/:id', async (req, res) => { 
  try { 
    await Post.findByIdAndDelete(req.params.id); 
    res.json({ message: 'Post deleted' }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

// === PROFILE ENDPOINTS ===
app.get('/api/profile/:username', async (req, res) => { 
  try { 
    const user = await User.findOne({ username: req.params.username }).select('-password'); 
    res.json(user); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.put('/api/profile/:username', async (req, res) => { 
  try { 
    const { displayName, bio, avatar, levelOfStudy, degreeName, faculty, race, ethnicGroup, gender, relationshipStatus } = req.body; 
    const user = await User.findOneAndUpdate(
      { username: req.params.username }, 
      { displayName, bio, avatar, levelOfStudy, degreeName, faculty, race, ethnicGroup, gender, relationshipStatus }, 
      { new: true }
    ).select('-password'); 
    res.json(user); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

// === LOST & FOUND ENDPOINTS ===
app.get('/api/lost-found', async (req, res) => { 
  try { 
    const items = await LostFound.find().sort({ createdAt: -1 }).populate('user', 'username displayName'); 
    res.json(items); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/lost-found', async (req, res) => { 
  try { 
    const { userId, username, type, title, description, location, date, images, contactInfo } = req.body; 
    const item = new LostFound({ 
      user: userId, 
      username, 
      type, 
      title, 
      description, 
      location, 
      date, 
      images: images || [], 
      contactInfo 
    }); 
    await item.save(); 
    res.json(item); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.put('/api/lost-found/:id/claim', async (req, res) => { 
  try { 
    const { userId, verificationNotes } = req.body; 
    const item = await LostFound.findByIdAndUpdate(
      req.params.id, 
      { status: 'CLAIMED', claimedBy: userId, verificationNotes }, 
      { new: true }
    ); 
    res.json(item); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.put('/api/lost-found/:id/return', async (req, res) => { 
  try { 
    const item = await LostFound.findByIdAndUpdate(
      req.params.id, 
      { status: 'RETURNED' }, 
      { new: true }
    ); 
    res.json(item); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

// === MARKETPLACE ENDPOINTS ===
app.get('/api/marketplace', async (req, res) => { 
  try { 
    const { category, search } = req.query; 
    let query = {}; 
    
    if (category && category !== 'All') query.category = category; 
    if (search) query.title = { $regex: search, $options: 'i' }; 
    
    const items = await MarketplaceItem.find(query).sort({ createdAt: -1 }).populate('seller', 'username displayName'); 
    res.json(items); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/marketplace', async (req, res) => { 
  try { 
    const { sellerId, sellerName, title, description, price, category, condition, images, contactInfo } = req.body; 
    const item = new MarketplaceItem({ 
      seller: sellerId, 
      sellerName, 
      title, 
      description, 
      price, 
      category, 
      condition, 
      images: images || [], 
      contactInfo 
    }); 
    await item.save(); 
    res.json(item); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.put('/api/marketplace/:id/interested', async (req, res) => { 
  try { 
    const { userId } = req.body; 
    const item = await MarketplaceItem.findById(req.params.id); 
    
    if (!item.interested.includes(userId)) { 
      item.interested.push(userId); 
      await item.save(); 
    } 
    
    res.json(item); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.delete('/api/marketplace/:id', async (req, res) => { 
  try { 
    await MarketplaceItem.findByIdAndDelete(req.params.id); 
    res.json({ message: 'Item deleted' }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

// === LIBRARY ENDPOINTS ===
app.get('/api/study-resources', async (req, res) => { 
  try { 
    const { subject, search } = req.query; 
    let query = {}; 
    
    if (subject && subject !== 'All') query.subject = subject; 
    if (search) query.title = { $regex: search, $options: 'i' }; 
    
    const resources = await StudyResource.find(query).sort({ createdAt: -1 }).populate('uploader', 'username displayName'); 
    res.json(resources); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/study-resources', async (req, res) => { 
  try { 
    const { uploaderId, uploaderName, title, description, subject, gradeLevel, fileType, fileUrl, fileName, fileSize, tags } = req.body; 
    const resource = new StudyResource({ 
      uploader: uploaderId, 
      uploaderName, 
      title, 
      description, 
      subject, 
      gradeLevel, 
      fileType, 
      fileUrl, 
      fileName, 
      fileSize, 
      tags: tags || [] 
    }); 
    await resource.save(); 
    res.json(resource); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.put('/api/study-resources/:id/like', async (req, res) => { 
  try { 
    const { userId } = req.body; 
    const resource = await StudyResource.findById(req.params.id); 
    
    if (!resource.likedBy.includes(userId)) { 
      resource.likedBy.push(userId); 
      resource.likes += 1; 
    } else { 
      resource.likedBy = resource.likedBy.filter(id => id.toString() !== userId); 
      resource.likes -= 1; 
    } 
    
    await resource.save(); 
    res.json(resource); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.put('/api/study-resources/:id/download', async (req, res) => { 
  try { 
    const resource = await StudyResource.findByIdAndUpdate(
      req.params.id, 
      { $inc: { downloads: 1 } }, 
      { new: true }
    ); 
    res.json(resource); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

// === NEWS FEED ENDPOINTS ===
app.get('/api/news', async (req, res) => { 
  try { 
    const { page = 1, limit = 10 } = req.query; 
    const posts = await NewsPost.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username displayName avatar'); 
    res.json(posts); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/news', async (req, res) => { 
  try { 
    const { authorId, authorName, content, images, tags, poll } = req.body; 
    const post = new NewsPost({ 
      author: authorId, 
      authorName, 
      content, 
      images: images || [], 
      tags: tags || [], 
      poll 
    }); 
    await post.save(); 
    res.json(post); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/news/:id/react', async (req, res) => { 
  try { 
    const { userId, reaction } = req.body; 
    const post = await NewsPost.findById(req.params.id); 
    const existingReaction = post.reactions?.find(r => r.userId.toString() === userId); 
    
    if (existingReaction) { 
      if (existingReaction.type === reaction) { 
        post.reactions = post.reactions.filter(r => r.userId.toString() !== userId); 
        post.reactionCounts[reaction] = Math.max(0, (post.reactionCounts[reaction] || 0) - 1); 
      } else { 
        post.reactionCounts[existingReaction.type] = Math.max(0, (post.reactionCounts[existingReaction.type] || 0) - 1); 
        existingReaction.type = reaction; 
        post.reactionCounts[reaction] = (post.reactionCounts[reaction] || 0) + 1; 
      } 
    } else { 
      post.reactions = post.reactions || []; 
      post.reactions.push({ userId, type: reaction }); 
      post.reactionCounts = post.reactionCounts || {}; 
      post.reactionCounts[reaction] = (post.reactionCounts[reaction] || 0) + 1; 
    } 
    
    await post.save(); 
    res.json(post); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/news/:id/comment', async (req, res) => { 
  try { 
    const { userId, username, content, parentId } = req.body; 
    const post = await NewsPost.findById(req.params.id); 
    const comment = { 
      _id: new mongoose.Types.ObjectId(), 
      userId, 
      username, 
      content, 
      parentId: parentId || null, 
      createdAt: new Date(), 
      likes: 0, 
      likedBy: [] 
    }; 
    
    post.comments = post.comments || []; 
    post.comments.push(comment); 
    await post.save(); 
    res.json(comment); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/news/:postId/comment/:commentId/like', async (req, res) => { 
  try { 
    const { userId } = req.body; 
    const post = await NewsPost.findById(req.params.postId); 
    const comment = post.comments?.find(c => c._id.toString() === req.params.commentId); 
    
    if (comment) { 
      if (comment.likedBy?.includes(userId)) { 
        comment.likes = Math.max(0, comment.likes - 1); 
        comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId); 
      } else { 
        comment.likes = (comment.likes || 0) + 1; 
        comment.likedBy = comment.likedBy || []; 
        comment.likedBy.push(userId); 
      } 
      await post.save(); 
      res.json(comment); 
    } else { 
      res.status(404).json({ error: 'Comment not found' }); 
    } 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/news/:id/share', async (req, res) => { 
  try { 
    const post = await NewsPost.findById(req.params.id); 
    post.shares = (post.shares || 0) + 1; 
    await post.save(); 
    res.json({ message: 'Post shared', shares: post.shares }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.get('/api/news/:id/comments', async (req, res) => { 
  try { 
    const post = await NewsPost.findById(req.params.id); 
    res.json(post.comments || []); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

// === EXAM PREP ENDPOINTS ===
app.get('/api/exam-threads/:room', async (req, res) => { 
  try { 
    const threads = await ExamThread.find({ room: req.params.room }).sort({ createdAt: -1 }); 
    res.json(threads); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/exam-threads', async (req, res) => { 
  try { 
    const { room, authorId, authorName, title, question, image } = req.body; 
    const thread = new ExamThread({ 
      room, 
      author: authorId, 
      authorName, 
      title, 
      question, 
      image 
    }); 
    await thread.save(); 
    res.json(thread); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/exam-threads/:id/reply', async (req, res) => { 
  try { 
    const { authorId, authorName, content, image } = req.body; 
    const thread = await ExamThread.findById(req.params.id); 
    thread.replies.push({ author: authorId, authorName, content, image }); 
    await thread.save(); 
    res.json(thread); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

// === CAMPUS CONNECTIONS ENDPOINTS ===
app.get('/api/connections', async (req, res) => { 
  try { 
    const profiles = await ConnectionProfile.find().populate('user', 'username displayName avatar'); 
    res.json(profiles); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/connections/profile', async (req, res) => { 
  try { 
    const { userId, username, displayName, age, faculty, bio, photos, interests, campusHotspots, lookingFor, music, hobbies } = req.body; 
    let profile = await ConnectionProfile.findOneAndUpdate(
      { user: userId }, 
      { 
        userId, 
        username, 
        displayName, 
        age, 
        faculty, 
        bio, 
        photos, 
        interests, 
        campusHotspots, 
        lookingFor, 
        music, 
        hobbies 
      }, 
      { upsert: true, new: true }
    ); 
    res.json(profile); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/connections/like', async (req, res) => { 
  try { 
    const { likerId, likedId } = req.body; 
    const existing = await ConnectionLike.findOne({ liker: likerId, liked: likedId }); 
    
    if (existing) return res.json({ match: false, message: 'Already liked' }); 
    
    const like = new ConnectionLike({ liker: likerId, liked: likedId }); 
    await like.save(); 
    
    const mutualLike = await ConnectionLike.findOne({ liker: likedId, liked: likerId }); 
    
    if (mutualLike) { 
      await ConnectionLike.findByIdAndUpdate(existing._id, { status: 'matched' }); 
      await ConnectionLike.findByIdAndUpdate(mutualLike._id, { status: 'matched' }); 
      const match = new ConnectionMatch({ user1: likerId, user2: likedId }); 
      await match.save(); 
      res.json({ match: true, message: "It's a Match! 💕" }); 
    } else { 
      res.json({ match: false, message: 'Liked!' }); 
    } 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.post('/api/connections/pass', async (req, res) => { 
  try { 
    const { passerId, passedId } = req.body; 
    const pass = new ConnectionLike({ liker: passerId, liked: passedId, status: 'passed' }); 
    await pass.save(); 
    res.json({ message: 'Passed' }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.get('/api/connections/matches/:userId', async (req, res) => { 
  try { 
    const matches = await ConnectionMatch.find({ 
      $or: [{ user1: req.params.userId }, { user2: req.params.userId }] 
    }).populate('user1', 'username displayName avatar').populate('user2', 'username displayName avatar'); 
    res.json(matches); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

app.get('/api/connections/compatibility/:userId1/:userId2', async (req, res) => { 
  try { 
    const profile1 = await ConnectionProfile.findOne({ user: req.params.userId1 }); 
    const profile2 = await ConnectionProfile.findOne({ user: req.params.userId2 }); 
    
    if (!profile1 || !profile2) return res.json({ score: 0, common: [] }); 
    
    const commonInterests = profile1.interests.filter(i => profile2.interests.includes(i)); 
    const commonMusic = profile1.music.filter(m => profile2.music.includes(m)); 
    const commonHotspots = profile1.campusHotspots.filter(h => profile2.campusHotspots.includes(h)); 
    
    const totalCommon = commonInterests.length + commonMusic.length + commonHotspots.length; 
    const score = Math.min(100, Math.round((totalCommon / 10) * 100)); 
    
    res.json({ 
      score, 
      common: { 
        interests: commonInterests, 
        music: commonMusic, 
        hotspots: commonHotspots 
      } 
    }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  } 
});

// === STUDY GUIDE UPLOAD ENDPOINTS ===
app.post('/api/study-guides/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, subject, moduleCode, userId, uploaderName, uploaderRole, tags, description } = req.body;
    const file = req.file;
    
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let extractedText = '';
    const fileType = file.originalname.split('.').pop().toLowerCase();

    console.log('📁 Processing file:', file.originalname, 'Type:', fileType);

    if (fileType === 'pdf') {
      try {
        const data = await pdfParse(file.buffer);
        extractedText = data.text;
        console.log('✅ PDF extracted:', extractedText.length, 'chars');
      } catch (pdfError) {
        console.error('❌ PDF Parse Error:', pdfError.message);
        extractedText = 'Could not extract text from PDF';
      }
    } else if (fileType === 'docx' || fileType === 'doc') {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        extractedText = result.value;
        console.log('✅ DOCX extracted:', extractedText.length, 'chars');
      } catch (docError) {
        console.error('❌ DOCX Parse Error:', docError.message);
        extractedText = 'Could not extract text from document';
      }
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'].includes(fileType)) {
      try {
        console.log('🔍 Running OCR on image...');
        const { data: { text } } = await Tesseract.recognize(
          file.buffer,
          'eng',
          { logger: m => console.log(m) }
        );
        extractedText = text;
        console.log('✅ Image OCR extracted:', extractedText.length, 'chars');
      } catch (ocrError) {
        console.error('❌ OCR Error:', ocrError.message);
        extractedText = 'Could not extract text from image';
      }
    } else {
      extractedText = file.buffer.toString('utf-8');
      console.log('✅ Text file extracted:', extractedText.length, 'chars');
    }

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    const isVerified = uploaderRole === 'founder' || uploaderRole === 'admin';

    const studyGuide = new StudyGuide({
      title,
      subject,
      moduleCode: moduleCode.toUpperCase(),
      uploadedBy: userId,
      uploaderName,
      uploaderRole,
      content: extractedText,
      fileType: fileType.toUpperCase(),
      fileName: file.originalname,
      fileSize: Math.round(file.size / 1024),
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      description,
      isVerified,
      verifiedBy: isVerified ? userId : null
    });

    await studyGuide.save();
    res.json({ 
      message: `Study guide uploaded! 📚 ${isVerified ? '✅ Auto-verified' : '⏳ Pending verification'}`,
      guide: studyGuide 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/study-guides/paste-text', async (req, res) => {
  try {
    const { title, subject, moduleCode, userId, uploaderName, uploaderRole, tags, description, textContent } = req.body;
    
    if (!textContent || textContent.trim() === '') return res.status(400).json({ error: 'No text content' });
    
    const isVerified = uploaderRole === 'founder' || uploaderRole === 'admin';
    
    const studyGuide = new StudyGuide({
      title, 
      subject, 
      moduleCode: moduleCode.toUpperCase(), 
      uploadedBy: userId, 
      uploaderName, 
      uploaderRole,
      content: textContent, 
      fileType: 'PASTED_TEXT', 
      fileName: 'Text Paste',
      fileSize: Math.round(textContent.length / 1024), 
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      description, 
      isVerified, 
      verifiedBy: isVerified ? userId : null
    });
    
    await studyGuide.save();
    res.json({ 
      message: `Text saved! 📝 ${isVerified ? '✅ Auto-verified' : '⏳ Pending verification'}`, 
      guide: studyGuide 
    });
  } catch (error) {
    console.error('Paste text error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/study-guides/search', async (req, res) => {
  try {
    const { query, moduleCode, subject, isVerified } = req.query;
    let searchQuery = {};
    
    if (moduleCode) searchQuery.moduleCode = moduleCode.toUpperCase();
    if (subject) searchQuery.subject = { $regex: subject, $options: 'i' };
    if (isVerified !== undefined) searchQuery.isVerified = isVerified === 'true';
    if (query) searchQuery.$text = { $search: query };
    
    const guides = await StudyGuide.find(searchQuery)
      .select('-content')
      .sort({ isVerified: -1, likes: -1, downloads: -1, createdAt: -1 })
      .limit(20)
      .populate('uploadedBy', 'username displayName role');
    
    res.json({ guides });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/study-guides/:id', async (req, res) => {
  try {
    const guide = await StudyGuide.findById(req.params.id)
      .populate('uploadedBy', 'username displayName role')
      .populate('verifiedBy', 'username displayName');
    
    guide.views += 1;
    await guide.save();
    res.json({ guide });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/study-guides/admin/all', async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId);
    
    if (!user || (user.role !== 'founder' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Founder/Admin only' });
    }
    
    const guides = await StudyGuide.find()
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'username displayName role')
      .populate('verifiedBy', 'username displayName');
    
    res.json({ guides });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/study-guides/:id/verify', async (req, res) => {
  try {
    const { userId, userRole } = req.body;
    
    if (userRole !== 'founder' && userRole !== 'admin') {
      return res.status(403).json({ error: 'Founder/Admin only' });
    }
    
    const guide = await StudyGuide.findByIdAndUpdate(
      req.params.id, 
      { isVerified: true, verifiedBy: userId }, 
      { new: true }
    );
    
    res.json({ message: 'Verified! ✅', guide });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.delete('/api/study-guides/:id', async (req, res) => {
  try {
    const { userId, userRole } = req.body;
    
    if (userRole !== 'founder') {
      return res.status(403).json({ error: 'Founder only' });
    }
    
    await StudyGuide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted!' });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/study-guides/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const guide = await StudyGuide.findById(req.params.id);
    
    if (guide.likedBy.includes(userId)) { 
      guide.likes -= 1; 
      guide.likedBy = guide.likedBy.filter(id => id.toString() !== userId); 
    } else { 
      guide.likes += 1; 
      guide.likedBy.push(userId); 
    }
    
    await guide.save();
    res.json({ guide });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/study-guides/module/:moduleCode', async (req, res) => {
  try {
    const guides = await StudyGuide.find({ moduleCode: req.params.moduleCode.toUpperCase() })
      .select('-content')
      .sort({ isVerified: -1, likes: -1, downloads: -1 })
      .populate('uploadedBy', 'username displayName role');
    
    res.json({ guides });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// === NDIVHO AI ===
app.post('/api/ndivho-ai/chat', async (req, res) => {
  try {
    const { message, userId, moduleCode } = req.body;
    
    if (!message || message.trim() === '') {
      return res.json({ 
        response: "Hey! I am Ndivho AI 🤖 How can I help you today?", 
        source: 'local', 
        timestamp: new Date() 
      });
    }

    console.log('🔍 Searching for study guides... Message:', message, 'Module:', moduleCode);

    let relevantGuides = [];
    let relevantContent = '';

    try {
      if (moduleCode) {
        relevantGuides = await StudyGuide.find({ 
          moduleCode: moduleCode.toUpperCase(),
          isVerified: true 
        }).sort({ likes: -1, downloads: -1 }).limit(5);
        console.log(`✅ Found ${relevantGuides.length} guides for module ${moduleCode}`);
      }
      
      if (relevantGuides.length === 0) {
        const keywords = message.toLowerCase().split(' ')
          .filter(word => word.length > 3)
          .filter(word => !['what', 'how', 'why', 'when', 'where', 'which', 'about', 'explain', 'tell', 'give', 'show'].includes(word));
        
        if (keywords.length > 0) {
          const searchQuery = { 
            $text: { $search: keywords.join(' ') },
            isVerified: true 
          };
          relevantGuides = await StudyGuide.find(searchQuery)
            .sort({ likes: -1, downloads: -1 }).limit(5);
          console.log(`✅ Found ${relevantGuides.length} guides for keywords:`, keywords);
        }
      }
      
      if (relevantGuides.length === 0) {
        relevantGuides = await StudyGuide.find({ isVerified: true })
          .sort({ createdAt: -1 }).limit(3);
        console.log(`✅ Found ${relevantGuides.length} recent guides (fallback)`);
      }
      
      if (relevantGuides.length > 0) {
        relevantContent = relevantGuides.map(guide => {
          const contentSnippet = guide.content.substring(0, 1500);
          return `From "${guide.title}" (${guide.moduleCode}) - Uploaded by ${guide.uploaderName} (${guide.fileType}):\n${contentSnippet}`;
        }).join('\n\n---\n\n');
        
        console.log('📚 Study guide content length:', relevantContent.length);
      } else {
        console.log('⚠️ No study guides found');
      }
    } catch (guideError) {
      console.error('❌ Error fetching study guides:', guideError.message);
    }

    const systemPrompt = `You are Ndivho AI, a friendly, knowledgeable study assistant for University of Venda (UNIVEN) students in South Africa.
${relevantContent ? `📚 RELEVANT STUDY MATERIAL FROM UPLOADED GUIDES (including images, PDFs, documents):\n${relevantContent}\n\n` : ''}
ABOUT UNIVEN:
Location: Thohoyandou, Limpopo, South Africa
Faculties: Agriculture/Science/Engineering, Commerce/Law/Management, Humanities/Social Sciences/Education, Health Sciences
Student Portal: myuniven.univen.ac.za
YOUR ROLE:
✅ If study material is provided above, use it FIRST to answer the student's question
✅ Mention when you're using uploaded study material (e.g., "According to the study guide...")
✅ If no study material is relevant, use your general knowledge
✅ Explain complex topics in simple, clear terms
✅ Be friendly, encouraging, and use emojis 📚✨
✅ Keep responses concise but helpful (2-4 short paragraphs)
✅ If asked about UNIVEN-specific info, direct to official channels
✅ If you don't know something, say: "Great question! I'd recommend asking your lecturer or checking the UNIVEN library. 📚"
Student question: ${message}`;

    let response;
    let source = 'local';

    if (process.env.GROQ_API_KEY) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message }
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.7,
          max_tokens: 600
        });
        
        response = chatCompletion.choices[0]?.message?.content?.trim();
        source = relevantContent ? 'study-guide' : 'groq-llama3';
        
        if (!response || response.length < 20) {
          throw new Error('Response too short');
        }
      } catch (groqError) {
        console.log('⚠️ Groq API error:', groqError.message);
      }
    }

    if (!response || response.length < 20) {
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('math') || lowerMessage.includes('calculus')) {
        response = "📐 **Mathematics** is the study of numbers, quantities, shapes, and patterns!\n\nAt UNIVEN, you'll study:\n• Calculus - Derivatives, integrals, rates of change\n• Algebra - Equations, functions, matrices\n• Statistics - Data analysis, probability\n\n💡 **Study Tip**: Practice daily! Math is like a muscle - use it or lose it. Work through examples, don't just read solutions.\n\nNeed help with a specific topic? Ask me! 🎓✨";
      } else if (lowerMessage.includes('univen') || lowerMessage.includes('registration') || lowerMessage.includes('fees')) {
        response = "🎓 **UNIVEN Info**: The University of Venda is in Thohoyandou, Limpopo.\n\n• Student Portal: myuniven.univen.ac.za\n• Library: Open Mon-Fri 8am-8pm, Sat 9am-2pm\n• NSFAS: Apply at www.nsfas.org.za (Sept-Oct)\n\nAlways check official channels for the most accurate, up-to-date information! 📚";
      } else {
        response = "Hey! I am Ndivho AI 🤖 How can I help you today?\n\nI can help with:\n📚 Any UNIVEN module\n📝 Exam preparation\n💡 Study tips\n⏰ Time management\n💪 Motivation\n💼 Career advice\n\nJust ask me anything!";
      }
      source = 'local';
    }

    res.json({ 
      response, 
      source,
      studyGuidesUsed: relevantGuides.length,
      timestamp: new Date() 
    });
  } catch (error) {
    console.error('Ndivho AI error:', error);
    res.status(500).json({
      response: "Sorry, I'm having trouble right now. Please try again! 🙏",
      source: 'error',
      timestamp: new Date()
    });
  }
});

app.get('/api/ndivho-ai/tips', async (req, res) => {
  try { 
    res.json({ tips: [], source: 'local' }); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.get('/api/ndivho-ai/modules', async (req, res) => {
  try {
    const modules = {
      agriculture: ['Agronomy', 'Animal Science', 'Soil Science'],
      sciences: ['Mathematics', 'Physics', 'Chemistry', 'Biology'],
      computer_science: ['Programming', 'Data Structures', 'Algorithms', 'Databases'],
      engineering: ['Electrical', 'Mechanical', 'Civil Engineering'],
      commerce: ['Accounting', 'Economics', 'Business Management'],
      law: ['Constitutional Law', 'Contract Law', 'Criminal Law'],
      education: ['Educational Psychology', 'Curriculum Studies'],
      humanities: ['Psychology', 'Sociology', 'History'],
      health: ['Nursing', 'Medicine', 'Nutrition', 'Pharmacy']
    };
    res.json({ modules });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

app.post('/api/ndivho-ai/suggest', async (req, res) => {
  try {
    console.log('📚 NEW KNOWLEDGE SUGGESTION:', req.body);
    res.json({ message: 'Thank you! 🙏 Your suggestion has been submitted!', status: 'pending_review' });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

// === SOCKET.IO FOR REAL-TIME ===
const userSockets = {};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("register_user", (userId) => {
    userSockets[userId] = socket.id;
    socket.userId = userId;
  });

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("send_room_message", (data) => {
    const messageData = { ...data, timestamp: new Date() };
    io.to(data.roomId).emit("receive_room_message", messageData);
  });

  socket.on("send_message", async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
      
      if (sender?.blockedUsers?.includes(receiverId) || receiver?.blockedUsers?.includes(senderId)) {
        socket.emit("error_message", { error: "You cannot send messages to this user" });
        return;
      }
      
      const message = new Message({ sender: senderId, receiver: receiverId, content });
      await message.save();
      await message.populate('sender', 'username displayName');
      
      const receiverSocketId = userSockets[receiverId];
      if (receiverSocketId) io.to(receiverSocketId).emit("receive_message", message);
      socket.emit("message_sent", message);
    } catch (error) { 
      socket.emit("error_message", { error: error.message }); 
    }
  });

  socket.on("mark_read", async (data) => {
    try {
      await Message.findByIdAndUpdate(data.messageId, { read: true, readAt: new Date() });
      const message = await Message.findById(data.messageId);
      const receiverSocketId = userSockets[message?.sender?.toString()];
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message_read", { 
          messageId: data.messageId, 
          readAt: new Date() 
        });
      }
    } catch (error) { 
      console.error("Error marking read:", error); 
    }
  });

  socket.on("typing_start", (data) => {
    const target = data.roomId || data.receiverId;
    socket.to(target).emit("user_typing", { 
      senderId: data.senderId, 
      senderName: data.senderName, 
      isTyping: true 
    });
  });

  socket.on("typing_stop", (data) => {
    const target = data.roomId || data.receiverId;
    socket.to(target).emit("user_typing", { 
      senderId: data.senderId, 
      senderName: data.senderName, 
      isTyping: false 
    });
  });

  socket.on("disconnect", () => {
    delete userSockets[socket.userId];
  });
});

server.listen(process.env.PORT || 3001, () => {
  console.log("✅ SERVER RUNNING ON PORT 3001");
  console.log("🤖 Ndivho AI Ready! (Groq Llama 3: " + (process.env.GROQ_API_KEY ? '✅ Connected' : '❌ Not Configured') + ")");
  console.log("📚 Study Guides: Enabled (PDF, DOCX, TXT, IMAGES with OCR)");
  console.log("👑 Founder System: Ready");
  console.log("💕 Single & Mingle: Enabled");
});