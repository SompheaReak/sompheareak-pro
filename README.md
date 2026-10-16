# Somphea Reak Studio – Customer Storefront (Web & Mobile)

> **Cambodia Kingdom of Wonder • Premium Collectibles, Toys & Customizable Italy Charm Jewelry**  
> Modern, luxury cross-platform storefront built with React Native and Expo (Web, iOS, Android).

---

## 🌟 Key Features

- **Interactive 9mm Italian Charm Bracelet Builder**: Real-time visual charm linking, link expansion/removal, and dynamic wrist preview.
- **Catalog & Big Category Browsing**: Smooth browsing with category filters, search, and instant modal previews.
- **Cart & Direct Checkout**: Voucher selector, auto point calculations, and seamless Telegram receipt integration.
- **Bilingual & Adaptive Dark Mode**: High-contrast luxury styling in Khmer (ភាសាខ្មែរ) and English with instant theme transitions.
- **Universal Web Deployment**: Zero-config export ready for Vercel, Netlify, Cloudflare Pages, or any static host.

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
# Launch on web (default: http://localhost:8081)
npm run web

# Or launch Expo bundler for iOS/Android/Web
npm start
```

---

## 🌐 Deploy as a Website

### Option 1: Render (Recommended — Zero-Config Blueprint)
1. Push this repository to GitHub (`sompheareak-pro`).
2. Go to [Render Dashboard](https://dashboard.render.com/) > **New** > **Blueprint** (or **Static Site**).
3. Connect your `sompheareak-pro` repository.
4. Render automatically applies the included `render.yaml`:
   - **Service Type**: Static Site
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **SPA Route Rewrite**: `/* -> /index.html` (prevents 404 on sub-routes)
5. *(Optional)* Set Environment Variable in Render:
   - `EXPO_PUBLIC_API_URL`: Your backend API URL (e.g. `https://sompheareak-api.onrender.com`)
6. Click **Apply** / **Create Static Site**!

### Option 2: Vercel
1. Push this repository to GitHub (`sompheareak-pro`).
2. Go to [Vercel Dashboard](https://vercel.com/new) and import your `sompheareak-pro` repository.
3. Vercel automatically detects the build configuration via `vercel.json`:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. *(Optional)* Add Environment Variable:
   - `EXPO_PUBLIC_API_URL`: Your backend API URL (e.g. `https://api.sompheareak.com`)
5. Click **Deploy**!

### Option 2: Netlify
1. Import repository on [Netlify](https://app.netlify.com/start).
2. The included `netlify.toml` automatically configures:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **SPA Redirects**: `/* -> /index.html`
3. *(Optional)* Set `EXPO_PUBLIC_API_URL` under Site configuration > Environment variables.
4. Click **Deploy site**!

### Option 3: Manual Static Build
```bash
# Export static production website into ./dist
npm run build

# Preview locally
npm run preview
```
Upload the generated `dist/` directory to any static web host, S3, Firebase Hosting, Cloudflare Pages, or GitHub Pages.

---

## ⚙️ Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Base URL of the Somphea Reak API server | Auto-resolves (`http://localhost:5000` or same-origin) |

---

## 📄 License

See [LICENSE](LICENSE) for full proprietary license terms.  
Copyright © 2026 Somphea Reak Studio (សម្ភារៈ). All Rights Reserved.
