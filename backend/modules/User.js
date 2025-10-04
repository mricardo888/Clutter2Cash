import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "./modules/User.js";
import ScannedItem from "./modules/scanneditems.js";
import geminiService from "./geminiService.js";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/clutter2cash")
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

// --- JWT Authentication Middleware (Fixed) ---
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: "No token provided" });
        }

        // Handle both "Bearer token" and "token" formats
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(403).json({ error: "Invalid token - user not found" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        res.status(403).json({
            error: "Invalid token",
            details: error.message
        });
    }
}

// --- Optional Authentication Middleware (Fixed) ---
async function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            req.user = null;
            return next();
        }

        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        req.user = user || null;
        next();
    } catch (error) {
        req.user = null;
        next();
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

// --- ANALYZE ROUTE (Works with or without auth) ---
app.post("/analyze", optionalAuth, upload.single("image"), async (req, res) => {
    let imagePath = null;

    try {
        const { description } = req.body;

        console.log("🔥 Received analyze request:");
        console.log("- User:", req.user ? req.user.email : "Guest");
        console.log("- File:", req.file ? "Yes" : "No");
        console.log("- Description:", description || "None");

        if (!req.file && !description) {
            return res.status(400).json({ error: "Please provide either an image or description" });
        }

        imagePath = req.file?.path;

        // Use Gemini to analyze the item
        console.log("🤖 Analyzing item with Gemini...");
        const result = await analyzeWithGemini(imagePath, description);
        console.log("✅ Analysis complete:", result);

        // Only save to database if user is logged in
        if (req.user) {
            const scannedItem = new ScannedItem({
                userId: req.user._id,
                itemName: result.itemName || "Unknown Item",
                description: result.description || description,
                category: result.category || 'Other',
                estimatedValue: parseFloat(result.estimatedValue) || 0,
                condition: result.condition || 'Good',
                ecoImpact: {
                    co2SavedKg: parseFloat(result.co2SavedKg) || 0,
                    description: `${result.co2SavedKg || 0} kg CO₂ saved`
                },
                confidence: result.confidence || "medium",
                priceAnalysis: {
                    currentAverage: parseFloat(result.estimatedValue) || 0,
                    priceRange: {
                        min: parseFloat(result.priceMin) || 0,
                        max: parseFloat(result.priceMax) || 0
                    },
                    marketTrend: result.marketTrend || 'stable'
                },
                fullAnalysis: result
            });

            await scannedItem.save();

            console.log("💾 Saved to database with ID:", scannedItem._id);
            res.json({
                id: scannedItem._id,
                item: scannedItem.itemName,
                value: scannedItem.estimatedValue,
                ecoImpact: scannedItem.ecoImpact.description,
                confidence: scannedItem.confidence,
                category: scannedItem.category,
                timestamp: scannedItem.createdAt,
                saved: true
            });
        } else {
            // Guest mode - return analysis without saving
            console.log("👤 Guest mode - not saving to database");
            res.json({
                id: null,
                item: result.itemName || "Unknown Item",
                value: parseFloat(result.estimatedValue) || 0,
                ecoImpact: `${result.co2SavedKg || 0} kg CO₂ saved`,
                confidence: result.confidence || "medium",
                category: result.category || 'Other',
                timestamp: new Date(),
                saved: false,
                guestMode: true,
                message: "Sign in to save your scanned items"
            });
        }
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

// --- GEMINI ANALYSIS FUNCTION ---
async function analyzeWithGemini(imagePath, description) {
    const prompt = `Analyze this item and provide the following information in JSON format:
{
  "itemName": "name of the item",
  "description": "brief description",
  "category": "one of: Electronics, Furniture, Clothing, Books, Toys, Home Decor, Sports, Other",
  "estimatedValue": "estimated resale value in USD (number only)",
  "priceMin": "minimum price estimate",
  "priceMax": "maximum price estimate",
  "condition": "one of: New, Like New, Good, Fair, Poor",
  "co2SavedKg": "estimated CO2 saved by reusing/recycling (number only)",
  "confidence": "one of: low, medium, high",
  "marketTrend": "one of: rising, stable, falling"
}

Item description: ${description || "Analyze the image"}

Provide ONLY valid JSON, no other text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.4,
                maxOutputTokens: 500,
            }
        }),
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    // Clean up the response and parse JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Could not parse Gemini response");
}

// --- GET SUGGESTIONS ENDPOINT ---
app.post("/suggestions", optionalAuth, async (req, res) => {
    try {
        const { itemName, action, category, estimatedValue } = req.body;

        if (!itemName || !action) {
            return res.status(400).json({
                error: "Item name and action are required"
            });
        }

        if (!['sell', 'donate', 'recycle'].includes(action)) {
            return res.status(400).json({
                error: "Action must be 'sell', 'donate', or 'recycle'"
            });
        }

        console.log(`🔍 Getting ${action} suggestions for: ${itemName}`);

        const suggestions = await geminiService.getSuggestions(
            itemName,
            action,
            category || 'Other',
            estimatedValue || 0
        );

        console.log(`✅ Got suggestions:`, suggestions);

        res.json({
            action,
            itemName,
            hasOptions: suggestions.hasOptions,
            message: suggestions.message,
            suggestions: suggestions.suggestions
        });

    } catch (error) {
        console.error("❌ Suggestions error:", error);
        res.status(500).json({
            error: "Failed to get suggestions",
            details: error.message
        });
    }
});

// --- GET SCANNED ITEMS ROUTES (Require authentication) ---

// Get all scanned items for user
app.get("/scanned-items", authenticate, async (req, res) => {
    try {
        const items = await ScannedItem.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .select('-fullAnalysis');

        console.log(`📋 Fetched ${items.length} items for user ${req.user.email}`);
        res.json(items);
    } catch (error) {
        console.error("Error fetching items:", error);
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
        console.log(`✏️ Updated item ${item._id} with status: ${item.status}`);
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

// --- USER STATS ROUTES (Require authentication) ---

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
        console.error("Error in /profile:", error);
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
    res.send("Clutter2Cash backend is running! 🔥🔥🔥");
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'NOT configured'}`);
});