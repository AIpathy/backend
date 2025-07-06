const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express'); 
const swaggerSpec = require('./swagger');        
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Basit test için anasayfa
app.get('/', (req, res) => {
    res.send('API Çalışıyor Lordum!');
});

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));

// Doctor routes
app.use('/api', require('./routes/doctorRoutes'));

// User routes
app.use('/api', require('./routes/userRoutes'));

// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));
