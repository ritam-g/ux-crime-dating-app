# DEPLOYMENT GUIDE: Love.exe Not Responding

Follow these steps to deploy the full stack MERN app to production.

## 1. Environment Setup

### Backend (.env)
You must define the following variables in your production host (Render/Railway/Heroku):
```env
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_string
MISTRAL_API_KEY=your_mistral_api_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public
IMAGEKIT_PRIVATE_KEY=your_imagekit_private
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
```

### Frontend (.env)
You must define these variables in Vercel/Netlify:
```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
VITE_SOCKET_URL=https://your-backend-domain.onrender.com
```

## 2. Backend Deployment (Render)

1. Connect your GitHub repository to Render.
2. Select **Web Service**.
3. Set the Root Directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add all Environment Variables from above.
7. Click **Deploy**.

## 3. Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel.
2. Set the Framework Preset to **Vite**.
3. Set the Root Directory to `frontend`.
4. Ensure the Build Command is `npm run build`.
5. Add `VITE_API_URL` and `VITE_SOCKET_URL` to Environment Variables.
6. Click **Deploy**.

## 4. Production Verifications

### CORS Verification
Ensure `CLIENT_URL` strictly matches your frontend domain (e.g., `https://love-exe.vercel.app`), without a trailing slash. If this is incorrect, login and registration will fail.

### Cookie Security
In production (`NODE_ENV=production`), the JWT cookie sets `Secure: true` and `SameSite: none`. Your frontend MUST be served over `HTTPS` for cookies to stick.

### WebSockets
Socket.io is configured to fallback to long-polling if WebSockets fail. Ensure your hosting provider (like Render) supports WebSockets.

### External Services
- **MongoDB**: Ensure network access allows IPs from your hosting provider (usually `0.0.0.0/0` for serverless).
- **ImageKit**: Verify the URL endpoint exactly matches your dashboard.
- **Mistral AI**: Verify API keys have sufficient quota.
