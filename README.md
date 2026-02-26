# KINETIC — AI Fitness App
## React Native + Expo Mobile App

---

## 🚀 HOW TO RUN ON REPLIT

### Step 1 — Create the Replit
1. Go to **replit.com** and click **Create Repl**
2. Search for the **Expo** template
3. Name it `kinetic-fitness`
4. Click **Create Repl**

### Step 2 — Upload These Files
Upload ALL of the following files maintaining the exact folder structure:

```
App.js                          ← root
package.json                    ← root
app.json                        ← root
babel.config.js                 ← root
src/
  data/
    exercises.js
    theme.js
    storage.js
  components/
    UI.js
  screens/
    TrackerScreen.js
    LibraryScreen.js
    BuilderScreen.js
    SuggestScreen.js
    SavedScreen.js
```

### Step 3 — Install Dependencies
In the Replit Shell tab, run:
```bash
npm install
```

### Step 4 — Start the App
```bash
npx expo start
```

Replit will show a **QR code**. Scan it with:
- **iPhone**: Use the built-in Camera app → it opens in Expo Go
- **Android**: Open the **Expo Go** app → tap "Scan QR Code"

> Download **Expo Go** from the App Store or Google Play first.

---

## 📱 WHAT YOU GET

| Screen | What it does |
|--------|-------------|
| 📷 TRACK | Camera + manual rep counter, workout log |
| 📚 LIBRARY | 80+ exercises, search & filter, add to plan |
| 🏗️ BUILD | Customize sets/reps, muscle coverage, save plans |
| ✨ SUGGEST | AI workout generator by goal/equipment/focus |
| 💾 SAVED | All saved plans, load to tracker or editor |

---

## 🔗 HOW THE SCREENS CONNECT

```
LIBRARY → tap exercise → adds to BUILDER
BUILDER → "Load into Tracker" → TRACKER shows active plan
SUGGEST → "Send to Builder" → BUILDER
SUGGEST → "Load into Tracker" → TRACKER
SAVED → "▶ TRACK" → TRACKER with that plan loaded
SAVED → "✏️ EDIT" → BUILDER with that plan loaded
```

---

## 🏪 PUBLISHING TO APP STORES

Once you're happy with the app:

1. Create a free **Expo** account at expo.dev
2. Run: `npm install -g eas-cli`
3. Run: `eas login`
4. Run: `eas build:configure`
5. **For Android**: `eas build --platform android`
6. **For iOS**: `eas build --platform ios` (requires $99/yr Apple Developer account)

EAS (Expo Application Services) handles all the certificate complexity for you.

---

## 📝 NOTES

- All data is stored on-device using AsyncStorage (equivalent of localStorage)
- Camera permission is requested automatically on first use
- The exercise tracker uses manual tap-to-count right now
- Full AI pose detection can be added later with `@tensorflow-models/pose-detection`
