# NetSec Visual Analyzer

A modern, interactive web application for visualizing and analyzing network security configurations, DNS records, and threat intelligence data.

## Overview

NetSec Visual Analyzer is a comprehensive security analysis tool built with React and TypeScript that provides:

- **Dashboard Analytics** - Real-time security metrics and compliance status
- **DNS Record Analysis** - Detailed view of DNS configurations (A, AAAA, MX, TXT records)
- **DMARC/DKIM/SPF Monitoring** - Email authentication protocol status
- **Site Comparison** - Compare security configurations across multiple domains
- **Threat Intelligence** - Access to threat intelligence feeds and data
- **Audit History** - Track historical changes and events

## Application Screenshot

![NetSec Dashboard](./docs/screenshots/dashboard.jpg)

### Dashboard Features Shown:
- **Left Sidebar Navigation** - Quick access to all features
- **DMARC Status Card** - Shows email authentication coverage and control status
- **Status Indicators** - Visual representation of security strength:
  - 🟢 **SUCCESS** (100 strength) - Fully configured
  - 🟡 **WARNING** (60 strength) - Partially configured
  - 🔴 **ERROR** (20 strength) - Missing or failing
- **A Record Details Table** - Lists all DNS A records with IP addresses and TTL values

## Key Features

### 1. **Security Dashboard**
   - Real-time security metrics overview
   - DMARC/DKIM/SPF implementation status
   - Coverage and control indicators

### 2. **DNS Records Management**
   - View and analyze all DNS record types
   - IP address tracking
   - TTL (Time To Live) information
   - Interactive record details

### 3. **Site Comparison**
   - Compare security configurations between domains
   - Side-by-side analysis
   - Identify gaps and differences

### 4. **Threat Intelligence**
   - Integrated threat feed data
   - Risk assessment
   - Security recommendations

### 5. **Audit Trail**
   - Historical logs of all changes
   - Compliance tracking
   - Event timeline

### 6. **Educational Resources**
   - Terms guide for security concepts
   - Why Results explanations
   - Best practices documentation

## Tech Stack

- **Frontend Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with PostCSS
- **UI Components:** Custom components + Blink UI library
- **State Management:** TanStack Query (React Query)
- **Routing:** TanStack Router
- **Form Handling:** React Hook Form
- **3D Graphics:** Three.js with React Three Fiber
- **Charting:** Recharts
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd netsec-visual-analyzer-main

# Install dependencies
npm install
# or
bun install
```

### Development Server

```bash
npm run dev
# or
bun run dev
```

The application will start on `http://localhost:3000/`

#### Network Access
- Local: `http://localhost:3000/`
- Network (IPv4): `http://192.168.56.1:3000/`

### Build for Production

```bash
npm run build
# or
bun run build
```

### Preview Production Build

```bash
npm run preview
# or
bun run preview
```

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev Server | `npm run dev` | Start Vite development server with hot reload |
| Build | `npm run build` | Create optimized production build |
| Preview | `npm run preview` | Preview production build locally |
| Lint Types | `npm run lint:types` | Type check with TypeScript |
| Lint JS | `npm run lint:js` | Lint JavaScript/TypeScript files |
| Lint CSS | `npm run lint:css` | Lint and fix CSS files |
| Full Lint | `npm run lint` | Run all linters |
| Generate PPT | `npm run ppt:build` | Generate project presentation |

## Project Structure

```
src/
├── components/           # React components
│   ├── AppSidebarShell.tsx
│   ├── DashboardLayout.tsx
│   ├── NetworkGlobe.tsx
│   └── ...
├── pages/               # Page components
│   ├── DashboardPage.tsx
│   ├── ComparePage.tsx
│   ├── ThreatsPage.tsx
│   ├── HistoryPage.tsx
│   ├── TermsGuidePage.tsx
│   └── ResultsWhyPage.tsx
├── lib/                 # Utility functions
│   ├── dns.ts          # DNS-related utilities
│   ├── threatIntel.ts  # Threat intelligence
│   ├── history.ts      # History management
│   └── utils.ts        # General utilities
├── layouts/            # Layout components
└── assets/             # Static assets
```

## Data Display

### DNS Records
The application displays comprehensive DNS record information including:
- Node identifiers
- IP addresses (IPv4)
- TTL (Time To Live) values
- Record type indicators
- Additional record details

### Security Status
Visual indicators show security implementation strength:
- **100** - Optimal security (fully configured)
- **60** - Adequate security (partially configured)
- **20** - Poor security (missing or failing)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern Chromium-based browsers

## Performance Optimization

- Vite for fast module serving
- Code splitting and lazy loading
- Optimized production builds
- CSS purging via Tailwind
- Asset compression

## Development Features

- Hot Module Replacement (HMR)
- TypeScript type checking
- ESLint configuration
- Stylelint for CSS
- Source maps for debugging

## Contributing

Guidelines for contributing to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## License

[Add your license here]

## Support

For issues, questions, or suggestions, please:
- Open an GitHub issue
- Check the Terms Guide in the application
- Review the Why Results section for explanations

---

**Last Updated:** July 3, 2026
**Application Status:** ✅ Running and fully functional
