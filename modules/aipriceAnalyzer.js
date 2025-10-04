import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

class aipriceAnalyzer {
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    /**
     * Identify item from image using Gemini with optional description
     */
    async identifyItemFromImage(imagePath, productDescription = null) {
        try {
            const imageData = fs.readFileSync(imagePath);
            const base64Image = imageData.toString('base64');

            // Determine mime type
            const mimeType = imagePath.toLowerCase().endsWith('.png')
                ? 'image/png'
                : 'image/jpeg';

            const descriptionContext = productDescription
                ? `\n\nADDITIONAL CONTEXT PROVIDED BY USER:\n${productDescription}\n\nUse this information to help identify the specific model and details.`
                : '';

            const prompt = `Analyze this image and identify the item with MAXIMUM SPECIFICITY. Provide:
1. Item name/title (be VERY specific - include exact brand, model number, version, year, variant, SKU if visible)
2. Category (be specific - e.g., "Gaming Laptop" not just "Laptop")
3. Condition assessment (new, used, like new, refurbished, vintage, etc.)
4. Specific identifiable features:
   - Exact model number or SKU
   - Color/finish variant
   - Storage capacity/RAM (for electronics)
   - Size specifications
   - Manufacturing year if identifiable
   - Any edition or variant details (limited edition, anniversary, etc.)
5. Brand and product line${descriptionContext}

IMPORTANT: Be as specific as possible. For example:
- Instead of "iPhone", say "iPhone 15 Pro Max 256GB Natural Titanium"
- Instead of "Nike Shoes", say "Nike Air Jordan 1 Retro High OG 'Chicago' 2015"
- Instead of "Guitar", say "Fender American Professional II Stratocaster Sunburst 2021"

Format as JSON with keys: itemName, category, condition, specificModel, brand, features (array), specifications`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Image
                                }
                            }
                        ]
                    }
                ]
            });

            const text = response.text;

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Could not parse item identification');
        } catch (error) {
            throw new Error(`Image identification failed: ${error.message}`);
        }
    }

    /**
     * Get current market price using Gemini's knowledge
     */
    async getCurrentMarketPrice(itemInfo) {
        try {
            const prompt = `You are a market pricing expert. Based on your knowledge of current market conditions and online marketplaces, provide the current market price for this SPECIFIC item:

ITEM DETAILS:
${JSON.stringify(itemInfo, null, 2)}

IMPORTANT: Use the SPECIFIC model and variant information provided to give accurate pricing. Different variants can have significantly different prices.

Provide response in JSON format with current market pricing:
{
  "averagePrice": <number>,
  "priceRange": {
    "lowest": <number>,
    "highest": <number>
  },
  "currency": "USD",
  "marketConditions": "<brief description of current market for this specific model>"
}

IMPORTANT: Respond ONLY with valid JSON. Use your knowledge of current market prices for this SPECIFIC item variant.`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt
            });

            const text = response.text;

            // Clean the response - remove markdown code blocks if present
            let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Could not parse current market price');
        } catch (error) {
            throw new Error(`Current market price failed: ${error.message}`);
        }
    }

    /**
     * Get price history using Gemini's knowledge
     */
    async getPriceHistory(itemInfo) {
        try {
            const prompt = `You are a market analyst. Based on your knowledge of historical pricing data and market trends, provide the price history for this SPECIFIC item over the past 30 days:

ITEM DETAILS:
${JSON.stringify(itemInfo, null, 2)}

IMPORTANT: Consider the specific model and variant when providing price history.

Provide response in JSON format:
{
  "priceHistory": [
    {
      "price": <number>,
      "date": "<ISO date string>",
      "condition": "<condition>",
      "source": "<marketplace/platform>"
    }
  ],
  "dataAvailability": "full|partial|limited",
  "historicalTrend": "increasing|decreasing|stable"
}

IMPORTANT: 
- Provide realistic historical prices based on market knowledge for this SPECIFIC variant
- Include up to 30 data points if available, or fewer if limited data exists
- Use ISO date format for dates
- Respond ONLY with valid JSON`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt
            });

            const text = response.text;

            // Clean the response - remove markdown code blocks if present
            let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Could not parse price history');
        } catch (error) {
            throw new Error(`Price history failed: ${error.message}`);
        }
    }

    /**
     * Get AI prediction and recommendation
     */
    async getPricePrediction(itemInfo, priceHistory, currentPrice) {
        try {
            const prompt = `You are a market analyst with access to current market trends and news. Analyze this SPECIFIC item data and provide a comprehensive price prediction.

ITEM DETAILS:
${JSON.stringify(itemInfo, null, 2)}

CURRENT MARKET PRICE:
${JSON.stringify(currentPrice, null, 2)}

PRICE HISTORY:
${JSON.stringify(priceHistory, null, 2)}

Analyze:
1. Price trends from the historical data for this specific model
2. Current market conditions and demand for this variant
3. Recent news or events affecting this item category
4. Seasonal trends that might impact value
5. Supply and demand factors
6. Market sentiment and buyer behavior
7. Model-specific factors (age, rarity, popularity)

Provide response in JSON format:
{
  "predictedPrice": <number>,
  "priceDirection": "up|down|stable",
  "confidence": "high|medium|low",
  "reasoning": "<detailed explanation of prediction>",
  "marketFactors": ["<factor1>", "<factor2>", "<factor3>"],
  "newsImpact": "<any recent news affecting prices>",
  "marketTrend": "<overall market trend analysis>",
  "recommendation": "HOLD|SELL",
  "recommendationReason": "<detailed explanation for the recommendation>"
}

IMPORTANT: 
- Consider real-world market dynamics and current events
- Provide actionable insights based on comprehensive analysis
- Respond ONLY with valid JSON. Do not include any text outside the JSON structure.`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt
            });

            const text = response.text;

            // Clean the response - remove markdown code blocks if present
            let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Could not parse prediction');
        } catch (error) {
            throw new Error(`Price prediction failed: ${error.message}`);
        }
    }

    /**
     * Main analysis function with optional product description
     */
    async analyzeItem(imagePath, productDescription = null) {
        try {
            console.log('Step 1: Identifying item from image...');
            if (productDescription) {
                console.log(`Using provided description: ${productDescription}`);
            }
            const itemInfo = await this.identifyItemFromImage(imagePath, productDescription);
            console.log('Item identified:', itemInfo.itemName);
            if (itemInfo.specificModel) {
                console.log('Specific model:', itemInfo.specificModel);
            }

            console.log('\nStep 2: Getting current market price...');
            const currentPrice = await this.getCurrentMarketPrice(itemInfo);
            console.log(`Current average price: $${currentPrice.averagePrice}`);

            console.log('\nStep 3: Fetching price history...');
            const historyData = await this.getPriceHistory(itemInfo);
            console.log(`Price history data availability: ${historyData.dataAvailability}`);
            console.log(`Historical trend: ${historyData.historicalTrend}`);

            console.log('\nStep 4: Getting AI prediction and recommendation...');
            const prediction = await this.getPricePrediction(itemInfo, historyData, currentPrice);

            return {
                itemInfo,
                currentSellingPrice: {
                    average: currentPrice.averagePrice.toFixed(2),
                    lowest: currentPrice.priceRange.lowest.toFixed(2),
                    highest: currentPrice.priceRange.highest.toFixed(2),
                    currency: currentPrice.currency,
                    marketConditions: currentPrice.marketConditions
                },
                priceHistory: historyData.priceHistory.map(item => ({
                    price: item.price,
                    date: item.date,
                    condition: item.condition,
                    source: item.source
                })),
                historicalAnalysis: {
                    dataAvailability: historyData.dataAvailability,
                    trend: historyData.historicalTrend
                },
                prediction: {
                    predictedPrice: prediction.predictedPrice,
                    priceDirection: prediction.priceDirection,
                    confidence: prediction.confidence,
                    reasoning: prediction.reasoning,
                    marketFactors: prediction.marketFactors,
                    newsImpact: prediction.newsImpact,
                    marketTrend: prediction.marketTrend
                },
                recommendation: {
                    action: prediction.recommendation,
                    reason: prediction.recommendationReason,
                    confidence: prediction.confidence
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Analysis failed: ${error.message}`);
        }
    }
}

// Export for use in other files
export default aipriceAnalyzer;

// Example usage (uncomment to run directly)
/*
const analyzer = new aipriceAnalyzer();

// Without description
analyzer.analyzeItem('./path-to-image.jpg')
  .then(result => {
    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });

// With description
analyzer.analyzeItem('./path-to-image.jpg', 'iPhone 15 Pro Max 256GB in Natural Titanium')
  .then(result => {
    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
*/