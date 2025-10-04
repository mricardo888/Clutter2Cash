import User from "./modules/User.js";
import jwt from "jsonwebtoken";

// Register
// Register
app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: "Email already registered" });

        const user = new User({ name, email, password });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        // Send token back to frontend
        res.json({
            message: "User registered successfully",
            token,
            user: { name: user.name, email: user.email, badges: user.badges }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "Invalid credentials" });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { name: user.name, email: user.email, badges: user.badges } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
