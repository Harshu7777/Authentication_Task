const express = require("express");
const app = express();
const authRouter = require("./routres/authRouter");  
const connectDB = require("./config/db");
const morgan = require("morgan");
const dotenv = require("dotenv");

const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger");

const path = require("path");  

dotenv.config();

const PORT = process.env.PORT || 3000;

//* Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("views")); 

//* Document File --> Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//* Database Connection
connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//* Routes
app.use("/api/auth", authRouter);

//* 404 Error Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
