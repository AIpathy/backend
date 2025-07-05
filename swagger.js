const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Aipathy Backend API',
            version: '1.0.0',
            description: 'Aipathy projesinin backend API dökümantasyonu',
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
        components: { // 🔥 Token desteği burada
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [ // 🔥 Global token kontrolü burada
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Route açıklamaları bu klasörde aranacak
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
