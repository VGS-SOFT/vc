const User = require('../models/user.model');

exports.getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends.user', 'name email')
      .select('friends');
    
    const acceptedFriends = user.friends.filter(f => f.status === 'accepted');
    res.json(acceptedFriends);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching friends list' });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUser.friends.some(f => f.user.toString() === req.userId)) {
      return res.status(400).json({ message: 'Friend request already exists' });
    }

    targetUser.friends.push({ user: req.userId, status: 'pending' });
    await targetUser.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending friend request' });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const request = user.friends.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = 'accepted';
    await user.save();

    // Add the user to the friend's friends list as well
    await User.findByIdAndUpdate(request.user, {
      $push: { friends: { user: req.userId, status: 'accepted' } }
    });

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Error accepting friend request' });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const request = user.friends.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    request.status = 'rejected';
    await user.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting friend request' });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('friends.user', 'name email')
      .select('friends');
    
    const pendingRequests = user.friends.filter(f => f.status === 'pending');
    res.json(pendingRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending requests' });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    
    await User.findByIdAndUpdate(req.userId, {
      $pull: { friends: { user: friendId } }
    });

    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: { user: req.userId } }
    });

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing friend' });
  }
};