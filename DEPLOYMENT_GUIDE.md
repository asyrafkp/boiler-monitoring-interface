# Deployment Guide

This guide covers deploying the Boiler Operation Monitoring System to various platforms.

## Quick Deploy

### Option 1: Netlify (Easiest)

1. **Connect GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/boiler-monitoring
   git push -u origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select your GitHub repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

3. **Automatic Deploys**
   - Every push to main branch triggers automatic build
   - Netlify generates a unique URL
   - Supports custom domain

### Option 2: Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow Prompts**
   - Confirm project name
   - Set build settings
   - Vercel automatically detects Vite

### Option 3: GitHub Pages

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Create gh-pages Branch**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

3. **Configure Repository**
   - Go to Settings → Pages
   - Select `gh-pages` branch
   - Save

## Production Deployment Checklist

- [ ] Build passes without errors: `npm run build`
- [ ] No console errors or warnings
- [ ] Test in production mode: `npm run preview`
- [ ] Update README.md with deployment URL
- [ ] Configure custom domain (if needed)
- [ ] Set up monitoring/alerts
- [ ] Plan backup strategy for OneDrive data
- [ ] Document environment variables needed

## Environment Setup

### For OneDrive Integration

When deploying with real OneDrive data, configure:

```bash
# Create .env.production
VITE_AZURE_CLIENT_ID=your_azure_client_id
VITE_AZURE_TENANT_ID=your_tenant_id
VITE_ONEDRIVE_FOLDER_URL=your_onedrive_folder_url
```

**Important:** Never commit `.env.production` to version control!

## Platform-Specific Instructions

### AWS S3 + CloudFront

1. **Build the Application**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://boiler-monitoring
   aws s3 sync dist/ s3://boiler-monitoring --delete
   ```

3. **Create CloudFront Distribution**
   - Origin: S3 bucket URL
   - Index document: index.html
   - Error handling: Route 404 to index.html

4. **Update DNS**
   - Point domain to CloudFront distribution

### Azure Static Web Apps

1. **Create Web App**
   ```bash
   az staticwebapp create \
     --name boiler-monitoring \
     --resource-group mygroup \
     --source https://github.com/yourusername/repo
   ```

2. **Configure Build Settings**
   - Build preset: Vite
   - Build location: `dist`

3. **Add Custom Domain**
   ```bash
   az staticwebapp domain create \
     --name boiler-monitoring \
     --domain-name yourdomain.com
   ```

### Docker Deployment

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

**Deploy:**
```bash
docker build -t boiler-monitoring .
docker run -p 80:80 boiler-monitoring
```

## Performance Optimization

### Before Deploying

1. **Run Lighthouse Audit**
   ```bash
   npm run build
   npm run preview
   # Open http://localhost:4173 in Chrome
   # Run Lighthouse audit
   ```

2. **Check Bundle Size**
   ```bash
   npm install -D vite-plugin-visualizer
   ```

3. **Optimize Assets**
   - Images compressed
   - CSS minified
   - JavaScript minified

### Post-Deploy Monitoring

- Set up uptime monitoring
- Monitor error rates
- Track performance metrics
- Alert on failures

## Scaling Considerations

### For High Traffic

1. **Use CDN**
   - Static assets cached globally
   - Faster delivery to users
   - Reduce origin traffic

2. **Enable Gzip Compression**
   - Most hosting platforms do this automatically
   - Can be configured in nginx/Apache

3. **Add Caching Headers**
   ```nginx
   # Cache static assets for 1 year
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## Data Fetching in Production

### OneDrive Integration Strategy

1. **Use Microsoft Graph API**
   - Set up Azure App registration
   - Use OAuth 2.0 flow
   - Token refresh handled automatically

2. **Implement Backend Proxy** (Recommended)
   - Node.js/Express backend
   - Handles Graph API authentication
   - Provides `/api/boiler-data` endpoint

3. **Edge Computing** (Optional)
   - Cloudflare Workers
   - AWS Lambda@Edge
   - Reduce latency

### Example Backend Integration

```javascript
// backend/routes/boiler-data.js
app.get('/api/boiler-data', async (req, res) => {
  try {
    const token = await getGraphAPIToken()
    const file = await fetchFromOneDrive(token)
    const data = parseExcelFile(file)
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})
```

## Monitoring & Maintenance

### Set Up Monitoring

1. **Uptime Monitoring**
   - [UptimeRobot](https://uptimerobot.com)
   - [Pingdom](https://www.pingdom.com)
   - Alert on downtime

2. **Error Tracking**
   - [Sentry](https://sentry.io)
   - [LogRocket](https://logrocket.com)
   - Real-time error alerts

3. **Performance Monitoring**
   - [New Relic](https://newrelic.com)
   - [DataDog](https://www.datadoghq.com)
   - Track metrics over time

### Maintenance Tasks

- **Weekly:** Review error logs
- **Monthly:** Update dependencies
- **Quarterly:** Review performance metrics
- **As Needed:** Hot fixes for critical bugs

## Rollback Procedure

If deployment goes wrong:

### Netlify
```bash
# Automatic rollback available in Netlify dashboard
# Or manually redeploy previous commit
git revert <commit-hash>
git push origin main
```

### Vercel
```bash
vercel rollback
```

### GitHub Pages
```bash
git revert <commit-hash>
git push origin main
```

## Domain & SSL

### Custom Domain Setup

1. **Add Domain to Hosting**
   - Depends on platform (Netlify, Vercel, etc.)
   - Usually automatic after DNS points to platform

2. **SSL Certificate**
   - Most platforms provide automatic SSL
   - Valid certificate immediately
   - Renews automatically

3. **DNS Configuration**
   ```
   CNAME record:
   boiler-monitoring.example.com  →  platform.netlify.com
   ```

## Backup & Disaster Recovery

1. **Git Repository Backup**
   - GitHub Actions auto-backup
   - Or manual: `git clone --mirror`

2. **Build Artifacts**
   - Keep dist/ folder backed up
   - Or rebuild from source anytime

3. **OneDrive Data**
   - Data stored in OneDrive (backed up by Microsoft)
   - App is stateless (no local data)

## Cost Estimation

| Platform | Price | Free Tier |
|----------|-------|-----------|
| Netlify | $19-99/mo | Yes (500MB) |
| Vercel | $20-150/mo | Yes (limits) |
| GitHub Pages | Free | Yes |
| AWS S3 | $0.023/GB | Free tier |
| Azure Static | $0.001/GB | 100GB free |

## Getting Help

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Deployment](https://react.dev/learn/start-a-new-react-project)
- Platform-specific docs (Netlify, Vercel, etc.)

## Next Steps

1. Choose hosting platform
2. Build application: `npm run build`
3. Deploy dist/ folder
4. Test deployed application
5. Set up monitoring
6. Configure OneDrive integration
7. Monitor and maintain
