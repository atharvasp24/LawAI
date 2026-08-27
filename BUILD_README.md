# LawAI Mobile App

A preliminary legal-information mobile app for citizens, students, and legal professionals in India. Built with React Native and Expo.

> **Status:** Phase-I prototype. This README describes what is actually implemented today, not the long-term product vision. See the disclaimer below before relying on any AI output.

## Features (implemented)

- **AI Legal Assistant** — ask a legal question in plain English, get an answer from Google Gemini
- **Bare Acts Library** — searchable text of IPC, CrPC, CPC, Indian Evidence Act, Motor Vehicles Act, and a partial Bharatiya Nyaya Sanhita (BNS) dataset
- **FIR Builder** — fill a structured complaint form and generate a printable PDF draft
- **Case history** — queries and AI responses are saved locally on your device and viewable in the Case Database screen
- **Original Documents** — links to official/public copies of key statutes

## Not yet implemented

Being upfront about this so nobody spends time looking for it:

- No user accounts or login — the app is unauthenticated
- No backend server — the AI Legal Assistant calls the Gemini API directly from the app
- No retrieval-augmented generation (RAG) — AI answers are not grounded in the Bare Acts data; the two features are independent
- No case law / judicial precedent module
- No cloud storage — saved cases live only in this browser/device's local storage and are lost if storage is cleared
- No BNSS or BSA (Bharatiya Nagarik Suraksha Sanhita / Bharatiya Sakshya Adhiniyam) data yet
- No document upload — Original Documents is a fixed list of external links, not a personal file store

## Disclaimer

LawAI is a preliminary legal-information and document-preparation tool. It does not replace a qualified advocate, provide formal legal representation, or officially register an FIR with police authorities.

## Build Instructions

### Prerequisites

- Node.js 18+ (20+ recommended)
- npm
- Expo CLI (`npx expo`, no separate install needed)

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

Get a free key at [Google AI Studio](https://aistudio.google.com/apikey). No backend, OpenAI account, or Firebase project is required.

### Development

```bash
npx expo start
```

- Press `w` to open in a browser (fastest way to test; some native-only features like voice input on native and PDF generation fall back to browser equivalents on web)
- Scan the QR code with the Expo Go app for iOS/Android
- Press `a` / `i` for an Android/iOS emulator or simulator (requires Android Studio / Xcode installed separately)

### Known limitations on web

- Voice input uses the browser's built-in Speech Recognition API (Chrome/Edge recommended) rather than the native `react-native-voice` library
- PDF generation opens the browser print dialog ("Save as PDF") rather than using `react-native-html-to-pdf`, which is native-only

## Tech Stack

- React Native + Expo SDK 54
- TypeScript
- React Navigation
- Google Gemini API (`gemini-3.6-flash`)
- `@react-native-async-storage/async-storage` for local persistence

## Project Structure

```
├── assets/           # App icons and static assets
├── components/       # Reusable UI components
├── pages/            # App screens
├── Json/             # Legacy data files (currently unused by the app)
├── types.ts          # TypeScript type definitions
└── App.tsx           # Main app component
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the BSD 0-Clause License.