# Polotno Lambda Example

Example repository showing how to use [polotno-node](https://www.npmjs.com/package/polotno-node) in AWS Lambda to generate PDFs from Polotno JSON templates.

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure credentials**

   ```bash
   cp config.example.mjs config.mjs
   # Edit config.mjs with your S3/Spaces credentials
   ```

3. **Deploy to Lambda**
   ```bash
   npm run zip
   # Upload index.zip to AWS Lambda
   ```

## Lambda Configuration

- **Handler**: `index.handler`
- **Memory**: 2000 MB
- **Timeout**: 60 seconds
- **Environment**: `POLOTNO_API_KEY=your_key`

## API Usage

**Request:**

```json
{
  "json": {
    /* Polotno JSON template */
  },
  "attrs": {
    "pixelRatio": 2
  }
}
```

**Response:**

```json
{
  "url": "https://your-bucket.cdn.digitaloceanspaces.com/lambda/{id}.pdf"
}
```

## Testing

Run parallel tests and download PDFs. `design.json` is any Polotno design, as produced by `store.toJSON()`:

```bash
LAMBDA_URL=https://your-function-url node test.mjs design.json
```

Edit `REPEAT_COUNT` in `test.mjs` to adjust parallel test count. Results saved to `./output` folder.

## How It Works

1. Lambda receives POST request with Polotno JSON
2. Generates PDF using `polotno-node`
3. Uploads to S3/DigitalOcean Spaces
4. Returns public URL

## Links

- [Polotno Documentation](https://polotno.com/docs)
- [polotno-node on npm](https://www.npmjs.com/package/polotno-node)
