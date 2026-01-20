# Production Deployment Checklist

## Pre-Deployment ✓

### Code Ready
- [ ] All features working locally at http://localhost:3000
- [ ] No console errors in browser dev tools
- [ ] Build completes: `npm run build` (check for `✓ built in Xs`)
- [ ] `.gitignore` includes `node_modules/`, `dist/`, `.env`
- [ ] `.env.example` has placeholder values
- [ ] No hardcoded secrets in code
- [ ] All TypeScript types are correct (no `any`)

### Git Repository
- [ ] GitHub repo created and pushed
- [ ] All commits are clean (no API keys in history)
- [ ] README.md exists with setup instructions
- [ ] Main branch is up to date

### Azure Setup
- [ ] App Registration created in Azure Portal
- [ ] Client ID noted (copy to .env)
- [ ] Tenant ID noted (copy to .env)
- [ ] API permissions configured:
  - [ ] Files.Read (OneDrive access)
  - [ ] Sites.Read.All
  - [ ] offline_access
- [ ] Test app works locally with OAuth

---

## Deployment Process

### Step 1: Initialize Git
```bash
cd "d:\Documents\Program created\Boiler Operation Monitoring Interface"
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/boiler-monitoring.git
git push -u origin main
```

### Step 2: Choose Hosting
- **Vercel** (Recommended): Best for Vite/React, free tier generous
  - Go to vercel.com/new → Import GitHub repo
- **Supabase Deployments**: If you want backend integrated
  - Go to app.supabase.com → Deployments → Connect GitHub
- **Netlify**: Alternative, similar to Vercel

### Step 3: Configure Deployment
**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Environment Variables:**
```
VITE_MS_GRAPH_TENANT_ID = your_value
VITE_MS_GRAPH_CLIENT_ID = your_value
```

### Step 4: Deploy & Monitor
- [ ] Trigger deployment (usually automatic on push)
- [ ] Monitor build logs for errors
- [ ] Wait for "Deployment successful" message
- [ ] Get your production URL (e.g., `https://boiler-monitoring.vercel.app`)

### Step 5: Update Azure OAuth
1. Azure Portal → App Registrations → Your App
2. Authentication → Redirect URIs → Add New
3. Add: `https://your-vercel-domain.vercel.app/callback`
4. Save

### Step 6: Test Production
- [ ] Open production URL in browser
- [ ] Login with admin/admin123
- [ ] Login with user/user123
- [ ] Verify logos/images load
- [ ] Check console for errors (F12)
- [ ] Test OneDrive login (if admin account)

---

## Post-Deployment

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket)
- [ ] Monitor deployment logs
- [ ] Check performance metrics
- [ ] Set up uptime monitoring

### Security
- [ ] Review environment variables (not exposed)
- [ ] Verify HTTPS is enforced
- [ ] Set security headers (CSP, X-Frame-Options)
- [ ] Run security audit: `npm audit`
- [ ] Never commit `.env` files

### Optimization
- [ ] Check bundle size: `npm run build` then inspect `dist/`
- [ ] Enable gzip compression
- [ ] Set up CDN caching headers
- [ ] Minify and optimize images

### Documentation
- [ ] Update README with production URL
- [ ] Document environment variables needed
- [ ] Create runbook for troubleshooting
- [ ] Document backup/recovery procedures

---

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Build size | < 500 KB | 479 KB ✓ |
| Gzip size | < 200 KB | 159 KB ✓ |
| Core Web Vitals | Good | TBD |
| First Contentful Paint | < 2s | TBD |
| Lighthouse Score | > 80 | TBD |

---

## Rollback Plan

If deployment has issues:

1. **Revert to previous version:**
   ```bash
   git revert HEAD
   git push origin main
   ```
   (Deployment platform auto-triggers new build)

2. **Quick hotfix:**
   ```bash
   # Fix the bug locally
   git add .
   git commit -m "Hotfix: [description]"
   git push origin main
   ```

3. **Check deployment logs** for specific errors

---

## URLs & Links

- **Production URL:** https://your-domain.vercel.app
- **Azure Portal:** https://portal.azure.com
- **GitHub Repo:** https://github.com/YOUR_USERNAME/boiler-monitoring
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Supabase Dashboard:** https://app.supabase.com

---

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev
- React Docs: https://react.dev
- Microsoft Graph API: https://learn.microsoft.com/en-us/graph

---

## Team Handoff

When sharing with team:
1. Share production URL
2. Provide demo credentials:
   - Admin: admin / admin123
   - User: user / user123
3. Document OneDrive setup steps
4. Provide support contact info

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Version:** _______________
**Status:** ○ In Progress  ○ Deployed  ○ Issues
