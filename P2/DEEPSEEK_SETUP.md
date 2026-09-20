# DeepSeek AI integration

The P2 AI engine is now designed for DeepSeek V4.1 Flash through the model name `deepseek-flash`.

## What it does
One uploaded image is sent to DeepSeek Vision and the server requests JSON containing:
- title
- description
- keywords
- category suggestion
- visible text
- brand/logo detection
- people/property-release attention flag

## Security
The DeepSeek API key MUST stay on the server as `DEEPSEEK_API_KEY`. It must never be placed in `p2/app.js`, HTML, GitHub Pages, or browser local storage.

## Important architecture limit
GitHub Pages can host the P2 frontend, but it cannot safely host this server-side API endpoint. Therefore the DeepSeek endpoint needs a small server runtime. This does not change the frontend workflow or require Floot.

The frontend can later point to the deployed endpoint through a single API-base configuration.

## Current transfer boundary
DeepSeek only handles visual analysis and metadata generation. It does NOT submit metadata or final submissions to Shutterstock, and it does NOT replace the separate image-transfer mechanism.
