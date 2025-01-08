# Codev: A Real-Time Collaborative Code Editor

## Overview
Codev is a web-based, real-time collaborative code editor designed to enhance teamwork and improve remote coding experiences. Built using **React.js**, **Socket.io**, and **WebRTC**, Codev allows developers to collaborate on code in real-time while seamlessly communicating through video calls. It combines the simplicity of modern web technologies with powerful collaboration tools to ensure a productive and engaging experience for developers worldwide.

---

## Features

### 1. Real-Time Code Synchronization
- As one user types or edits the code, their changes are instantly reflected in the editors of all other participants.
- Ensures that everyone is always on the same page without any lag or delay.

### 2. Room Creation and Sharing
- Users can create a new room with a unique Room ID.
- Room IDs can be shared with team members, allowing easy access and collaboration.

### 3. WebRTC-Based Video Call
- Built-in video calling functionality using WebRTC enables face-to-face communication.
- Facilitates direct communication and faster problem-solving without switching to external tools.

### 4. Collaborative Coding for Interviews
- Synchronization ensures all code updates are visible in real-time, providing a transparent environment for coding interviews.

### 5. Versatile Programming Language Support
- Supports multiple programming languages like JavaScript, Python, Java, C++, and HTML.
- Users can dynamically change the programming language during collaboration.

### 6. User-Friendly Interface
- Light/Dark mode toggle for customizable themes.
- Built-in terminal for running code snippets or commands.
- Typing indicators to show who is actively working on the code.

---

## User Interface

### Join Room Screen
- **Room ID Input**: Enter an existing room ID to join.
- **User Name Input**: Enter your name.
- **Join Room Button**: Join the room after entering the details.
- **Create New Room Link**: Option to create a new room.

### Main Editor Screen (After Joining)
- **Room Info Section**: Displays the Room ID and a button to copy it to the clipboard.
- **Users List**: Shows all users currently in the room. Each user has a "Call" button to initiate a video call.
- **Typing Indicator**: Displays the name of the user currently typing.
- **Language Selector**: Dropdown menu to select the programming language.
- **Leave Room Button**: Exit the room.

### Code Editor
- **Monaco Editor**: A feature-rich, in-browser editor with syntax highlighting, auto-completion, and customizable themes.
- **Terminal Section**: A built-in terminal for real-time interaction with code.

### Video Call Section
- **Local Video**: Displays the user's webcam feed, toggleable on/off.
- **Remote Video**: Displays the webcam feed of other users in the room.

---

## Tech Stack

### Frontend
- **React.js**: For building a dynamic and interactive user interface.
- **Monaco Editor**: For the in-browser code editor.
- **Socket.io**: For real-time communication between users.
- **WebRTC & PeerJS**: For video calling functionality.

### Backend
- **Node.js**: For server-side logic.
- **Express.js**: For handling server routes and APIs.
- **Socket.io**: For managing real-time events like code synchronization.

---

## How It Works

### 1. Room Management
- Rooms are dynamically created with unique IDs using **UUIDv4**.
- Users can join rooms by entering the Room ID and their name.

### 2. Real-Time Code Synchronization
- **Socket.io** ensures that code updates, typing indicators, and language changes are broadcasted to all participants instantly.

### 3. Video Calls
- WebRTC establishes peer-to-peer connections for seamless video calling.
- PeerJS simplifies signaling and peer management for video communication.

### 4. Language Selection
- Users can switch between supported programming languages dynamically, and changes are reflected for all participants.

---

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/username/codev.git
   cd codev
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
