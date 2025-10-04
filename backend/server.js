import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import aipriceAnalyzer from "./aipriceAnalyzer.js";
import fs from "fs";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- Simple mock database stored in JSON file ---
const DB_PATH = "./database.json";
if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
}

function readDB() {
    return JSON.parse(fs.readFileSync(DB_PATH));
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Middleware ---
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const allowedOrigins = [
            'http://localhost:8081',
            'http://localhost:8082',
            'http://localhost:19006',
            'http://localhost:19000'
        ];
        if (allowedOrigins.indexOf(origin) !== -1 || origin.match(/^https:\/\/.*\.exp\.direct$/)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// --- AUTH ROUTES ---

// Signup route
app.post("/signup", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "Username and password required" });

    const db = readDB();
    if (db.users.find(u => u.username === username)) {
        return res.status(400).json({ error: "Username already exists" });
    }

    const token = crypto.randomBytes(16).toString("hex");
    db.users.push({ username, password, token, history: [] });
    writeDB(db);

    res.json({ message: "Signup successful", token });
});

// Login route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const db = readDB();

    const user = db.users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    // Refresh token
    user.token = crypto.randomBytes(16).toString("hex");
    writeDB(db);

    res.json({ message: "Login successful", token: user.token });
});

// Middleware to authenticate routes
function authenticate(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ error: "No token provided" });

    const db = readDB();
    const user = db.users.find(u => u.token === token);
    if (!user) return res.status(403).json({ error: "Invalid token" });

    req.user = user;
    next();
}

// --- ANALYZE ROUTE ---
app.post("/analyze", authenticate, upload.single("image"), async (req, res) => {
    let imagePath = null;

    try {
        const { description } = req.body;

        console.log("📥 Received request:");
        console.log("- User:", req.user.username);
        console.log("- File:", req.file ? "Yes" : "No");
        console.log("- Description:", description || "None");

        if (!req.file && !description) {
            return res.status(400).json({ error: "Please provide either an image or description" });
        }

        imagePath = req.file?.path;

        console.log("🔍 Analyzing item...");
        const analyzer = new aipriceAnalyzer();
        const result = await analyzer.analyzeItem(imagePath, description);
        console.log("✅ Analysis complete:", result);

        const transformedResult = {
            item: result.itemInfo?.itemName || "Unknown Item",
            value: parseFloat(result.currentSellingPrice?.average) || 0,
            ecoImpact: `${result.environmentalImpact?.co2SavedKg || 0} kg CO₂ saved`,
            confidence: result.prediction?.confidence || "medium",
            date: new Date().toISOString(),
            fullAnalysis: result
        };

        // Save analysis history for logged-in user
        const db = readDB();
        const user = db.users.find(u => u.username === req.user.username);
        user.history.push(transformedResult);
        writeDB(db);

        console.log("📤 Sending transformed response:", transformedResult);
        res.json(transformedResult);
    } catch (error) {
        console.error("❌ Analysis error:", error);
        res.status(500).json({ error: error.message, details: error.stack });
    } finally {
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

// --- HISTORY ROUTE ---
app.get("/history", authenticate, (req, res) => {
    const db = readDB();
    const user = db.users.find(u => u.username === req.user.username);
    res.json(user.history || []);
});

// --- ROOT ---
app.get("/", (req, res) => {
    res.send("Clutter2Cash backend is running! 💀💀💀💀💀🥀🥀🥀🥀🥀");
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
