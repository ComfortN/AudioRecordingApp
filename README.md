# Voice Notes App

A React Native mobile application for recording, managing, and organizing voice notes. This app provides a simple and intuitive interface for users to create voice recordings, manage their audio library, and customize their recording experience.

## Features

- **Voice Recording**
  - High-quality audio recording
  - Auto-save functionality
  - Recording status indicators

- **Voice Notes Management**
  - List view of all recordings
  - Search functionality
  - Delete recordings
  - Playback controls

- **Customization**
  - Dark/Light mode support
  - Adjustable recording quality
  - Auto-save preferences

- **User Experience**
  - Intuitive navigation
  - Clean, modern interface
  - Loading states and feedback
  - Empty state handling

## Tech Stack

- React Native
- Expo
- React Navigation
- AsyncStorage for local data persistence
- Context API for state management
- Ionicons for icons

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ComfortN/AudioRecordingApp.git
```

2. Install dependencies:
```bash
cd AudioRecordingApp
npm install
```

3. Start the development server:
```bash
npx expo start
```

## Screens

### Home Screen
- Displays list of recorded voice notes
- Search functionality
- Quick access to recording
- Empty state for first-time users

### Record Screen
- Audio recording interface
- Recording controls
- Status indicators

### Settings Screen
- Recording quality options
- Auto-save preferences
- Dark mode toggle
- Data management
- App information

## Configuration

### Settings Options
- High Quality Recording
- Auto Save
- Dark Mode
- Data Management (Clear all notes)

## Local Storage

The app uses AsyncStorage to persist:
- Voice notes
- App settings
- User preferences

## Required Permissions

- Microphone access for recording
- Storage access for saving recordings