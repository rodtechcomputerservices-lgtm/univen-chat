// === PRIVATE MESSAGING SOCKET HANDLERS ===

// Handle sending private messages
socket.on("send_message", async (data) => {
  try {
    const { senderId, receiverId, content, messageType = 'text' } = data;
    
    // Create new message in database
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      content: content,
      messageType: messageType,
      read: false
    });
    
    await newMessage.save();
    
    // Populate sender info for the message
    const populatedMessage = await newMessage.populate('sender', 'username displayName avatar');
    
    // Send to receiver's socket
    io.to(receiverId).emit("receive_message", populatedMessage);
    
    // Send confirmation to sender's socket
    socket.emit("message_sent", populatedMessage);
    
  } catch (error) {
    console.error('Private message error:', error);
  }
});

// Handle marking messages as read
socket.on("mark_read", async ({ messageId }) => {
  try {
    await Message.findByIdAndUpdate(messageId, { 
      read: true, 
      readAt: new Date() 
    });
    
    socket.emit("message_read", { 
      messageId, 
      readAt: new Date() 
    });
  } catch (error) {
    console.error('Mark read error:', error);
  }
});