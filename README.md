# WindBorne Engineering Challenge

**A real-time weather balloon tracking and analytics dashboard that visualizes global balloon trajectories, analyzes atmospheric patterns, and provides insights into wind drift, altitude distributions, and temperature-altitude relationships.**

---

## 🎯 Project Overview

This project is a comprehensive data visualization and analytics platform built for the WindBorne Engineering Challenge. It fetches real-time weather balloon data from WindBorne Systems, displays balloon trajectories on an interactive world map, and performs statistical analysis to uncover patterns in balloon movement, altitude distributions, and their relationship with surface temperatures.

The application provides three main views:

- **Balloon Map**: Interactive visualization of balloon trajectories with filtering capabilities
- **Global Insights**: Statistical analysis of wind drift patterns and temperature-altitude correlations
- **Balloons Overview**: Fun facts and extreme statistics about individual balloon performances

---

## ✨ Key Features

- **🌍 Interactive World Map**: Real-time visualization of weather balloon trajectories using Leaflet, with customizable markers and path rendering
- **📊 Global Insights Dashboard**:
  - Dominant wind drift analysis across all tracked balloons
  - Temperature-altitude trend analysis with linear regression (R² correlation)
  - Average altitude calculations
- **🎈 Balloon Analytics**: Comprehensive statistics including:
  - Longest/shortest distance traveled
  - Highest/lowest altitude records
  - Fastest balloon (average speed calculation)
  - Biggest altitude range explorer
  - Most consistent direction flyer
  - Comparison with Mount Everest height
- **🔍 Advanced Filtering**: Filter balloons by:
  - Hemisphere (Northern, Southern, or All)
  - Altitude range (0-40 km)
- **📄 Pagination**: Efficient display of large datasets (200 balloons per page)
- **🔄 Auto-Refresh**: Automatic data updates every 10 minutes
- **🌡️ Temperature Integration**: Fetches surface temperatures from Open-Meteo API with intelligent caching and rate limiting
- **📈 Data Visualization**: Interactive charts using Recharts for temperature-altitude relationships
- **🎨 Modern UI**: Built with Tailwind CSS and Radix UI components for a polished, responsive experience

---

## 🛠️ Tech Stack

### Core Framework

- **Next.js** `15.5.4` - React framework with App Router
- **React** `19.0.0` - UI library
- **TypeScript** `5.x` - Type-safe development

### UI & Styling

- **Tailwind CSS** `4.x` - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-select`
  - `@radix-ui/react-separator`
  - `@radix-ui/react-tooltip`
- **Lucide React** `0.545.0` - Icon library
- **class-variance-authority** - Component variant management
- **clsx** & **tailwind-merge** - Conditional styling utilities

### Data Visualization & Maps

- **Leaflet** `1.9.4` - Interactive maps library
- **React-Leaflet** `5.0.0` - React bindings for Leaflet
- **Recharts** `3.2.1` - Charting library for React

### APIs & Data

- **Open-Meteo** `1.2.1` - Weather data API client
- **WindBorne Systems API** - Weather balloon data source

### Developer Experience

- **ESLint** `9.x` - Code linting
- **Turbopack** - Fast bundler (via Next.js)
- **Sonner** `2.0.7` - Toast notification system

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `20.x` or higher
- **npm** `9.x` or higher (or `yarn`, `pnpm`, `bun`)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd windborne-coding-challenge
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Environment Variables

**No environment variables are required.** The application uses public APIs:

- WindBorne Systems API: `https://a.windbornesystems.com/treasure`
- Open-Meteo API: `https://api.open-meteo.com/v1/forecast`

---

## 📖 Usage

### Development Mode

Run the development server with Turbopack for faster builds:

```bash
npm run dev
```

The application will automatically reload when you make changes to the code.

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

### Linting

Check code quality:

```bash
npm run lint
```

### Key Functionality

1. **Viewing Balloon Data**: The dashboard automatically fetches the latest balloon data on load and refreshes every 10 minutes.

2. **Filtering Balloons**:
   - Use the hemisphere dropdown to filter by Northern/Southern hemisphere
   - Adjust altitude range sliders to filter balloons by altitude (0-40 km)
   - Click "Reset Filters" to restore default settings

3. **Navigating Balloons**: Use the Previous/Next buttons to paginate through balloons (200 per page).

