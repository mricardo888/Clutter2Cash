import mongoose from 'mongoose';

const scannedItemSchema = new mongoose.Schema({
    // Changed to String to support both ObjectId and guest IDs
    userId: {
        type: String,
        required: true,
        index: true
    },

    // Track if this is a guest item
    isGuestItem: {
        type: Boolean,
        default: false
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

    estimatedValue: {
        type: Number,
        default: 0
    },

    ecoImpact: {
        co2SavedKg: {
            type: Number,
            default: 0
        },
        description: String
    },

    confidence: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },

    priceAnalysis: {
        currentAverage: Number,
        priceRange: {
            min: Number,
            max: Number
        },
        marketTrend: {
            type: String,
            enum: ['rising', 'stable', 'declining'],
            default: 'stable'
        }
    },

    // Item status tracking
    status: {
        type: String,
        enum: ['scanned', 'listed', 'sold'],
        default: 'scanned'
    },

    // Listing details
    listedPrice: Number,
    listedPlatform: String,
    listedUrl: String,
    listedAt: Date,

    // Sale details
    soldPrice: Number,
    soldAt: Date,

    // User notes
    userNotes: String,

    // Images
    images: [{
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Full AI analysis result (stored for reference)
    fullAnalysis: {
        type: mongoose.Schema.Types.Mixed,
        select: false // Don't include by default to reduce payload
    }
}, {
    timestamps: true
});

// Indexes for better query performance
scannedItemSchema.index({ userId: 1, createdAt: -1 });
scannedItemSchema.index({ userId: 1, category: 1 });
scannedItemSchema.index({ userId: 1, status: 1 });

// Instance methods
scannedItemSchema.methods.markAsListed = function(price, platform, url) {
    this.status = 'listed';
    this.listedPrice = price;
    this.listedPlatform = platform;
    this.listedUrl = url;
    this.listedAt = new Date();
    return this.save();
};

scannedItemSchema.methods.markAsSold = function(soldPrice) {
    this.status = 'sold';
    this.soldPrice = soldPrice;
    this.soldAt = new Date();
    return this.save();
};

// Static methods for aggregations
scannedItemSchema.statics.getUserTotalValue = async function(userId) {
    const result = await this.aggregate([
        { $match: { userId: userId } },
        {
            $group: {
                _id: null,
                totalValue: { $sum: '$estimatedValue' },
                itemCount: { $sum: 1 },
                totalCO2Saved: { $sum: '$ecoImpact.co2SavedKg' }
            }
        }
    ]);

    return result[0] || { totalValue: 0, itemCount: 0, totalCO2Saved: 0 };
};

scannedItemSchema.statics.getUserItemsByCategory = async function(userId) {
    return await this.aggregate([
        { $match: { userId: userId } },
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                totalValue: { $sum: '$estimatedValue' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

scannedItemSchema.statics.getRecentScans = async function(userId, limit = 5) {
    return await this.find({ userId: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-fullAnalysis');
};

// Virtual for age of item
scannedItemSchema.virtual('age').get(function() {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON
scannedItemSchema.set('toJSON', { virtuals: true });
scannedItemSchema.set('toObject', { virtuals: true });

const ScannedItem = mongoose.model('ScannedItem', scannedItemSchema);

export default ScannedItem;
