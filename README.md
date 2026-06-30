# Noir Cuisine - Touch-Free Recipe Website

This repository contains a university project focusing on intelligent user interfaces. The application explores a website concept where the primary interaction is controlled entirely with hand gestures, eliminating the need to touch any hardware control elements.

## Use Case

The project is designed for a cook who is following a recipe in a kitchen environment. Because their hands may be dirty, wet, or covered in ingredients, touching buttons, links, or a screen can be inconvenient and unhygienic. Noir Cuisine implements a hands-free interaction model that lets the user navigate recipe content seamlessly through the device's camera.

## Features & Interaction Model

Noir Cuisine is a recipe website with a distinctive monochrome visual style. It features recipe cards, detail pages, ingredients, and step-by-step cooking instructions. Key interaction features include:

- A hand-tracking mode that can be enabled from the navigation bar.
- Webcam integration to continuously detect and track the user's hand movements.
- A custom on-screen cursor controlled by moving the hand in the frame.
- Pinch-and-hold gestures to select buttons, links, and recipe cards.
- A fist gesture that enables scrolling through pages and long recipe steps.
- Adaptive UI elements that become larger in hand mode to facilitate gesture-based control.

## Technologies

- React
- TypeScript
- Vite
- Tailwind CSS
- MediaPipe Hands for robust hand tracking
- React Router for seamless page navigation
- Motion for fluid animations

## Running the Project Locally

**Prerequisite:** Node.js

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the local URL shown in the terminal.

*Note: Hand tracking requires camera access. This works best on localhost or through a secure HTTPS connection, as modern browsers restrict webcam access on insecure origins.*

## Available Scripts

- `npm run dev` - start the local development server
- `npm run build` - build the production version
- `npm run preview` - preview the production build
- `npm run lint` - run the TypeScript type check
