# 📱 Clutter2Cash – React Native Frontend Developer Prompt

You are building the **frontend** of _Clutter2Cash_, a React Native app that helps users turn unused household items into cash while promoting sustainability. Your job is to create a **clickable, polished app** that connects to a backend API and clearly demonstrates the concept to hackathon judges.

---

## 🎯 Goals

- Create a **smooth, minimal app** with 3–4 screens.
- Allow users to upload an image or type details of an item.
- Display item recognition results, estimated resale value, and eco-impact.
- Provide Sell / Donate / Recycle actions.
- Show a dashboard/history of previously scanned items.
- Polish UI so judges see a **real, usable app**, even if some backend parts are mocked.

---

## 📂 Screens to Build

### 1. **Home / Scan Item**

- Buttons: “📸 Upload Photo” and “⌨️ Enter Item Details.”
- Text input for brand/model.
- Image picker using `expo-image-picker` or `react-native-image-picker`.
- Submit button → sends to backend `/analyze-item`.

---

### 2. **Results Screen**

- Display:
  - Item Name (e.g., “iPhone 11”).
  - Estimated Value (e.g., “$180”).
  - Eco Impact (“🌍 You saved 30kg CO₂!”).
- Action buttons: **Sell**, **Donate**, **Recycle** (links to mocked pages or external URLs).
- Small celebratory animation (e.g., confetti or success checkmark).

---

### 3. **Dashboard / History**

- FlatList of user’s scanned items.
- Each entry: Item image, name, resale value, chosen action.
- Summary stats:
  - “Total Value Unlocked: $560.”
  - “Total CO₂ Saved: 90kg.”

---

### 4. **(Optional Stretch) Profile/Settings**

- User name + badges (e.g., “Declutter Rookie”).
- Toggle for dark mode or accessibility options.

---

## 🔌 API Integration

- Backend endpoint:
  - `POST /analyze-item` → { image/text } → returns JSON:
    ```json
    {
      "item": "iPhone 11",
      "value": 180,
      "ecoImpact": "30kg CO₂ saved"
    }
    ```
  - `GET /history` → returns scanned items.
- If backend not ready: **mock responses** with local JSON to keep UI moving.

---

## 🎨 UI/UX Guidelines

- **Theme:** eco-friendly → greens, whites, light grey accents.
- Use **React Navigation** for navigation.
- Use **React Native Paper** or **shadcn/ui RN** for fast, pretty components.
- Add icons via `@expo/vector-icons` or `lucide-react-native`.
- Keep it **clean, minimal, and judge-friendly.**

---

## ✨ Extra Features (If Time Allows)

- **Gamification:**
  - Progress bar (“Decluttered 3/10 items → Next badge: Eco Hero”).
- **Share button:**
  - Share item listing via device’s share sheet.
- **Accessibility / Voice Input:**
  - Add a mic button → speech-to-text for item input.

---

## ⏱️ Suggested Timeline

- **Day 1:** Set up navigation + dummy screens.
- **Day 2:** Implement photo upload, text input, results screen with mocked API.
- **Day 3:** Connect to backend if available, add history dashboard, polish UI & animations.

---

⚡ Your job is to make the app **look real and demo smoothly**. Even if backend AI is limited, the frontend should convince judges that Clutter2Cash works end-to-end.
