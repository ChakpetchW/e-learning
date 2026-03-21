const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const router = express.Router();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Use Memory Storage for Serverless (Vercel)
const storage = multer.memoryStorage();

// File filter (Same as before)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB max
});

// POST /api/upload - Upload to Supabase Storage
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please select a file.' });
        }

        const isImage = req.file.mimetype.startsWith('image/');
        const bucketName = 'uploads'; // ** Ensure you create this bucket in Supabase **
        const subDir = isImage ? 'images' : 'documents';
        
        // Generate unique filename
        const ext = path.extname(req.file.originalname);
        const baseName = path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${subDir}/${Date.now()}_${baseName}${ext}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (error) throw error;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        res.json({
            message: 'Upload successful!',
            fileUrl: publicUrl,
            fileName: fileName
        });

    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

module.exports = router;
