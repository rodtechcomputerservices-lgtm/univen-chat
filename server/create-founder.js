const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User } = require('./models');

console.log("🚀 Creating founder account...");

mongoose.connect('mongodb+srv://rodtechcomputerservices_db_user:Ko8CWgYyxOG2OHpu@cluster0.asdxcle.mongodb.net/univen-chat?retryWrites=true&w=majority&appName=Cluster0')
  .then(async () => {
    console.log("✅ MongoDB Connected");
    
    // Check if user exists
    const existingUser1 = await User.findOne({ username: 'rodtech' });
    const existingUser2 = await User.findOne({ username: 'rodtech2002' });
    
    if (existingUser1 || existingUser2) {
      console.log("⚠️  Founder account already exists!");
      if (existingUser1) console.log("   Username: rodtech");
      if (existingUser2) console.log("   Username: rodtech2002");
      process.exit(0);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('2002', 10);
    
    // Create founder account
    const founder = new User({
      username: 'rodtech',
      password: hashedPassword,
      displayName: 'RodTech - Founder',
      bio: 'Founder of UNIVEN CHAT 🎓',
      levelOfStudy: 'Fourth Year',
      degreeName: 'BSc Computer Science',
      faculty: 'Agriculture, Science & Engineering',
      race: 'African',
      ethnicGroup: 'Venda'
    });
    
    await founder.save();
    
    console.log("✅ Founder account created successfully!");
    console.log("👑 Username: rodtech");
    console.log("🔑 Password: 2002");
    console.log("🎉 You can now login!");
    
    process.exit(0);
  })
  .catch(err => {
    console.log("❌ Error:", err.message);
    process.exit(1);
  });