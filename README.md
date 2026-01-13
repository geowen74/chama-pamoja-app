# Chama Pamoja App

Chama Pamoja is a modern, feature-rich web and mobile application designed to streamline the management of community-based savings and investment groups (chamas). Built with React, Vite, Tailwind CSS, and Capacitor, it provides a seamless experience across platforms.

## Features

- **User Authentication**: Secure login, registration, and password recovery.
- **Dashboard**: Overview of group finances, activities, and quick actions.
- **Member Management**: Add, view, and manage group members and their roles.
- **Meetings**: Schedule, document, and track meetings and resolutions.
- **Contributions**: Record, view, and manage member contributions.
- **Expenses & Fines**: Track group expenses and member fines.
- **Loans**: Apply for, approve, and manage group loans.
- **Projects**: Manage group projects, incomes, and related finances.
- **Reports**: Generate and view financial and activity reports.
- **Settings**: Customize group and user settings, including security options.
- **Beautiful UI**: Responsive, modern design with custom animations and gradients.

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, PostCSS
- **Mobile**: Capacitor (Android support)
- **State Management**: Zustand

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Android Studio (for Android builds)

### Installation
1. Clone the repository:
   ```sh
   git clone <repo-url>
   cd "Chama Pamoja app"
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```sh
   npm run dev
   # or
   yarn dev
   ```
4. To build and run the Android app:
   ```sh
   cd android
   ./gradlew assembleDebug
   ```

## Project Structure

- `src/` - Main source code (components, pages, layouts, stores, types, utils)
- `android/` - Android native project (for Capacitor)
- `public/` - Static assets
- `index.html`, `vite.config.ts` - App entry and configuration
- `tailwind.config.js`, `postcss.config.js` - Styling configuration

## Custom Styling
The app uses advanced Tailwind CSS with custom animations, gradients, and glassmorphism effects. See `src/index.css` for details.

## Contributing
Contributions are welcome! Please fork the repo and submit a pull request.

## License
[MIT](LICENSE)

---

*Chama Pamoja - Empowering community finance management.*
