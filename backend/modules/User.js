const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    auth0Id: { type: String, sparse: true, unique: true },
    password: { type: String }, // Optional for Auth0 users
    itemsScanned: [{
        item: String,
        value: Number,
        ecoImpact: String,
        timestamp: { type: Date, default: Date.now }
    }],
    badges: [String]
}, { timestamps: true });

// Keep the bcrypt methods for backward compatibility
userSchema.pre("save", async function(next) {
    if (!this.isModified("password") || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(password) {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);