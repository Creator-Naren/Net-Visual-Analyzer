const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

const outputPath = path.resolve(__dirname, '../docs/project-documentation.pdf')

const doc = new PDFDocument({
  size: 'A4',
  margin: 0,
  bufferPages: true,
  info: {
    Title: 'NetSec Visual Analyzer - Professional Documentation',
    Author: 'Development Team',
    Subject: 'Enterprise DNS Security Analysis Platform'
  }
})

const stream = fs.createWriteStream(outputPath)
doc.pipe(stream)

// Professional color palette
const colors = {
  bg: '#0a0e27',
  primary: '#47d7ff',      // Bright cyan
  secondary: '#8b5cf6',    // Vibrant purple
  accent: '#06b6d4',       // Darker cyan
  dark: '#0f172a',
  card: '#1a2744',
  text: '#e2e8f0',
  textMuted: '#94a3b8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
}

function fillBackground() {
  doc.rect(0, doc.y, doc.page.width, doc.page.height - doc.y).fill(colors.bg)
}

function addPageHeader(title, subtitle) {
  // Background banner
  doc.rect(0, 0, doc.page.width, 200).fill(colors.dark)
  
  // Gradient-like accent bars
  doc.rect(0, 0, doc.page.width, 8).fill(colors.primary)
  doc.rect(0, 192, doc.page.width, 8).fill(colors.secondary)
  
  // Title
  doc.fontSize(48).font('Helvetica-Bold').fillColor(colors.primary)
    .text(title, 50, 60, { width: 495, align: 'left' })
  
  // Subtitle
  doc.fontSize(16).fillColor(colors.secondary).font('Helvetica')
    .text(subtitle || '', 50, 140, { width: 495, align: 'left' })
  
  doc.y = 220
}

function addSectionTitle(text) {
  doc.fontSize(24).font('Helvetica-Bold').fillColor(colors.primary)
    .text(text, 50, doc.y, { width: 495 })
  
  doc.moveTo(50, doc.y + 30).lineTo(545, doc.y + 30)
    .strokeColor(colors.secondary).lineWidth(3).stroke()
  
  doc.y += 45
}

function addBox(title, content) {
  const boxHeight = 120
  doc.rect(40, doc.y, 515, boxHeight).fillAndStroke(colors.card, colors.accent)
  
  doc.fontSize(14).font('Helvetica-Bold').fillColor(colors.primary)
    .text(title, 55, doc.y + 12, { width: 485 })
  
  doc.fontSize(11).font('Helvetica').fillColor(colors.text)
    .text(content, 55, doc.y + 38, { width: 485, align: 'left' })
  
  doc.y += boxHeight + 15
}

function addFeatureGrid(items) {
  const itemsPerRow = 2
  const itemWidth = 240
  const itemHeight = 100
  
  let row = 0
  let col = 0
  
  items.forEach((item, idx) => {
    if (col === itemsPerRow) {
      col = 0
      row++
      doc.y += itemHeight + 10
    }
    
    const x = 40 + col * (itemWidth + 20)
    const y = doc.y
    
    doc.rect(x, y, itemWidth, itemHeight).fillAndStroke(colors.card, colors.accent)
    
    doc.fontSize(13).font('Helvetica-Bold').fillColor(colors.primary)
      .text(item.title, x + 15, y + 12, { width: itemWidth - 30 })
    
    doc.fontSize(10).font('Helvetica').fillColor(colors.text)
      .text(item.desc, x + 15, y + 35, { width: itemWidth - 30, height: 55 })
    
    col++
  })
  
  doc.y += itemHeight + 15
}

function addKeyValueTable(data) {
  const labelWidth = 200
  const spacing = 25
  
  doc.fontSize(11).font('Helvetica')
  
  data.forEach(([label, value]) => {
    doc.fillColor(colors.primary).font('Helvetica-Bold')
      .text(label, 50, doc.y, { width: labelWidth })
    
    doc.fillColor(colors.text).font('Helvetica')
      .text(value, 50 + labelWidth + 20, doc.y, { width: 275 })
    
    doc.y += spacing
  })
}

