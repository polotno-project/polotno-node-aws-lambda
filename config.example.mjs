// DigitalOcean Spaces / AWS S3 configuration
// Copy this file to config.mjs and add your credentials
export const s3Config = {
  region: 'sfo3',
  endpoint: 'https://sfo3.digitaloceanspaces.com',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
  },
};

export const PUBLIC_URL =
  'https://your-bucket.sfo3.cdn.digitaloceanspaces.com/';
