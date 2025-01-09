const swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "Authentication API",
      version: "1.0.0",
      description: "API documentation for user authentication and management",
    },
    servers: [
      {
        url: "http://localhost:8000/api",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description: "Authentication and user management endpoints",
      },
    ],
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    username: { type: "string", example: "john_doe" },
                    email: { type: "string", example: "john@example.com" },
                    password: { type: "string", example: "securePassword123" },
                  },
                  required: ["username", "email", "password"],
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Bad request" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "john@example.com" },
                    password: { type: "string", example: "securePassword123" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful" },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/send-otp": {
        post: {
          tags: ["Auth"],
          summary: "Send OTP to email",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "john@example.com" },
                  },
                  required: ["email"],
                },
              },
            },
          },
          responses: {
            200: { description: "OTP sent successfully" },
            404: { description: "User not found" },
          },
        },
      },
      "/auth/verify-otp": {
        post: {
          tags: ["Auth"],
          summary: "Verify OTP",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", example: "john@example.com" },
                    otp: { type: "string", example: "123456" },
                  },
                  required: ["email", "otp"],
                },
              },
            },
          },
          responses: {
            200: { description: "OTP verified successfully" },
            400: { description: "Invalid OTP" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout user",
          responses: {
            200: { description: "Logout successful" },
          },
          security: [{ BearerAuth: [] }],
        },
      },
      "/auth/refresh-token": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          responses: {
            200: { description: "New token generated successfully" },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  };
  
  module.exports = swaggerDocument;
  