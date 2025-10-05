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
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/clutter2cash")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Middleware ---

app.use(cors({
    credentials: true,
    origin: true
}));

app.use(express.json());

const upload = multer({ dest: "uploads/" });

// --- Guest Account Management ---
const GUEST_SESSION_DURATION = '7d';

function createGuestToken() {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return jwt.sign(
        { id: guestId, isGuest: true },
        process.env.JWT_SECRET,
        { expiresIn: GUEST_SESSION_DURATION }
    );
}

// --- Authentication Middleware (Always authenticates, creates guest if needed) ---
async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization;

        if (!token) {
            // No token - create guest session
            const guestToken = createGuestToken();
            req.user = {
                isGuest: true,
                id: jwt.decode(guestToken).id,
                name: "Guest User",
                email: null,
                badges: []
            };
            req.guestToken = guestToken; // Send back to client
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's a guest token
        if (decoded.isGuest) {
            req.user = {
                isGuest: true,
                id: decoded.id,
                name: "Guest User",
                email: null,
                badges: []
            };
            return next();
        }

        // It's a registered user token
        const user = await User.findById(decoded.id);
        if (!user) {
            // Invalid user token - convert to guest
            const guestToken = createGuestToken();
            req.user = {
                isGuest: true,
                id: jwt.decode(guestToken).id,
                name: "Guest User",
                email: null,
                badges: []
            };
            req.guestToken = guestToken;
            return next();
        }

        req.user = {
            isGuest: false,
            ...user.toObject()
        };
        next();
    } catch (error) {
        // Invalid token - create guest session
        const guestToken = createGuestToken();
        req.user = {
            isGuest: true,
            id: jwt.decode(guestToken).id,
            name: "Guest User",
            email: null,
            badges: []
        };
        req.guestToken = guestToken;
        next();
    }
}

// --- Middleware that requires registered user (blocks guests) ---
function requireRegisteredUser(req, res, next) {
    if (req.user.isGuest) {
        return res.status(403).json({
            error: "This feature requires an account",
            requiresAuth: true,
            message: "Please sign up or log in to access this feature"
        });
    }
    next();
}

// --- AUTH ROUTES ---

