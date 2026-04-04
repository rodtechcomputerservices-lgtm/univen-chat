const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: String,
  bio: { type: String, default: "UNIVEN Student 🎓" },
  avatar: { type: String, default: "" },
  status: { type: String, default: "online", enum: ["online", "offline", "busy"] },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  levelOfStudy: { type: String, enum: ["First Year", "Second Year", "Third Year", "Fourth Year", "Honours", "Masters", "PhD", ""], default: "" },
  degreeName: { type: String, default: "" },
  faculty: { type: String, enum: ["Agriculture, Science & Engineering", "Commerce, Law & Management", "Humanities, Social Sciences & Education", "Health Sciences", ""], default: "" },
  race: { type: String, enum: ["African", "Coloured", "Indian", "White", "Other", ""], default: "" },
  ethnicGroup: { type: String, enum: ["Venda", "Tsonga", "Sotho", "Ndebele", "Zulu", "Xhosa", "Other", ""], default: "" },
  joinedDate: { type: Date, default: Date.now }
});

const friendRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  readAt: Date,
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: String,
  content: String,
  likes: { type: Number, default: 0 },
  likedBy: [String],
  timestamp: { type: Date, default: Date.now }
});

const marketplaceItemSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName: String,
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, enum: ['Electronics', 'Textbooks', 'Clothing', 'Furniture', 'Food', 'Services', 'Other'], default: 'Other' },
  condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'], default: 'Good' },
  images: [String],
  contactInfo: String,
  status: { type: String, enum: ['Available', 'Sold', 'Reserved'], default: 'Available' },
  interested: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const lostFoundSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: String,
  type: { type: String, enum: ['Lost', 'Found'], required: true },
  title: { type: String, required: true },
  description: String,
  location: String,
  date: Date,
  images: [String],
  contactInfo: String,
  status: { type: String, enum: ['FOUND', 'CLAIMED', 'RETURNED'], default: 'FOUND' },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationNotes: String,
  createdAt: { type: Date, default: Date.now }
});

const groupChatSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    senderName: String,
    content: String,
    type: { type: String, enum: ['text', 'image', 'file', 'voice'], default: 'text' },
    fileUrl: String,
    fileName: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const studyResourceSchema = new mongoose.Schema({
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploaderName: String,
  title: { type: String, required: true },
  description: String,
  subject: { type: String, enum: ['Mathematics', 'Physical Sciences', 'Life Sciences', 'Business Studies', 'Accounting', 'Computer Science', 'English', 'Other'], default: 'Other' },
  gradeLevel: { type: String, enum: ['First Year', 'Second Year', 'Third Year', 'Fourth Year', 'Honours', 'Masters', 'PhD'], default: 'First Year' },
  fileType: { type: String, enum: ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'Image', 'Audio', 'Video', 'Other'], default: 'PDF' },
  fileUrl: String,
  fileName: String,
  fileSize: String,
  tags: [String],
  downloads: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const newsPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  content: String,
  images: [String],
  videoUrl: String,
  poll: {
    question: String,
    options: [{ text: String, votes: Number }]
  },
  tags: [String],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares: { type: Number, default: 0 },
  isPromoted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const examThreadSchema = new mongoose.Schema({
  room: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorName: String,
  title: String,
  question: String,
  image: String,
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: String,
    content: String,
    image: String,
    createdAt: { type: Date, default: Date.now }
  }],
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema);
const Message = mongoose.model('Message', messageSchema);
const Post = mongoose.model('Post', postSchema);
const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema);
const LostFound = mongoose.model('LostFound', lostFoundSchema);
const GroupChat = mongoose.model('GroupChat', groupChatSchema);
const StudyResource = mongoose.model('StudyResource', studyResourceSchema);
const NewsPost = mongoose.model('NewsPost', newsPostSchema);
const ExamThread = mongoose.model('ExamThread', examThreadSchema);

// Campus Connections Profile Schema
const connectionProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  username: String,
  displayName: String,
  age: Number,
  faculty: String,
  bio: String,
  photos: [String],
  interests: [String],
  campusHotspots: [String],
  lookingFor: {
    type: String,
    enum: ['Partner', 'Study Buddy', 'Business Collab', 'Friends'],
    default: 'Friends'
  },
  music: [String],
  hobbies: [String],
  createdAt: { type: Date, default: Date.now }
});

// Likes & Matches Schema
const connectionLikeSchema = new mongoose.Schema({
  liker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  liked: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['liked', 'passed', 'matched'], default: 'liked' },
  createdAt: { type: Date, default: Date.now }
});

// Matches Schema
const connectionMatchSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchedAt: { type: Date, default: Date.now },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

const ConnectionProfile = mongoose.model('ConnectionProfile', connectionProfileSchema);
const ConnectionLike = mongoose.model('ConnectionLike', connectionLikeSchema);
const ConnectionMatch = mongoose.model('ConnectionMatch', connectionMatchSchema);

module.exports = { 
  User, 
  FriendRequest, 
  Message, 
  Post,
  MarketplaceItem,
  LostFound,
  GroupChat,
  StudyResource,
  NewsPost,
  ExamThread,
  ConnectionProfile,
  ConnectionLike,
  ConnectionMatch
};