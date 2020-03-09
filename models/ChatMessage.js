const mongoose = require("mongoose");

const ChatMessageSchema = new mongoose.Schema({
  dateCreated: {
    type: Date,
    default: Date.now()
  },
  content: {
    type: String
  },
  from: {
    type: String
  }
});

module.exports = ChatMessage = mongoose.model(
  "chatmessages",
  ChatMessageSchema
);
