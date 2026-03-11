# Tanvi Agro Farm - Premium Organic Poultry

A high-end, responsive website for Tanvi Agro Farm, featuring premium organic products, a dynamic logo generation service, and a seamless WhatsApp ordering system.

## Features

*   **Dynamic Logo Generation**: Uses Google Gemini API to create a unique organic practices logo.
*   **WhatsApp Ordering**: Integrated order form that constructs a detailed message for direct WhatsApp ordering.
*   **Responsive Design**: Fully optimized for mobile, tablet, and desktop.
*   **Gallery & FAQ**: Showcases farm life and addresses common customer queries.
*   **SEO Optimized**: Includes sitemap, robots.txt, and optimized meta tags.

## Deployment Guide (Vercel)

Since you are experiencing GitHub synchronization issues, follow these steps for a reliable manual deployment:

1.  **Export Project**: Use the "Export to ZIP" feature in the AI Studio settings menu.
2.  **Extract & Initialize Git**:
    ```bash
    unzip project.zip
    cd project
    git init
    git add .
    git commit -m "Initial commit"
    ```
3.  **Push to GitHub**: Create a new repository on GitHub and push your code.
4.  **Import to Vercel**: Connect your GitHub repository to Vercel.
5.  **Configure Environment Variables**:
    *   `GEMINI_API_KEY`: **Required** for the organic logo generation feature.
6.  **Deploy**: Vercel will automatically build and deploy your application.

## Local Development

1.  Install dependencies: `npm install`
2.  Start dev server: `npm run dev`
3.  Build for production: `npm run build`
