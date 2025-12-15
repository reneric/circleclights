# 🎄 Neighborhood Christmas Lights Map

An interactive map showing all the Christmas light displays in the neighborhood. Visitors can view all decorated houses and build an optimized driving route from their current location.

## ✨ Features

- **Interactive Google Map**: Beautiful dark-themed map with custom ornament markers
- **43 Decorated Houses**: All contest entries pinned on the map
- **One-Click Route Builder**: Builds an optimized driving route from your location
- **Distance & Duration**: Shows total trip distance and estimated drive time
- **Mobile Friendly**: Works great on phones for use while driving

## 🚀 Setup

### 1. Get a Google Maps API Key

Go to [Google Cloud Console](https://console.cloud.google.com/) and:
1. Create a new project
2. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
3. Create an API key in Credentials

### 2. Install Dependencies

```bash
npm install
```

### 3. Geocode the Addresses

Run this once to get the correct coordinates for all houses:

```bash
node scripts/geocode-addresses.js YOUR_API_KEY
```

### 4. Add Your API Key

Create `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📍 How It Works

1. Visitor opens the website
2. Map shows all 43 decorated houses as markers
3. Visitor clicks "Build My Driving Route"
4. App gets their location and calculates an optimized route
5. Route is displayed on the map with distance/time info

## 🏠 Updating Houses

To add or remove houses, edit `scripts/geocode-addresses.js` and re-run it:

```bash
node scripts/geocode-addresses.js YOUR_API_KEY
```

This regenerates `src/data/houses.ts` with updated coordinates.

## 🛠 Tech Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Google Maps JavaScript API

---

Made with ❤️ for Christmas light enthusiasts 🎅
