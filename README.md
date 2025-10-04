# 🌱 Clutter2Cash

**Turn your unused household items into cash while promoting sustainability!**

Clutter2Cash is a React Native app that helps users identify, value, and take action on unused items in their homes. By leveraging AI analysis, the app provides estimated resale values and tracks environmental impact, encouraging users to sell, donate, or recycle items instead of throwing them away.

## ✨ Features

### 📸 Smart Item Analysis
- **Photo Upload**: Take or select photos of items for AI-powered analysis
- **Text Input**: Describe items manually with brand and model information
- **Instant Results**: Get item identification, estimated value, and eco impact

### 💰 Value & Impact Tracking
- **Estimated Resale Value**: AI-powered pricing for various item categories
- **Eco Impact**: Track CO₂ savings from keeping items out of landfills
- **Action Options**: Choose to sell, donate, or recycle each item

### 📊 Dashboard & History
- **Scan History**: View all previously analyzed items
- **Impact Statistics**: Track total value unlocked and CO₂ saved
- **Badge System**: Earn achievements for sustainable decluttering
- **Progress Tracking**: Monitor your decluttering journey

### ⚙️ User Experience
- **Clean, Eco-friendly UI**: Green color scheme promoting sustainability
- **Intuitive Navigation**: Bottom tab navigation with smooth transitions
- **Profile Management**: User settings, preferences, and app information
- **Share Functionality**: Share your sustainable choices on social media

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Studio (for device testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:mricardo888/Clutter2Cash.git
   cd Clutter2Cash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 📱 App Screens

### 1. **Home/Scan Screen**
- Upload photos or enter item details
- AI analysis with loading states
- Eco-friendly design with impact messaging

### 2. **Results Screen**
- Item identification and estimated value
- CO₂ savings calculation
- Action buttons for sell/donate/recycle
- Success animations and share options

### 3. **Dashboard/History**
- FlatList of scanned items with images
- Statistics cards showing total impact
- Badge system with achievements
- Pull-to-refresh functionality

### 4. **Profile/Settings**
- User avatar and level display
- Theme toggle (light/dark mode)
- Notification preferences
- App information and help

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
├── navigation/          # React Navigation setup
│   └── AppNavigator.tsx # Main navigation configuration
├── screens/             # App screens
│   ├── HomeScreen.tsx   # Scan/upload interface
│   ├── ResultsScreen.tsx # Analysis results
│   ├── DashboardScreen.tsx # History and stats
│   └── ProfileScreen.tsx # User profile and settings
├── services/            # API and data management
│   └── api.ts          # Mock API service
├── types/               # TypeScript definitions
│   └── index.ts        # App-wide type definitions
└── utils/               # Utilities and configuration
    └── theme.ts        # Material Design theme
```

## 🎨 Design System

### Color Palette
- **Primary**: `#2E7D32` (Eco Green)
- **Accent**: `#4CAF50` (Light Green)
- **Background**: `#F5F5F5` (Light Grey)
- **Surface**: `#FFFFFF` (White)

### Typography
- Clean, readable fonts with proper hierarchy
- Consistent spacing using 4px grid system
- Accessibility-focused text sizing

### Components
- Material Design 3 components via React Native Paper
- Custom eco-friendly styling
- Consistent iconography using Lucide React Native

## 🔌 API Integration

The app includes a mock API service that simulates backend functionality:

```typescript
// Analyze item from image or text
ApiService.analyzeItem(imageUri?, textInput?)

// Get user's scan history
ApiService.getHistory()

// Save scanned item
ApiService.saveItem(item)
```

**Mock Data Includes:**
- 8 different item categories (phones, laptops, gaming, etc.)
- Realistic pricing and eco impact calculations
- Sample user history with various actions

## 🌱 Sustainability Features

### Environmental Impact
- **CO₂ Tracking**: Calculates carbon footprint savings
- **Waste Reduction**: Promotes circular economy principles
- **Education**: Teaches users about sustainable practices

### Gamification
- **Badge System**: Earn achievements for sustainable actions
- **Progress Tracking**: Visual representation of impact
- **Social Sharing**: Encourage others to participate

## 📈 Future Enhancements

### Planned Features
- **Real AI Integration**: Connect to actual computer vision APIs
- **Marketplace Integration**: Direct selling platform connections
- **Donation Partnerships**: Links to local charities
- **Recycling Guides**: Location-based recycling information
- **Community Features**: Share and discover items with neighbors

### Technical Improvements
- **Offline Support**: Cache data for offline functionality
- **Push Notifications**: Remind users about listed items
- **Advanced Analytics**: Detailed impact reporting
- **Multi-language Support**: International accessibility

## 🛠️ Development

### Available Scripts
```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in web browser
```

### Adding Features
1. Create components in `src/components/`
2. Add screens in `src/screens/`
3. Update navigation in `src/navigation/`
4. Add types in `src/types/index.ts`
5. Update API service if needed

### Code Style
- TypeScript for type safety
- Functional components with hooks
- Material Design 3 principles
- Accessibility-first approach

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@clutter2cash.com or create an issue in this repository.

---

**Built with ❤️ for a more sustainable future** 🌍
