const fs = require('fs')
const path = require('path')
const PptxGenJS = require('pptxgenjs')

const rootDir = path.resolve(__dirname, '..')
const outputPath = path.join(rootDir, 'docs', 'NetSec-Visual-Analyzer-Overview-portrait-centered.pptx')
const screenshotDir = path.join(rootDir, 'docs', 'screenshots')

function imagePath(name) {
  const filePath = path.join(screenshotDir, name)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing screenshot asset: ${filePath}`)
  }

  return filePath
}

function addSlideTitle(slide, title, subtitle) {
  slide.addText(title, {
    x: 0.4,
    y: 0.28,
    w: 6.7,
    h: 0.42,
    fontFace: 'Aptos Display',
    fontSize: 24,
    bold: true,
    color: 'F5FAFF',
    margin: 0,
  })

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.4,
      y: 0.68,
      w: 6.7,
      h: 0.3,
      fontFace: 'Aptos',
      fontSize: 10.5,
      color: 'B8C4D6',
      margin: 0,
    })
  }
}

function addFooter(slide, text) {
  slide.addText(text, {
    x: 0.4,
    y: 9.42,
    w: 6.7,
    h: 0.18,
    fontFace: 'Aptos',
    fontSize: 8,
    color: '91A3B7',
    align: 'right',
    margin: 0,
  })
}

function addBulletCard(slide, x, y, w, h, title, body, accent) {
  slide.addShape('roundRect', {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    line: { color: accent, pt: 1.25 },
    fill: { color: '0F172A', transparency: 6 },
    shadow: { type: 'outer', color: '000000', angle: 45, blur: 1, distance: 1, opacity: 0.12 },
  })

  slide.addText(title, {
    x: x + 0.16,
    y: y + 0.12,
    w: w - 0.32,
    h: 0.24,
    fontFace: 'Aptos',
    fontSize: 15,
    bold: true,
    color: accent,
    margin: 0,
  })

  slide.addText(body, {
    x: x + 0.16,
    y: y + 0.41,
    w: w - 0.32,
    h: h - 0.5,
    fontFace: 'Aptos',
    fontSize: 10.5,
    color: 'E2E8F0',
    breakLine: false,
    margin: 0,
    valign: 'top',
  })
}

function addScreenshotSlide(slide, title, subtitle, fileName, footer) {
  slide.addShape('roundRect', {
    x: 0.12,
    y: 0.12,
    w: 7.26,
    h: 9.76,
    rectRadius: 0.03,
    line: { color: '0F172A', pt: 1 },
    fill: { color: '07111F' },
  })

  slide.addShape('roundRect', {
    x: 0.3,
    y: 0.3,
    w: 6.9,
    h: 0.92,
    rectRadius: 0.03,
    line: { color: '111827', pt: 1 },
    fill: { color: '0B1220', transparency: 8 },
  })

  slide.addText(title, {
    x: 0.52,
    y: 0.46,
    w: 4.9,
    h: 0.26,
    fontFace: 'Aptos Display',
    fontSize: 18,
    bold: true,
    color: 'F8FAFC',
    margin: 0,
  })

  slide.addText(subtitle, {
    x: 0.52,
    y: 0.76,
    w: 6.1,
    h: 0.18,
    fontFace: 'Aptos',
    fontSize: 8.5,
    color: 'B8C4D6',
    margin: 0,
  })

  slide.addImage({
    path: imagePath(fileName),
    x: 0.32,
    y: 1.35,
    w: 6.86,
    h: 8.0,
    sizing: {
      type: 'cover',
      x: 0.32,
      y: 1.35,
      w: 6.86,
      h: 8.0,
    },
  })

  // subtle inner border to visually frame the image
  slide.addShape('rect', {
    x: 0.3,
    y: 1.33,
    w: 6.9,
    h: 8.04,
    line: { color: '0F172A', pt: 0.75 },
    fill: { color: '000000', transparency: 100 },
  })

  addFooter(slide, footer)
}

async function main() {
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'CUSTOM_PORTRAIT', width: 7.5, height: 10 })
  pptx.layout = 'CUSTOM_PORTRAIT'
  pptx.author = 'GitHub Copilot'
  pptx.company = 'NetSec Visual Analyzer'
  pptx.subject = 'Project overview and real-world usage'
  pptx.title = 'NetSec Visual Analyzer'
  pptx.lang = 'en-US'
  pptx.theme = {
    headFontFace: 'Aptos Display',
    bodyFontFace: 'Aptos',
    lang: 'en-US',
  }

  const cover = pptx.addSlide()
  cover.background = { color: '07111F' }

  cover.addShape('rect', {
    x: 0,
    y: 0,
    w: 7.5,
    h: 10,
    line: { color: '07111F', transparency: 100 },
    fill: { color: '07111F' },
  })

  cover.addShape('rect', {
    x: 0,
    y: 0,
    w: 7.5,
    h: 0.14,
    line: { color: '38BDF8', transparency: 100 },
    fill: { color: '38BDF8' },
  })

  cover.addShape('rect', {
    x: 0,
    y: 9.86,
    w: 7.5,
    h: 0.14,
    line: { color: '8B5CF6', transparency: 100 },
    fill: { color: '8B5CF6' },
  })

  cover.addText('NetSec Visual Analyzer', {
    x: 0.42,
    y: 0.92,
    w: 5.8,
    h: 0.5,
    fontFace: 'Aptos Display',
    fontSize: 23,
    bold: true,
    color: 'F8FAFC',
    margin: 0,
  })

  cover.addText('DNS security analysis, threat intelligence, and audit reporting', {
    x: 0.42,
    y: 1.46,
    w: 6.2,
    h: 0.35,
    fontFace: 'Aptos',
    fontSize: 12,
    color: '94A3B8',
    margin: 0,
  })

  cover.addText('What the project does', {
    x: 0.42,
    y: 2.2,
    w: 3.3,
    h: 0.3,
    fontFace: 'Aptos',
    fontSize: 15,
    bold: true,
    color: '38BDF8',
    margin: 0,
  })

  cover.addText('The app checks domain security signals, explains the score in plain language, compares sites side by side, and keeps a visible audit trail for follow-up analysis.', {
    x: 0.42,
    y: 2.5,
    w: 6.45,
    h: 0.95,
    fontFace: 'Aptos',
    fontSize: 13,
    color: 'E2E8F0',
    margin: 0,
    valign: 'top',
  })

  addBulletCard(
    cover,
    0.42,
    3.75,
    2.1,
    1.25,
    'Security teams',
    'Quickly judge whether DNSSEC, SPF, and DMARC are configured well enough to reduce spoofing risk.',
    '38BDF8'
  )

  addBulletCard(
    cover,
    2.63,
    3.75,
    2.1,
    1.25,
    'IT admins',
    'Spot missing records, weak policy settings, and trending changes before they become incidents.',
    '8B5CF6'
  )

  addBulletCard(
    cover,
    4.84,
    3.75,
    2.2,
    1.25,
    'Real-world value',
    'Useful for security reviews, phishing defense, board reporting, MSP audits, and pre-launch domain checks.',
    '10B981'
  )

  cover.addText('Includes live result explanations and output screenshots from the running app.', {
    x: 0.42,
    y: 5.35,
    w: 6.45,
    h: 0.3,
    fontFace: 'Aptos',
    fontSize: 11.5,
    color: 'B8C4D6',
    italic: true,
    margin: 0,
  })

  const valueSlide = pptx.addSlide()
  valueSlide.background = { color: '0B1220' }
  addSlideTitle(valueSlide, 'Why It Matters', 'The app turns DNS data into decisions that non-specialists can understand.')

  addBulletCard(valueSlide, 0.4, 1.35, 2.15, 1.6, 'Phishing defense', 'Helps identify weak SPF or DMARC settings that attackers can exploit for spoofed email campaigns.', 'F59E0B')
  addBulletCard(valueSlide, 2.72, 1.35, 2.15, 1.6, 'Trust and integrity', 'Shows whether DNSSEC is present, which protects DNS answers from tampering and cache poisoning.', '38BDF8')
  addBulletCard(valueSlide, 5.04, 1.35, 2.05, 1.6, 'Operational visibility', 'Stores history so a team can compare audits over time instead of relying on a single point-in-time result.', '10B981')

  valueSlide.addText('Typical usage', {
    x: 0.4,
    y: 3.28,
    w: 2,
    h: 0.24,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: '38BDF8',
    margin: 0,
  })

  valueSlide.addText('1. Check a domain on the dashboard.\n2. Compare it with another site.\n3. Review the history page for prior audits.\n4. Open the threat feed to see live phishing indicators.\n5. Use the explanation page to understand why the score changed.', {
    x: 0.4,
    y: 3.58,
    w: 3.15,
    h: 2.0,
    fontFace: 'Aptos',
    fontSize: 12.5,
    color: 'E2E8F0',
    margin: 0,
    breakLine: false,
    valign: 'top',
  })

  valueSlide.addShape('roundRect', {
    x: 3.75,
    y: 3.55,
    w: 3.3,
    h: 2.05,
    rectRadius: 0.08,
    line: { color: '1F2937', pt: 1 },
    fill: { color: '111827' },
  })

  valueSlide.addText('Score model summary', {
    x: 3.95,
    y: 3.75,
    w: 2.8,
    h: 0.2,
    fontFace: 'Aptos',
    fontSize: 14,
    bold: true,
    color: 'E2E8F0',
    margin: 0,
  })

  valueSlide.addText('Base score + DNSSEC + SPF + DMARC + MX coverage = a transparent score that can be explained to technical and non-technical users.', {
    x: 3.95,
    y: 4.12,
    w: 2.9,
    h: 1.2,
    fontFace: 'Aptos',
    fontSize: 12,
    color: 'B8C4D6',
    margin: 0,
    valign: 'top',
  })

  const flowSlide = pptx.addSlide()
  flowSlide.background = { color: '07111F' }
  addSlideTitle(flowSlide, 'How the App Works', 'The app takes a domain, runs live checks, then turns the results into a visual story.')

  const flowSteps = [
    ['Input', 'Domain entered by user'],
    ['Fetch', 'Live DNS and threat data'],
    ['Analyze', 'DNSSEC, SPF, DMARC, MX checks'],
    ['Score', 'Weighted result and status labels'],
    ['Explain', 'Simple reasons and history'],
  ]

  flowSteps.forEach((step, index) => {
    const x = 0.4
    const y = 1.28 + index * 1.35
    flowSlide.addShape('roundRect', {
      x,
      y,
      w: 2.85,
      h: 1.0,
      rectRadius: 0.08,
      line: { color: index % 2 === 0 ? '38BDF8' : '8B5CF6', pt: 1.1 },
      fill: { color: '111827' },
    })
    flowSlide.addText(step[0], {
      x: x + 0.14,
      y: y + 0.14,
      w: 1.0,
      h: 0.2,
      fontFace: 'Aptos',
      fontSize: 13,
      bold: true,
      align: 'center',
      color: 'F8FAFC',
      margin: 0,
    })
    flowSlide.addText(step[1], {
      x: x + 0.14,
      y: y + 0.42,
      w: 2.55,
      h: 0.4,
      fontFace: 'Aptos',
      fontSize: 9.5,
      align: 'center',
      color: 'B8C4D6',
      margin: 0,
    })
  })

  flowSlide.addText('1', { x: 3.45, y: 1.6, w: 0.25, h: 0.2, fontFace: 'Aptos', fontSize: 11, bold: true, color: '38BDF8', margin: 0 })
  flowSlide.addText('2', { x: 3.45, y: 2.95, w: 0.25, h: 0.2, fontFace: 'Aptos', fontSize: 11, bold: true, color: '38BDF8', margin: 0 })
  flowSlide.addText('3', { x: 3.45, y: 4.3, w: 0.25, h: 0.2, fontFace: 'Aptos', fontSize: 11, bold: true, color: '38BDF8', margin: 0 })
  flowSlide.addText('4', { x: 3.45, y: 5.65, w: 0.25, h: 0.2, fontFace: 'Aptos', fontSize: 11, bold: true, color: '38BDF8', margin: 0 })
  flowSlide.addText('5', { x: 3.45, y: 7.0, w: 0.25, h: 0.2, fontFace: 'Aptos', fontSize: 11, bold: true, color: '38BDF8', margin: 0 })

  flowSlide.addText('The same analysis engine feeds the dashboard, compare page, history page, threat feed, and the result explanation page, so the UI stays consistent.', {
    x: 3.72,
    y: 1.28,
    w: 3.2,
    h: 0.72,
    fontFace: 'Aptos',
    fontSize: 11.5,
    color: 'E2E8F0',
    margin: 0,
  })

  flowSlide.addText('This is useful for audits, executive summaries, and practical security reviews where the team needs both the number and the reason behind it.', {
    x: 3.72,
    y: 2.82,
    w: 3.2,
    h: 0.72,
    fontFace: 'Aptos',
    fontSize: 11.5,
    color: 'B8C4D6',
    margin: 0,
  })

  const screenshotSlides = [
    ['Dashboard Overview', 'Main score, control breakdown, and network view.', 'screencapture-localhost-3000-2026-05-22-10_40_42.png', 'Dashboard screenshot captured from the running app.'],
    ['Domain Comparison', 'Compare two domains side by side to see which one is stronger.', 'screencapture-localhost-3000-compare-2026-05-22-10_41_44.png', 'Comparison view used for risk evaluation.'],
    ['Audit History', 'Track previous scans and review changes over time.', 'screencapture-localhost-3000-history-2026-05-22-10_45_06.png', 'History view used for audit trails and repeat checks.'],
    ['Terms Guide', 'Explain the labels and terms used across graphs and tables.', 'screencapture-localhost-3000-terms-2026-05-22-10_45_20.png', 'Terms guide view used as a glossary for the app.'],
    ['Threat Intelligence', 'Live phishing feed to connect domain posture with active threats.', 'screencapture-localhost-3000-threats-2026-05-22-10_44_44.png', 'Threat feed view shown with the full browser viewport.'],
    ['Why These Results?', 'Plain-language explanations that show how the score was derived.', 'screencapture-localhost-3000-why-results-2026-05-22-10_45_37.png', 'Explanation page that connects the score to the live checks behind it.'],
  ]

  screenshotSlides.forEach(([title, subtitle, fileName, footer]) => {
    const slide = pptx.addSlide()
    slide.background = { color: '07111F' }
    addScreenshotSlide(slide, title, subtitle, fileName, footer)
  })

  const closing = pptx.addSlide()
  closing.background = { color: '0B1220' }
  addSlideTitle(closing, 'Wrap-Up', 'NetSec Visual Analyzer turns DNS data into an actionable security story.')

  addBulletCard(closing, 0.55, 1.65, 4.1, 1.55, 'Project strength', 'Clear visuals, accurate scoring, live threat context, and a dedicated explanation page make the app easier to understand than a raw report.', '38BDF8')
  addBulletCard(closing, 5.2, 1.65, 4.25, 1.55, 'Real-world usage', 'Useful for security teams, MSPs, compliance reviews, and anyone who needs to explain DNS posture without reading raw records.', '10B981')

  closing.addText('The presentation deck and all screenshots are saved in the docs folder.', {
    x: 0.42,
    y: 4.0,
    w: 6.45,
    h: 0.25,
    fontFace: 'Aptos',
    fontSize: 12,
    color: 'B8C4D6',
    margin: 0,
  })

  closing.addText('Output file: docs/NetSec-Visual-Analyzer-Overview.pptx', {
    x: 0.42,
    y: 4.35,
    w: 6.45,
    h: 0.25,
    fontFace: 'Aptos',
    fontSize: 12,
    color: 'F8FAFC',
    bold: true,
    margin: 0,
  })

  await pptx.writeFile({ fileName: outputPath })
  console.log(`Presentation written to ${outputPath}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})