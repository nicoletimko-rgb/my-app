# SPEC.md — Daily Journaling and Manifestation App

## 1. App Overview

**App Name:** Daily Journaling and Manifestion App

**Purpose:** A personal journaling and motivation app where users can save lessons they have learned, quotes, revisit past reflections for daily inspiration, and keep track of their yearly goals and manifestations.

All information will be saved locally on the user's device.

## 2. Screens

### Screen 1: Home / Daily Inspiration

The home screen should display:

- **Inspirational Entry of the Day:** Select one previously saved journal entry and display its title/quote as the daily inspiration.
- **Read Full Entry:** Tapping the inspirational title opens the full journal entry.
- **Past Entries:** Display a list of all previously saved journal entries. Favorited entries should appear at the top, followed by non-favorited entries. Within each group, entries should be ordered from most recent to oldest.
- **Favorite Entries:** Each journal entry should have a star icon that users can tap to favorite or unfavorite it. The Past Entries list should automatically reorder when the favorite status changes.
- **Add Entry:** A button to create a new journal entry.
- **Manifestations:** A button to navigate to the yearly goals screen.

The inspirational entry should remain the same throughout a day and change the next day. If no entries exist, display a welcoming message encouraging the user to add their first reflection. Select it deterministically using the current local date and the saved entries, independent of favorite status.

### Screen 2: Journal Entry

Users should be able to:

- Create a journal entry with a **title/quote** and a **reflection** ("What I Learned").
- Save the entry using a Save button.
- View the full text of a previously saved entry.
- Favorite or unfavorite an entry while viewing its full reflection.
- Return to the home screen.

Each saved entry should automatically include the date it was created.

Both the title and reflection are required before saving. Empty or whitespace-only input should not be accepted.

The favorite status should be visually indicated with a filled or unfilled star icon.

### Screen 3: Yearly Manifestations

Users should be able to:

- Enter a goal or manifestation for the current year.
- Save the goal.
- View a list of previously saved goals.
- Return to the home screen.

Each manifestation is a simple text entry. Empty or whitespace-only goals should not be saved.

## 3. Navigation

Use simple navigation between three screens:

- **Home → Journal Entry:** Add a new entry or read an existing entry.
- **Home → Manifestations:** View and add yearly goals.
- **Journal Entry / Manifestations → Home:** Return using a back button.

## 4. Entities

Use React Native AsyncStorage to save data locally.

Store two collections:

**Journal Entries**
- `id`: Unique identifier
- `title`: String
- `reflection`: String
- `createdAt`: Date/time
- `isFavorite`: Boolean (defaults to `false`)

**Manifestations**
- `id`: Unique identifier
- `text`: String
- `year`: Number

The app must load saved data when reopened.

Favorite status must persist after closing and reopening the app.

For Past Entries, sort by favorite status first, then by creation date descending.

The daily inspirational entry should be selected deterministically based on the current local date and saved entries so it remains consistent during the same day. Adding entries during the day should not change the selected entry; persist the daily selection and date locally. Select a new entry on the next calendar day when entries are available.


## 5. Design & Branding

The app should have a calming, minimalist appearance.

- Soft neutral or pastel colors
- Consistent fonts and button styling
- Readable text and spacing
- Rounded cards for journal entries and manifestations
- Filled star icons for favorited entries and outlined stars for non-favorited entries
- Clear navigation buttons
- Simple, uncluttered layout

The design should work on a standard iPhone screen.

## 7. Core Features

The app is complete when:

- The home screen displays a daily inspirational entry when saved entries exist.
- The inspirational entry remains the same throughout the calendar day, including after restarting the app.
- Users can create and save journal entries with a title and reflection.
- Saved journal entries appear on the home screen.
- Users can tap an entry to read its full reflection.
- Users can favorite and unfavorite journal entries from the home screen and journal entry screen.
- Favorited entries appear above non-favorited entries in Past Entries.
- Entries within each group are ordered from newest to oldest.
- Favorite status persists after closing and reopening the app.
- The favorite icon correctly reflects each entry's current status.
- Users can add and view yearly manifestations.
- Journal entries and manifestations survive closing and reopening the app.
- Navigation works between all three screens.
- Empty states and blank inputs are handled appropriately.
- The app runs successfully on a phone through Expo Go or on a simulator.
- The interface has consistent, intentional styling.
