import dotenv from "dotenv";
dotenv.config();

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    }

    async getSuggestions(itemName, action, category, estimatedValue) {
        try {
            const prompt = this.buildPrompt(itemName, action, category, estimatedValue);

            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
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
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Gemini API error:", errorData);
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No suggestions available";

            return this.parseResponse(text, action);
        } catch (error) {
            console.error("Gemini API error:", error);
            return this.getFallbackSuggestions(action);
        }
    }

    buildPrompt(itemName, action, category, estimatedValue) {
        const actionPrompts = {
            sell: `I have a ${itemName} (${category} category, estimated value: $${estimatedValue}) that I want to SELL. 

Please provide 3-5 specific platforms or stores where I can sell this item. Format your response as a numbered list with:
1. Platform/Store name - Brief description

If there are no good options for selling this specific item, respond with "NONE" and explain why.`,

            donate: `I have a ${itemName} (${category} category) that I want to DONATE.

Please provide 3-5 specific organizations, charities, or donation centers where I can donate this item. Format your response as a numbered list with:
1. Organization name - Brief description

If there are no good donation options for this specific item, respond with "NONE" and explain why.`,

            recycle: `I have a ${itemName} (${category} category) that I want to RECYCLE.

Please provide 3-5 specific recycling centers, programs, or services where I can recycle this item properly. Format your response as a numbered list with:
1. Service/Center name - Brief description

If this item cannot be recycled, respond with "NONE" and explain the best disposal method.`
        };

        return actionPrompts[action] || actionPrompts.sell;
    }

    parseResponse(text, action) {
        // Check if response indicates no options
        if (text.trim().toUpperCase().startsWith("NONE")) {
            return {
                hasOptions: false,
                message: text,
                suggestions: []
            };
        }

        // Parse the suggestions - split by numbers or bullet points
        const lines = text.split('\n').filter(line => line.trim());
        const suggestions = [];

        for (const line of lines) {
            // Match lines starting with numbers, bullets, or dashes
            if (line.match(/^[\d]+[.\)]\s/) || line.match(/^[-•*]\s/)) {
                const cleanLine = line.replace(/^[\d]+[.\)]\s*/, '').replace(/^[-•*]\s*/, '').trim();
                if (cleanLine) {
                    suggestions.push(cleanLine);
                }
            }
        }

        return {
            hasOptions: suggestions.length > 0,
            message: text,
            suggestions: suggestions.slice(0, 5) // Limit to 5 suggestions
        };
    }

    getFallbackSuggestions(action) {
        const fallbacks = {
            sell: {
                hasOptions: true,
                message: "Here are some general platforms where you can sell items:",
                suggestions: [
                    "eBay - Great for collectibles and electronics with wide reach",
                    "Facebook Marketplace - Best for local sales with no shipping",
                    "Mercari - Easy mobile selling for various items",
                    "Craigslist - Local classified ads for quick sales"
                ]
            },
            donate: {
                hasOptions: true,
                message: "Here are some general donation options:",
                suggestions: [
                    "Goodwill - Accepts most household items and clothing",
                    "Salvation Army - Takes furniture, clothing, and household goods",
                    "Local Charities - Check your area for specific needs",
                    "Habitat for Humanity ReStore - Accepts furniture and building materials"
                ]
            },
            recycle: {
                hasOptions: true,
                message: "Here are some general recycling options:",
                suggestions: [
                    "Best Buy - Accepts electronics for free recycling",
                    "Local Recycling Center - Check your municipality's program",
                    "TerraCycle - Specializes in hard-to-recycle items",
                    "Call2Recycle - Battery and electronics recycling"
                ]
            }
        };

        return fallbacks[action] || fallbacks.sell;
    }
}

export default new GeminiService();