// Get or create guest session
app.post("/guest", (req, res) => {
    const guestToken = createGuestToken();
    const decoded = jwt.decode(guestToken);

    res.json({
        token: guestToken,
        user: {
            id: decoded.id,
            name: "Guest User",
            email: null,
            isGuest: true,
            badges: []
        },
        message: "Guest session created"
    });
});

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
                isGuest: false,
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
                isGuest: false,
                badges: user.badges
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ANALYZE ROUTE (Works for both guests and registered users) ---
app.post("/analyze", authenticate, upload.single("image"), async (req, res) => {
    let imagePath = null;

    try {
        const { description } = req.body;

        console.log("🔥 Received request:");
        console.log("- User:", req.user.isGuest ? "Guest" : req.user.email);
        console.log("- File:", req.file ? "Yes" : "No");
        console.log("- Description:", description || "None");

        if (!req.file && !description) {
            return res.status(400).json({ error: "Please provide either an image or description" });
        }

        imagePath = req.file?.path;

        console.log("🤖 Analyzing item...");
        const analyzer = new aipriceAnalyzer();
        const result = await analyzer.analyzeItem(imagePath, description);
        console.log("✅ Analysis complete:", result);

        // Validate and normalize category
        const validCategories = [
            'Electronics', 'Furniture', 'Clothing', 'Books', 'Toys', 'Home Decor', 'Sports', 'Other'
        ];

        let category = result.itemInfo?.category || 'Other';
        if (!validCategories.includes(category)) {
            // Try to map common variations
            const categoryMap = {
                'technology': 'Electronics',
                'tech': 'Electronics',
                'computer': 'Electronics',
                'phone': 'Electronics',
                'clothes': 'Clothing',
                'apparel': 'Clothing',
                'fashion': 'Clothing',
                'book': 'Books',
                'toy': 'Toys',
                'game': 'Toys',
                'sport': 'Sports',
                'fitness': 'Sports',
                'home': 'Home Decor',
                'decor': 'Home Decor',
                'furniture': 'Furniture'
            };

            const lowerCategory = category.toLowerCase();
            category = categoryMap[lowerCategory] || 'Other';
        }

        // Validate and normalize condition
        const validConditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
        let condition = result.itemInfo?.condition || 'Good';

        if (!validConditions.includes(condition)) {
            // Try to map common variations
            const conditionMap = {
                'brand new': 'New',
                'mint': 'Like New',
                'excellent': 'Like New',
                'very good': 'Good',
                'used': 'Good',
                'acceptable': 'Fair',
                'worn': 'Fair',
                'damaged': 'Poor',
                'broken': 'Poor'
            };

            const lowerCondition = condition.toLowerCase();
            condition = conditionMap[lowerCondition] || 'Good';
        }

        // Validate and normalize confidence
        const validConfidence = ['high', 'medium', 'low'];
        let confidence = (result.prediction?.confidence || 'medium').toLowerCase();
        if (!validConfidence.includes(confidence)) {
            confidence = 'medium';
        }

        // Validate and normalize market trend
        const validTrends = ['rising', 'stable', 'falling'];
        let marketTrend = (result.marketTrend || 'stable').toLowerCase();
        if (!validTrends.includes(marketTrend)) {
            // Map common variations
            if (marketTrend === 'declining') marketTrend = 'falling';
            else marketTrend = 'stable';
        }

        const scannedItem = new ScannedItem({
            userId: req.user.id.toString(), // Ensure it's a string
            isGuestItem: req.user.isGuest,
            itemName: result.itemInfo?.itemName || "Unknown Item",
            description: result.itemInfo?.description || description,
            category: category,
            estimatedValue: parseFloat(result.currentSellingPrice?.average) || 0,
            condition: condition,
            ecoImpact: {
                co2SavedKg: parseFloat(result.environmentalImpact?.co2SavedKg) || 0,
                description: `${result.environmentalImpact?.co2SavedKg || 0} kg CO₂ saved`
            },
            confidence: confidence,
            priceAnalysis: {
                currentAverage: parseFloat(result.currentSellingPrice?.average) || 0,
                priceRange: {
                    min: parseFloat(result.currentSellingPrice?.min) || 0,
                    max: parseFloat(result.currentSellingPrice?.max) || 0
                },
                marketTrend: marketTrend
            },
            fullAnalysis: result
        });

        await scannedItem.save();

        console.log("📤 Sending response (saved to DB)");
        const response = {
            id: scannedItem._id,
            item: scannedItem.itemName,
            value: scannedItem.estimatedValue,
            ecoImpact: scannedItem.ecoImpact.description,
            confidence: scannedItem.confidence,
            category: scannedItem.category,
            timestamp: scannedItem.createdAt,
            saved: true,
            isGuest: req.user.isGuest
        };

        // If guest token was created, send it back
        if (req.guestToken) {
            response.guestToken = req.guestToken;
            response.message = "Guest session created. Sign up to keep your items permanently!";
        } else if (req.user.isGuest) {
            response.message = "Saved to guest session. Sign up to keep your items permanently!";
        }

        res.json(response);
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

// --- GET SCANNED ITEMS ROUTES (Work for both guests and registered users) ---

// Get all scanned items for user (including guests)
app.get("/scanned-items", authenticate, async (req, res) => {
    try {
        const items = await ScannedItem.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-fullAnalysis'); // Exclude heavy data

        res.json({
            items,
            isGuest: req.user.isGuest,
            message: req.user.isGuest ? "Sign up to keep your items permanently" : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single scanned item by ID
app.get("/scanned-items/:id", authenticate, async (req, res) => {
    try {
        const item = await ScannedItem.findOne({
            _id: req.params.id,
            userId: req.user.id
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
            userId: req.user.id,
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
            userId: req.user.id
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
            userId: req.user.id
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
            userId: req.user.id
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
            userId: req.user.id
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

// --- USER STATS ROUTES (Work for guests, but some features require registration) ---

// Get user profile with stats
app.get("/profile", authenticate, async (req, res) => {
    try {
        // Guests can see their stats but should be prompted to sign up
        const stats = await ScannedItem.getUserTotalValue(req.user.id);
        const categoryBreakdown = await ScannedItem.getUserItemsByCategory(req.user.id);

        res.json({
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                isGuest: req.user.isGuest,
                badges: req.user.badges
            },
            stats: {
                totalItems: stats.itemCount,
                totalValue: stats.totalValue,
                totalCO2Saved: stats.totalCO2Saved,
                categoryBreakdown
            },
            message: req.user.isGuest ? "Sign up to keep your data permanently and unlock all features!" : null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get dashboard stats
app.get("/dashboard", authenticate, async (req, res) => {
    try {
        const stats = await ScannedItem.getUserTotalValue(req.user.id);
        const recentScans = await ScannedItem.getRecentScans(req.user.id, 5);
        const categoryBreakdown = await ScannedItem.getUserItemsByCategory(req.user.id);

        res.json({
            totalValue: stats.totalValue,
            totalItems: stats.itemCount,
            totalCO2Saved: stats.totalCO2Saved,
            recentScans,
            categoryBreakdown,
            isGuest: req.user.isGuest
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Convert guest account to registered account
app.post("/convert-guest", authenticate, async (req, res) => {
    try {
        if (!req.user.isGuest) {
            return res.status(400).json({ error: "Already a registered user" });
        }

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();

        // Transfer all guest items to the new user
        await ScannedItem.updateMany(
            { userId: req.user.id, isGuestItem: true },
            { userId: user._id.toString(), isGuestItem: false }
        );

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Account created and guest data transferred successfully!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isGuest: false,
                badges: user.badges
            },
            itemsTransferred: await ScannedItem.countDocuments({ userId: user._id })
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ROOT ---
app.get("/", (req, res) => {
    res.send("Clutter2Cash backend is running! 👀👀👀👀👀🥀🥀🥀🥀🥀");
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`✔️ Server running on http://localhost:${PORT}`);
});
