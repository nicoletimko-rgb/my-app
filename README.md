# Daily Journaling and Manifestation App

## What the App Does

This app helps users record daily lessons, reflections, or favorite quotes, revisit favorite entries for inspiration, and keep track of goals or manifestations for the current year. I chose this idea because I am currently taking a course called "Hack Your Life" which teaches practices to improve mental health and life overall. One of these practices was journaling. I found that journaling helps with my overthinking and defining goals for my life adds purpose and something to strive towards. Thus, I wanted to make an app that I could use to practice both these things.

## Screens

### Home / Daily Inspiration

The home screen shows a daily inspiration selected from the saved journal entries and keeps that selection for the same day. Users can tap the quote to read the full reflection, view past entries, favorite or unfavorite entries, create a new entry, and open the manifestations page. Past entries are grouped by favorite status and ordered newest to oldest.

### Journal Entry

The journal screen lets users enter a title or quote and a “What I Learned” reflection, or view a complete saved entry. Saving requires both fields to contain text. Existing entries show their creation date and allow the user to favorite or unfavorite them and return home.

### Yearly Manifestations

The manifestations screen lets users add goals for the current year, view current-year goals, and edit existing goals. A goal must contain text, and the app stores its year and text locally.

## Setup and Run

### Requirements

- Node.js and npm
- Expo Go or an iOS/Android simulator
- Expo SDK 58

This project uses Expo SDK `58.0.26`, as defined in `package.json`, with React Native `0.88.1` and Expo Router.

### Install and Start

From the project directory:

```bash
npm install
npx expo start
```

After Expo starts, you can:

- Scan the QR code with Expo Go on a physical device
- Open the app in an Android emulator
- Open the app in an iOS simulator
- Press `w` to open the web version

For the mobile layout, the app is designed for a standard iPhone screen and uses safe-area spacing.

**Device/simulator used:** Apple iPhone 14 running Expo Go.

## What I Learned

One surprising thing was the loading and disabled button states. It was one of the warnings that the AI review brought up, and I did not realize how important they were for preventing double pressing. In general, I was surprised by how many background challenges like these the app has to handle for the app to function correctly.

## AI Review

### What Did Not Change and Why

- **Finding 16 — Dark theme:** The dark theme was removed because the app is intended to use its consistent purple and neutral light appearance.
- **Finding 18 — Keyboard behavior:** The app relies on the user dismissing or pressing out of the keyboard to save; no additional keyboard adjustment component was added.
- **Finding 17 — Accessibility roles and labels:** Accessibility roles and labels are not required for the app to work visually or for normal touch interaction, so they were not treated as necessary for core functionality.

### Fixes

- **Midnight refresh:** The app checks for a new day at startup, when the app comes back to the foreground, and every minute. It changes the daily inspiration when the calendar date changes.
- **Prevent stale or lost updates:** Saves and favorite changes are processed one at a time. The app also remembers the newest in-memory list rather than relying on an older React snapshot, reducing the chance of rapid presses overwriting data.
- **Malformed saved data:** The app checks saved entries and manifestations before using them. If stored JSON is malformed or has an unexpected shape, invalid data is ignored instead of breaking the entire load.
- **Double presses:** Save and favorite buttons are disabled while a write is in progress, preventing repeated taps from starting duplicate operations.
- **Invalid reflection links:** Opening a journal URL with an unknown entry ID now shows “Reflection not found” and a button to return home instead of incorrectly showing the new-reflection form.
- **Dark mode removed:** The app stays in its intended light appearance regardless of the device theme.
- **Manifestation editing:** Users can edit existing manifestations and save or cancel changes.
