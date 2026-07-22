# 🛡️ NetSec Visual Analyzer

<div align="center">

**Enterprise-Grade Network Security & DNS Analysis Platform**

[![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=flat-square&logo=checkmark)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6?style=flat-square&logo=typescript)]()
[![React](https://img.shields.io/badge/React-18%2B-61dafb?style=flat-square&logo=react)]()

**Real-time DNS security analysis • Interactive 3D visualization • Threat intelligence • Compliance reporting**

[📖 Documentation](#overview) • [🚀 Quick Start](#getting-started) • [✨ Features](#key-features) • [🏗️ Architecture](#tech-stack)

</div>

---

## 🎯 Overview

**NetSec Visual Analyzer** is a production-ready security analysis platform that transforms complex network security data into intuitive, actionable intelligence. Built for security teams, compliance auditors, and DevOps engineers who demand precision and speed.

### Core Capabilities

- **📊 Real-time Security Analytics** — Composite security scoring engine with multi-factor analysis
- **🔍 Intelligent DNS Discovery** — Complete DNS record enumeration with validation
- **📧 Email Authentication Stack** — DMARC, DKIM, SPF verification and compliance tracking
- **🌐 3D Network Visualization** — Interactive WebGL-powered topology visualization
- **🔀 Multi-Domain Comparison** — Side-by-side security posture analysis
- **⚠️ Threat Intelligence Integration** — Real-time threat feeds and risk assessment
- **📋 Audit & Compliance** — Complete event logging and regulatory compliance documentation

---

## 🚀 Getting Started

### Prerequisites

```
Node.js 18+  │  npm/yarn/bun  │  Modern browser with WebGL support
```

### Installation & Setup

```bash
# 1️⃣ Clone and navigate
git clone <repository-url>
cd netsec-visual-analyzer

# 2️⃣ Install dependencies
npm install

# 3️⃣ Start development server
npm run dev
```

**Application will be available at:** `http://localhost:3000`

### Quick Commands

```bash
npm run dev          # 🔧 Development server (hot reload)
npm run build        # 📦 Production build
npm run preview      # 👁️ Preview production build
npm run lint         # ✅ Full linting suite
npm run lint:types   # 🔍 TypeScript type checking
```

---

## ✨ Key Features

### 1. 🛡️ Security Dashboard
The intelligent control center for security analysis with real-time metrics and visual threat assessment.

**Capabilities:**
- **Composite Security Scoring** — 0-100 scale based on email protocols, DNS integrity, and threat intelligence
- **Interactive 3D Globe** — WebGL-powered topology visualization with network node mapping
- **Live Security Metrics** — Real-time DMARC/DKIM/SPF status monitoring
- **Status Badge System** — Visual threat indicators (🟢 Excellent → 🔴 Critical)

**Score Breakdown:**
| Grade | Score | Status |
|-------|-------|--------|
| 🟢 A+ | 95-100 | Excellent |
| 🟢 A | 90-94 | Excellent |
| 🔵 B | 80-89 | Good |
| 🟡 C | 70-79 | Fair |
| 🟠 D | 60-69 | Poor |
| 🔴 F | <60 | Critical |

### 2. 📋 DNS Records Management
Complete DNS enumeration and validation engine with full record type support.

**Supported Records:**
```
A Records (IPv4)           │ AAAA Records (IPv6)
MX Records (Mail)          │ TXT Records (Verification)
CNAME Records (Aliases)    │ NS Records (Nameservers)
```

**Features:**
- Interactive data tables with sorting and filtering
- TTL and priority value tracking
- Historical change detection
- Export capabilities (CSV, JSON)

### 3. ✉️ Email Authentication Analysis
Enterprise-grade email security verification with full protocol compliance checking.

**DMARC Analysis:**
- Policy enforcement levels (none, quarantine, reject)
- Coverage metrics and alignment requirements
- Subdomain delegation tracking

**DKIM Verification:**
- Signature validation and algorithm detection
- Key deployment status
- RSA-2048+ compliance verification

**SPF Audit:**
- Record syntax validation
- Authorized host enumeration
- Fail policy configuration review

### 4. 🔀 Site Comparison Engine
Advanced multi-domain analysis with vulnerability gap identification.

**Comparison Matrix:**
- Security posture side-by-side analysis
- Configuration delta highlighting
- Best practice benchmarking
- Export-ready comparison reports

### 5. 🚨 Threat Intelligence
Real-time threat feed integration with risk scoring and remediation guidance.

**Coverage:**
- Compromised domain detection
- Known malicious IP identification
- Active threat vector tracking
- Incident timeline visualization
- Actionable remediation steps

### 6. 📅 Audit & Compliance
Complete audit trail for regulatory compliance and forensic investigation.

**Features:**
- Timestamp-precise event logging
- Configuration change history
- SOC 2 / ISO 27001 report generation
- Search and filter capabilities
- Timeline-based visualization

### 7. 📚 Knowledge Base
Integrated educational resources for security teams.

**Included:**
- 📖 Interactive security terminology guide
- ❓ Detailed scoring explanation engine
- 🎯 Actionable remediation recommendations
- 📊 Best practices and industry standards

---

## 🏗️ Tech Stack

### Frontend Architecture

| Layer | Technologies |
|-------|--------------|
| **Framework** | React 18+ with TypeScript 5.0+ |
| **Build Tool** | Vite (next-gen tooling) |
| **Styling** | Tailwind CSS 3+ with PostCSS |
| **State Mgmt** | TanStack Query (server state), React hooks (UI state) |
| **Routing** | TanStack Router (type-safe navigation) |
| **3D Graphics** | Three.js with React Three Fiber |
| **Charting** | Recharts (responsive analytics) |
| **Forms** | React Hook Form with validation |
| **Animations** | Framer Motion (performance-optimized) |
| **Notifications** | React Hot Toast (accessibility-first) |
| **Components** | Blink UI library + custom components |

### Performance Features

- ⚡ Vite module federation for fast HMR
- 🔄 Automatic code splitting and lazy loading
- 📦 Tree-shaking and dead code elimination
- 🎨 Tailwind CSS purging (minimal bundle size)
- 🖼️ Asset optimization and compression
- 🌳 Efficient WebGL rendering pipeline

---

## 📁 Project Structure

```
src/
├── components/
│   ├── AppSidebarShell.tsx       # Layout shell with navigation
│   ├── DashboardLayout.tsx       # Page layout wrapper
│   ├── NetworkGlobe.tsx          # 3D globe visualization
│   ├── SecurityScoreCard.tsx     # Score display component
│   ├── DNSRecordsTable.tsx       # Record enumeration UI
│   ├── EmailAuthStatus.tsx       # DMARC/DKIM/SPF display
│   └── ...
├── pages/
│   ├── DashboardPage.tsx         # Main security dashboard
│   ├── ComparePage.tsx           # Site comparison tool
│   ├── ThreatsPage.tsx           # Threat intelligence feed
│   ├── HistoryPage.tsx           # Audit trail viewer
│   ├── TermsGuidePage.tsx        # Terminology reference
│   └── ResultsWhyPage.tsx        # Score explanation engine
├── lib/
│   ├── dns.ts                    # DNS lookup utilities
│   ├── threatIntel.ts            # Threat data integration
│   ├── scoring.ts                # Security scoring algorithm
│   ├── history.ts                # Audit log management
│   └── utils.ts                  # General helpers
├── hooks/
│   ├── useDomain.ts              # Domain analysis hook
│   ├── useThreatIntel.ts         # Threat data hook
│   └── ...
└── assets/
    └── static files and icons
```

---

## 🎮 Usage Guide

### Workflow: Quick Domain Security Check

```
1. Open Dashboard (http://localhost:3000)
2. Enter domain in search box (e.g., google.com)
3. System analyzes:
   ✓ Security score (0-100)
   ✓ DNS configuration
   ✓ Email authentication status
   ✓ Threat intelligence
4. Review recommendations → Takes ~30 seconds
```

### Workflow: Comprehensive Security Audit

```
1. Dashboard → Input target domain
2. Review security score breakdown
3. Navigate to DNS Records section
   - Examine A, AAAA, MX records
   - Check nameserver configuration
4. Verify Email Authentication
   - DMARC policy and coverage
   - DKIM signature status
   - SPF record validation
5. Check Audit History for recent changes
6. Review Terms Guide for context
7. Export compliance report (PDF/CSV)
```

### Workflow: Multi-Domain Benchmarking

```
1. Go to Compare Sites
2. Enter 2-5 competitor domains
3. System displays:
   - Side-by-side security scores
   - Configuration differences
   - Best practice gaps
4. Download comparison report
5. Identify improvement areas
```

### Pro Tips

| Tip | Description |
|-----|-------------|
| 🔄 **3D Navigation** | Click and drag globe to rotate; scroll to zoom |
| 📱 **Responsive Design** | Full mobile support with touch-optimized UI |
| 💾 **Export Everything** | All data available in PDF, CSV, and JSON formats |
| 🔗 **Share Results** | Copy analysis links to share with team |
| ⏰ **Real-time Updates** | Data refreshes automatically every 5 seconds |

---

## 🔧 Advanced Features

### 3D Network Visualization
- **Interactive Mesh Network** — Node-based topology representation
- **WebGL Acceleration** — Hardware-accelerated rendering
- **Particle Effects** — Real-time network activity visualization
- **Zoom & Pan Controls** — Detailed region inspection
- **Continuous Animation** — Smooth network state updates

### Real-time Analytics Dashboard
- **Live Metric Updates** — 5-second refresh cycle
- **Trend Analysis** — Historical data tracking and prediction
- **Alert System** — Toast notifications for critical findings
- **Performance Metrics** — Query timing and system health

### Enterprise Export & Reporting
- **PDF Reports** — Print-ready security analysis documents
- **CSV Export** — DNS records in spreadsheet format
- **JSON API Format** — Machine-readable compliance data
- **Share Links** — Time-limited analysis URLs

---

## 🌐 Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|-----------------|-------|
| Chrome/Edge | 90+ | Full support including WebGL |
| Firefox | 88+ | Full support |
| Safari | 14+ | WebGL support required |
| Opera | 76+ | Full support |

**Requirement:** Modern browser with WebGL 2.0 support

---

## 📊 Performance Metrics

- **Initial Load:** < 2 seconds (optimized Vite bundle)
- **DNS Query:** < 1 second (cached results)
- **3D Rendering:** 60 FPS (hardware-accelerated)
- **Security Scoring:** < 500ms (algorithmic calculation)

---

## 🤝 Contributing

We welcome contributions from the security community!

### Development Process

```bash
# 1. Fork and clone
git clone <your-fork-url>
cd netsec-visual-analyzer

# 2. Create feature branch
git checkout -b feature/your-feature

# 3. Make changes following code standards
# - TypeScript strict mode
# - ESLint configuration
# - Tailwind CSS conventions

# 4. Run quality checks
npm run lint          # All linters
npm run lint:types    # Type safety
npm run lint:js       # Code style
npm run lint:css      # Stylesheet lint

# 5. Submit PR with description and issue reference
```

### Code Standards

- **TypeScript:** Strict mode with full type coverage
- **Linting:** ESLint + Prettier (auto-format)
- **Testing:** Unit and integration tests required
- **Documentation:** Inline comments for complex logic
- **Accessibility:** WCAG 2.1 AA compliance

---

## 📋 Scripts Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run dev` | Start dev server with HMR | Vite development server |
| `npm run build` | Create production build | Optimized bundle in `dist/` |
| `npm run preview` | Preview production build | Local production preview |
| `npm run lint` | Run all linters | Code quality report |
| `npm run lint:types` | TypeScript type check | Type safety report |
| `npm run lint:js` | JavaScript/TS linting | Code style report |
| `npm run lint:css` | CSS linting | Stylesheet validation |
| `npm run ppt:build` | Generate project slides | PowerPoint presentation |

---

## 🗺️ Roadmap

### Upcoming Features (Q3 2026)

- 🔐 **Enterprise SSO** — SAML 2.0 and OAuth 2.0 integration
- 📧 **Alert Notifications** — Email and webhook alerts
- 🌍 **Multi-language Support** — i18n framework
- 📱 **Mobile Apps** — iOS and Android native apps
- 🤖 **AI Recommendations** — ML-powered security suggestions
- 🔗 **REST API** — Complete API for automation
- 📊 **Advanced Analytics** — Machine learning insights
- 🎨 **Custom Theming** — White-label capabilities

### Performance Roadmap

- 🚀 Faster DNS resolution
- 📦 Further bundle optimization
- 🖥️ Native WebGL 3.0 support
- 📱 Progressive Web App (PWA)

---

## ❓ FAQ

**Q: What domains can I analyze?**
> Any publicly registered domain. Enter the domain name and NetSec will analyze it. Examples: google.com, microsoft.com, github.com, your-company.com

**Q: Is my data secure and private?**
> ✅ Yes. All queries are processed securely. We do not store, log, or retain domain names or analysis results. All processing happens client-side in your browser.

**Q: How is the security score calculated?**
> The score is a composite metric (0-100) based on:
> - Email authentication strength (DMARC/DKIM/SPF)
> - DNS configuration quality
> - Industry best practices adherence
> - Threat intelligence data
> - Historical security incidents

**Q: Can I export analysis results?**
> ✅ Absolutely. Use the export button to download reports in PDF, CSV, or JSON formats for compliance documentation and archival.

**Q: How frequently are threat feeds updated?**
> Threat intelligence feeds are updated in real-time with a 5-minute refresh cycle. Critical threats trigger immediate alerts.

**Q: Does the tool support multi-domain analysis?**
> ✅ Yes. The "Compare Sites" feature supports analysis of up to 5 domains simultaneously with side-by-side comparison.

**Q: Is the application mobile-responsive?**
> ✅ Yes. The interface is fully responsive with touch-optimized controls for desktop, tablet, and mobile devices.

**Q: Which browsers are supported?**
> Chrome, Firefox, Safari, Edge, and any Chromium-based browser (Brave, Opera, etc.). Requires modern WebGL 2.0 support.

**Q: Can results be used for compliance audits?**
> ✅ Yes. Exported reports are suitable for SOC 2, ISO 27001, HIPAA, PCI-DSS, and other regulatory compliance requirements.

**Q: Is a REST API available?**
> 🔜 Currently in development. Contact the team for early access or roadmap feedback.

**Q: What if DNS resolution fails?**
> The tool queries public DNS databases. If a domain doesn't resolve:
> - Verify the domain is publicly registered
> - Check DNS propagation (up to 48 hours)
> - Confirm registrar configuration

---

## 📄 License

**MIT License** — See [LICENSE](./LICENSE) file for complete terms

---

## 📞 Support & Resources

### In-Application Help

- 📖 **Terms Guide** — Interactive security terminology database
- ❓ **Why Results** — Detailed scoring explanation engine
- 📚 **Embedded Documentation** — Context-sensitive help throughout the application

### External References

| Resource | URL |
|----------|-----|
| DMARC Specification | [dmarc.org](https://dmarc.org/) |
| SPF RFC 7208 | [RFC 7208](https://tools.ietf.org/html/rfc7208) |
| DKIM RFC 6376 | [RFC 6376](https://tools.ietf.org/html/rfc6376) |
| DNS Security | [DNSSEC Basics](https://www.cloudflare.com/dns/dnssec/) |

### Report Issues

1. **GitHub Issues** — Use the issue tracker for bug reports
   - Include domain name tested
   - Attach relevant screenshots
   - Describe expected vs. actual behavior

2. **Security Concerns** — For security vulnerabilities:
   - Do NOT open public issues
   - Email: security@example.com
   - Include proof-of-concept
   - Allow 90 days for responsible disclosure

---

## 📈 Version History

| Version | Release Date | Highlights |
|---------|--------------|-----------|
| **1.0.0** | 2026-07-03 | 🎉 Production release — Full feature set |
| **0.9.0** | 2026-06-15 | 🔄 Beta — Limited features, testing period |
| **0.1.0** | 2026-01-01 | 🚀 Alpha — Foundation and core architecture |

---

<div align="center">

### 🌟 Found NetSec Visual Analyzer Useful?

**[Give it a ⭐ star on GitHub](https://github.com/Creator-Naren/Net-Visual-Analyzer)** to show your support!

---

**Last Updated:** July 3, 2026  
**Status:** ✅ Production-Ready  
**Version:** 1.0.0  
**Built with:** React 18 + TypeScript + Vite + Tailwind CSS

---

### 👥 Made with ❤️ by Narendra Borhade.

Questions? Open a [GitHub issue](https://github.com/Creator-Naren/Net-Visual-Analyzer/issues) or start a [discussion](https://github.com/Creator-Naren/Net-Visual-Analyzer/discussions).

**[Visit Repository](https://github.com/Creator-Naren/Net-Visual-Analyzer)** • **[Documentation](https://github.com/Creator-Naren/Net-Visual-Analyzer)** • **[Report Bug](https://github.com/Creator-Naren/Net-Visual-Analyzer/issues)**

</div>
