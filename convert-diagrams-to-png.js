const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function convertDiagramsToPNG() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Set viewport for iPad resolution
  await page.setViewport({
    width: 1024,
    height: 768,
    deviceScaleFactor: 2
  });

  // Load the HTML file
  const htmlPath = path.join(__dirname, 'dashboard.investor-demo.wireframes.html');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0'
  });

  // Wait for Mermaid to render
  await page.waitForTimeout(3000);

  // Define diagrams to capture
  const diagrams = [
    { id: 'diagram1', name: 'dashboard.investor-demo.wireframe.big-numbers-variant' },
    { id: 'diagram2', name: 'dashboard.investor-demo.wireframe.visual-metaphor-variant' },
    { id: 'diagram3', name: 'dashboard.investor-demo.interaction-flow' },
    { id: 'diagram4', name: 'dashboard.investor-demo.tab1-conversion-detail' },
    { id: 'diagram5', name: 'dashboard.investor-demo.drilldown-breakdown' }
  ];

  // Create output directory
  const outputDir = path.join(__dirname, 'dashboard.investor-demo.assets');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Capture each diagram
  for (const diagram of diagrams) {
    try {
      const element = await page.$(`#${diagram.id}`);
      if (element) {
        await element.screenshot({
          path: path.join(outputDir, `${diagram.name}.png`),
          omitBackground: false
        });
        console.log(`✓ Generated ${diagram.name}.png`);
      }
    } catch (error) {
      console.error(`✗ Failed to generate ${diagram.name}.png:`, error);
    }
  }

  // Also create a full page screenshot
  await page.screenshot({
    path: path.join(outputDir, 'dashboard.investor-demo.all-wireframes-combined.png'),
    fullPage: true
  });
  console.log('✓ Generated sos-dashboard-all-wireframes.png');

  await browser.close();
  
  console.log(`\n✅ All diagrams saved to: ${outputDir}`);
  console.log('\nGenerated files:');
  fs.readdirSync(outputDir).forEach(file => {
    if (file.endsWith('.png')) {
      const stats = fs.statSync(path.join(outputDir, file));
      const size = (stats.size / 1024).toFixed(1);
      console.log(`  - ${file} (${size} KB)`);
    }
  });
}

// Run the conversion
convertDiagramsToPNG().catch(console.error);