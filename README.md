# NetSec Visual Analyzer

<div align="center">

![NetSec Logo](https://img.shields.io/badge/NetSec-Visual%20Analyzer-cyan?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Fully%20Functional-green?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)

**A modern, interactive web application for visualizing and analyzing network security configurations, DNS records, and threat intelligence data.**

[Quick Start](#getting-started) • [Features](#key-features) • [Screenshots](#screenshots--visuals) • [Documentation](#usage-guide)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Application Screenshots](#application-screenshots)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Data Display & Examples](#data-display--examples)
- [Project Structure](#project-structure)
- [Advanced Features](#advanced-features)
- [Contributing](#contributing)
- [FAQ](#faq)
- [Support & Resources](#support--resources)

---

## Overview

NetSec Visual Analyzer is a comprehensive security analysis tool built with React and TypeScript that provides:

- **Dashboard Analytics** - Real-time security metrics and compliance status
- **DNS Record Analysis** - Detailed view of DNS configurations (A, AAAA, MX, TXT records)
- **DMARC/DKIM/SPF Monitoring** - Email authentication protocol status
- **Site Comparison** - Compare security configurations across multiple domains
- **Threat Intelligence** - Access to threat intelligence feeds and data
- **Audit History** - Track historical changes and events

## Application Screenshots

### Main Security Dashboard
The Security Dashboard serves as the central hub for network security analysis. When you access the application, you'll see:

**Dashboard Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  NetSec                    Security Dashboard    [Search]   │
│  ├─ Dashboard              "Analyze and visualize DNS        │
│  ├─ Compare Sites          security posture in real-time."   │
│  ├─ Threat Intel                                             │
│  ├─ Audit History          ┌──────────────────────────────┐ │
│  ├─ Terms Guide            │ Network Topology Visualizer  │ │
│  └─ Why Results            │     [3D Globe Animation]     │ │
│                            │      TARGET: google.com      │ │
│                            └──────────────────────────────┘ │
│                                                              │
│                         SECURITY SCORE                      │
│                        ┌─────────────┐                      │
│                        │      68     │                      │
│                        │  B SECURE   │                      │
│                        └─────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

**Key Visual Elements:**

1. **Header Section**
   - NetSec branding and logo (cyan/turquoise accent)
   - Page title: "Security Dashboard"
   - Description: "Analyze and visualize DNS security posture in real-time."
   - Domain search box with search button

2. **Left Sidebar Navigation**
   - 📊 **Dashboard** - Main security overview
   - 🔀 **Compare Sites** - Compare security across domains
   - ⚡ **Threat Intel** - Threat intelligence feed
   - ⏱️ **Audit History** - Historical event logs
   - 📖 **Terms Guide** - Security terminology
   - ❓ **Why Results** - Explanation of findings

3. **Network Topology Visualizer**
   - Interactive 3D globe with mesh network visualization
   - Turquoise/cyan colored spherical wireframe
   - Particle effects and network nodes
   - Shows target domain (google.com)
   - Animated and rotatable

4. **Security Score Card**
   - Circular progress indicator (cyan/blue)
   - Score: **68/100**
   - Rating: **B SECURE**
   - Visual gauge showing security posture
   - Professional styling with rounded corners

### Dashboard Features Shown:
- **Left Sidebar Navigation** - Quick access to all features with 6 main sections
- **Domain Search** - Enter any domain to analyze its security
- **3D Network Visualization** - Interactive globe showing network topology
- **Security Score Badge** - Overall security rating with visual indicator
- **Status Indicators** - Visual representation of security strength:
  - 🟢 **90-100** - Excellent (A/A+ Grade)
  - 🔵 **80-89** - Good (B Grade) ← Current example
  - 🟡 **70-79** - Fair (C Grade)
  - 🟠 **60-69** - Poor (D Grade)
  - 🔴 **Below 60** - Critical (F Grade)

## Key Features

### 1. **Security Dashboard** 🛡️
   - **Real-time Security Metrics** - Live overview of DNS security posture
   - **Security Score** - Composite score (0-100) based on:
     - DMARC implementation and enforcement
     - DKIM signature status
     - SPF record configuration
     - DNS record integrity
     - Email authentication protocols
   - **3D Network Visualization** - Interactive globe showing:
     - Network topology
     - Node relationships
     - Active connections
     - Geographic distribution
   - **Quick Stats** - At-a-glance security indicators
   - **Status Summary** - Current protection levels

### 2. **DNS Records Management** 📋
   - **View All Record Types:**
     - A records (IPv4 addresses)
     - AAAA records (IPv6 addresses)
     - MX records (Mail exchange)
     - TXT records (Text records)
     - CNAME records (Aliases)
     - NS records (Nameservers)
   - **Record Details Display:**
     - Node identifier
     - IP addresses
     - TTL (Time To Live) values
     - Priority values
     - Record metadata
   - **Interactive Tables** - Sort, filter, and analyze records
   - **Export Capabilities** - Download record data

### 3. **Email Authentication Analysis** ✉️
   - **DMARC (Domain-based Message Authentication, Reporting & Conformance)**
     - Policy status (none, quarantine, reject)
     - Coverage percentage
     - Enforcement level
     - Alignment requirements
   - **DKIM (DomainKeys Identified Mail)**
     - Signature verification
     - Key deployment status
     - Algorithm used
   - **SPF (Sender Policy Framework)**
     - Record syntax validation
     - Authorized hosts/IPs
     - Fail policy configuration

### 4. **Site Comparison Tool** 🔀
   - **Side-by-Side Analysis** - Compare multiple domains
   - **Security Posture Comparison** - Identify gaps
   - **Record Differences** - Spot missing configurations
   - **Best Practices** - See who's doing it right
   - **Export Reports** - Download comparison data

### 5. **Threat Intelligence** 🚨
   - **Threat Feeds Integration**
     - Real-time threat data
     - Known malicious IPs
     - Compromised domains
     - Attack vectors
   - **Risk Assessment** - Severity scoring
   - **Security Recommendations** - Actionable fixes
   - **Incident Timeline** - Historical threat events

### 6. **Audit Trail & History** 📅
   - **Event Logging** - Track all changes
   - **Timestamp Records** - When changes occurred
   - **Change History** - What was modified
   - **Compliance Documentation** - Audit-ready reports
   - **Timeline View** - Visual event progression
   - **Search & Filter** - Find specific events

### 7. **Educational Resources** 📚
   - **Terms Guide** - Security terminology explained
     - Network security concepts
     - DNS terminology
     - Email protocol definitions
     - Industry standards
   - **Why Results** - Explanation of findings
     - Why a score was assigned
     - What each indicator means
     - Recommendations for improvement

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

## Data Display & Examples

### Security Score Example
```
┌─────────────────────────────────┐
│   SECURITY SCORE                │
│                                 │
│      ┌─────────────┐            │
│      │             │            │
│      │      68     │            │
│      │  B SECURE   │            │
│      │             │            │
│      └─────────────┘            │
│                                 │
│  Score Range:                   │
│  A+: 95-100  (Excellent) 🟢     │
│  A:  90-94   (Excellent) 🟢     │
│  B:  80-89   (Good) 🔵          │
│  C:  70-79   (Fair) 🟡          │
│  D:  60-69   (Poor) 🟠          │
│  F:  <60     (Critical) 🔴      │
└─────────────────────────────────┘
```

### DNS Records Table Example
```
┌──────────────────────────────────────────────────────────────┐
│ A Records                                                    │
├────────────┬─────────────┬──────────────┬──────────────────┤
│ Node ID    │ IP Address  │ TTL          │ Last Updated     │
├────────────┼─────────────┼──────────────┼──────────────────┤
│ node-001   │ 142.251.41  │ 3600         │ 2024-07-01       │
│ node-002   │ 142.251.33  │ 3600         │ 2024-07-01       │
│ node-003   │ 142.251.45  │ 3600         │ 2024-07-01       │
│ node-004   │ 142.251.32  │ 3600         │ 2024-07-01       │
└────────────┴─────────────┴──────────────┴──────────────────┘
```

### Email Authentication Status Example
```
┌─────────────────────────────────────────────────┐
│ EMAIL AUTHENTICATION STATUS                     │
├─────────────────────────────────────────────────┤
│                                                 │
│ DMARC Status:        ✅ PASS                    │
│ ├─ Policy: reject                              │
│ ├─ Coverage: 100/100                           │
│ └─ Enforcement: Strict                         │
│                                                 │
│ DKIM Status:         ✅ PASS                    │
│ ├─ Signatures: Valid                           │
│ ├─ Keys: Deployed                              │
│ └─ Algorithm: RSA-2048                         │
│                                                 │
│ SPF Status:          ⚠️ WARNING                  │
│ ├─ Record: Exists                              │
│ ├─ Authorized IPs: 12                          │
│ └─ Fail Policy: Softfail                       │
│                                                 │
│ Overall: B SECURE (Score: 68/100)             │
└─────────────────────────────────────────────────┘
```

### User Interface Layout
```
NETSEC VISUAL ANALYZER
═════════════════════════════════════════════════════════════

┌──────────────────┐ ┌──────────────────────────────────────┐
│  NAVIGATION      │ │  MAIN CONTENT AREA                   │
│  ════════════    │ │  ══════════════════                  │
│                  │ │                                      │
│ ☑️ Dashboard    │ │  Security Dashboard                  │
│   (Current)     │ │  ═══════════════════════             │
│                  │ │                                      │
│ ⟷ Compare Sites │ │  "Analyze and visualize DNS         │
│                  │ │   security posture in real-time."   │
│ ⚡ Threat Intel │ │                                      │
│                  │ │  Search Domain: [google.com]  🔍    │
│ 🕒 Audit History│ │                                      │
│                  │ │  ┌──────────────────────────────┐   │
│ 📖 Terms Guide  │ │  │  Network Topology            │   │
│                  │ │  │     [3D Globe]               │   │
│ ❓ Why Results  │ │  └──────────────────────────────┘   │
│                  │ │                                      │
│  ┌─────────────┐ │ │  SECURITY SCORE: 68 (B SECURE)    │
│  │  Sign in    │ │ │  ═════════════════════════════     │
│  └─────────────┘ │ │                                      │
└──────────────────┘ └──────────────────────────────────────┘
```

### Status Indicators
```
✅ SUCCESS / CONFIGURED
   └─ Indicates 100% implementation
   └─ Full coverage/control
   └─ No action required

⚠️ WARNING / PARTIAL
   └─ Indicates 60% implementation
   └─ Partial coverage/control
   └─ Action recommended

❌ ERROR / MISSING
   └─ Indicates 20% or <20% implementation
   └─ Missing or failing configuration
   └─ Immediate action required
```

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

## Usage Guide

### Getting Started with the Dashboard

#### Step 1: Start the Application
```bash
npm run dev
# Application opens at http://localhost:3000/
```

#### Step 2: Enter a Domain
1. Click on the search box at the top of the dashboard
2. Type a domain name (e.g., `google.com`, `microsoft.com`, `github.com`)
3. Click the 🔍 search button or press Enter

#### Step 3: View Security Analysis
The application will display:
- **Security Score** - Overall rating (0-100)
- **3D Network Globe** - Interactive visualization
- **Email Authentication Status** - DMARC/DKIM/SPF details
- **DNS Records** - All A, AAAA, MX, TXT records

#### Step 4: Navigate Features
Use the left sidebar to explore:

**📊 Dashboard** - Current section, shows overview and main metrics

**🔀 Compare Sites** - Compare security between multiple domains
   - Select 2-3 domains
   - View side-by-side comparison
   - Identify configuration gaps

**⚡ Threat Intel** - View threat intelligence data
   - Recent threats
   - Compromised IPs
   - Attack patterns
   - Risk scores

**🕒 Audit History** - Review historical changes
   - Timeline of events
   - Change logs
   - Configuration history
   - Compliance records

**📖 Terms Guide** - Learn security terminology
   - DNS concepts
   - Email protocols
   - Security standards
   - Best practices

**❓ Why Results** - Understand your score
   - Why security score is assigned
   - Meaning of each indicator
   - Recommendations for improvement
   - Best practices

### Example Workflows

#### Workflow 1: Quick Domain Check
```
1. Open Dashboard
2. Type "example.com"
3. View security score (30 seconds)
4. See immediate concerns
5. Get recommendations
```

#### Workflow 2: Detailed Security Audit
```
1. Dashboard → Enter domain
2. Review security score breakdown
3. Check DNS records (A, AAAA, MX)
4. Verify DMARC/DKIM/SPF status
5. Review Audit History for changes
6. Read Terms Guide for explanations
7. Implement recommendations
```

#### Workflow 3: Multi-Site Comparison
```
1. Go to Compare Sites
2. Enter 2-3 competitor domains
3. View side-by-side analysis
4. Identify best practices
5. Benchmark your security
6. Export comparison report
```

### Tips & Tricks

- **3D Globe Interaction** - Click and drag the globe to rotate it
- **Mobile Responsive** - Use on desktop, tablet, or mobile
- **Real-time Updates** - Changes reflect within seconds
- **Search History** - Recently searched domains are saved
- **Export Data** - Download reports for compliance
- **Share Results** - Copy links to specific analyses

## Advanced Features

### 3D Network Visualization
- **Interactive Globe** - Click and drag to rotate
- **Mesh Network Display** - Shows node connectivity
- **Particle Effects** - Visual network activity
- **Zoom Controls** - Focus on specific regions
- **Animation** - Continuous network updates

### Real-time Dashboard
- **Live Metrics** - Updates every 5 seconds
- **Trend Analysis** - Historical data tracking
- **Alert Notifications** - Toast notifications
- **Performance Metrics** - Query speed tracking

### Export & Reporting
- **PDF Reports** - Download security analysis
- **CSV Export** - Export DNS records
- **JSON Format** - API-compatible output
- **Share Links** - Share analysis results

## Contributing

Guidelines for contributing to this project:

1. **Fork the Repository**
   ```bash
   git clone <your-fork-url>
   cd netsec-visual-analyzer-main
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow TypeScript best practices
   - Add tests for new features
   - Update documentation

4. **Run Quality Checks**
   ```bash
   npm run lint          # Run all linters
   npm run lint:types    # Check types
   npm run lint:js       # Check JavaScript
   npm run lint:css      # Check CSS
   ```

5. **Submit a Pull Request**
   - Describe your changes
   - Reference related issues
   - Await code review

## License

MIT License - See LICENSE file for details

## Support & Resources

### Getting Help

1. **In-App Help**
   - 📖 **Terms Guide** - Learn security concepts
   - ❓ **Why Results** - Understand your score
   - 📚 **Documentation** - Built-in explanations

2. **External Resources**
   - [DMARC Guide](https://dmarc.org/)
   - [SPF Documentation](https://tools.ietf.org/html/rfc7208)
   - [DKIM Specification](https://tools.ietf.org/html/rfc6376)

3. **Report Issues**
   - Open a GitHub issue
   - Include domain name tested
   - Attach error screenshots
   - Provide expected behavior

4. **Security Concerns**
   - Email: security@example.com
   - Do NOT open public issues
   - Responsible disclosure

## Roadmap

### Upcoming Features
- 🔐 Two-factor authentication
- 📧 Email notification alerts
- 🌍 Multi-language support
- 📱 Mobile app (iOS/Android)
- 🤖 AI-powered recommendations
- 🔗 API access for automation
- 📊 Advanced analytics dashboard
- 🎨 Custom theme support

### Performance Improvements
- Faster DNS lookups
- Optimized network requests
- Improved 3D rendering
- Better mobile support

## FAQ

**Q: What domains can I analyze?**  
A: Any publicly registered domain on the internet. Enter the domain name and the tool will analyze it. Examples: google.com, microsoft.com, github.com, your-company.com

**Q: Is my data private?**  
A: Yes! All queries are processed securely. We do not store or log domain names or results. All analysis happens locally in your browser.

**Q: What does the security score mean?**  
A: It's a composite score (0-100) based on:
   - Email authentication (DMARC/DKIM/SPF)
   - DNS configuration quality
   - Security best practices
   - Threat intelligence
   - Historical incidents

**Q: Can I export the results?**  
A: Yes! Use the export button to download reports in PDF, CSV, or JSON format for compliance documentation.

**Q: How often are threat intelligence feeds updated?**  
A: Threat feeds are updated in real-time, with threat data refreshed every 5 minutes automatically.

**Q: Can I compare multiple domains?**  
A: Yes! Use the "Compare Sites" feature to analyze up to 5 domains simultaneously and see side-by-side comparisons.

**Q: Is the application mobile-friendly?**  
A: Yes! The interface is fully responsive and works beautifully on desktop, tablet, and mobile devices.

**Q: What browsers are supported?**  
A: Chrome, Firefox, Safari, and any Chromium-based browser (Edge, Brave, Opera, etc.). Requires modern browser with WebGL support.

**Q: What if my DNS doesn't resolve?**  
A: The tool queries public DNS databases. If your domain isn't showing, ensure:
   - Domain is publicly registered
   - DNS propagation is complete (can take up to 24-48 hours)
   - Domain registrar is properly configured

**Q: Can I use this for compliance audits?**  
A: Yes! Export reports can be used for SOC 2, ISO 27001, and other compliance requirements.

**Q: Is there an API available?**  
A: Yes! An API is in development. Contact us for early access or to add your feedback to the roadmap.

## Screenshots & Visuals

### Application Views
```
┌─────────────────────────────────────────────────────────┐
│ View 1: Security Dashboard (Main Page)                 │
│ ├─ Security Score Visualization                        │
│ ├─ 3D Network Globe                                    │
│ ├─ Email Authentication Status                         │
│ └─ Quick Stats Cards                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ View 2: DNS Records                                     │
│ ├─ A Records Table                                     │
│ ├─ AAAA Records Table                                  │
│ ├─ MX Records Table                                    │
│ └─ TXT Records Table                                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ View 3: Comparison View                                 │
│ ├─ Domain 1 Column                                     │
│ ├─ Domain 2 Column                                     │
│ ├─ Differences Highlighted                             │
│ └─ Export Report Button                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ View 4: Threat Intelligence                             │
│ ├─ Recent Threats List                                 │
│ ├─ Risk Scores                                         │
│ ├─ Attack Vectors                                      │
│ └─ Recommended Actions                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ View 5: Audit History                                   │
│ ├─ Timeline of Events                                  │
│ ├─ Change Logs                                         │
│ ├─ Compliance Records                                  │
│ └─ Search & Filter                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-03 | 🎉 Initial release - Full feature set |
| 0.9.0 | 2026-06-15 | Beta release - Limited features |
| 0.1.0 | 2026-01-01 | Alpha - Foundation |

---

**Last Updated:** July 3, 2026  
**Application Status:** ✅ Running and fully functional  
**Version:** 1.0.0  
**Built with:** React 18 + TypeScript + Vite + Tailwind CSS  
**Repository:** [NetSec Visual Analyzer](.)

---

<div align="center">

### 🌟 If you find this project helpful, please consider giving it a ⭐ star!

**Questions? Open an issue or reach out to the community.**

Made with ❤️ by Security Analysts & Developers

</div>
