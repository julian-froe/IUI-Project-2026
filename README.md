# Noir Cuisine - Touch-Free Recipe Website Concept

This repository contains a university project for testing intelligent interfaces. The goal is to explore a website concept where the main interaction can be controlled entirely with hand gestures, without having to touch any control elements.

## Use Case

The project is designed around a cook who is following a recipe while cooking. Because their hands may be dirty, wet, or covered in ingredients, touching buttons, links, or a screen is inconvenient and unhygienic. The website therefore experiments with a hands-free interaction model that lets the cook navigate recipe content through the camera.

## Project Concept

Noir Cuisine is a recipe website prototype with a monochrome visual style. It shows recipe cards, detail pages, ingredients, and step-by-step cooking instructions. The important part of the concept is not only the recipe content, but how users can interact with it:

- A hand-tracking mode can be enabled from the navigation bar.
- The webcam is used to detect the user's hand.
- Moving the hand controls a custom on-screen cursor.
- Pinching and holding selects buttons, links, and recipe cards.
- Making a fist allows scrolling through pages and recipe steps.
- Interactive elements become larger in hand mode to make gesture-based control easier.

## Technologies

- React
- TypeScript
- Vite
- Tailwind CSS
- MediaPipe Hands for hand tracking
- React Router for page navigation
- Motion for animations

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

Hand tracking requires camera access. It works best on localhost or through an HTTPS connection because browsers restrict webcam access on insecure origins.

## Available Scripts

- `npm run dev` - start the local development server
- `npm run build` - build the production version
- `npm run preview` - preview the production build
- `npm run lint` - run the TypeScript check

## Notes

This is an experimental prototype for an intelligent interfaces course. It focuses on demonstrating and evaluating touch-free interaction ideas, not on being a complete cooking platform.
