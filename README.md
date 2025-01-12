# Voice Notes App

A React Native mobile application for recording, managing, and organizing voice notes with secure authentication. This app provides a simple and intuitive interface for users to create voice recordings, manage their audio library, and customize their recording experience.

## Features

### Authentication & User Management
- Email/Password authentication
- Google Sign-in integration
- User profile management
- Profile picture upload and management
- Secure data storage with Firebase
- Persistent login state

### Voice Recording
- High-quality audio recording
- Auto-save functionality
- Recording status indicators

### Voice Notes Management
- List view of all recordings
- Search functionality
- Delete recordings
- Playback controls

### Customization
- Dark/Light mode support
- Adjustable recording quality
- Auto-save preferences
- User profile customization

### User Experience
- Intuitive navigation
- Clean, modern interface
- Loading states and feedback
- Empty state handling
- Responsive design for various screen sizes

## Tech Stack

- React Native
- Expo
- Firebase Authentication
- Firebase Firestore
- React Navigation
- AsyncStorage for local data persistence
- Context API for state management
- Ionicons for icons
- expo-image-picker for profile images

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ComfortN/AudioRecordingApp.git
```

2. Switch to the authentication branch:
```bash
git checkout with-auth
```

3. Install dependencies:
```bash
cd AudioRecordingApp
npm install
```

4. Configure Firebase:
   - Create a Firebase project
   - Add your Firebase configuration to the app
   - Enable Email/Password and Google authentication methods

5. Start the development server:
```bash
npx expo start
```

## Screens

### Authentication Screens
- **Login Screen**
  - Email/Password login
  - Google Sign-in option
  - Navigation to registration
  - Password visibility toggle
  - Error handling and validation

- **Register Screen**
  - New user registration
  - Form validation
  - Error handling

### Profile Screens
- **Profile Screen**
  - User information display
  - Profile picture
  - Navigation to settings and help
  - Logout functionality

- **Edit Profile Screen**
  - Update display name
  - Change profile picture
  - Update email
  - Image upload with size validation
  - Auto-retry mechanism for updates

### Main App Screens
- **Home Screen**
  - Displays list of recorded voice notes
  - Search functionality
  - Quick access to recording
  - Empty state for first-time users

- **Record Screen**
  - Audio recording interface
  - Recording controls
  - Status indicators

- **Settings Screen**
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
- Profile Settings

## Data Storage

### Firebase
- User authentication data
- User profiles
- Profile images (in Firestore)

### Local Storage (AsyncStorage)
- Voice notes
- App settings
- User preferences
- Theme settings

## Required Permissions

- Microphone access for recording
- Storage access for saving recordings
- Camera roll access for profile pictures

## Security Features

- Secure authentication flow
- Protected routes
- Image size validation
- Error handling and retry mechanisms
- Secure profile updates
- Network state management

## Theme Support

The app includes a comprehensive theming system with:
- Dark and light mode
- Consistent color schemes
- Responsive design
- Dynamic theme switching

## Error Handling

- Network error recovery
- Authentication error messages
- Image upload validation
- Profile update retries
- User-friendly error messages