# 🎓 CollegeConnect - College Discovery Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.6-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.17-38B2AC.svg)](https://tailwindcss.com/)

A modern, full-featured college discovery and admission management platform built with React, TypeScript, and Tailwind CSS.

**🌐 [Live Demo](#) | 📖 [Documentation](PROJECT_SUMMARY.md) | 🐛 [Report Bug](#) | 💡 [Request Feature](#)**

## 🚀 Features

### For Students
- **Smart College Search** - Find colleges based on courses, location, fees, and rankings
- **Advanced Filters** - Filter by type, location, fees, ratings
- **Save Favorites** - Bookmark colleges for later reference
- **Application Tracking** - Track admission progress in real-time
- **Query Management** - Ask questions and get responses from counselors
- **Detailed College Info** - View comprehensive details, placements, facilities

### For Counselors
- **Student Management** - View and manage assigned students
- **Application Progress** - Track and update application stages
- **Notes & Communication** - Add notes and communicate with students
- **Dashboard Analytics** - View statistics and pending tasks

### For Admins
- **College Management** - Add, edit, and delete colleges
- **Application Review** - Approve or reject applications
- **Query Response** - Respond to student queries
- **Comprehensive Dashboard** - Monitor all platform activities

## 🛠️ Tech Stack

### Frontend (Deployed on Vercel)
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS 4** - Modern utility-first CSS
- **Framer Motion** - Smooth animations and transitions
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management
- **React Query** - Server state management (ready for backend integration)
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form validation
- **Zod** - Schema validation

### Database (Supabase - Now Integrated!)
- **Supabase** - PostgreSQL database with REST API
- **Real-time sync** - Changes reflect immediately
- **Row Level Security** - Secure data access
- See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for configuration

### Backend (Ready for Cloudflare Deployment)
The frontend is ready to integrate with:
- **Cloudflare Workers** - Serverless edge computing
- **Cloudflare D1** - SQLite database at the edge
- **Cloudflare R2** - Object storage for images
- **Hono** - Lightweight web framework

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Vite and deploy

Or use CLI:
```bash
npm install -g vercel
vercel
```

### Backend (Cloudflare Workers) - Coming Soon
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy worker
wrangler deploy
```

## 🎨 Design Features

- **Modern UI** - Clean, professional design with gradients
- **Fully Responsive** - Works on all devices
- **Smooth Animations** - Framer Motion powered transitions
- **Dark Mode Ready** - Easy to implement dark theme
- **Accessible** - WCAG compliant components
- **Fast Performance** - Optimized bundle size and lazy loading

## 📱 Pages

- **Home** - Hero section with search, features, and stats
- **Colleges** - Filterable college listing with cards
- **College Detail** - Comprehensive college information
- **Student Dashboard** - Application tracking and saved colleges
- **Admin Dashboard** - College and application management
- **Counselor Dashboard** - Student guidance and progress tracking
- **Login** - Multi-role authentication

## 🔐 Authentication

Currently using mock authentication for demo purposes. Ready to integrate with:
- Cloudflare Access
- Auth0
- Firebase Auth
- Custom JWT implementation

## 🗄️ Data Structure

The app uses TypeScript interfaces for type safety:
- `College` - College information
- `Application` - Student applications
- `Query` - Student queries
- `User` - User accounts (student/counselor/admin)

## 🎯 Future Enhancements

- [ ] Real-time notifications
- [ ] Payment gateway integration
- [ ] Document upload with OCR
- [ ] AI-powered college recommendations
- [ ] Video counseling sessions
- [ ] Mobile apps (React Native)
- [ ] Email notifications
- [ ] Advanced analytics dashboard

## 🔄 State Management

- **Zustand** for global state (auth, colleges)
- **React Query** ready for server state
- **Local Storage** persistence for auth

## 🎨 Customization

All colors, fonts, and styles can be easily customized in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles
- Component-level styling with Tailwind

## 📊 Performance

- Code splitting with React lazy loading
- Image optimization
- Bundle size optimization
- Edge caching ready

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📚 Documentation

- **[Project Summary](PROJECT_SUMMARY.md)** - Complete project overview
- **[Features List](FEATURES.md)** - All features and roadmap
- **[Deployment Guide](DEPLOYMENT.md)** - How to deploy
- **[Backend Setup](BACKEND_SETUP.md)** - Cloudflare backend setup
- **[API Documentation](API_DOCUMENTATION.md)** - Complete API reference
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

MIT License - Free to use for personal and commercial projects

## 🙏 Acknowledgments

- Tailwind CSS for amazing utilities
- Framer Motion for smooth animations
- Lucide for beautiful icons
- Unsplash for placeholder images

---

Built with ❤️ for students seeking their dream colleges
# degree-difference
