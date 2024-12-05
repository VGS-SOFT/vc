const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const mediaController = require('../controllers/media.controller');
const upload = require('../middleware/upload.middleware');

router.use(authenticate);

router.post('/upload', upload.single('image'), mediaController.uploadMedia);
router.get('/:mediaId', mediaController.getMedia);
router.delete('/:mediaId', mediaController.deleteMedia);

module.exports = router;