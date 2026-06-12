# Deployment Guide

Complete guide to deploy CollegeConnect platform.

## 🚀 Quick Deploy

### Frontend to Vercel (Recommended - 5 minutes)

#### Method 1: Using Vercel Dashboard
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Vercel auto-detects Vite configuration
6. Click "Deploy"
7. Done! 🎉

#### Method 2: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

Your app will be live at: `https://your-app.vercel.app`

### Backend to Cloudflare Workers (10-15 minutes)

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for detailed instructions.

## 📋 Pre-deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors
- [ ] Environment variables configured
- [ ] Update API URLs for production
- [ ] Test on different devices/browsers

## 🌐 Custom Domain Setup

### Vercel
1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

### Cloudflare Workers
1. Go to Workers & Pages
2. Select your worker
3. Click "Triggers" > "Custom Domains"
4. Add your domain
5. DNS configured automatically

## 🔧 Environment Variables

### Vercel
1. Go to Project Settings > Environment Variables
2. Add variables:
   ```
   VITE_API_URL=https://your-worker.workers.dev
   ```
3. Redeploy for changes to take effect

## 📊 Performance Optimization

### Already Implemented
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Tree shaking
- ✅ Minification
- ✅ Gzip compression

### Additional Optimizations
```bash
# Analyze bundle size
npm run build
npx vite-bundle-visualizer
```

## 🔒 Security Checklist

- [ ] Environment variables in Vercel (not in code)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Input validation on forms
- [ ] XSS protection (React handles this)
- [ ] CSRF tokens for API calls

## 📈 Monitoring & Analytics

### Vercel Analytics (Free)
1. Go to Analytics tab in Vercel dashboard
2. Enable Web Analytics
3. View real-time and historical data

### Custom Analytics
Add to your app:
```typescript
// Google Analytics
VITE_GA_ID=G-XXXXXXXXXX

// Sentry Error Tracking
VITE_SENTRY_DSN=https://...
```

## 🔄 CI/CD Pipeline

### Automatic with Vercel
- ✅ Auto-deploy on git push
- ✅ Preview deployments for PRs
- ✅ Production deployments for main branch
- ✅ Rollback capability

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🌍 Multi-region Deployment

### Vercel Edge Network
- Automatically deployed to global CDN
- Edge functions for low latency
- 70+ edge locations worldwide

### Cloudflare Workers
- Runs in 275+ data centers
- <50ms latency worldwide
- Automatic geographic routing

## 📱 Progressive Web App (PWA)

To make your app installable:

1. Add `vite-plugin-pwa`:
```bash
npm install -D vite-plugin-pwa
```

2. Update `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CollegeConnect',
        short_name: 'CollegeConnect',
        theme_color: '#2563eb',
        icons: [/* ... */]
      }
    })
  ]
});
```

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables Not Working
- Ensure they start with `VITE_`
- Restart dev server after adding
- Check Vercel dashboard for production

### 404 on Refresh
Vercel handles this automatically with Vite.
For other hosts, add `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 💡 Post-deployment Tasks

1. **Test Everything**
   - [ ] All pages load correctly
   - [ ] Forms submit properly
   - [ ] Authentication works
   - [ ] Mobile responsive

2. **SEO Setup**
   - [ ] Add meta tags
   - [ ] Create sitemap.xml
   - [ ] Submit to Google Search Console
   - [ ] Add robots.txt

3. **Performance**
   - [ ] Run Lighthouse audit
   - [ ] Check Core Web Vitals
   - [ ] Test on slow connections

4. **Monitoring**
   - [ ] Set up error tracking
   - [ ] Configure analytics
   - [ ] Set up uptime monitoring

## 📞 Support

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

### Cloudflare Support
- Documentation: https://developers.cloudflare.com/
- Community: https://community.cloudflare.com/

## 🎯 Cost Breakdown

### Free Tier (Perfect for Starting)
- **Vercel**: Free for personal projects
  - Unlimited deployments
  - Unlimited bandwidth
  - Automatic HTTPS
  - 100GB bandwidth/month

- **Cloudflare Workers**: Free tier includes
  - 100,000 requests/day
  - 10ms CPU time per request
  - Enough for thousands of users

### Paid Tier (For Growth)
- **Vercel Pro**: $20/month
  - Team collaboration
  - Advanced analytics
  - More build minutes

- **Cloudflare Workers Paid**: $5/month
  - 10 million requests
  - 50ms CPU time
  - Priority support

**Total Cost**: $0-25/month depending on scale

## 🚀 Scaling Strategy

### Phase 1: MVP (Free)
- Vercel Free Tier
- Cloudflare Workers Free Tier
- Expected: 0-1000 users

### Phase 2: Growth ($25/month)
- Vercel Pro
- Cloudflare Workers Paid
- Expected: 1000-10000 users

### Phase 3: Scale ($100+/month)
- Vercel Enterprise
- Cloudflare Workers Enterprise
- Multiple regions
- Advanced caching
- Expected: 10000+ users

## ✅ Launch Checklist

- [ ] Code reviewed and tested
- [ ] Build successful
- [ ] Environment variables set
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Analytics enabled
- [ ] Error tracking setup
- [ ] Performance optimized
- [ ] SEO basics implemented
- [ ] Social media cards added
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team access granted

## 🎉 Going Live!

```bash
# Final checks
npm run build
npm run preview

# Deploy to production
vercel --prod

# Celebrate! 🎊
```

---

Need help? Check out the documentation or open an issue!