function addCodeBlock(code) {
  doc.rect(40, doc.y, 515, 8).fill(colors.accent)
  
  const lines = code.split('\n')
  const lineHeight = 14
  const blockHeight = (lines.length * lineHeight) + 20
  
  doc.rect(40, doc.y + 8, 515, blockHeight).fillAndStroke('#000000', colors.accent)
  
  doc.fontSize(9).font('Courier').fillColor('#00ff00')
  
  lines.forEach((line, idx) => {
    doc.text(line, 50, doc.y + 18 + (idx * lineHeight), { width: 495 })
  })
  
  doc.y += blockHeight + 15
}

function ensurePageSpace(space) {
  if (doc.y + space > 750) {
    doc.addPage()
    fillBackground()
  }
}

function newPage() {
  doc.addPage()
  fillBackground()
}

// ==================== PAGE 1: COVER ====================
fillBackground()
addPageHeader('NetSec', 'Visual Analyzer')

doc.fontSize(28).font('Helvetica-Bold').fillColor(colors.primary)
  .text('Enterprise DNS Security Platform', 50, doc.y + 40, { width: 495 })

doc.fontSize(13).font('Helvetica').fillColor(colors.textMuted)
  .text('Real-time threat intelligence, security analysis, and audit tracking', 50, doc.y + 40, { width: 495 })

doc.moveDown(2)

addBox(
  '[SECURITY] What is NetSec?',
  'NetSec is a comprehensive DNS security analysis and threat intelligence dashboard. It provides real-time security scoring, domain comparisons, live phishing threat feeds, and interactive 3D network visualizations.'
)

doc.moveDown(2)

doc.fontSize(11).font('Helvetica-Bold').fillColor(colors.secondary).text('Key Capabilities', 50, doc.y)
doc.moveDown(0.5)

const capabilities = [
  '[+] Real-time DNS security scoring (0-100 scale)',
  '[+] Side-by-side domain security comparisons',
  '[+] Live OpenPhish threat intelligence feeds',
  '[+] Interactive 3D network topology visualization',
  '[+] Persistent audit history with search',
  '[+] SPF, DMARC, and DNSSEC analysis'
]

doc.fontSize(11).fillColor(colors.text)
capabilities.forEach(cap => {
  doc.text(cap, 50, doc.y, { width: 495 })
  doc.moveDown(0.6)
})

// ==================== PAGE 2: TECHNICAL STACK ====================
newPage()
addPageHeader('Technical', 'Architecture & Stack')

addSectionTitle('Technology Stack')

const features = [
  { title: 'Frontend', desc: 'React 18 + TypeScript with Vite for fast development' },
  { title: 'Routing', desc: 'TanStack Router v1.168 for type-safe navigation' },
  { title: 'State Mgmt', desc: 'React Query v5.97 for server-state caching' },
  { title: '3D Graphics', desc: 'Three.js + React Three Fiber for visualizations' }
]

addFeatureGrid(features)

ensurePageSpace(150)

doc.fontSize(18).font('Helvetica-Bold').fillColor(colors.primary).text('Core Dependencies', 50, doc.y)
doc.moveDown(1)

const deps = [
  ['Framework', 'React 18.2.0 + TypeScript 6.0.2'],
  ['Build Tool', 'Vite 8.0.4 with HMR development'],
  ['Routing', '@tanstack/react-router v1.168.10'],
  ['State Management', '@tanstack/react-query v5.97.0'],
  ['UI Components', '@blinkdotnew/ui 0.4.0 (Blink Design System)'],
  ['Authentication', '@blinkdotnew/react 1.0.2 (Blink SDK)'],
  ['Forms', 'react-hook-form 7.72.1 + Zod 4.3.6'],
  ['Charts', 'Recharts 3.8.1'],
  ['3D Library', 'React Three Fiber 9.5.0 + Drei 10.7.7'],
  ['Styling', 'TailwindCSS 3.3.5 + PostCSS']
]

addKeyValueTable(deps)

// ==================== PAGE 3: APPLICATION FLOW ====================
newPage()
addPageHeader('Application', 'Flow & Routes')

addSectionTitle('Data Flow Architecture')

