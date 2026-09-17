# Wasteless

A community-driven mobile-first web application for reporting, cleaning up, and verifying waste hotspots. Built to empower local communities to take collective action against environmental pollution.

## Features

- **Interactive Map**: Report waste locations by tapping on an interactive Leaflet map
- **Photo Verification**: Before/after photo system for cleanup verification
- **Community Review**: Three-approval voting system ensures cleanup authenticity
- **Gamification**: Earn XP, maintain streaks, unlock badges, and complete challenges
- **Multi-language Support**: English, French, and Arabic with RTL support
- **Privacy Options**: Private cleanup mode for personal tracking
- **Real-time Updates**: Live location tracking and geolocation services
- **Offline Support**: Full functionality continues without internet connection
- **Map Filtering**: Filter hotspots by severity and status
- **Profile System**: Track personal impact with XP levels and achievement history

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 8
- **Maps**: Leaflet 1.9 with OpenStreetMap tiles
- **Styling**: Custom CSS with CSS variables
- **Storage**: Browser localStorage
- **Linting**: oxlint

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

1. **Report Waste**: Tap anywhere on the map to mark a waste hotspot, add details, and upload a photo
2. **Community Review**: Other users can vote on cleanup submissions to verify completion
3. **Earn XP**: 
   - +10 XP for reporting waste
   - +50 XP for completing cleanups
   - +5 XP for reviewing submissions
4. **Track Progress**: View your level, XP progress, streaks, and badges in the Impact section
5. **Complete Challenges**: Take on community challenges for bonus XP rewards

## Project Structure

```
src/
├── components/       # React components
│   ├── ClaimModal.tsx
│   ├── EditModal.tsx
│   ├── ImpactSheet.tsx
│   ├── Landing.tsx
│   ├── LiveCamera.tsx
│   ├── MapView.tsx
│   ├── ReportModal.tsx
│   ├── ReviewSheet.tsx
│   └── Toast.tsx
├── lib/             # Utilities and helpers
│   ├── challenges.ts    # Gamification logic
│   ├── i18n.ts          # Internationalization
│   ├── network.ts       # Network status
│   ├── photo.ts         # Photo processing
│   └── store.ts         # Local storage management
├── App.tsx          # Main application component
├── index.css        # Global styles
└── types.ts         # TypeScript type definitions
```

## Current Status

This is a prototype application that runs entirely in the browser using localStorage. Future development will include:

- Backend API integration
- User authentication system
- Real-time synchronization
- Expanded gamification features
- Analytics dashboard

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for your own community initiatives.

## Contact

For questions or collaboration opportunities, please open an issue on GitHub.

---

Built with ❤️ for cleaner communities everywhere.
