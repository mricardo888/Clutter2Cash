import mongoose from 'mongoose';

const scannedItemSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    isGuestItem: {
        type: Boolean,
        default: false
    },
    itemName: {
        type: String,
        required: true
    },
    description: String,
    category: {
        type: String,
        enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Toys', 'Home Decor', 'Sports', 'Other'],
        default: 'Other'
    },
    estimatedValue: {
        type: Number,
        default: 0
    },
    condition: {
        type: String,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
        default: 'Good'
    },
    images: [{
        url: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    ecoImpact: {
        co2SavedKg: Number,
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
            enum: ['rising', 'stable', 'falling'],
            default: 'stable'
        }
    },
    status: {
        type: String,
        enum: ['scanned', 'listed', 'sold', 'donated', 'recycling'],
        default: 'scanned'
    },
    listedDetails: {
        platform: String,
        listedPrice: Number,
        listedAt: Date,
        listingUrl: String
    },
    soldDetails: {
        soldPrice: Number,
        soldAt: Date
    },
    userNotes: String,
    // Store the complete analysis result as a flexible object
    fullAnalysis: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    // This ensures that Mixed types are saved properly
    minimize: false
});

// Add index for faster queries
scannedItemSchema.index({ userId: 1, createdAt: -1 });
scannedItemSchema.index({ userId: 1, category: 1 });

// Method to mark item as listed
scannedItemSchema.methods.markAsListed = function(price, platform, url) {
    this.status = 'listed';
    this.listedDetails = {
        platform,
        listedPrice: price,
        listedAt: new Date(),
        listingUrl: url
    };
    return this.save();
};

// Method to mark item as sold
scannedItemSchema.methods.markAsSold = function(soldPrice) {
    this.status = 'sold';
    this.soldDetails = {
        soldPrice,
        soldAt: new Date()
    };
    return this.save();
};

// Static method to get user's total value
scannedItemSchema.statics.getUserTotalValue = async function(userId) {
    const items = await this.find({ userId });
    const totalValue = items.reduce((sum, item) => sum + (item.estimatedValue || 0), 0);
    const totalCO2Saved = items.reduce((sum, item) => sum + (item.ecoImpact?.co2SavedKg || 0), 0);

    return {
        totalValue,
        itemCount: items.length,
        totalCO2Saved
    };
};

// Static method to get items by category
scannedItemSchema.statics.getUserItemsByCategory = async function(userId) {
    const items = await this.find({ userId });
    const categoryBreakdown = {};

    items.forEach(item => {
        const category = item.category || 'Other';
        if (!categoryBreakdown[category]) {
            categoryBreakdown[category] = {
                count: 0,
                totalValue: 0
            };
        }
        categoryBreakdown[category].count++;
        categoryBreakdown[category].totalValue += item.estimatedValue || 0;
    });

    return categoryBreakdown;
};

// Static method to get recent scans
scannedItemSchema.statics.getRecentScans = async function(userId, limit = 5) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('-fullAnalysis'); // Exclude heavy data for list views
};

const ScannedItem = mongoose.model('ScannedItem', scannedItemSchema);

export default ScannedItem;