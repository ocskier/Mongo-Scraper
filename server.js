import {} from 'dotenv/config'

import express from "express";
import logger from "morgan";
import mongoose from "mongoose";

const PORT = 8080;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/Mongo-Scraper";
console.log(MONGODB_URI);

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Set Handlebars.
import exphbs from "express-handlebars";

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

import routes from "./routes/routes.js";

app.use(routes);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
