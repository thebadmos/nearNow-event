# NearNow - Event Discovery Application

NearNow is the essential event discovery application designed for spontaneous and savvy city dwellers. Say goodbye to endless scrolling and complex searching; NearNow cuts through the noise to show you exactly what's exciting, available, and happening in your immediate vicinity.

## Features

### 🎯 Event Discovery (Home Screen)
- **Current Location Detection**: Automatically uses the device's location (or prompts the user to input a city) to show nearby events first
- **Popular/Trending Events**: A curated section showing the most popular or highly rated events in the user's detected city

### 🔍 Search & Filters
- **Search Bar**: Search for events by keywords (e.g., "rock concert," "comedy show")
- **Location Filter**: Filter by city or use your current location
- **Date Filter**: Filter by "Today", "This Weekend", or a custom date
- **Price Filter**: Filter by price range (Free, $0-$50, $50-$100, $100+)

### 📅 Event Results & Details
- **Event Cards**: Display essential information including:
  - Event name
  - Date & time
  - Venue/location
  - Event image
  - Price information
  - Save/bookmark functionality
- **Detailed View**: Full event page with:
  - Complete description
  - Map integration (Google Maps link)
  - Direct link to event details on PredictHQ

### ❤️ My Events (Saved Events)
- Save events you're interested in
- View all saved events in one place
- Events are stored locally using localStorage (no database required)

## Tech Stack

- **Framework**: Next.js 16.0.0 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with Lucide React icons
- **API**: PredictHQ API for event data (comprehensive event intelligence)
- **State Management**: React hooks and localStorage

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd event-management
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

The app will automatically redirect to `/dashboard` where you can start discovering events!

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── page.tsx              # Event discovery home page
│   │       ├── my-events/
│   │       │   └── page.tsx         # Saved events page
│   │       └── events/
│   │           └── [id]/
│   │               └── page.tsx      # Event detail page
│   └── layout.tsx                    # Root layout
├── components/
│   ├── dashboard/
│   │   ├── Header.tsx                # App header
│   │   ├── Sidebar.tsx               # Navigation sidebar
│   │   └── MobileMenu.tsx            # Mobile navigation menu
│   └── events/
│       ├── EventCard.tsx             # Event card component
│       └── SearchFilters.tsx         # Search and filter component
├── services/
│   ├── predicthq.ts                  # PredictHQ API service
│   └── localStorage.ts               # localStorage service for saved events
└── types/
    └── event.ts                      # TypeScript types for events
```

## API Configuration

The application uses the PredictHQ API to fetch event data. The API token is stored in environment variables for security.
e
