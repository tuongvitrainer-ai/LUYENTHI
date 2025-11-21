/**
 * Upload Controller - Handle file uploads for questions (images, audio)
 */

/**
 * Upload a single file (image or audio)
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được tải lên'
      });
    }

    // Return the file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Tải file thành công',
      data: {
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải file lên',
      error: error.message
    });
  }
};

/**
 * Upload multiple files (for questions with multiple images)
 */
const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được tải lên'
      });
    }

    // Return all file URLs
    const files = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }));

    res.json({
      success: true,
      message: `Tải ${files.length} file thành công`,
      data: {
        files
      }
    });
  } catch (error) {
    console.error('Upload multiple files error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tải file lên',
      error: error.message
    });
  }
};

module.exports = {
  uploadFile,
  uploadMultipleFiles
};
