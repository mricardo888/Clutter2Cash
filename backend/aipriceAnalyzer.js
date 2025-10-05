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
     * Get selling platforms for the item
     */
    async getSellingPlatforms(itemInfo) {
        try {
            const prompt = `You are an e-commerce expert. Based on this item, recommend the best online platforms where the user can sell it:

ITEM DETAILS:
${JSON.stringify(itemInfo, null, 2)}

Provide 3-5 selling platforms that are best suited for this specific item. Consider:
- Item category and type
- Target audience
- Platform fees and ease of use
- Shipping requirements

Provide response in JSON format:
{
  "sellingPlaces": [
    {
      "name": "<platform name>",
      "type": "selling",
      "address": "Online Marketplace",
      "website": "<full URL>",
      "rating": <number between 3.5-5.0>,
      "distance": "Online",
      "description": "<brief description of why this platform is good for this item>",
      "specialInstructions": "<specific tips or requirements for selling this item type>"
    }
  ]
}

IMPORTANT: 
- Provide realistic, well-known platforms
- Include accurate website URLs
- Make descriptions specific to the item category
- Respond ONLY with valid JSON`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt
            });

            const text = response.text;
            let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Could not parse selling platforms');
        } catch (error) {
            throw new Error(`Selling platforms failed: ${error.message}`);
        }
    }

    /**
     * Get donation places for the item
     */
    async getDonationPlaces(itemInfo) {
        try {
            const prompt = `You are a donation expert. Based on this item, recommend specific organizations and places where the user can donate it:

ITEM DETAILS:
${JSON.stringify(itemInfo, null, 2)}

Provide 3-5 donation organizations/places that accept this type of item. Consider:
- Item category and condition
- Organizations that specifically need this item type
- Local and national options
- Tax deduction possibilities

Provide response in JSON format:
{
  "donationPlaces": [
    {
      "name": "<organization name>",
      "type": "donation",
      "address": "<typical location or 'Multiple Locations'>",
      "phone": "<phone number in format (555) 123-4567>",
      "website": "<full URL>",
      "rating": <number between 3.5-5.0>,
      "distance": "<typical distance or 'Varies by Location'>",
      "description": "<why this organization is good for this item type>",
      "hours": "<typical hours>",
      "specialInstructions": "<specific requirements or instructions for donating this item>"
    }
  ]
}

IMPORTANT: 
- Recommend real organizations that accept this item category
- Include accurate contact information
- Make descriptions specific to the item type
- Provide helpful donation tips
- Respond ONLY with valid JSON`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt
            });

            const text = response.text;
            let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Could not parse donation places');
        } catch (error) {
            throw new Error(`Donation places failed: ${error.message}`);
        }
    }

    /**
     * Get recycling facilities for the item
     */
    async getRecyclingFacilities(itemInfo) {
        try {
            const prompt = `You are a recycling expert. Based on this item, recommend specific recycling facilities and programs where the user can properly recycle it:

ITEM DETAILS:
${JSON.stringify(itemInfo, null, 2)}

Provide 3-5 recycling facilities/programs that accept this type of item. Consider:
- Item materials and recyclability
- Specialized recycling requirements (e-waste, hazardous materials, etc.)
- Environmental certifications
- Data destruction for electronics

Provide response in JSON format:
{
  "recyclingPlaces": [
    {
      "name": "<facility/program name>",
      "type": "recycling",
      "address": "<typical location or 'Multiple Locations'>",
      "phone": "<phone number in format (555) 123-4567>",
      "website": "<full URL>",
      "rating": <number between 3.5-5.0>,
      "distance": "<typical distance or 'Varies by Location'>",
      "description": "<what makes this facility suitable for this item>",
      "hours": "<typical hours>",
      "specialInstructions": "<specific requirements for recycling this item type, preparation needed, certifications offered>"
    }
  ]
}

IMPORTANT: 
- Recommend appropriate recycling facilities for this item category
- Include accurate contact information
- Highlight special services (data destruction, hazardous waste handling, etc.)
- Provide preparation instructions
- Respond ONLY with valid JSON`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt
            });

            const text = response.text;
            let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Could not parse recycling facilities');
        } catch (error) {
            throw new Error(`Recycling facilities failed: ${error.message}`);
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
     * Calculate CO2 emissions saved by reselling instead of discarding
     */
    async calculateCO2EmissionsSaved(itemInfo) {
        try {
            const prompt = `You are an environmental sustainability expert. Calculate the CO2 emissions saved by reselling/reusing this item instead of throwing it away and buying a new replacement.

ITEM DETAILS:
${JSON.stringify(itemInfo, null, 2)}

Consider:
1. Manufacturing emissions for producing a new replacement item
2. Transportation emissions (manufacturing to retail)
3. Disposal/landfill emissions if discarded
4. Material composition and carbon footprint
5. Energy used in production
6. Packaging materials avoided

Provide response in JSON format:
{
  "co2SavedKg": <number in kilograms>,
  "co2SavedLbs": <number in pounds>,
  "equivalentTrees": <number of trees needed to offset this CO2>,
  "equivalentCarMiles": <miles a car would need to drive to produce this much CO2>,
  "breakdown": {
    "manufacturingEmissions": <kg CO2>,
    "transportationEmissions": <kg CO2>,
    "disposalEmissionsAvoided": <kg CO2>
  },
  "environmentalImpact": "<brief description of environmental benefit>",
  "comparisonMetric": "<relatable comparison, e.g., 'equivalent to charging 500 smartphones'>"
}

IMPORTANT: 
- Use realistic CO2 emission data based on the specific item category and materials
- Be conservative in estimates but scientifically accurate
- Respond ONLY with valid JSON`;

            const response = await this.ai.models.generateContent({
                model: 'gemini-2.0-flash-001',
                contents: prompt
            });

            const text = response.text;
            let cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            throw new Error('Could not parse CO2 emissions data');
        } catch (error) {
            throw new Error(`CO2 emissions calculation failed: ${error.message}`);
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

            console.log('\nStep 3: Getting selling platforms...');
            const sellingData = await this.getSellingPlatforms(itemInfo);
            console.log(`Found ${sellingData.sellingPlaces.length} selling platforms`);

            console.log('\nStep 4: Getting donation places...');
            const donationData = await this.getDonationPlaces(itemInfo);
            console.log(`Found ${donationData.donationPlaces.length} donation places`);

            console.log('\nStep 5: Getting recycling facilities...');
            const recyclingData = await this.getRecyclingFacilities(itemInfo);
            console.log(`Found ${recyclingData.recyclingPlaces.length} recycling facilities`);

            console.log('\nStep 6: Fetching price history...');
            const historyData = await this.getPriceHistory(itemInfo);
            console.log(`Price history data availability: ${historyData.dataAvailability}`);
            console.log(`Historical trend: ${historyData.historicalTrend}`);

            console.log('\nStep 7: Getting AI prediction and recommendation...');
            const prediction = await this.getPricePrediction(itemInfo, historyData, currentPrice);

            console.log('\nStep 8: Calculating CO2 emissions saved...');
            const co2Data = await this.calculateCO2EmissionsSaved(itemInfo);
            console.log(`CO2 saved by reselling: ${co2Data.co2SavedKg.toFixed(2)} kg`);

            return {
                itemInfo,
                currentSellingPrice: {
                    average: currentPrice.averagePrice.toFixed(2),
                    lowest: currentPrice.priceRange.lowest.toFixed(2),
                    highest: currentPrice.priceRange.highest.toFixed(2),
                    currency: currentPrice.currency,
                    marketConditions: currentPrice.marketConditions
                },
                actionPlaces: {
                    selling: sellingData.sellingPlaces,
                    donation: donationData.donationPlaces,
                    recycling: recyclingData.recyclingPlaces
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
                environmentalImpact: {
                    co2SavedKg: co2Data.co2SavedKg.toFixed(2),
                    co2SavedLbs: co2Data.co2SavedLbs.toFixed(2),
                    equivalentTrees: Math.round(co2Data.equivalentTrees),
                    equivalentCarMiles: Math.round(co2Data.equivalentCarMiles),
                    breakdown: {
                        manufacturingEmissions: co2Data.breakdown.manufacturingEmissions.toFixed(2),
                        transportationEmissions: co2Data.breakdown.transportationEmissions.toFixed(2),
                        disposalEmissionsAvoided: co2Data.breakdown.disposalEmissionsAvoided.toFixed(2)
                    },
                    environmentalImpact: co2Data.environmentalImpact,
                    comparisonMetric: co2Data.comparisonMetric
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw new Error(`Analysis failed: ${error.message}`);
        }
    }
}

export default aipriceAnalyzer;