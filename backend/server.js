import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import aipriceAnalyzer from "./aipriceAnalyzer.js";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:8081',
            'http://localhost:8082',
            'http://localhost:19006',
            'http://localhost:19000'
        ];

        // Check if origin is in allowed list or is an Expo tunnel
        if (allowedOrigins.indexOf(origin) !== -1 || origin.match(/^https:\/\/.*\.exp\.direct$/)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Multer for image uploads
const upload = multer({ dest: "uploads/" });

// Root route
app.get("/", (req, res) => {
    res.send("Clutter2Cash backend is running! 💀💀💀💀💀🥀🥀🥀🥀🥀");
});

// POST route for AI price analysis
app.post("/analyze", upload.single("image"), async (req, res) => {
    let imagePath = null;

    try {
        const { description } = req.body;

        console.log("🔥 Received request:");
        console.log("- File:", req.file ? "Yes" : "No");
        console.log("- Description:", description || "None");

        // Check if we have either an image or description
        if (!req.file && !description) {
            return res.status(400).json({
                error: "Please provide either an image or description"
            });
        }

        imagePath = req.file?.path;

        console.log("🔍 Analyzing item...");
        const analyzer = new aipriceAnalyzer();
        const result = await analyzer.analyzeItem(imagePath, description);

        console.log("✅ Analysis complete:", result);

        // Return the full result directly - let frontend handle the structure
        res.json(result);

    } catch (error) {
        console.error("❌ Analysis error:", error);
        console.error("Stack trace:", error.stack);
        res.status(500).json({
            error: error.message,
            details: error.stack
        });
    } finally {
        // Clean up uploaded file if it exists
        if (imagePath && fs.existsSync(imagePath)) {
            try {
                fs.unlinkSync(imagePath);
                console.log("🗑️ Cleaned up file:", imagePath);
            } catch (cleanupError) {
                console.error("Error cleaning up file:", cleanupError);
            }
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});