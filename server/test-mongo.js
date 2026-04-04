const mongoose = require('mongoose');

console.log("🔄 Testing MongoDB connection...");

mongoose.connect('mongodb+srv://rodtechcomputerservices_db_user:Ko8CWgYyxOG2OHpu@cluster0.asdxcle.mongodb.net/univen-chat?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => {
    console.log("✅ MongoDB Connected Successfully!");
    process.exit(0);
  })
  .catch(err => {
    console.log("❌ MongoDB Connection Failed!");
    console.log("Error:", err.message);
    process.exit(1);
  });