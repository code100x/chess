# Chess Mobile App

**NOTE: This app has only been tested on Android devices.**

## Features

Demo Videos link:

- https://youtu.be/TYqO7j7ydDo
- https://youtu.be/-6WtZn5Zx0I
- https://youtube.com/shorts/uG1elnCFi4Q?feature=share

In the Mobile App, Users Can:

1. Sign up using Google or GitHub, similar to the web version.
2. Store cookies in secure storage and send them with every request for user authentication.
3. Play chess between mobile-to-mobile or mobile-to-desktop devices.
4. Note: "Play with Friend" and "Play as Guest" functionalities are currently not implemented.

## Tech Stack

1. Expo
2. Recoil for state management

## Running the App Locally

### Important Notes

- The app cannot be used with the `EXPO GO` mobile app due to authentication flow and deep-linking requirements.
- To pass the sign-in screen, a backend and WebSocket server must be running.

### Setup Instructions

1. **Backend and WebSocket Setup:**

   - Mobile devices cannot access servers running on localhost. Instead, you must expose your backend and WebSocket server to the internet. A convenient way to do this is through [ngrok](https://ngrok.com/).
   - Ngrok allows only one endpoint to be exposed for free. To expose both WebSocket and backend servers, you need a config file with your authToken.
   - Ngrok also provides one free domain that doesn't change each time you start a server. Claim a free domain for the HTTP server to use the backend.

2. **Ngrok Configuration:**

   - In order to edit the `ngrok.yml` file, run this command,
     ```bash
     ngrok config edit
     ```
   - Update the `ngrok.yml` file with the following content:
     ```yml
     version: '2'
     authtoken: YOUR_TOKEN_HERE
     tunnels:
       chess_server:
         proto: http
         addr: 3000
         domain: dynamic-honeybee-humorous.ngrok-free.app
       wschess:
         proto: tcp
         addr: 8080
     ```
     (Replace `YOUR_TOKEN_HERE` with your actual Ngrok auth token.)
   - Run the following command to start Ngrok:
     ```bash
     ngrok start --all
     ```
     (Ensure your backend is running on port 3000 and WebSocket on port 8080, adjust if necessary.)

3. **Environment Configuration:**

   - Copy `.env.sample` to `.env`.
   - Do not change the `EXPO_USE_METRO_WORKSPACE_ROOT` variable, as it is necessary for Expo metro config to work in a monorepo.
   - Set the backend URL in `EXPO_PUBLIC_API_URL` and WebSocket URL in `EXPO_PUBLIC_WS_URL`.

4. **Running the App:**
   ```bash
   # For Android
   yarn expo run:android
   # For iOS
   yarn expo run:ios
   ```
   _Note: Use Yarn as the package manager since it is a yarn turborepo._

### Troubleshooting

- **Android Development Build Issues:**
  - Ensure you have an Android emulator and Java SDK that matches the emulator's requirements. Without this, the React Native app styles may flicker.
  - Follow the setup guide [here](https://reactnative.dev/docs/set-up-your-environment).

## About the App

- Utilizes an animated splash screen via Lottie.
- Uses NativeWind for styling, bringing Tailwind CSS to mobile.
- Context is used for WebSocket to maintain consistent value with a single reference.
- Most data, including the chess object, is stored in Recoil.

## In Progress

- Implementing "Play with Friends" functionality.
- Adding WebSocket reconnect logic.
- Allowing users to join games via links.
- Implementing user cookie refresh to avoid repeated logins.
- Adding confetti effects (note: avoid using Lottie for this due to performance).
- Adding sound effects for moves.
- Creating a settings page for customizing color, theme, master volume, and avatar.
