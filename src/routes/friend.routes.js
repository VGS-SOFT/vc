const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const friendController = require('../controllers/friend.controller');

router.use(authenticate);

router.get('/list', friendController.getFriendsList);
router.post('/request/:userId', friendController.sendFriendRequest);
router.put('/request/:requestId/accept', friendController.acceptFriendRequest);
router.put('/request/:requestId/reject', friendController.rejectFriendRequest);
router.get('/requests', friendController.getPendingRequests);
router.delete('/:friendId', friendController.removeFriend);

module.exports = router;