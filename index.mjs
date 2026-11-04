// import chromium from '@sparticuz/chromium';
// import puppeteer from 'puppeteer-core';
import { createInstance } from 'polotno-node';
import {
  S3Client,
  PutObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { s3Config, PUBLIC_URL } from './config.mjs';

const s3Client = new S3Client(s3Config);

export const handler = async (event) => {
  // let browser;
  try {
    console.log('Starting lambda');
    // browser = await puppeteer.launch({
    //   args: [
    //     ...chromium.args,
    //     '--no-sandbox',
    //     '--hide-scrollbars',
    //     '--disable-web-security',
    //     '--allow-file-access-from-files',
    //     '--disable-dev-shm-usage',
    //     '--disable-gpu',
    //   ],
    //   defaultViewport: chromium.defaultViewport,
    //   executablePath: await chromium.executablePath(),
    //   headless: 'new',
    //   ignoreHTTPSErrors: true,
    //   protocolTimeout: 60 * 60 * 1000,
    // });
    const polotnoInstance = await createInstance({
      key: process.env.POLOTNO_API_KEY,
      // browser,
    });

    // Parse JSON from POST body
    const body =
      typeof event.body === 'string' ? JSON.parse(event.body) : event.body;

    // Extract json and attrs from the body
    const json = body.json || body;
    const attrs = body.attrs || {};

    // Merge default attributes with provided ones
    const pdfAttrs = {
      fontLoadTimeout: 15000,
      ...attrs,
    };

    const pdfBase64 = await polotnoInstance.jsonToPDFBase64(json, pdfAttrs);

    // Generate random ID for this PDF
    const crypto = await import('crypto');
    const randomId = crypto.randomBytes(16).toString('hex');
    const filePath = `lambda/${randomId}.pdf`;

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    const params = {
      Bucket: 'polotno-files',
      Key: filePath,
      Body: pdfBuffer,
      ACL: ObjectCannedACL.public_read,
      ContentType: 'application/pdf',
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const url = `${PUBLIC_URL}${filePath}`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
  }
};
