import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import aipriceAnalyzer from "./aipriceAnalyzer.js";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
//test
// Middlewares
app.use(cors());
app.use(express.json());

// Multer for image uploads
const upload = multer({ dest: "uploads/" });

// Root route
app.get("/", (req, res) => {
  res.send("Clutter2Cash backend is running! 💀💀💀💀💀🥀🥀🥀🥀🥀");
});

// POST route for AI price analysis
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const { description } = req.body;
    const imagePath = req.file.path;

    const analyzer = new aipriceAnalyzer();
    const result = await analyzer.analyzeItem(imagePath, description);

    // Delete the uploaded file after processing
    fs.unlinkSync(imagePath);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
