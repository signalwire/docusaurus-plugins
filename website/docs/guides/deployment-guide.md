---
id: deployment-guide
title: Deployment Guide
sidebar_label: Deployment
---

# Deployment Guide

Learn how to deploy your Docusaurus site to various hosting platforms.

## GitHub Pages

Deploy to GitHub Pages with a single command:

```bash
npm run deploy
```

Configure in `docusaurus.config.js`:

```javascript
module.exports = {
  url: 'https://yourusername.github.io',
  baseUrl: '/your-repo-name/',
  organizationName: 'yourusername',
  projectName: 'your-repo-name',
};
```

## Netlify

Deploy to Netlify with continuous deployment:

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `build`

## Vercel

Deploy with Vercel's zero-config deployment:

```bash
npx vercel
```

## Docker

Create a Dockerfile for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "serve"]
```