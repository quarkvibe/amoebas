import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Amoeba v2.0 API',
            version: '2.0.0',
            description: 'API documentation for the Amoeba v2.0 AI Content Generation Platform',
            license: {
                name: 'Amoeba Community License v1.0',
                url: 'https://github.com/quarkvibe/ameoba_v2.0/blob/main/LICENSE',
            },
            contact: {
                name: 'QuarkVibe Inc.',
                url: 'https://github.com/quarkvibe/ameoba_v2.0',
            },
        },
        servers: [
            {
                url: '/api',
                description: 'Main API Server',
            },
        ],
        components: {
            securitySchemes: {
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'connect.sid',
                },
            },
        },
        security: [
            {
                cookieAuth: [],
            },
        ],
    },
    apis: ['./server/routes/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
