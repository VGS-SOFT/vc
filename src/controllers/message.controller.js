const Message = require('../models/message.model');

exports.sendMessage = async (req, res) => {
  try {
    const { content, recipientId } = req.body;
    
    const message = new Message({
      sender: req.userId,
      recipient: recipientId,
      content: content,
      type: 'text'
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({
      $or: [
        { sender: req.userId, recipient: userId },
        { sender: userId, recipient: req.userId }
      ]
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('sender', 'name')
    .populate('recipient', 'name');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversation' });
  }
};

exports.getRecentMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { recipient: req.userId }]
    })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('sender', 'name')
    .populate('recipient', 'name');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent messages' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.userId
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or unauthorized' });
    }

    await message.remove();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message' });
  }
};