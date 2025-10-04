import mongoose from "mongoose";

const scannedItemSchema = new mongoose.Schema({
    // Reference to the user who scanned this item
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Basic item information
    itemName: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    category: {
        type: String,
        enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Toys', 'Home Decor', 'Sports', 'Other'],
        default: 'Other'
    },

    // Value information
    estimatedValue: {
        type: Number,
        required: true,
        min: 0
    },

    condition: {
        type: String,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
        default: 'Good'
    },

    // Environmental impact
    ecoImpact: {
        co2SavedKg: {
            type: Number,
            default: 0
        },
        description: {
            type: String,
            default: function() {
                return `${this.ecoImpact.co2SavedKg} kg CO₂ saved`;
            }
        }
    },

    // Analysis details
    confidence: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },

    // Price analysis
    priceAnalysis: {
        currentAverage: Number,
        priceRange: {
            min: Number,
            max: Number
        },
        marketTrend: {
            type: String,
            enum: ['rising', 'stable', 'falling'],
            default: 'stable'
        }
    },

    // Images
    images: [{
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Full AI analysis result (stored as JSON)
    fullAnalysis: {
        type: mongoose.Schema.Types.Mixed
    },

    // Status tracking
    status: {
        type: String,
        enum: ['scanned', 'listed', 'sold', 'donated', 'kept'],
        default: 'scanned'
    },

    // Marketplace info (if listed)
    marketplace: {
        isListed: {
            type: Boolean,
            default: false
        },
        listingPrice: Number,
        platform: String, // e.g., 'eBay', 'Facebook Marketplace'
        listingUrl: String,
        listedAt: Date,
        soldAt: Date,
        soldPrice: Number
    },

    // Tags for searchability
    tags: [String],

    // Notes from user
    userNotes: String

}, {
    timestamps: true  // Adds createdAt and updatedAt
});

// Indexes for better query performance
scannedItemSchema.index({ userId: 1, createdAt: -1 });
scannedItemSchema.index({ status: 1 });
scannedItemSchema.index({ category: 1 });
scannedItemSchema.index({ 'marketplace.isListed': 1 });

// Virtual for total eco impact display
scannedItemSchema.virtual('ecoImpactDisplay').get(function() {
    return `${this.ecoImpact.co2SavedKg} kg CO₂ saved`;
});

// Method to mark item as listed
scannedItemSchema.methods.markAsListed = function(price, platform, url) {
    this.status = 'listed';
    this.marketplace.isListed = true;
    this.marketplace.listingPrice = price;
    this.marketplace.platform = platform;
    this.marketplace.listingUrl = url;
    this.marketplace.listedAt = new Date();
    return this.save();
};

// Method to mark item as sold
scannedItemSchema.methods.markAsSold = function(soldPrice) {
    this.status = 'sold';
    this.marketplace.soldAt = new Date();
    this.marketplace.soldPrice = soldPrice || this.marketplace.listingPrice;
    return this.save();
};

// Static method to get user's total value
scannedItemSchema.statics.getUserTotalValue = async function(userId) {
    const result = await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $group: {
                _id: null,
                totalValue: { $sum: '$estimatedValue' },
                totalCO2Saved: { $sum: '$ecoImpact.co2SavedKg' },
                itemCount: { $sum: 1 }
            }}
    ]);
    return result[0] || { totalValue: 0, totalCO2Saved: 0, itemCount: 0 };
};

// Static method to get user's items by category
scannedItemSchema.statics.getUserItemsByCategory = async function(userId) {
    return await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalValue: { $sum: '$estimatedValue' }
            }},
        { $sort: { count: -1 } }
    ]);
};

// Static method to get recent scans
scannedItemSchema.statics.getRecentScans = async function(userId, limit = 10) {
    return await this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-fullAnalysis'); // Exclude heavy analysis data
};

// Pre-save middleware to auto-generate tags
scannedItemSchema.pre('save', function(next) {
    if (this.isModified('itemName') || this.isModified('category')) {
        const nameTags = this.itemName.toLowerCase().split(' ');
        const categoryTag = this.category.toLowerCase();
        this.tags = [...new Set([...nameTags, categoryTag])];
    }
    next();
});

export default mongoose.model("ScannedItem", scannedItemSchema);