4. **Temperature Analysis**:
   - The Global Insights section automatically samples balloon locations and fetches surface temperatures
   - Adjust the sample size (50, 100, or 200) to change the analysis granularity
   - Note: Sample size changes have a 30-second cooldown to prevent API rate limiting

5. **Viewing Statistics**: Scroll down to see fun facts about balloon extremes and comparisons.

---

## 📁 Project Structure

```
windborne-coding-challenge/
├── app/                          # Next.js App Router directory
│   ├── api/                      # API routes
│   │   ├── balloon-data/         # Balloon data fetching endpoint
│   │   │   └── route.ts
│   │   └── surface-temps/        # Surface temperature API endpoint
│   │       └── route.ts
│   ├── layout.tsx                # Root layout component
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── cards/                    # Card components
│   │   └── BalloonDataCard.tsx
│   ├── charts/                   # Chart components
│   │   └── TempVsAltitudeChart.tsx
│   ├── home/                     # Main dashboard components
│   │   ├── DashboardClient.tsx   # Main dashboard client component
│   │   ├── balloon-map/          # Map visualization
│   │   │   ├── BalloonMap.tsx
│   │   │   ├── MapComponent.tsx
│   │   │   └── MapLegend.tsx
│   │   ├── balloons-overview/    # Statistics overview
│   │   │   └── BalloonsOverview.tsx
│   │   └── global-insights/      # Global analytics
│   │       └── GlobalInsights.tsx
│   └── ui/                       # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── error-state.tsx
│       ├── loaders/              # Loading states
│       │   ├── GraphLoader.tsx
│       │   ├── MapLoader.tsx
│       │   └── PageLoader.tsx
│       └── ...                   # Other UI components
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts
│   └── use-pagination.ts
│
├── lib/                          # Utility functions and helpers
│   └── utils/
│       ├── balloonData.ts        # Balloon data processing utilities
│       └── utils.ts              # General utilities
│
├── public/                       # Static assets
│   └── *.svg                     # SVG icons and images
│
├── components.json               # shadcn/ui configuration
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### Key Files

- **`app/page.tsx`**: Main entry point that renders the dashboard
- **`components/home/DashboardClient.tsx`**: Core dashboard logic, state management, and data fetching
- **`lib/utils/balloonData.ts`**: Comprehensive utility functions for:
  - Fetching and processing balloon data
  - Calculating trajectories and statistics
  - Computing wind drift, distances, and extremes
  - Temperature-altitude trend analysis
- **`app/api/balloon-data/route.ts`**: API route that aggregates 24 hours of balloon data from WindBorne
- **`app/api/surface-temps/route.ts`**: API route that batches temperature requests with caching and rate limiting

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these guidelines:

1. **Fork the repository** and create a new branch for your feature or bugfix

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the existing code style and conventions

3. **Test your changes** thoroughly
   - Ensure the application builds without errors
   - Test all affected functionality
   - Run the linter: `npm run lint`

4. **Commit your changes** with clear, descriptive commit messages

   ```bash
   git commit -m "Add: description of your changes"
   ```

5. **Push to your branch** and create a Pull Request
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style Guidelines

- Use TypeScript for all new files
- Follow the existing component structure and naming conventions
- Use functional components with hooks
- Maintain consistent formatting (ESLint will help enforce this)
- Add comments for complex logic or algorithms
- Write self-documenting code with clear variable and function names

### Areas for Contribution

- Performance optimizations
- Additional visualization types
- Enhanced filtering capabilities
- Mobile responsiveness improvements
- Unit and integration tests
- Documentation improvements

---

## 📝 License

This project was created as part of the WindBorne Engineering Challenge.

---

## 👤 Author

**Chris Cortes**

- GitHub: [@DoubleC8](https://github.com/DoubleC8)
- LinkedIn: [Chris Cortes](https://www.linkedin.com/in/chris-cortes-45b7b6280/)

## 📊 Data Sources

- **Balloon Data**: Fetched from `https://a.windbornesystems.com/treasure/[00-23].json` (24-hour historical data)
- **Temperature Data**: Fetched from `https://api.open-meteo.com/v1/forecast` (current surface temperatures)

---

## ⚠️ Notes

- The application automatically refreshes balloon data every 10 minutes
- Temperature API requests are rate-limited (5 requests per batch with 600ms delay) to respect API limits
- Temperature data is cached for 10 minutes to reduce API calls
- Sample size changes for temperature analysis have a 30-second cooldown period
- The map component uses dynamic imports to prevent SSR issues with Leaflet