addCodeBlock(`USER INPUT
    |
FORM VALIDATION (Zod)
    |
REACT QUERY FETCH (Cloudflare DoH)
    |
DNS ANALYSIS ENGINE
    |
SECURITY SCORING (0-100)
    |
RENDER + VISUALIZE
    |
STORE AUDIT EVENT`)

ensurePageSpace(200)

doc.fontSize(16).font('Helvetica-Bold').fillColor(colors.primary).text('Routes & Pages', 50, doc.y)
doc.moveDown(1)

const routes = [
  ['/', 'Dashboard', 'Primary DNS security analysis with real-time scoring and 3D globe'],
  ['/compare', 'Compare', 'Side-by-side security comparison of two domains'],
  ['/threats', 'Threats', 'Threat intelligence feed with OpenPhish integration'],
  ['/history', 'History', 'Audit log with searchable history and filtering']
]

doc.fontSize(10).fillColor(colors.text)
routes.forEach(([route, name, desc]) => {
  doc.font('Helvetica-Bold').fillColor(colors.primary).text(route, 50, doc.y, { width: 60 })
  doc.font('Helvetica-Bold').fillColor(colors.secondary).text(name, 115, doc.y - 12, { width: 100 })
  doc.font('Helvetica').fillColor(colors.text).text(desc, 220, doc.y - 12, { width: 315 })
  doc.moveDown(1)
})

// ==================== PAGE 4: CORE MODULES ====================
newPage()
addPageHeader('Core', 'Modules & Libraries')

addSectionTitle('Business Logic Modules')

const modules = [
  {
    title: 'src/lib/dns.ts',
    desc: 'DNS security analysis engine using Cloudflare DoH API. Queries A, AAAA, MX, TXT, NS, DNSSEC records and evaluates SPF, DMARC configurations.'
  },
  {
    title: 'src/lib/threatIntel.ts',
    desc: 'OpenPhish feed integration with threat classification, risk scoring, domain age analysis, and RDAP metadata enrichment.'
  },
  {
    title: 'src/lib/history.ts',
    desc: 'LocalStorage-backed audit event persistence with deduplication and 100-record capacity limit.'
  },
  {
    title: 'src/components/NetworkGlobe.tsx',
    desc: '3D rotating wireframe globe visualization using React Three Fiber and Drei with interactive camera controls.'
  }
]

modules.forEach(m => {
  ensurePageSpace(80)
  doc.fontSize(12).font('Helvetica-Bold').fillColor(colors.primary).text(m.title, 50, doc.y)
  doc.moveDown(0.5)
  doc.fontSize(11).font('Helvetica').fillColor(colors.text).text(m.desc, 50, doc.y, { width: 495 })
  doc.moveDown(1)
})

// ==================== PAGE 5: PAGE COMPONENTS ====================
newPage()
addPageHeader('Page', 'Components')

addSectionTitle('User Interface Pages')

const pages = [
  {
    title: '[CHART] Dashboard',
    desc: 'Security analysis interface with domain search, real-time scoring, DNS findings cards, charts, heatmaps, and 3D globe visualization'
  },
  {
    title: '[BALANCE] Compare',
    desc: 'Parallel domain analysis with score comparison, findings matrix, benchmark charts, and detailed audit log'
  },
  {
    title: '[ALERT] Threats',
    desc: 'Threat intelligence dashboard with feed statistics, domain lookup tool, risk scoring, and signal breakdown'
  },
  {
    title: '[NOTES] History',
    desc: 'Audit log viewer with searchable table, pagination, color-coded scores, and refresh/clear controls'
  }
]

pages.forEach(p => {
  ensurePageSpace(80)
  doc.fontSize(13).font('Helvetica-Bold').fillColor(colors.primary).text(p.title, 50, doc.y)
  doc.moveDown(0.5)
  doc.fontSize(11).font('Helvetica').fillColor(colors.text).text(p.desc, 50, doc.y, { width: 495 })
  doc.moveDown(1)
})

// ==================== PAGE 6: INTEGRATIONS ====================
newPage()
addPageHeader('External', 'Integrations')

addSectionTitle('API & Service Integrations')

