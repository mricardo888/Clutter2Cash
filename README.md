# 🧺 Clutter2Cash

> **Turn your unused household items into cash — while promoting sustainability.**
> Snap a photo or describe an item, and Clutter2Cash uses Google’s Gemini AI to identify it, estimate a resale price, and calculate your CO₂ savings from keeping it out of landfill.

---

### 🚀 Tech Stack

**Frontend:** React Native (Expo)
**Backend:** Node.js + Express
**AI Engine:** Google Gemini via `@google/genai`

---

## 📁 Project Structure

```bash
.
├── App.tsx
├── src/                     # App source (components, screens, services)
├── backend/                 # Node/Express API
│   ├── server.js            # Express server (CORS + file upload + /analyze)
│   ├── aipriceAnalyzer.js   # Gemini-based item analysis
│   └── .env                 # Environment variables (not committed)
├── package.json             # Shared dependencies for app + backend
└── README.md
```

---

## 🧩 Prerequisites

* **Node.js** 18+ (LTS recommended)
* **npm** 9+ or **pnpm/yarn**
* **Expo CLI**:

  ```bash
  npm i -g @expo/cli
  ```
* **Device or emulator:**

    * iOS Simulator (macOS + Xcode)
    * Android Studio Emulator
    * Physical device with Expo Go (same Wi-Fi/LAN)

---

## ⚡ Quick Start

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Configure & start the backend


```bash
# backend/.env
GEMINI_API_KEY=your_gemini_api_key
PORT=5001
```

Then run:

```bash
node backend/server.js
```

> ✅ You should see: **Server running on [http://localhost:5001](http://localhost:5001)**

---

### 3️⃣ Start the Expo app


* **Windows (PowerShell)**

  >>>npm i
  >>>npx expo start --tunnel

  Either scan the QR code in terminal using another device that has Expo Go downloaded or follow the localhost link
  
### 4️⃣ Run on a device or emulator

| Command | Action                  |
| ------- | ----------------------- |
| `i`     | Run on iOS Simulator    |
| `a`     | Run on Android Emulator |
| Scan QR | Open on Expo Go         |

---

## 🧠 Backend Overview

| Key           | Description                                                                              |
| ------------- | ---------------------------------------------------------------------------------------- |
| **Framework** | Express.js                                                                               |
| **Endpoint**  | `POST /analyze`                                                                          |
| **Purpose**   | Accepts an image or description and returns item details, price estimate, and CO₂ impact |
| **Library**   | `@google/genai`                                                                          |

**Environment Variables**

```bash
GEMINI_API_KEY=your_gemini_api_key
PORT=5001
```

**Request Example**

```
POST /analyze
Content-Type: multipart/form-data
  image: file (optional)
  description: string (optional)
```

**Response Example**

```json
{
  "item": "Vintage Lamp",
  "value": 25.00,
  "ecoImpact": "3.1 kg CO₂ saved",
  "confidence": "high"
}
```

---

## 📱 App Configuration (Expo)

* The app connects to your backend using:

  ```bash
  EXPO_PUBLIC_API_URL=http://YOUR_IP:5001
  ```
* Default fallback: `http://localhost:5001`
* Located in: `src/services/api.ts`

**Common Commands**

```bash
npm start       # Expo dev server
npm run ios     # Run on iOS simulator
npm run android # Run on Android emulator
npm run web     # Web (for dev/testing)
```

---

## ✨ Features at a Glance

✅ AI-powered price and category detection
✅ CO₂ savings calculator
✅ Photo or text input
✅ Impact dashboard
✅ Clean, accessible UI (React Native Paper + MD3)

---

## 🧰 Troubleshooting

| Issue                            | Possible Fix                                            |
| -------------------------------- | ------------------------------------------------------- |
| **Expo app can’t reach backend** | Use LAN IP instead of localhost                         |
| **CORS errors**                  | Add your Expo dev origin to CORS in `backend/server.js` |
| **Gemini errors**                | Check `GEMINI_API_KEY` validity                         |
| **Image upload fails**           | Don’t set `Content-Type` manually for multipart uploads |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch

   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes

   ```bash
   git commit -m "Add amazing feature"
   ```
4. Push and open a Pull Request

---

## 📜 License

Licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

## 💬 Support

Have questions or issues?
📩 Open an issue on this repository, and we’ll be happy to help!
