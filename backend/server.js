import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import aipriceAnalyzer from "./aipriceAnalyzer.js";
import User from "./modules/User.js";
import ScannedItem from "./modules/scanneditems.js";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/clutter2cash")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

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

// --- JWT Authentication Middleware ---
async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(403).json({ error: "Invalid token" });

        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid token" });
    }
}

// --- AUTH ROUTES ---

// Register route
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                badges: user.badges
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                badges: user.badges
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ANALYZE ROUTE ---
app.post("/analyze", authenticate, upload.single("image"), async (req, res) => {
    let imagePath = null;

    try {
        const { description } = req.body;

        console.log("📥 Received request:");
        console.log("- User:", req.user.email);
        console.log("- File:", req.file ? "Yes" : "No");
        console.log("- Description:", description || "None");

        if (!req.file && !description) {
            return res.status(400).json({ error: "Please provide either an image or description" });
        }

        imagePath = req.file?.path;

        console.log("ðŸ” Analyzing item...");
        const analyzer = new aipriceAnalyzer();
        const result = await analyzer.analyzeItem(imagePath, description);
        console.log("✅ Analysis complete:", result);

        // Create new ScannedItem document
        const scannedItem = new ScannedItem({
            userId: req.user._id,
            itemName: result.itemInfo?.itemName || "Unknown Item",
            description: result.itemInfo?.description || description,
            category: result.itemInfo?.category || 'Other',
            estimatedValue: parseFloat(result.currentSellingPrice?.average) || 0,
            condition: result.itemInfo?.condition || 'Good',
            ecoImpact: {
                co2SavedKg: parseFloat(result.environmentalImpact?.co2SavedKg) || 0,
                description: `${result.environmentalImpact?.co2SavedKg || 0} kg CO₂ saved`
            },
            confidence: result.prediction?.confidence || "medium",
            priceAnalysis: {
                currentAverage: parseFloat(result.currentSellingPrice?.average) || 0,
                priceRange: {
                    min: parseFloat(result.currentSellingPrice?.min) || 0,
                    max: parseFloat(result.currentSellingPrice?.max) || 0
                },
                marketTrend: result.marketTrend || 'stable'
            },
            fullAnalysis: result
        });

        await scannedItem.save();

        console.log("📤 Sending response");
        res.json({
            id: scannedItem._id,
            item: scannedItem.itemName,
            value: scannedItem.estimatedValue,
            ecoImpact: scannedItem.ecoImpact.description,
            confidence: scannedItem.confidence,
            category: scannedItem.category,
            timestamp: scannedItem.createdAt
        });
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

// --- GET SCANNED ITEMS ROUTES ---

// Get all scanned items for user
app.get("/scanned-items", authenticate, async (req, res) => {
    try {
        const items = await ScannedItem.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-fullAnalysis'); // Exclude heavy data

        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single scanned item by ID
app.get("/scanned-items/:id", authenticate, async (req, res) => {
    try {
        const item = await ScannedItem.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get items by category
app.get("/scanned-items/category/:category", authenticate, async (req, res) => {
    try {
        const items = await ScannedItem.find({
            userId: req.user._id,
            category: req.params.category
        }).sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update scanned item
app.put("/scanned-items/:id", authenticate, async (req, res) => {
    try {
        const item = await ScannedItem.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        // Update allowed fields
        const allowedUpdates = ['itemName', 'description', 'category', 'condition', 'userNotes', 'status'];
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        });

        await item.save();
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete scanned item
app.delete("/scanned-items/:id", authenticate, async (req, res) => {
    try {
        const item = await ScannedItem.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark item as listed
app.post("/scanned-items/:id/list", authenticate, async (req, res) => {
    try {
        const { price, platform, url } = req.body;
        const item = await ScannedItem.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        await item.markAsListed(price, platform, url);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark item as sold
app.post("/scanned-items/:id/sold", authenticate, async (req, res) => {
    try {
        const { soldPrice } = req.body;
        const item = await ScannedItem.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }

        await item.markAsSold(soldPrice);
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- USER STATS ROUTES ---

// Get user profile with stats
app.get("/profile", authenticate, async (req, res) => {
    try {
        const stats = await ScannedItem.getUserTotalValue(req.user._id);
        const categoryBreakdown = await ScannedItem.getUserItemsByCategory(req.user._id);

        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                badges: req.user.badges
            },
            stats: {
                totalItems: stats.itemCount,
                totalValue: stats.totalValue,
                totalCO2Saved: stats.totalCO2Saved,
                categoryBreakdown
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard stats
app.get("/dashboard", authenticate, async (req, res) => {
    try {
        const stats = await ScannedItem.getUserTotalValue(req.user._id);
        const recentScans = await ScannedItem.getRecentScans(req.user._id, 5);
        const categoryBreakdown = await ScannedItem.getUserItemsByCategory(req.user._id);

        res.json({
            totalValue: stats.totalValue,
            totalItems: stats.itemCount,
            totalCO2Saved: stats.totalCO2Saved,
            recentScans,
            categoryBreakdown
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ROOT ---
app.get("/", (req, res) => {
    res.send("Clutter2Cash backend is running! 👀👀👀👀👀🥀🥀🥀🥀🥀");
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`âœ… Server running on http://localhost:${PORT}`);
});