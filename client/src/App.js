import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io.connect("http://localhost:3001");

function App() {
  // === AUTH STATE ===
  const [showAuth, setShowAuth] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authDisplayName, setAuthDisplayName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authGender, setAuthGender] = useState("Male");
  const [authFaculty, setAuthFaculty] = useState("");
  const [authLevelOfStudy, setAuthLevelOfStudy] = useState("First Year");
  const [authRelationshipStatus, setAuthRelationshipStatus] = useState("Single");
  const [authJoinMingle, setAuthJoinMingle] = useState(false);
  const [authError, setAuthError] = useState("");

  // === USER STATE ===
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userGender, setUserGender] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // === FRIENDS STATE ===
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [privateMessageInput, setPrivateMessageInput] = useState("");

  // === ROOMS STATE ===
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState("cafeteria");
  const [roomMessages, setRoomMessages] = useState([]);
  const [roomMessageInput, setRoomMessageInput] = useState("");

  // === NAVIGATION STATE ===
  const [activeTab, setActiveTab] = useState("rooms");
  const [showProfile, setShowProfile] = useState(false);
  const [editProfile, setEditProfile] = useState({
    displayName: "", bio: "", avatar: "", levelOfStudy: "", degreeName: "", faculty: "", race: "", ethnicGroup: "", email: "", phone: ""
  });
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);

  // === SINGLE & MINGLE STATE ===
  const [connectionProfiles, setConnectionProfiles] = useState([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [userProfile, setUserProfile] = useState({
    age: "", faculty: "", bio: "", photos: [], interests: [], campusHotspots: [], lookingFor: "Friends", music: [], hobbies: []
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [matches, setMatches] = useState([]);
  const [compatibility, setCompatibility] = useState({ score: 0, common: {} });
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [newMatch, setNewMatch] = useState(null);
  const [mingleStatuses, setMingleStatuses] = useState([]);
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [statusImage, setStatusImage] = useState(null);

  // === LOST & FOUND STATE ===
  const [lostFoundItems, setLostFoundItems] = useState([]);
  const [showLostFoundForm, setShowLostFoundForm] = useState(false);
  const [lostFoundView, setLostFoundView] = useState("list");
  const [lostFoundItem, setLostFoundItem] = useState({
    type: "Found", title: "", description: "", location: "", date: "", images: [], contactInfo: ""
  });
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [itemToClaim, setItemToClaim] = useState(null);
  const [claimNotes, setClaimNotes] = useState("");
  const [lfImages, setLfImages] = useState([]);

  // === MARKETPLACE STATE ===
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [showMarketForm, setShowMarketForm] = useState(false);
  const [marketFilter, setMarketFilter] = useState("All");
  const [marketSearch, setMarketSearch] = useState("");
  const [marketItem, setMarketItem] = useState({
    title: "", description: "", price: "", category: "Other", condition: "Good", images: [], contactInfo: ""
  });
  const [marketImages, setMarketImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // === LIBRARY STATE ===
  const [studyResources, setStudyResources] = useState([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [libraryFilter, setLibraryFilter] = useState("All");
  const [librarySearch, setLibrarySearch] = useState("");
  const [studyResource, setStudyResource] = useState({
    title: "", description: "", subject: "Other", gradeLevel: "First Year", fileType: "PDF", fileUrl: "", fileName: "", fileSize: "", tags: ""
  });
  const [resourceFile, setResourceFile] = useState(null);

  // === NEWS FEED STATE ===
  const [newsPosts, setNewsPosts] = useState([]);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsPost, setNewsPost] = useState({ content: "", images: [], tags: "" });
  const [newsImages, setNewsImages] = useState([]);

  // === EXAM PREP STATE ===
  const [examThreads, setExamThreads] = useState([]);
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [examThread, setExamThread] = useState({ title: "", question: "", image: "" });
  const [threadImage, setThreadImage] = useState(null);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [threadReply, setThreadReply] = useState("");

  // === TYPING INDICATORS STATE ===
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimeout = useRef({});

  // === NEWS FEED ENHANCED STATE ===
  const [postReactions, setPostReactions] = useState({});
  const [postComments, setPostComments] = useState({});
  const [showComments, setShowComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [replyingTo, setReplyingTo] = useState({});
  const [showReactionPicker, setShowReactionPicker] = useState({});

  // === NDIVHO AI STATE ===
  const [showNdivhoAI, setShowNdivhoAI] = useState(false);
  const [ndivhoMessages, setNdivhoMessages] = useState([
    { sender: 'bot', text: "Hey! I am Ndivho AI 🤖 How can I help you today?", timestamp: new Date() }
  ]);
  const [ndivhoInput, setNdivhoInput] = useState("");
  const [isAITyping, setIsAITyping] = useState(false);

  // === AI ROOM STATE ===
  const [aiRoomActive, setAiRoomActive] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { sender: 'bot', text: "Hey! I am Ndivho AI 🤖 How can I help you today?", timestamp: new Date() }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiModuleCode, setAiModuleCode] = useState("");

  // === UI STATE ===
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recordingVoice, setRecordingVoice] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const fileInputRef = useRef(null);

  const emojis = ["😀", "😂", "😍", "🤔", "👍", "❤️", "🎉", "🔥", "👏", "🙏", "💯", "✨", "📚", "🎓", "💼", "🛒"];

  // === AUTH FUNCTIONS ===
  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authUsername,
          password: authPassword,
          displayName: authDisplayName,
          email: authEmail,
          phone: authPhone,
          gender: authGender,
          faculty: authFaculty,
          levelOfStudy: authLevelOfStudy,
          relationshipStatus: authRelationshipStatus,
          joinMingle: authJoinMingle
        })
      });
      const data = await response.json();
      if (data.error) setAuthError(data.error);
      else {
        alert('Registration successful! Please login. ✅');
        setIsLogin(true);
      }
    } catch (error) {
      setAuthError('Registration failed');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsername, password: authPassword })
      });
      const data = await response.json();
      if (data.error) setAuthError(data.error);
      else {
        setUserId(data.user.id);
        setUsername(data.user.username);
        setCurrentUser(data.user);
        setUserGender(data.user.gender || "Male");
        setUserEmail(data.user.email || "");
        setUserPhone(data.user.phone || "");
        setShowAuth(false);
        socket.emit("register_user", data.user.id);
        
        // Fetch all data for logged-in user
        fetchRooms();
        fetchFriends(data.user.id);
        fetchFriendRequests(data.user.id);
        fetchAllUsers();
        fetchUserProfile(authUsername);
        joinRoom("cafeteria");
        fetchLostFoundItems();
        fetchMarketplaceItems();
        fetchStudyResources();
        fetchNewsPosts();
        fetchExamThreads();
        fetchConnectionProfiles();
        fetchMatches(data.user.id);
        fetchMingleStatuses();
      }
    } catch (error) {
      setAuthError('Login failed');
    }
  };

  const handleLogout = () => {
    // Clear all state to prevent data leakage
    setUserId("");
    setUsername("");
    setCurrentUser(null);
    setUserGender("");
    setUserEmail("");
    setUserPhone("");
    setFriends([]);
    setFriendRequests([]);
    setAllUsers([]);
    setSearchResults([]);
    setShowSearchResults(false);
    setSelectedFriend(null);
    setPrivateMessages([]);
    setRoomMessages([]);
    setConnectionProfiles([]);
    setMatches([]);
    setMingleStatuses([]);
    setShowAuth(true);
    setActiveTab("rooms");
    setSearchQuery("");
  };

  // === ROOM FUNCTIONS ===
  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/rooms');
      const data = await response.json();
      setRooms(data);
      if (data.length > 0) setCurrentRoom(data[0].id);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const joinRoom = (roomId) => {
    socket.emit("join_room", roomId);
    setCurrentRoom(roomId);
    setRoomMessages([]);
  };

  const sendRoomMessage = () => {
    if (!roomMessageInput.trim()) return;
    socket.emit("send_room_message", {
      roomId: currentRoom,
      senderId: userId,
      content: roomMessageInput,
      senderName: username
    });
    setRoomMessageInput("");
  };

  const addEmoji = (emoji) => {
    setRoomMessageInput(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      socket.emit("send_room_message", {
        roomId: currentRoom,
        senderId: userId,
        content: reader.result,
        senderName: username,
        fileType: file.type,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          socket.emit("send_room_message", {
            roomId: currentRoom,
            senderId: userId,
            content: reader.result,
            senderName: username,
            messageType: 'voice'
          });
        };
        reader.readAsDataURL(blob);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecordingVoice(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorder && recordingVoice) {
      mediaRecorder.stop();
      setRecordingVoice(false);
    }
  };

  // === USER SEARCH FUNCTIONS ===
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    try {
      const allUsersResponse = await fetch('http://localhost:3001/api/users');
      const allUsersData = await allUsersResponse.json();
      
      const filtered = allUsersData.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(filtered.filter(u => u._id !== userId));
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // === LOST & FOUND FUNCTIONS ===
  const fetchLostFoundItems = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/lost-found');
      const data = await response.json();
      setLostFoundItems(data);
    } catch (error) {
      console.error('Error fetching lost & found:', error);
    }
  };

  const createLostFoundItem = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/lost-found', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, ...lostFoundItem, images: lfImages })
      });
      await response.json();
      alert('Item posted! ✅');
      setShowLostFoundForm(false);
      setLostFoundItem({ type: "Found", title: "", description: "", location: "", date: "", images: [], contactInfo: "" });
      setLfImages([]);
      fetchLostFoundItems();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const claimItem = async () => {
    try {
      await fetch(`http://localhost:3001/api/lost-found/${itemToClaim}/claim`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verificationNotes: claimNotes })
      });
      alert('Claim submitted! Wait for verification. ✅');
      setShowClaimModal(false);
      setItemToClaim(null);
      setClaimNotes("");
      fetchLostFoundItems();
    } catch (error) {
      console.error('Error claiming item:', error);
    }
  };

  const returnItem = async (itemId) => {
    try {
      await fetch(`http://localhost:3001/api/lost-found/${itemId}/return`, { method: 'PUT' });
      alert('Item marked as returned! ✅');
      fetchLostFoundItems();
    } catch (error) {
      console.error('Error returning item:', error);
    }
  };

  // === MARKETPLACE FUNCTIONS ===
  const fetchMarketplaceItems = async () => {
    try {
      const query = `?category=${marketFilter}&search=${marketSearch}`;
      const response = await fetch(`http://localhost:3001/api/marketplace${query}`);
      const data = await response.json();
      setMarketplaceItems(data);
    } catch (error) {
      console.error('Error fetching marketplace:', error);
    }
  };

  useEffect(() => {
    fetchMarketplaceItems();
  }, [marketFilter, marketSearch]);

  const createMarketItem = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: userId, sellerName: username, ...marketItem, images: marketImages })
      });
      await response.json();
      alert('Item listed! ✅');
      setShowMarketForm(false);
      setMarketItem({ title: "", description: "", price: "", category: "Other", condition: "Good", images: [], contactInfo: "" });
      setMarketImages([]);
      fetchMarketplaceItems();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const markInterested = async (itemId) => {
    try {
      await fetch(`http://localhost:3001/api/marketplace/${itemId}/interested`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      alert('Seller notified of your interest! 💬');
      fetchMarketplaceItems();
    } catch (error) {
      console.error('Error marking interested:', error);
    }
  };

  const nextImage = (itemId, max) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1 >= max ? 0 : (prev[itemId] || 0) + 1
    }));
  };

  const prevImage = (itemId, max) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) - 1 < 0 ? max - 1 : (prev[itemId] || 0) - 1
    }));
  };

  // === LIBRARY FUNCTIONS ===
  const fetchStudyResources = async () => {
    try {
      const query = `?subject=${libraryFilter}&search=${librarySearch}`;
      const response = await fetch(`http://localhost:3001/api/study-resources${query}`);
      const data = await response.json();
      setStudyResources(data);
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  };

  useEffect(() => {
    fetchStudyResources();
  }, [libraryFilter, librarySearch]);

  const createStudyResource = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/study-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploaderId: userId,
          uploaderName: username,
          ...studyResource,
          fileUrl: resourceFile,
          tags: studyResource.tags.split(',').map(t => t.trim())
        })
      });
      await response.json();
      alert('Resource shared! ✅');
      setShowResourceForm(false);
      setStudyResource({ title: "", description: "", subject: "Other", gradeLevel: "First Year", fileType: "PDF", fileUrl: "", fileName: "", fileSize: "", tags: "" });
      setResourceFile(null);
      fetchStudyResources();
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  const likeResource = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/study-resources/${id}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      fetchStudyResources();
    } catch (error) {
      console.error('Error liking resource:', error);
    }
  };

  const downloadResource = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/study-resources/${id}/download`, { method: 'PUT' });
      alert('Download started! 📥');
      fetchStudyResources();
    } catch (error) {
      console.error('Error downloading:', error);
    }
  };

  // === NEWS FEED FUNCTIONS ===
  const fetchNewsPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/news');
      const data = await response.json();
      setNewsPosts(data);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const createNewsPost = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: userId,
          authorName: username,
          ...newsPost,
          images: newsImages,
          tags: newsPost.tags.split(',').map(t => t.trim())
        })
      });
      await response.json();
      alert('Post published! ✅');
      setShowNewsForm(false);
      setNewsPost({ content: "", images: [], tags: "" });
      setNewsImages([]);
      fetchNewsPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // === EXAM PREP FUNCTIONS ===
  const fetchExamThreads = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/exam-threads/exam-prep`);
      const data = await response.json();
      setExamThreads(data);
    } catch (error) {
      console.error('Error fetching threads:', error);
    }
  };

  const createExamThread = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/exam-threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: 'exam-prep',
          authorId: userId,
          authorName: username,
          ...examThread,
          image: threadImage
        })
      });
      await response.json();
      alert('Thread created! ✅');
      setShowThreadForm(false);
      setExamThread({ title: "", question: "", image: "" });
      setThreadImage(null);
      fetchExamThreads();
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const replyToThread = async (threadId) => {
    try {
      await fetch(`http://localhost:3001/api/exam-threads/${threadId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: userId,
          authorName: username,
          content: threadReply
        })
      });
      setThreadReply("");
      fetchExamThreads();
    } catch (error) {
      console.error('Error replying:', error);
    }
  };

  // === FRIEND FUNCTIONS ===
  const fetchFriends = async (uid) => {
    try {
      const response = await fetch(`http://localhost:3001/api/friends/${uid}`);
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchFriendRequests = async (uid) => {
    try {
      const response = await fetch(`http://localhost:3001/api/friend-requests/${uid}`);
      const data = await response.json();
      setFriendRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const data = await response.json();
      setAllUsers(data.filter(u => u.username !== username));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    try {
      await fetch('http://localhost:3001/api/friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: userId, receiverId })
      });
      alert('Friend request sent!');
      fetchFriendRequests(userId);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleFriendRequest = async (requestId, status) => {
    try {
      await fetch(`http://localhost:3001/api/friend-request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchFriendRequests(userId);
      if (status === 'accepted') fetchFriends(userId);
    } catch (error) {
      console.error('Error handling request:', error);
    }
  };

  const blockUser = (blockedUserId) => {
    setUserToBlock(blockedUserId);
    setShowBlockConfirm(true);
  };

  const confirmBlockUser = async () => {
    if (!userToBlock) return;
    try {
      await fetch('http://localhost:3001/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blockedUserId: userToBlock })
      });
      alert('User blocked successfully');
      setShowBlockConfirm(false);
      setUserToBlock(null);
    } catch (error) {
      console.error('Error blocking:', error);
      alert('Failed to block user');
    }
  };

  const selectFriend = async (friend) => {
    setSelectedFriend(friend);
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${userId}/${friend._id}`);
      const data = await response.json();
      setPrivateMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendPrivateMessage = async () => {
    if (!privateMessageInput.trim() || !selectedFriend) return;
    socket.emit("send_message", {
      senderId: userId,
      receiverId: selectedFriend._id,
      content: privateMessageInput
    });
    setPrivateMessageInput("");
  };

  const markAsRead = async (messageId) => {
    socket.emit("mark_read", { messageId });
  };

  // === SINGLE & MINGLE FUNCTIONS ===
  const fetchConnectionProfiles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/connections');
      const data = await response.json();
      setConnectionProfiles(data.filter(p => p.user.toString() !== userId));
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const fetchMatches = async (uid) => {
    try {
      const response = await fetch(`http://localhost:3001/api/connections/matches/${uid}`);
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const createConnectionProfile = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/connections/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, ...userProfile })
      });
      await response.json();
      alert('Profile created! ✅');
      setShowProfileForm(false);
      fetchConnectionProfiles();
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  const likeProfile = async (likedId) => {
    try {
      const response = await fetch('http://localhost:3001/api/connections/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likerId: userId, likedId })
      });
      const data = await response.json();
      if (data.match) {
        setNewMatch(data);
        setShowMatchPopup(true);
        fetchMatches(userId);
      }
      setCurrentProfileIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error liking:', error);
    }
  };

  const passProfile = async (passedId) => {
    try {
      await fetch('http://localhost:3001/api/connections/pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passerId: userId, passedId })
      });
      setCurrentProfileIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error passing:', error);
    }
  };

  const calculateCompatibility = async (profileId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/connections/compatibility/${userId}/${profileId}`);
      const data = await response.json();
      setCompatibility(data);
    } catch (error) {
      console.error('Error calculating compatibility:', error);
    }
  };

  // === MINGLE STATUS FUNCTIONS ===
  const fetchMingleStatuses = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/mingle/statuses?userId=${userId}`);
      const data = await response.json();
      setMingleStatuses(data);
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const createMingleStatus = async () => {
    if (!statusText.trim() && !statusImage) {
      alert('Please add text or an image');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('username', username);
      formData.append('text', statusText);
      if (statusImage) {
        formData.append('image', statusImage);
      }
      
      const response = await fetch('http://localhost:3001/api/mingle/status', {
        method: 'POST',
        body: formData
      });
      
      await response.json();
      alert('Status posted! ✅');
      setShowStatusForm(false);
      setStatusText("");
      setStatusImage(null);
      fetchMingleStatuses();
    } catch (error) {
      console.error('Error creating status:', error);
      alert('Failed to post status');
    }
  };

  // === TYPING INDICATOR FUNCTIONS ===
  const handleTypingStart = (targetId, isRoom = false) => {
    const key = isRoom ? `room_${currentRoom}_${userId}` : `private_${targetId}_${userId}`;
    if (typingTimeout.current[key]) clearTimeout(typingTimeout.current[key]);
    else {
      if (isRoom) socket.emit("typing_start", { roomId: currentRoom, senderId: userId, senderName: username });
      else socket.emit("typing_start", { receiverId: targetId, senderId: userId, senderName: username });
    }
    typingTimeout.current[key] = setTimeout(() => handleTypingStop(targetId, isRoom), 2000);
  };

  const handleTypingStop = (targetId, isRoom = false) => {
    const key = isRoom ? `room_${currentRoom}_${userId}` : `private_${targetId}_${userId}`;
    if (typingTimeout.current[key]) {
      clearTimeout(typingTimeout.current[key]);
      delete typingTimeout.current[key];
    }
    if (isRoom) socket.emit("typing_stop", { roomId: currentRoom, senderId: userId, senderName: username });
    else socket.emit("typing_stop", { receiverId: targetId, senderId: userId, senderName: username });
  };

  // === NEWS FEED ENHANCED FUNCTIONS ===
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const reactToPost = async (postId, reaction) => {
    try {
      const response = await fetch(`http://localhost:3001/api/news/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reaction })
      });
      const updatedPost = await response.json();
      setPostReactions(prev => ({ ...prev, [postId]: updatedPost.reactionCounts }));
      setShowReactionPicker(prev => ({ ...prev, [postId]: false }));
    } catch (error) {
      console.error('Error reacting:', error);
    }
  };

  const addComment = async (postId, parentId = null) => {
    const content = parentId ? (newComment[`${postId}_${parentId}`] || '').trim() : (newComment[postId] || '').trim();
    if (!content) return;
    try {
      const response = await fetch(`http://localhost:3001/api/news/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, username, content, parentId })
      });
      const comment = await response.json();
      setPostComments(prev => ({ ...prev, [postId]: [...(prev[postId] || []), comment] }));
      if (parentId) {
        setNewComment(prev => ({ ...prev, [`${postId}_${parentId}`]: '' }));
        setReplyingTo(prev => ({ ...prev, [postId]: null }));
      } else {
        setNewComment(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const likeComment = async (postId, commentId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/news/${postId}/comment/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const updatedComment = await response.json();
      setPostComments(prev => ({ ...prev, [postId]: prev[postId]?.map(c => c._id === commentId ? updatedComment : c) || [] }));
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const sharePost = async (postId) => {
    try {
      await fetch(`http://localhost:3001/api/news/${postId}/share`, { method: 'POST' });
      alert('Post shared! 🔗');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!showComments[postId]) fetchPostComments(postId);
  };

  const fetchPostComments = async (postId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/news/${postId}/comments`);
      const comments = await response.json();
      setPostComments(prev => ({ ...prev, [postId]: comments }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const getReactionsSummary = (counts) => {
    if (!counts) return '';
    const reactions = Object.entries(counts).filter(([_, count]) => count > 0).map(([type, count]) => {
      const emojis = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😡' };
      return `${emojis[type] || '👍'} ${count}`;
    });
    return reactions.join(' ');
  };

  // === NDIVHO AI FUNCTIONS ===
  const sendToNdivhoAI = async () => {
    if (!ndivhoInput.trim()) return;
    const userMessage = ndivhoInput.trim();
    setNdivhoMessages(prev => [...prev, { sender: 'user', text: userMessage, timestamp: new Date() }]);
    setNdivhoInput("");
    setIsAITyping(true);
    try {
      const response = await fetch('http://localhost:3001/api/ndivho-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await response.json();
      setTimeout(() => {
        setNdivhoMessages(prev => [...prev, { sender: 'bot', text: data.response, timestamp: data.timestamp }]);
        setIsAITyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setIsAITyping(false);
    }
  };

  // === AI ROOM FUNCTIONS ===
  const sendToAI = async () => {
    if (!aiInput.trim()) return;
    const userMessage = aiInput.trim();
    setAiMessages(prev => [...prev, { sender: 'user', text: userMessage, timestamp: new Date() }]);
    setAiInput("");
    setIsAiTyping(true);
    try {
      const response = await fetch('http://localhost:3001/api/ndivho-ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, userId, moduleCode: aiModuleCode })
      });
      const data = await response.json();
      setTimeout(() => {
        setAiMessages(prev => [...prev, { sender: 'bot', text: data.response, timestamp: data.timestamp }]);
        setIsAiTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error:', error);
      setIsAiTyping(false);
    }
  };

  const handleAiFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.split('.')[0]);
    formData.append('moduleCode', aiModuleCode || 'GENERAL');
    formData.append('userId', userId);
    formData.append('uploaderName', username);
    formData.append('uploaderRole', 'founder');

    try {
      const response = await fetch('http://localhost:3001/api/study-guides/upload', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        setAiMessages(prev => [...prev, {
          sender: 'bot',
          text: `✅ ${result.message}`,
          timestamp: new Date()
        }]);
      } else {
        alert(`❌ Upload failed: ${result.error}`);
      }
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed.');
    }
  };

  // === PROFILE FUNCTIONS ===
  const fetchUserProfile = async (username) => {
    try {
      const response = await fetch(`http://localhost:3001/api/profile/${username}`);
      const user = await response.json();
      setEditProfile({
        displayName: user.displayName || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        levelOfStudy: user.levelOfStudy || "First Year",
        degreeName: user.degreeName || "",
        faculty: user.faculty || "",
        race: user.race || "",
        ethnicGroup: user.ethnicGroup || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditProfile({ ...editProfile, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/profile/${username}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfile)
      });
      const updatedUser = await response.json();
      setCurrentUser(updatedUser);
      setShowProfile(false);
      alert('Profile updated! ✅');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // === SOCKET EVENT LISTENERS ===
  useEffect(() => {
    socket.on("receive_room_message", (message) => {
      if (message.roomId === currentRoom) setRoomMessages(prev => [...prev, message]);
    });
    socket.on("receive_message", (message) => {
      setPrivateMessages(prev => [...prev, message]);
      if (selectedFriend && message.sender._id === selectedFriend._id) markAsRead(message._id);
    });
    socket.on("message_sent", (message) => setPrivateMessages(prev => [...prev, message]));
    socket.on("message_read", ({ messageId, readAt }) => {
      setPrivateMessages(prev => prev.map(msg => msg._id === messageId ? { ...msg, read: true, readAt } : msg));
    });
    socket.on("user_typing", (data) => {
      if (data.isTyping) setTypingUsers(prev => ({ ...prev, [data.senderId]: data.senderName }));
      else setTypingUsers(prev => { const updated = { ...prev }; delete updated[data.senderId]; return updated; });
    });
    return () => {
      socket.off("receive_room_message");
      socket.off("receive_message");
      socket.off("message_sent");
      socket.off("message_read");
      socket.off("user_typing");
    };
  }, [currentRoom, selectedFriend]);

  // === AUTH SCREEN ===
  if (showAuth) {
    return (
      <div className="App auth-page">
        <div className="auth-container-modern">
          <div className="auth-header">
            <div className="logo-large">🎓</div>
            <h1 className="auth-title">UNIVEN CHAT</h1>
            <p className="auth-subtitle">University of Venda Student Platform</p>
          </div>
          <div className="auth-tabs">
            <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(true); setAuthError(""); }}>Login</button>
            <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => { setIsLogin(false); setAuthError(""); }}>Register</button>
          </div>
          {isLogin ? (
            <div className="auth-form-modern">
              <h2>Welcome Back 👋</h2>
              <div className="input-group-modern">
                <label>Username</label>
                <input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} placeholder="Enter username" />
              </div>
              <div className="input-group-modern">
                <label>Password</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Enter password" />
              </div>
              {authError && <div className="error-message">{authError}</div>}
              <button className="btn-primary" onClick={handleLogin}>Login</button>
            </div>
          ) : (
            <div className="auth-form-modern">
              <h2>Create Account</h2>
              <div className="input-group-modern">
                <label>Username</label>
                <input type="text" value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} placeholder="Choose username" />
              </div>
              <div className="input-group-modern">
                <label>Display Name</label>
                <input type="text" value={authDisplayName} onChange={(e) => setAuthDisplayName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="input-group-modern">
                <label>Email</label>
                <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Your email" />
              </div>
              <div className="input-group-modern">
                <label>Phone Number</label>
                <input type="tel" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} placeholder="Your phone number" />
              </div>
              <div className="input-group-modern">
                <label>Gender</label>
                <select value={authGender} onChange={(e) => setAuthGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="input-group-modern">
                <label>Faculty</label>
                <select value={authFaculty} onChange={(e) => setAuthFaculty(e.target.value)}>
                  <option value="">Select Faculty</option>
                  <option>Agriculture, Science & Engineering</option>
                  <option>Commerce, Law & Management</option>
                  <option>Humanities, Social Sciences & Education</option>
                  <option>Health Sciences</option>
                </select>
              </div>
              <div className="input-group-modern">
                <label>Level of Study</label>
                <select value={authLevelOfStudy} onChange={(e) => setAuthLevelOfStudy(e.target.value)}>
                  <option>First Year</option>
                  <option>Second Year</option>
                  <option>Third Year</option>
                  <option>Fourth Year</option>
                  <option>Honours</option>
                  <option>Masters</option>
                  <option>PhD</option>
                </select>
              </div>
              <div className="input-group-modern">
                <label>Relationship Status</label>
                <select value={authRelationshipStatus} onChange={(e) => setAuthRelationshipStatus(e.target.value)}>
                  <option value="Single">Single</option>
                  <option value="In Relationship">In Relationship</option>
                  <option value="It's Complicated">It's Complicated</option>
                </select>
              </div>
              {authRelationshipStatus === 'Single' && (
                <div className="input-group-modern checkbox-group">
                  <label>
                    <input type="checkbox" checked={authJoinMingle} onChange={(e) => setAuthJoinMingle(e.target.checked)} />
                    Join Single & Mingle automatically
                  </label>
                </div>
              )}
              <div className="input-group-modern">
                <label>Password</label>
                <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Create password" />
              </div>
              {authError && <div className="error-message">{authError}</div>}
              <button className="btn-primary" onClick={handleRegister}>Register</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === MAIN APP ===
  return (
    <div className="App">
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h2 className="chat-title">UNIVEN</h2>
            <div className="user-avatar-small" onClick={() => setShowProfile(true)}>
              {editProfile.avatar ? <img src={editProfile.avatar} alt="avatar" /> : <span>👤</span>}
            </div>
          </div>
          <div className="nav-tabs-sidebar">
            <button className={`nav-tab ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>🏛️ Rooms</button>
            <button className={`nav-tab ${aiRoomActive ? 'active' : ''}`} onClick={() => { setAiRoomActive(true); setActiveTab(''); }}>🤖 Ndivho AI</button>
            <button className={`nav-tab ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>
              💕 Single & Mingle {matches.length > 0 && <span className="notification-badge">{matches.length}</span>}
            </button>
            <button className={`nav-tab ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>👥 Friends ({friends.length})</button>
            <button className={`nav-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>📨 Requests ({friendRequests.length})</button>
            <button className={`nav-tab ${activeTab === 'news' ? 'active' : ''}`} onClick={() => setActiveTab('news')}>📰 News Feed</button>
          </div>
          {activeTab === 'rooms' && (
            <div className="rooms-list">
              {rooms.map(room => (
                <div key={room.id} className={`room-item ${currentRoom === room.id ? 'active' : ''}`} onClick={() => joinRoom(room.id)}>
                  <div className="room-icon">{room.name.split(' ')[0]}</div>
                  <div className="room-info">
                    <h4>{room.name}</h4>
                    <p>{room.description}</p>
                  </div>
                  {currentRoom === room.id && <div className="active-indicator">●</div>}
                </div>
              ))}
            </div>
          )}
          {activeTab === 'friends' && (
            <div className="friends-list">
              {/* Modern Search Bar */}
              <div className="search-section">
                <div className="search-box-modern">
                  <input
                    type="text"
                    placeholder="Search users by username..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim()) {
                        searchUsers();
                      } else {
                        setShowSearchResults(false);
                      }
                    }}
                    className="search-input-modern"
                  />
                  <button onClick={searchUsers} className="search-button">🔍</button>
                </div>
                {showSearchResults && searchResults.length > 0 && (
                  <div className="search-results-modern">
                    {searchResults.map(user => (
                      <div key={user._id} className="search-result-item">
                        <div className="result-avatar">
                          {user.avatar ? <img src={user.avatar} alt="" /> : <span>👤</span>}
                        </div>
                        <div className="result-info">
                          <h4>{user.displayName || user.username}</h4>
                          <p>@{user.username}</p>
                        </div>
                        <button className="btn-add-friend" onClick={() => sendFriendRequest(user._id)}>+ Add</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Friends List */}
              {friends.map(friend => (
                <div key={friend._id} className={`friend-item ${selectedFriend?._id === friend._id ? 'active' : ''}`} onClick={() => selectFriend(friend)}>
                  <div className="friend-avatar">
                    {friend.avatar ? <img src={friend.avatar} alt="" /> : <span>👤</span>}
                    <span className={`status-indicator ${friend.status === 'online' ? 'online' : 'offline'}`}></span>
                  </div>
                  <div className="friend-info">
                    <h4>{friend.displayName || friend.username}</h4>
                    <p>{friend.status === 'online' ? '● Online' : '○ Offline'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'requests' && (
            <div className="requests-list">
              {friendRequests.length === 0 ? <p className="no-requests">No pending requests</p> : (
                friendRequests.map(request => (
                  <div key={request._id} className="request-item">
                    <div className="request-info">
                      <h4>{request.sender.displayName || request.sender.username}</h4>
                      <p>{request.sender.username}</p>
                    </div>
                    <div className="request-actions">
                      <button className="btn-accept" onClick={() => handleFriendRequest(request._id, 'accepted')}>✓</button>
                      <button className="btn-reject" onClick={() => handleFriendRequest(request._id, 'rejected')}>✕</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {activeTab === 'news' && (
            <div className="news-sidebar">
              <button className="btn-primary" onClick={() => setShowNewsForm(!showNewsForm)}>
                {showNewsForm ? 'Cancel' : '+ Create Post'}
              </button>
              {showNewsForm && (
                <div className="form-container">
                  <textarea placeholder="What's happening?" value={newsPost.content} onChange={(e) => setNewsPost({ ...newsPost, content: e.target.value })} />
                  <input type="file" accept="image/*" multiple onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const imagePromises = files.map(file => {
                      return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                      });
                    });
                    const images = await Promise.all(imagePromises);
                    setNewsImages(images);
                  }} />
                  {newsImages.length > 0 && <p className="image-preview-count">{newsImages.length} image(s) selected</p>}
                  <input type="text" placeholder="Tags (comma separated)" value={newsPost.tags} onChange={(e) => setNewsPost({ ...newsPost, tags: e.target.value })} />
                  <button className="btn-primary" onClick={createNewsPost}>Publish</button>
                </div>
              )}
            </div>
          )}
          <div className="sidebar-footer">
            <div className="user-info-footer" onClick={() => setShowProfile(true)}>
              <div className="user-avatar-small">
                {editProfile.avatar ? <img src={editProfile.avatar} alt="" /> : <span>👤</span>}
              </div>
              <div className="user-details">
                <h4>{editProfile.displayName || username}</h4>
                {currentUser?.role === 'founder' && <p className="user-status" style={{ color: '#feca57' }}>👑 Founder</p>}
                {currentUser?.role !== 'founder' && <p className="user-status">● Online</p>}
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-chat-area">
          {/* AI ROOM */}
          {aiRoomActive && (
            <div className="ai-room-full">
              <div className="ai-room-header-full">
                <div className="ai-header-left">
                  <div className="ai-avatar-large">
                    <img src="/images/ndivho-avatar.jpg" alt="Ndivho" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  </div>
                  <div className="ai-title-section">
                    <h2>Ndivho AI</h2>
                    <p>Your UNIVEN Study Assistant - Powered by Llama 3</p>
                  </div>
                </div>
                <div className="ai-header-right">
                  <input
                    type="text"
                    placeholder="Module Code (optional)"
                    value={aiModuleCode}
                    onChange={(e) => setAiModuleCode(e.target.value.toUpperCase())}
                    className="ai-module-code-input"
                  />
                  <label className="ai-upload-button-header">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp"
                      onChange={handleAiFileUpload}
                      style={{ display: 'none' }}
                    />
                    📤 Upload Study Guide
                  </label>
                  <button className="close-ai-room-btn" onClick={() => setAiRoomActive(false)}>×</button>
                </div>
              </div>
              <div className="ai-chat-container">
                <div className="ai-messages-area">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`ai-chat-message ${msg.sender}`}>
                      <div className="ai-chat-avatar">
                        {msg.sender === 'bot' ? (
                          <img src="/images/ndivho-avatar.jpg" alt="Ndivho" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <div className="ai-chat-bubble">
                        <p>{msg.text}</p>
                        <span className="ai-chat-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="ai-chat-message bot">
                      <div className="ai-chat-avatar">🤖</div>
                      <div className="ai-chat-bubble">
                        <div className="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="ai-input-container">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendToAI()}
                    placeholder="Ask me anything about your studies, upload notes, or get help with any subject..."
                    className="ai-chat-input"
                  />
                  <button className="ai-send-button" onClick={sendToAI}>Send</button>
                </div>
              </div>
            </div>
          )}

          {/* Single & Mingle with Statuses */}
          {activeTab === 'connections' && (
            <div className="connections-container">
              <div className="connections-header">
                <h2>💕 Single & Mingle</h2>
                <div className="connections-actions">
                  <button className="btn-secondary" onClick={() => setShowStatusForm(!showStatusForm)}>
                    {showStatusForm ? 'Cancel' : '📸 Post Status'}
                  </button>
                  <button className="btn-primary" onClick={() => setShowProfileForm(!showProfileForm)}>
                    {showProfileForm ? 'Cancel' : 'Create Profile'}
                  </button>
                </div>
              </div>

              {/* Status Post Form */}
              {showStatusForm && (
                <div className="status-form-container">
                  <h3>Post Your Status</h3>
                  <textarea
                    placeholder="What's on your mind?"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    maxLength={200}
                  />
                  <div className="status-char-count">{statusText.length}/200</div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setStatusImage(e.target.files[0])}
                  />
                  {statusImage && <div className="image-preview">📷 {statusImage.name}</div>}
                  <button className="btn-primary" onClick={createMingleStatus}>Post Status</button>
                </div>
              )}

              {/* Statuses Feed */}
              {mingleStatuses.length > 0 && (
                <div className="statuses-feed">
                  <h3>📱 Recent Statuses</h3>
                  {mingleStatuses.map(status => (
                    <div key={status._id} className="status-card">
                      <div className="status-header">
                        <div className="status-avatar">
                          {status.user?.avatar ? <img src={status.user.avatar} alt="" /> : <span>👤</span>}
                        </div>
                        <div className="status-info">
                          <h4>{status.user?.displayName || status.username}</h4>
                          <p>{formatTimeAgo(status.createdAt)}</p>
                        </div>
                      </div>
                      {status.text && <p className="status-text">{status.text}</p>}
                      {status.image && <img src={status.image} alt="status" className="status-image" />}
                      <div className="status-actions">
                        <button className="status-action-btn">❤️ Like</button>
                        <button className="status-action-btn">💬 Comment</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Profile Form */}
              {showProfileForm && (
                <div className="form-container">
                  <h3>Create Your Connection Profile</h3>
                  <input type="number" placeholder="Age" value={userProfile.age} onChange={(e) => setUserProfile({ ...userProfile, age: e.target.value })} />
                  <input type="text" placeholder="Faculty" value={userProfile.faculty} onChange={(e) => setUserProfile({ ...userProfile, faculty: e.target.value })} />
                  <textarea placeholder="Bio (keep it fun!)" value={userProfile.bio} onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })} />
                  <select value={userProfile.lookingFor} onChange={(e) => setUserProfile({ ...userProfile, lookingFor: e.target.value })}>
                    <option value="Friends">Friends</option>
                    <option value="Study Buddy">Study Buddy</option>
                    <option value="Partner">Looking for a Partner</option>
                    <option value="Business Collab">Business Collab</option>
                  </select>
                  <input type="text" placeholder="Interests (comma separated)" value={userProfile.interests.join(', ')} onChange={(e) => setUserProfile({ ...userProfile, interests: e.target.value.split(',').map(i => i.trim()) })} />
                  <input type="text" placeholder="Music (comma separated)" value={userProfile.music.join(', ')} onChange={(e) => setUserProfile({ ...userProfile, music: e.target.value.split(',').map(m => m.trim()) })} />
                  <input type="text" placeholder="Campus Hotspots (e.g., Block 6, Library)" value={userProfile.campusHotspots.join(', ')} onChange={(e) => setUserProfile({ ...userProfile, campusHotspots: e.target.value.split(',').map(h => h.trim()) })} />
                  <button className="btn-primary" onClick={createConnectionProfile}>Save Profile</button>
                </div>
              )}

              {/* Connection Cards */}
              {!showProfileForm && !showStatusForm && connectionProfiles.length > 0 && currentProfileIndex < connectionProfiles.length ? (
                <div className="card-stack">
                  {connectionProfiles.slice(currentProfileIndex, currentProfileIndex + 1).map(profile => (
                    <div key={profile._id} className="connection-card" onClick={() => calculateCompatibility(profile.user)}>
                      <div className="card-photo">
                        {profile.photos && profile.photos.length > 0 ? (
                          <img src={profile.photos[0]} alt={profile.displayName} />
                        ) : (
                          <div className="photo-placeholder">👤</div>
                        )}
                        <div className="intent-badge">
                          {profile.lookingFor === 'Partner' && '🟢 Looking for a Partner'}
                          {profile.lookingFor === 'Study Buddy' && '🔵 Study Buddy'}
                          {profile.lookingFor === 'Business Collab' && '🟡 Business Collab'}
                          {profile.lookingFor === 'Friends' && '🟣 Friends'}
                        </div>
                      </div>
                      <div className="card-info">
                        <h3>{profile.displayName || profile.username}, {profile.age}</h3>
                        <p className="card-faculty">📚 {profile.faculty}</p>
                        {compatibility.score > 0 && (
                          <div className="vibe-meter">
                            <div className="vibe-label">{compatibility.score}% Match</div>
                            <div className="vibe-progress">
                              <div className="vibe-fill" style={{ width: `${compatibility.score}%` }}></div>
                            </div>
                            <p className="vibe-reason">
                              {compatibility.common.interests?.length > 0 && `Both love ${compatibility.common.interests.slice(0, 2).join(', ')}`}
                              {compatibility.common.music?.length > 0 && ` • ${compatibility.common.music[0]} music`}
                            </p>
                          </div>
                        )}
                        <div className="card-bio"><p>{profile.bio}</p></div>
                        <div className="interests-grid">
                          {profile.interests?.slice(0, 5).map((interest, i) => (
                            <span key={i} className="interest-chip">✨ {interest}</span>
                          ))}
                        </div>
                        <div className="campus-hotspots">
                          <h4>📍 Find me at...</h4>
                          {profile.campusHotspots?.map((spot, i) => (
                            <span key={i} className="hotspot-tag">{spot}</span>
                          ))}
                        </div>
                      </div>
                      <div className="card-actions">
                        <button className="btn-pass" onClick={() => passProfile(profile.user)}>✕</button>
                        <button className="btn-like" onClick={() => likeProfile(profile.user)}>❤️</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-profiles">
                  <h3>No more profiles! 🎉</h3>
                  <p>Check back later for new connections</p>
                </div>
              )}

              {/* Matches */}
              {matches.length > 0 && (
                <div className="matches-section">
                  <h3>💕 Your Matches ({matches.length})</h3>
                  <div className="matches-grid">
                    {matches.map(match => {
                      const otherUser = match.user1.toString() === userId ? match.user2 : match.user1;
                      return (
                        <div key={match._id} className="match-card">
                          <div className="match-avatar">
                            {otherUser.avatar ? <img src={otherUser.avatar} alt="" /> : <span>👤</span>}
                          </div>
                          <h4>{otherUser.displayName || otherUser.username}</h4>
                          <button className="btn-message">💬 Message</button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Friends Chat */}
          {activeTab === 'friends' && (
            selectedFriend ? (
              <>
                <div className="chat-header-main">
                  <div className="chat-user-info">
                    <h3>{selectedFriend.displayName || selectedFriend.username}</h3>
                    <p>{selectedFriend.status === 'online' ? '● Online' : '○ Offline'}</p>
                  </div>
                  <div className="chat-actions">
                    <button className="icon-btn" onClick={() => blockUser(selectedFriend._id)}>🚫 Block</button>
                  </div>
                </div>
                <div className="messages-container">
                  {privateMessages.length === 0 ? (
                    <div className="no-messages"><p>No messages yet. Say hi! 👋</p></div>
                  ) : (
                    privateMessages.map((msg, index) => (
                      <div key={index} className={`message-bubble ${msg.sender._id === userId ? 'own' : 'other'}`}>
                        <div className="message-text">{msg.content}</div>
                        <div className="message-meta">
                          <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                          {msg.sender._id === userId && <span className="read-status">{msg.read ? '✓✓' : '✓'}</span>}
                        </div>
                      </div>
                    ))
                  )}
                  {Object.keys(typingUsers).length > 0 && selectedFriend && typingUsers[selectedFriend._id] && (
                    <div className="typing-indicator">
                      <span className="typing-dots"><span></span><span></span><span></span></span>
                      <span>{typingUsers[selectedFriend._id]} is typing...</span>
                    </div>
                  )}
                </div>
                <div className="message-input-area">
                  <input type="text" value={privateMessageInput} onChange={(e) => { setPrivateMessageInput(e.target.value); handleTypingStart(selectedFriend._id, false); }} onKeyPress={(e) => { if (e.key === 'Enter') { sendPrivateMessage(); handleTypingStop(selectedFriend._id, false); } }} onBlur={() => handleTypingStop(selectedFriend._id, false)} placeholder="Type a message..." />
                  <button className="send-button" onClick={sendPrivateMessage}>Send</button>
                </div>
              </>
            ) : (
              <div className="no-chat-selected">
                <h2>Select a friend to start chatting</h2>
                <p>Or search for new friends using the search bar</p>
              </div>
            )
          )}

          {/* News Feed */}
          {activeTab === 'news' && (
            <div className="news-feed-container">
              <div className="news-feed-header">
                <h2>📰 Campus Feed</h2>
                <button className="btn-primary" onClick={() => setShowNewsForm(!showNewsForm)}>
                  {showNewsForm ? 'Cancel' : '✨ Create Post'}
                </button>
              </div>
              {showNewsForm && (
                <div className="post-creator">
                  <div className="post-creator-header">
                    <div className="post-creator-avatar">
                      {editProfile.avatar ? <img src={editProfile.avatar} alt="" /> : <span>👤</span>}
                    </div>
                    <div className="post-creator-info">
                      <h4>{editProfile.displayName || username}</h4>
                      <p>Share your thoughts with the campus...</p>
                    </div>
                  </div>
                  <textarea className="post-input" placeholder="What's on your mind?" value={newsPost.content} maxLength={500} onChange={(e) => setNewsPost({ ...newsPost, content: e.target.value })} />
                  <div className="post-input-footer">
                    <div className="char-counter">{newsPost.content.length}/500</div>
                    <div className="post-actions">
                      <button className="icon-btn-small">📷</button>
                      <button className="icon-btn-small">🎬</button>
                      <button className="icon-btn-small">📍</button>
                      <button className="btn-primary btn-sm" onClick={createNewsPost}>Post</button>
                    </div>
                  </div>
                </div>
              )}
              <div className="news-posts">
                {newsPosts.map(post => (
                  <div key={post._id} className={`post-card ${post.isPromoted ? 'promoted' : ''}`}>
                    {post.isPromoted && <div className="promoted-badge">🌟 Sponsored</div>}
                    <div className="post-header">
                      <div className="post-author">
                        <div className="author-avatar"><span>👤</span></div>
                        <div className="author-info">
                          <h4>{post.authorName}</h4>
                          <div className="post-meta">
                            <span>{formatTimeAgo(post.createdAt)}</span>
                            <span>•</span>
                            <span>🌍 Public</span>
                          </div>
                        </div>
                      </div>
                      <button className="post-options">⋯</button>
                    </div>
                    <div className="post-content">
                      <p className="post-text">{post.content}</p>
                      {post.images && post.images.length > 0 && (
                        <div className={`post-images ${post.images.length === 1 ? 'single' : 'grid'}`}>
                          {post.images.map((img, i) => <img key={i} src={img} alt="post" className="post-image" />)}
                        </div>
                      )}
                      {post.tags && post.tags.length > 0 && (
                        <div className="post-tags">
                          {post.tags.map((tag, i) => <span key={i} className="tag">#{tag}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="post-stats">
                      <span>{getReactionsSummary(postReactions[post._id])}</span>
                      <span>{post.comments?.length || 0} comments</span>
                      <span>{post.shares || 0} shares</span>
                    </div>
                    <div className="post-actions-bar">
                      <div className="action-group">
                        <button className={`action-btn ${showReactionPicker[post._id] ? 'active' : ''}`} onClick={() => setShowReactionPicker(prev => ({ ...prev, [post._id]: !prev[post._id] }))}>👍 React</button>
                        {showReactionPicker[post._id] && (
                          <div className="reaction-picker">
                            {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map(reaction => (
                              <button key={reaction} className="reaction-btn" onClick={() => reactToPost(post._id, reaction)}>
                                {reaction === 'like' && '👍'}
                                {reaction === 'love' && '❤️'}
                                {reaction === 'haha' && '😂'}
                                {reaction === 'wow' && '😮'}
                                {reaction === 'sad' && '😢'}
                                {reaction === 'angry' && '😡'}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button className="action-btn" onClick={() => toggleComments(post._id)}>💬 Comment</button>
                      <button className="action-btn" onClick={() => sharePost(post._id)}>🔗 Share</button>
                    </div>
                    {showComments[post._id] && (
                      <div className="comments-section">
                        <div className="comment-input-wrapper">
                          <div className="comment-avatar"><span>👤</span></div>
                          <input type="text" className="comment-input" placeholder="Write a comment..." value={newComment[post._id] || ''} onChange={(e) => setNewComment(prev => ({ ...prev, [post._id]: e.target.value }))} onKeyPress={(e) => e.key === 'Enter' && addComment(post._id)} />
                          <button className="btn-send-comment" onClick={() => addComment(post._id)}>Send</button>
                        </div>
                        <div className="comments-list">
                          {(postComments[post._id] || post.comments || []).filter(c => !c.parentId).map(comment => (
                            <div key={comment._id} className="comment-item">
                              <div className="comment-avatar"><span>👤</span></div>
                              <div className="comment-content">
                                <div className="comment-header">
                                  <strong>{comment.username}</strong>
                                  <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                                </div>
                                <p className="comment-text">{comment.content}</p>
                                <div className="comment-actions">
                                  <button className="comment-like" onClick={() => likeComment(post._id, comment._id)}>
                                    {comment.likedBy?.includes(userId) ? '❤️' : '🤍'} {comment.likes || 0}
                                  </button>
                                  <button className="comment-reply" onClick={() => setReplyingTo(prev => ({ ...prev, [post._id]: comment._id }))}>Reply</button>
                                </div>
                                {replyingTo[post._id] === comment._id && (
                                  <div className="reply-input-wrapper">
                                    <input type="text" className="reply-input" placeholder="Write a reply..." value={newComment[`${post._id}_${comment._id}`] || ''} onChange={(e) => setNewComment(prev => ({ ...prev, [`${post._id}_${comment._id}`]: e.target.value }))} onKeyPress={(e) => e.key === 'Enter' && addComment(post._id, comment._id)} />
                                    <button className="btn-send-reply" onClick={() => addComment(post._id, comment._id)}>Reply</button>
                                  </div>
                                )}
                                {(postComments[post._id] || post.comments || []).filter(c => c.parentId === comment._id).map(reply => (
                                  <div key={reply._id} className="reply-item">
                                    <div className="reply-avatar"><span>👤</span></div>
                                    <div className="reply-content">
                                      <div className="reply-header">
                                        <strong>{reply.username}</strong>
                                        <span className="reply-time">{formatTimeAgo(reply.createdAt)}</span>
                                      </div>
                                      <p className="reply-text">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lost & Found Room */}
          {activeTab === 'rooms' && currentRoom === 'lost-found' && (
            <div className="lost-found-container">
              <div className="room-content-header">
                <h2>🔍 Lost & Found</h2>
                <div className="header-actions">
                  <button className={`view-toggle ${lostFoundView === 'list' ? 'active' : ''}`} onClick={() => setLostFoundView('list')}>📋 List</button>
                  <button className={`view-toggle ${lostFoundView === 'gallery' ? 'active' : ''}`} onClick={() => setLostFoundView('gallery')}>🖼️ Gallery</button>
                  <button className="btn-primary" onClick={() => setShowLostFoundForm(!showLostFoundForm)}>{showLostFoundForm ? 'Cancel' : '+ I Found This'}</button>
                </div>
              </div>
              {showLostFoundForm && (
                <div className="form-container">
                  <h3>Post Lost/Found Item</h3>
                  <select value={lostFoundItem.type} onChange={(e) => setLostFoundItem({ ...lostFoundItem, type: e.target.value })}>
                    <option value="Found">I Found Something</option>
                    <option value="Lost">I Lost Something</option>
                  </select>
                  <input type="text" placeholder="Item Title" value={lostFoundItem.title} onChange={(e) => setLostFoundItem({ ...lostFoundItem, title: e.target.value })} />
                  <textarea placeholder="Description" value={lostFoundItem.description} onChange={(e) => setLostFoundItem({ ...lostFoundItem, description: e.target.value })} />
                  <input type="text" placeholder="Location" value={lostFoundItem.location} onChange={(e) => setLostFoundItem({ ...lostFoundItem, location: e.target.value })} />
                  <input type="date" value={lostFoundItem.date} onChange={(e) => setLostFoundItem({ ...lostFoundItem, date: e.target.value })} />
                  <input type="text" placeholder="Contact Info" value={lostFoundItem.contactInfo} onChange={(e) => setLostFoundItem({ ...lostFoundItem, contactInfo: e.target.value })} />
                  <input type="file" accept="image/*" multiple onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const imagePromises = files.map(file => {
                      return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                      });
                    });
                    const images = await Promise.all(imagePromises);
                    setLfImages(images);
                  }} />
                  {lfImages.length > 0 && <div className="image-preview">{lfImages.length} photo(s) selected</div>}
                  <button className="btn-primary" onClick={createLostFoundItem}>Post</button>
                </div>
              )}
              {lostFoundView === 'gallery' ? (
                <div className="lost-found-gallery">
                  {lostFoundItems.map(item => (
                    <div key={item._id} className={`lf-gallery-card ${item.status}`}>
                      <div className="lf-gallery-image">
                        {item.images && item.images.length > 0 ? <img src={item.images[0]} alt={item.title} /> : <span>📦</span>}
                        <span className={`status-badge ${item.status}`}>{item.status}</span>
                      </div>
                      <div className="lf-gallery-info">
                        <h4>{item.title}</h4>
                        <p>{item.location}</p>
                        {item.status === 'FOUND' && item.type === 'Found' && (
                          <button className="btn-claim" onClick={() => { setItemToClaim(item._id); setShowClaimModal(true); }}>🙋 Claim</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="lost-found-list">
                  {lostFoundItems.map(item => (
                    <div key={item._id} className={`lost-found-card ${item.type} ${item.status.toLowerCase()}`}>
                      <div className="lf-header">
                        <span className={`lf-badge ${item.type}`}>{item.type}</span>
                        <span className={`status-badge ${item.status}`}>{item.status}</span>
                        <h4>{item.title}</h4>
                      </div>
                      <p>{item.description}</p>
                      <p>📍 {item.location} • 📅 {new Date(item.date).toLocaleDateString()}</p>
                      <p>👤 {item.username}</p>
                      <p>📞 {item.contactInfo}</p>
                      {item.images && item.images.length > 0 && (
                        <div className="lf-images">
                          {item.images.map((img, i) => <img key={i} src={img} alt="item" />)}
                        </div>
                      )}
                      {item.status === 'FOUND' && item.type === 'Found' && (
                        <button className="btn-claim" onClick={() => { setItemToClaim(item._id); setShowClaimModal(true); }}>🙋 Claim This Item</button>
                      )}
                      {item.status === 'CLAIMED' && userId === item.user.toString() && (
                        <button className="btn-return" onClick={() => returnItem(item._id)}>✓ Mark as Returned</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Marketplace Room */}
          {activeTab === 'rooms' && currentRoom === 'marketplace' && (
            <div className="marketplace-container">
              <div className="room-content-header">
                <h2>💼 Campus Marketplace</h2>
                <div className="header-actions">
                  <input type="text" placeholder="Search items..." value={marketSearch} onChange={(e) => setMarketSearch(e.target.value)} className="search-input" />
                  <select value={marketFilter} onChange={(e) => setMarketFilter(e.target.value)} className="filter-select">
                    <option value="All">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Textbooks">Textbooks</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Services">Services</option>
                    <option value="Other">Other</option>
                  </select>
                  <button className="btn-primary" onClick={() => setShowMarketForm(!showMarketForm)}>{showMarketForm ? 'Cancel' : '+ Sell Item'}</button>
                </div>
              </div>
              {showMarketForm && (
                <div className="form-container">
                  <h3>List an Item for Sale</h3>
                  <input type="text" placeholder="Item Title" value={marketItem.title} onChange={(e) => setMarketItem({ ...marketItem, title: e.target.value })} />
                  <textarea placeholder="Description" value={marketItem.description} onChange={(e) => setMarketItem({ ...marketItem, description: e.target.value })} />
                  <input type="number" placeholder="Price (R)" value={marketItem.price} onChange={(e) => setMarketItem({ ...marketItem, price: e.target.value })} />
                  <select value={marketItem.category} onChange={(e) => setMarketItem({ ...marketItem, category: e.target.value })}>
                    <option>Electronics</option>
                    <option>Textbooks</option>
                    <option>Clothing</option>
                    <option>Furniture</option>
                    <option>Services</option>
                    <option>Other</option>
                  </select>
                  <select value={marketItem.condition} onChange={(e) => setMarketItem({ ...marketItem, condition: e.target.value })}>
                    <option>New</option>
                    <option>Like New</option>
                    <option>Good</option>
                    <option>Fair</option>
                    <option>Poor</option>
                  </select>
                  <input type="text" placeholder="Contact Info" value={marketItem.contactInfo} onChange={(e) => setMarketItem({ ...marketItem, contactInfo: e.target.value })} />
                  <input type="file" accept="image/*" multiple onChange={async (e) => {
                    const files = Array.from(e.target.files);
                    const imagePromises = files.map(file => {
                      return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                      });
                    });
                    const images = await Promise.all(imagePromises);
                    setMarketImages(images);
                  }} />
                  {marketImages.length > 0 && <div className="image-preview">{marketImages.length} photo(s) selected</div>}
                  <button className="btn-primary" onClick={createMarketItem}>List Item</button>
                </div>
              )}
              <div className="marketplace-grid">
                {marketplaceItems.map(item => (
                  <div key={item._id} className="market-item-card">
                    <div className="item-image-carousel">
                      {item.images && item.images.length > 0 ? (
                        <>
                          <img src={item.images[currentImageIndex[item._id] || 0]} alt={item.title} />
                          {item.images.length > 1 && (
                            <div className="carousel-controls">
                              <button onClick={() => prevImage(item._id, item.images.length)}>◀</button>
                              <span>{(currentImageIndex[item._id] || 0) + 1}/{item.images.length}</span>
                              <button onClick={() => nextImage(item._id, item.images.length)}>▶</button>
                            </div>
                          )}
                        </>
                      ) : <span>📦</span>}
                    </div>
                    <div className="item-details">
                      <h4>{item.title}</h4>
                      <p className="item-price">R {item.price}</p>
                      <p className="item-category">{item.category} • {item.condition}</p>
                      <p className="item-seller">Seller: {item.sellerName}</p>
                      <p className="item-contact">📞 {item.contactInfo}</p>
                      <div className="item-actions">
                        <button className="btn-interested" onClick={() => markInterested(item._id)}>💬 Interested</button>
                        <span className={`item-status ${item.status}`}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exam Prep Room */}
          {activeTab === 'rooms' && currentRoom === 'exam-prep' && (
            <div className="exam-prep-container">
              <div className="room-content-header">
                <h2>📝 Exam Prep War Room</h2>
                <button className="btn-primary" onClick={() => setShowThreadForm(!showThreadForm)}>{showThreadForm ? 'Cancel' : '+ New Thread'}</button>
              </div>
              {showThreadForm && (
                <div className="form-container">
                  <h3>Create Study Thread</h3>
                  <input type="text" placeholder="Thread Title" value={examThread.title} onChange={(e) => setExamThread({ ...examThread, title: e.target.value })} />
                  <textarea placeholder="Your Question" value={examThread.question} onChange={(e) => setExamThread({ ...examThread, question: e.target.value })} />
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => setThreadImage(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }} />
                  {threadImage && <div className="image-preview">Image attached</div>}
                  <button className="btn-primary" onClick={createExamThread}>Create Thread</button>
                </div>
              )}
              <div className="exam-threads">
                {examThreads.map(thread => (
                  <div key={thread._id} className="thread-card">
                    <div className="thread-header" onClick={() => setActiveThreadId(activeThreadId === thread._id ? null : thread._id)}>
                      <h4>{thread.title}</h4>
                      <p>by {thread.authorName} • {thread.replies.length} replies</p>
                    </div>
                    {activeThreadId === thread._id && (
                      <div className="thread-content">
                        <p className="thread-question">{thread.question}</p>
                        {thread.image && <img src={thread.image} alt="question" className="thread-image" />}
                        <div className="thread-replies">
                          {thread.replies.map((reply, i) => (
                            <div key={i} className="reply">
                              <strong>{reply.authorName}</strong>
                              <p>{reply.content}</p>
                              {reply.image && <img src={reply.image} alt="reply" className="reply-image" />}
                            </div>
                          ))}
                        </div>
                        <div className="reply-form">
                          <input type="text" placeholder="Your reply..." value={threadReply} onChange={(e) => setThreadReply(e.target.value)} />
                          <button onClick={() => replyToThread(thread._id)}>Reply</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cafeteria Room */}
          {activeTab === 'rooms' && currentRoom === 'cafeteria' && (
            <>
              <div className="chat-header-main">
                <div className="chat-user-info">
                  <h3>{rooms.find(r => r.id === currentRoom)?.name || 'Chat Room'}</h3>
                  <p>{rooms.find(r => r.id === currentRoom)?.description || ''}</p>
                </div>
              </div>
              <div className="messages-container">
                {roomMessages.length === 0 ? (
                  <div className="no-messages"><p>No messages yet. Start the conversation! 💬</p></div>
                ) : (
                  roomMessages.map((msg, index) => (
                    <div key={index} className={`message-bubble ${msg.senderId === userId ? 'own' : 'other'}`}>
                      <div className="message-author">{msg.senderName}</div>
                      {msg.messageType === 'voice' ? (
                        <audio controls src={msg.content} className="voice-note" />
                      ) : msg.fileName ? (
                        <div className="file-attachment"><span>📎</span> {msg.fileName}</div>
                      ) : (
                        <div className="message-text">{msg.content}</div>
                      )}
                      <div className="message-time">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))
                )}
                {Object.keys(typingUsers).filter(id => id !== userId).length > 0 && (
                  <div className="typing-indicator">
                    <span className="typing-dots"><span></span><span></span><span></span></span>
                    <span>{Object.values(typingUsers).join(', ')} is typing...</span>
                  </div>
                )}
              </div>
              <div className="message-input-area">
                <input type="text" value={roomMessageInput} onChange={(e) => { setRoomMessageInput(e.target.value); handleTypingStart(currentRoom, true); }} onKeyPress={(e) => { if (e.key === 'Enter') { sendRoomMessage(); handleTypingStop(currentRoom, true); } }} onBlur={() => handleTypingStop(currentRoom, true)} placeholder={`Message #${currentRoom}...`} />
                <button className="icon-btn-small" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>😀</button>
                <button className="icon-btn-small" onClick={() => fileInputRef.current.click()}>📎</button>
                <button className={`icon-btn-small ${recordingVoice ? 'recording' : ''}`} onClick={recordingVoice ? stopVoiceRecording : startVoiceRecording}>{recordingVoice ? '⏹️' : '🎤'}</button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                <button className="send-button" onClick={sendRoomMessage}>Send</button>
              </div>
              {showEmojiPicker && (
                <div className="emoji-picker">
                  {emojis.map(emoji => (
                    <button key={emoji} className="emoji-btn" onClick={() => addEmoji(emoji)}>{emoji}</button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Library Room */}
          {activeTab === 'rooms' && currentRoom === 'library' && (
            <div className="library-container">
              <div className="room-content-header">
                <h2>📚 Study Library</h2>
                <div className="header-actions">
                  <button className="btn-primary" onClick={() => setShowNdivhoAI(!showNdivhoAI)}>
                    {showNdivhoAI ? 'Close Ndivho AI' : '🤖 Ask Ndivho AI'}
                  </button>
                  <input type="text" placeholder="Search resources..." value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} className="search-input" />
                  <select value={libraryFilter} onChange={(e) => setLibraryFilter(e.target.value)} className="filter-select">
                    <option value="All">All Subjects</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physical Sciences">Physical Sciences</option>
                    <option value="Life Sciences">Life Sciences</option>
                    <option value="Business Studies">Business Studies</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Other">Other</option>
                  </select>
                  <button className="btn-primary" onClick={() => setShowResourceForm(!showResourceForm)}>{showResourceForm ? 'Cancel' : '+ Share Resource'}</button>
                </div>
              </div>
              {showResourceForm && (
                <div className="form-container">
                  <h3>Share Study Resource</h3>
                  <input type="text" placeholder="Resource Title" value={studyResource.title} onChange={(e) => setStudyResource({ ...studyResource, title: e.target.value })} />
                  <textarea placeholder="Description" value={studyResource.description} onChange={(e) => setStudyResource({ ...studyResource, description: e.target.value })} />
                  <select value={studyResource.subject} onChange={(e) => setStudyResource({ ...studyResource, subject: e.target.value })}>
                    <option>Mathematics</option>
                    <option>Physical Sciences</option>
                    <option>Life Sciences</option>
                    <option>Business Studies</option>
                    <option>Computer Science</option>
                    <option>Other</option>
                  </select>
                  <select value={studyResource.gradeLevel} onChange={(e) => setStudyResource({ ...studyResource, gradeLevel: e.target.value })}>
                    <option>First Year</option>
                    <option>Second Year</option>
                    <option>Third Year</option>
                    <option>Fourth Year</option>
                    <option>Honours</option>
                    <option>Masters</option>
                    <option>PhD</option>
                  </select>
                  <select value={studyResource.fileType} onChange={(e) => setStudyResource({ ...studyResource, fileType: e.target.value })}>
                    <option>PDF</option>
                    <option>DOC</option>
                    <option>DOCX</option>
                    <option>PPT</option>
                    <option>PPTX</option>
                    <option>Image</option>
                    <option>Other</option>
                  </select>
                  <input type="text" placeholder="Tags (comma separated)" value={studyResource.tags} onChange={(e) => setStudyResource({ ...studyResource, tags: e.target.value })} />
                  <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setResourceFile(reader.result);
                        setStudyResource({ ...studyResource, fileName: file.name, fileSize: (file.size / 1024).toFixed(2) + ' KB' });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
                  {resourceFile && <div className="image-preview">📄 {studyResource.fileName} ({studyResource.fileSize})</div>}
                  <button className="btn-primary" onClick={createStudyResource}>Share</button>
                </div>
              )}
              <div className="resources-list">
                {studyResources.map(resource => (
                  <div key={resource._id} className="resource-card">
                    <div className="resource-icon">
                      {resource.fileType === 'PDF' ? '📄' : resource.fileType === 'DOC' || resource.fileType === 'DOCX' ? '📝' : resource.fileType === 'PPT' || resource.fileType === 'PPTX' ? '📊' : '📁'}
                    </div>
                    <div className="resource-info">
                      <h4>{resource.title}</h4>
                      <p>{resource.description}</p>
                      <p>📚 {resource.subject} • {resource.gradeLevel} • {resource.fileType}</p>
                      <p>👤 {resource.uploaderName} • 👍 {resource.likes} • 📥 {resource.downloads}</p>
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="resource-tags">
                          {resource.tags.map((tag, i) => <span key={i} className="tag-small">#{tag}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="resource-actions">
                      <button className="btn-like-resource" onClick={() => likeResource(resource._id)}>👍 {resource.likes}</button>
                      <button className="btn-download" onClick={() => downloadResource(resource._id)}>📥 Download</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ndivho AI Panel */}
              {showNdivhoAI && (
                <div className="ndivho-ai-panel">
                  <div className="ndivho-ai-header">
                    <div className="ndivho-ai-avatar">
                      <img src="/images/ndivho-avatar.jpg" alt="Ndivho" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    </div>
                    <div className="ndivho-ai-info">
                      <h3>Ndivho AI</h3>
                      <p>Your UNIVEN Study Assistant</p>
                    </div>
                    <button className="close-ndivho-ai" onClick={() => setShowNdivhoAI(false)}>×</button>
                  </div>
                  <div className="ndivho-ai-messages">
                    {ndivhoMessages.map((msg, i) => (
                      <div key={i} className={`ndivho-ai-message ${msg.sender}`}>
                        <div className="ndivho-ai-message-avatar">
                          {msg.sender === 'bot' ? '🤖' : '👤'}
                        </div>
                        <div className="ndivho-ai-message-content">
                          <p>{msg.text}</p>
                          <span className="ndivho-ai-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                    {isAITyping && (
                      <div className="ndivho-ai-message bot">
                        <div className="ndivho-ai-message-avatar">🤖</div>
                        <div className="ndivho-ai-message-content">
                          <div className="typing-dots"><span></span><span></span><span></span></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ndivho-ai-quick-actions">
                    <button onClick={() => { }}>📚 Study</button>
                    <button onClick={() => { }}>📝 Exam</button>
                    <button onClick={() => { }}>⏰ Time</button>
                    <button onClick={() => { }}>💪 Motivation</button>
                    <button onClick={() => { }}>💻 IT</button>
                    <button onClick={() => { }}>⚖️ Law</button>
                  </div>
                  <div className="ndivho-ai-input-area">
                    <input
                      type="text"
                      value={ndivhoInput}
                      onChange={(e) => setNdivhoInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendToNdivhoAI()}
                      placeholder="Ask about ANY UNIVEN module..."
                    />
                    <button onClick={sendToNdivhoAI}>Send</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showMatchPopup && (
        <div className="modal-overlay" onClick={() => setShowMatchPopup(false)}>
          <div className="match-popup" onClick={(e) => e.stopPropagation()}>
            <div className="match-animation">💕</div>
            <h2>It's a Match!</h2>
            <p>You and {newMatch?.liked?.displayName} liked each other!</p>
            <button className="btn-primary" onClick={() => setShowMatchPopup(false)}>Keep Swiping</button>
          </div>
        </div>
      )}

      {showClaimModal && (
        <div className="modal-overlay" onClick={() => setShowClaimModal(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h2>🙋 Claim Item</h2>
              <button className="close-modal" onClick={() => setShowClaimModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Describe a unique detail about this item that wasn't in the photo (for verification):</p>
              <textarea placeholder="e.g., There's a scratch on the bottom..." value={claimNotes} onChange={(e) => setClaimNotes(e.target.value)} rows="4" />
              <button className="btn-primary" onClick={claimItem}>Submit Claim</button>
            </div>
          </div>
        </div>
      )}

      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-content-modern" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-modern">
              <h2>My Profile</h2>
              <button className="close-modal" onClick={() => setShowProfile(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="profile-avatar-section">
                <div className="avatar-large">{editProfile.avatar ? <img src={editProfile.avatar} alt="" /> : <span>👤</span>}</div>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} id="avatar-input" className="file-input-hidden" />
                <label htmlFor="avatar-input" className="change-avatar-btn">Change Photo</label>
              </div>
              <div className="form-section"><label>Display Name</label><input type="text" value={editProfile.displayName} onChange={(e) => setEditProfile({ ...editProfile, displayName: e.target.value })} /></div>
              <div className="form-section"><label>Email</label><input type="email" value={editProfile.email} onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })} /></div>
              <div className="form-section"><label>Phone</label><input type="tel" value={editProfile.phone} onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })} /></div>
              <div className="form-section"><label>Bio</label><textarea value={editProfile.bio} onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })} rows="3" /></div>
              <div className="form-section"><label>Level of Study</label><select value={editProfile.levelOfStudy} onChange={(e) => setEditProfile({ ...editProfile, levelOfStudy: e.target.value })}><option>First Year</option><option>Second Year</option><option>Third Year</option><option>Fourth Year</option><option>Honours</option><option>Masters</option><option>PhD</option></select></div>
              <div className="form-section"><label>Degree Name</label><input type="text" value={editProfile.degreeName} onChange={(e) => setEditProfile({ ...editProfile, degreeName: e.target.value })} placeholder="e.g., BSc Computer Science" /></div>
              <div className="form-section"><label>Faculty</label><select value={editProfile.faculty} onChange={(e) => setEditProfile({ ...editProfile, faculty: e.target.value })}><option value="">Select Faculty</option><option>Agriculture, Science & Engineering</option><option>Commerce, Law & Management</option><option>Humanities, Social Sciences & Education</option><option>Health Sciences</option></select></div>
              <button className="btn-primary btn-save" onClick={updateProfile}>Save Profile</button>
            </div>
          </div>
        </div>
      )}

      {showBlockConfirm && (
        <div className="modal-overlay" onClick={() => setShowBlockConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Block User?</h3>
            <p>You won't receive messages from this user anymore.</p>
            <div className="confirm-actions">
              <button className="btn-cancel" onClick={() => setShowBlockConfirm(false)}>Cancel</button>
              <button className="btn-confirm-block" onClick={confirmBlockUser}>Block User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;