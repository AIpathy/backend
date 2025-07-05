const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basit test için anasayfa
app.get('/', (req, res) => {
    res.send('API Çalışıyor');
});

// Auth routes 
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));
