const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Optimize image
    const optimizedFileName = `optimized-${req.file.filename}`;
    const optimizedPath = path.join(process.env.MEDIA_STORAGE_PATH, optimizedFileName);

    await sharp(req.file.path)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(optimizedPath);

    // Delete original file
    await fs.unlink(req.file.path);

    res.json({
      message: 'File uploaded successfully',
      fileName: optimizedFileName
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file' });
  }
};

exports.getMedia = async (req, res) => {
  try {
    const filePath = path.join(process.env.MEDIA_STORAGE_PATH, req.params.mediaId);
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving media' });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const filePath = path.join(process.env.MEDIA_STORAGE_PATH, req.params.mediaId);
    await fs.unlink(filePath);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting media' });
  }
};