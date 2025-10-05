# 🧺 Clutter2Cash

> **Turning clutter into climate impact — powered by Google Gemini.**  
> Snap a photo or describe an item, and Clutter2Cash identifies it, estimates resale value, and calculates CO₂ savings from keeping it out of landfill.  
> Built in one weekend by a full team of first-time hackers 💪.

---

## 🌟 Hackathon Highlights

### 🏆 Best Use of Gemini API (MLH)
We used **Google’s Gemini API** to make sustainability *smart*.  
Gemini analyzes uploaded images or descriptions, identifies the item, estimates its resale value, and calculates environmental impact.  
From understanding language like a human to generating structured insights — Gemini is the brain behind Clutter2Cash.

### 🔐 Auth0 Integration (Bonus Category)
For authentication, we implemented **Auth0** to handle sign-up and login securely without reinventing the wheel.  
Passwordless, secure, and scalable — perfect for rapid hackathon development.

---

## 🚀 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React Native (Expo) |
| **Backend** | Node.js + Express |
| **AI Engine** | Google Gemini via `@google/genai` |
| **Auth & Security** | Auth0 (planned integration) |
| **Database** | MongoDB (Mongoose) |

---

## ⚡ Quick Start

### 1️⃣ Install dependencies
```bash
npm install
2️⃣ Configure the backend
Create a .env file in /backend:

bash
Copy code
GEMINI_API_KEY=your_gemini_api_key
PORT=5001
Then start:

bash
Copy code
node backend/server.js
✅ You should see: Server running on http://localhost:5001

3️⃣ Start the mobile app
bash
Copy code
npx expo start --tunnel
Scan the QR code with Expo Go to launch on your device.

🧠 AI-Powered Backend
Endpoint	Description
POST /analyze	Accepts an image or text, then returns item category, price estimate, and CO₂ savings

Example Response

json
Copy code
{
  "item": "Vintage Lamp",
  "value": 25.00,
  "ecoImpact": "3.1 kg CO₂ saved",
  "confidence": "high"
}
⚡ Core Features
Feature	Description
📸 AI-Powered Scanning	Upload or describe an item — Gemini identifies it, estimates value, and calculates CO₂ savings.
🔐 Secure Auth0 Login	Fast and safe authentication with social or passwordless login.
💰 Resale Estimator	Get an approximate resale value based on item category and condition.
🌿 Eco Impact Tracker	Visualize your total CO₂ saved and items repurposed.
🧾 History Dashboard	Access all your scanned items and their stats anytime.
🎨 Responsive Design	Clean, accessible UI powered by React Native Paper + Material Design 

🧩 Project Structure
bash
Copy code
.
├── App.tsx
├── src/                   # Frontend (screens, services)
├── backend/               # Express API + Gemini logic
│   ├── server.js
│   ├── aipriceAnalyzer.js
│   └── .env
└── README.md
🧰 Troubleshooting
Issue	Fix
Expo can’t reach backend	Use LAN IP instead of localhost
403 "Invalid token"	Ensure valid JWT and synced BASE_URL
Image upload fails	Don’t manually set Content-Type for multipart/form-data

💡 Inspiration
Every year, millions of reusable items end up in landfills simply because people underestimate their value.
Clutter2Cash uses AI to bridge that gap — empowering users to sell smarter, waste less, and make sustainability simple.

🤝 Team
A full team of first-time hackers who came together to learn, build, and push what’s possible with AI in one weekend.
Built with 💚 for the planet, and a lot of late-night debugging ☕.