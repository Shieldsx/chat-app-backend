const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // ✅ Allow Vercel frontend
    methods: ['GET', 'POST'],
  }
});

app.use(cors());
app.use(express.static('public'));

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: 'dzvgj0cat',
  api_key: '534716349148656',
  api_secret: 'Jb7ag_4ebLd57yEmqEja0zqgeS4'
});

// ✅ Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chat_app_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 800, crop: 'limit' }]
  }
});

const upload = multer({ storage });

// ✅ Chat image upload
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ fileUrl: req.file.path }); // Cloudinary gives you a hosted URL
});

// ✅ Avatar upload
app.post('/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ fileUrl: req.file.secure_url }); // ✅ use secure_url
});

// ✅ Socket.IO logic
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

// ✅ Launch server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
// ✅ Serve static files