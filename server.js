const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express'); // ✅ Eklendi
const swaggerSpec = require('./swagger'); // ✅ Eklendi

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Swagger Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // ✅ Eklendi

// Anasayfa
app.get('/', (req, res) => {
    res.send('API Çalışıyor');
});

// Auth routes 
app.use('/api/auth', require('./routes/authRoutes'));

// Doctor routes
app.use('/api', require('./routes/doctorRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));
