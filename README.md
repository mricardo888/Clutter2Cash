# 🧺 Clutter2Cash

> **Find worth in what's left behind**
> Snap a photo or describe an item, and Clutter2Cash identifies it, estimates resale value, and calculates CO₂ savings from keeping it out of landfill.
> Built in one weekend by a team of first-time hackers 💪.

---

## 🌟 Hackathon Highlights

### 🏆 **Best Use of Gemini API (MLH)**

We harnessed **Google Gemini** to make sustainability *smart*.
Gemini processes uploaded images or text to:

* Identify the item
* Estimate resale value
* Calculate environmental impact (CO₂ saved)

Gemini is the intelligent core that bridges AI and sustainability — analyzing visuals and text in real time.

### 🔐 **Auth0 Integration (Bonus Category)**

We implemented **Auth0** for secure, passwordless authentication — ensuring users can sign up or log in easily and safely.
Perfect for rapid hackathon development.

---

## ⚙️ Tech Stack

| Layer         | Technologies                              |
| ------------- | ----------------------------------------- |
| **Frontend**  | React Native (Expo)                       |
| **Backend**   | Node.js + Express                         |
| **AI Engine** | Google Gemini via `@google/generative-ai` |
| **Auth**      | Auth0 (planned integration)               |
| **Database**  | MongoDB (Mongoose)                        |
| **Tunnel**    | ngrok                                     |

---

## 🚀 Getting Started

### 🔧 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/clutter2cash.git
cd clutter2cash
```

---

### ⚙️ 2️⃣ Backend Setup

#### a. Install dependencies

```bash
cd backend
npm install
```

#### b. Create a `.env` file inside `/backend`

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGO_URI=mongodb+srv://your_mongo_uri_here
JWT_SECRET=your_jwt_secret_here
PORT=5001
```

#### c. Start the backend

```bash
node server.js
```

✅ You should see:

```
Server running on http://localhost:5001
```

---

### 🌐 3️⃣ Connect with ngrok (for mobile access)

#### a. Install and authenticate ngrok

```bash
npm install -g ngrok
ngrok config add-authtoken <your_ngrok_token>
```

#### b. Start the tunnel

```bash
ngrok http 5001
```

#### c. Copy the **Forwarding URL** shown (e.g., `https://xxxxx.ngrok-free.dev`)

Then update your `.env` files:

##### In `/clutter2cash/.env`

```env
BASE_URL=https://xxxxx.ngrok-free.dev
GEMINI_API_KEY=your_gemini_api_key_here
NGROK_TOKEN=your_ngrok_token_here
```

##### In `/backend/.env`

```env
BASE_URL=https://xxxxx.ngrok-free.dev
```

💡 Tip: You can view the ngrok web interface at [http://127.0.0.1:4040](http://127.0.0.1:4040)

---

### 📱 4️⃣ Run the Frontend (React Native)

From the root directory:

```bash
npx expo start --tunnel
```

Then scan the QR code using **Expo Go** on your mobile device.

---

## 🧠 AI-Powered Backend Endpoints

| Endpoint   | Method | Description                                                                  |
| ---------- | ------ | ---------------------------------------------------------------------------- |
| `/analyze` | POST   | Accepts an image or text, returns item info, value estimate, and CO₂ savings |

**Example response:**

```json
{
  "item": "Vintage Lamp",
  "value": 25.00,
  "ecoImpact": "3.1 kg CO₂ saved",
  "confidence": "high"
}
```

---

## 💡 Core Features

| Feature                    | Description                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| 📸 **AI-Powered Scanning** | Upload or describe an item — Gemini identifies it, estimates resale value, and calculates CO₂ savings. |
| 🔐 **Secure Auth0 Login**  | Fast, passwordless authentication with social login.                                                   |
| 💰 **Resale Estimator**    | AI-based valuation for second-hand items.                                                              |
| 🌿 **Eco Impact Tracker**  | Visualize your total CO₂ saved and items repurposed.                                                   |
| 🧾 **History Dashboard**   | Access all scanned items anytime.                                                                      |
| 🎨 **Responsive Design**   | Built with React Native Paper + Material Design.                                                       |

---

## 🧩 Troubleshooting

| Issue                    | Fix                                                     |
| ------------------------ | ------------------------------------------------------- |
| Expo can’t reach backend | Use ngrok URL instead of localhost                      |
| 403 “Invalid token”      | Ensure JWT secret and BASE_URL match                    |
| Image upload fails       | Don’t manually set Content-Type for multipart/form-data |

---

## 💚 Inspiration

Every year, millions of reusable items end up in landfills simply because people don't know their value.
Clutter2Cash fixes that with AI, users can **sell smarter, waste less, and live greener.**