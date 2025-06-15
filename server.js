const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Handle socket messages
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // ✅ Broadcast to all (including sender)
  });
});

// ✅ Image upload
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ fileUrl: `/uploads/${req.file.filename}` });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// ✅ Handle errors