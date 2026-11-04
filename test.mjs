import fs from 'fs';
import path from 'path';

// Usage: LAMBDA_URL=https://your-function-url node test.mjs design.json
const LAMBDA_URL = process.env.LAMBDA_URL;
const designPath = process.argv[2];
const REPEAT_COUNT = 5;

if (!LAMBDA_URL || !designPath) {
  console.error('Usage: LAMBDA_URL=<function url> node test.mjs <design.json>');
  process.exit(1);
}

// Ensure output directory exists
if (!fs.existsSync('./output')) {
  fs.mkdirSync('./output');
}

// Function to download PDF from URL
async function downloadPDF(url, outputPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buffer));
}

// Function to generate PDF (single test)
async function generatePDF(json, testNum) {
  const startTime = Date.now();

  const requestBody = {
    json: json,
    attrs: {
      pixelRatio: 2,
    },
  };

  const req = await fetch(LAMBDA_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!req.ok) {
    const text = await req.text();
    console.error(`Test ${testNum} failed:`, req.status, req.statusText, text);
    return null;
  }

  const response = await req.json();
  const duration = Date.now() - startTime;

  // Download the PDF
  const outputFilename = `test${testNum}.pdf`;
  const outputPath = path.join('./output', outputFilename);
  await downloadPDF(response.url, outputPath);

  console.log(`Test ${testNum} completed in ${duration}ms - ${outputFilename}`);

  return { testNum, duration, url: response.url, file: outputFilename };
}

// Main function
async function run() {
  const json = JSON.parse(fs.readFileSync(designPath, 'utf8'));

  console.log(`Running ${REPEAT_COUNT} parallel tests\n`);

  const promises = [];
  for (let i = 1; i <= REPEAT_COUNT; i++) {
    promises.push(generatePDF(json, i));
  }

  const overallStart = Date.now();
  const results = await Promise.all(promises);
  const overallDuration = Date.now() - overallStart;

  const successful = results.filter((r) => r !== null);
  const avgDuration =
    successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;

  console.log('\nSummary:');
  console.log(`  Successful: ${successful.length}/${REPEAT_COUNT}`);
  console.log(`  Total time: ${overallDuration}ms`);
  console.log(`  Avg per test: ${avgDuration.toFixed(0)}ms`);
  console.log('\nCheck ./output folder for PDFs');
}

run();