const integrations = [
  {
    title: '[GLOBE] Cloudflare DoH',
    desc: 'Endpoint: https://cloudflare-dns.com/dns-query\nQueries: A, AAAA, MX, TXT, NS, DS records for security assessment'
  },
  {
    title: '[ALERT] OpenPhish Feed',
    desc: 'Source: https://openphish.com/feed.txt\nLive phishing URL indicators with threat classification'
  },
  {
    title: '[LOCK] Blink SDK',
    desc: 'OAuth authentication provider v2.4.0\nEnvironment: VITE_BLINK_PROJECT_ID configuration'
  }
]

integrations.forEach(int => {
  ensurePageSpace(100)
  doc.fontSize(13).font('Helvetica-Bold').fillColor(colors.primary).text(int.title, 50, doc.y)
  doc.moveDown(0.5)
  doc.fontSize(11).font('Helvetica').fillColor(colors.text).text(int.desc, 50, doc.y, { width: 495 })
  doc.moveDown(1)
})

// ==================== PAGE 7: DEVELOPMENT ====================
newPage()
addPageHeader('Development', 'Getting Started')

addSectionTitle('Installation & Setup')

addCodeBlock('npm install\nnpm run dev')

doc.fontSize(12).font('Helvetica').fillColor(colors.text)
  .text('Dev server runs at http://localhost:3000', 50, doc.y)
doc.moveDown(1.5)

doc.fontSize(16).font('Helvetica-Bold').fillColor(colors.primary).text('Available Scripts', 50, doc.y)
doc.moveDown(1)

addCodeBlock('npm run dev          # Start with HMR\nnpm run build        # Production build\nnpm run preview      # Preview production\nnpm run lint         # Code linting\nnpm run type-check   # TypeScript check')

// ==================== PAGE 8: SUMMARY ====================
newPage()
addPageHeader('Project', 'Summary')

addSectionTitle('Key Metrics & Deliverables')

const metrics = [
  ['Security Score Range', '0-100 points with multi-factor calculation'],
  ['DNS Records Analyzed', '6 types: A, AAAA, MX, TXT, NS, DNSSEC'],
  ['Security Policies', 'SPF, DMARC, DNSSEC evaluation'],
  ['Threat Intelligence', 'OpenPhish live feed integration'],
  ['Audit Capacity', 'Up to 100 recent records in LocalStorage'],
  ['Response Time', 'Real-time analysis with caching'],
  ['3D Visualization', 'WebGL-accelerated interactive globe'],
  ['Browser Support', 'Modern browsers with ES2020+ support']
]

addKeyValueTable(metrics)

ensurePageSpace(150)

doc.fontSize(16).font('Helvetica-Bold').fillColor(colors.success).text('[DONE] Deliverables', 50, doc.y)
doc.moveDown(0.8)

const deliverables = [
  'Complete DNS security analysis platform',
  'Real-time threat intelligence integration',
  '3D network topology visualization',
  'Domain comparison and benchmarking',
  'Persistent audit history tracking',
  'Responsive dark-theme UI',
  'Production-ready codebase'
]

doc.fontSize(11).fillColor(colors.text)
deliverables.forEach(d => {
  doc.text('• ' + d, 50, doc.y, { width: 495 })
  doc.moveDown(0.6)
})

// ==================== FOOTER ====================
doc.fontSize(9).fillColor(colors.textMuted)
  .text('NetSec Visual Analyzer | Professional Documentation v3.0', 50, doc.page.height - 40, { align: 'left', width: 495 })
doc.fontSize(8)
  .text(`Generated: ${new Date().toLocaleDateString()} | © 2024 Development Team`, 50, doc.page.height - 25, { width: 495 })

doc.end()

stream.on('finish', () => {
  const stats = fs.statSync(outputPath)
  console.log(`\n✅ PROFESSIONAL PDF CREATED!\n`)
  console.log(`📄 File: ${outputPath}`)
  console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`)
  console.log(`📅 Created: ${new Date().toLocaleString()}\n`)
})

stream.on('error', (err) => {
  console.error('❌ Error:', err)
  process.exit(1)
})