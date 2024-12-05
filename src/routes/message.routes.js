const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const messageController = require('../controllers/message.controller');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation.middleware');

router.use(authenticate);

const messageValidation = [
  body('content').trim().notEmpty(),
  body('recipientId').notEmpty().isMongoId()
];

router.post('/send', messageValidation, validate, messageController.sendMessage);
router.get('/conversation/:userId', messageController.getConversation);
router.get('/recent', messageController.getRecentMessages);
router.delete('/:messageId', messageController.deleteMessage);

module.exports = router;