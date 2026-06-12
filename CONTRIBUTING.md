# Contributing to CollegeConnect

Thank you for your interest in contributing to CollegeConnect! This document provides guidelines and instructions for contributing.

## 🤝 How to Contribute

### Reporting Bugs
1. Check if the bug already exists in [Issues]
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/device information

### Suggesting Features
1. Check if the feature is already suggested
2. Create an issue with:
   - Clear description of the feature
   - Use case and benefits
   - Potential implementation approach
   - Mockups/wireframes if available

### Submitting Code
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Update documentation
6. Submit a pull request

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/collegeconnect.git

# Navigate to directory
cd collegeconnect

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:5173
```

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new files
- Define proper types/interfaces
- Avoid `any` type
- Use meaningful variable names

```typescript
// Good
interface College {
  id: string;
  name: string;
}

const fetchColleges = async (): Promise<College[]> => {
  // ...
}

// Bad
const fetch = async (): Promise<any> => {
  // ...
}
```

### React Components
- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Add JSDoc comments for complex components

```typescript
/**
 * CollegeCard component displays college information
 * @param college - College data object
 * @param index - Card index for animation delay
 */
interface CollegeCardProps {
  college: College;
  index: number;
}

export default function CollegeCard({ college, index }: CollegeCardProps) {
  // ...
}
```

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use consistent spacing (4, 8, 16, 24, 32px)
- Group related classes

```tsx
// Good
<div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">

// Bad
<div className="p-4 bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
```

### File Organization
```
src/
├── components/     # Reusable components
│   └── ComponentName.tsx
├── pages/         # Page components
│   └── PageName.tsx
├── store/         # State management
│   └── storeName.ts
├── hooks/         # Custom hooks
│   └── useHookName.ts
├── utils/         # Utility functions
│   └── utilName.ts
└── types/         # TypeScript types
    └── index.ts
```

### Naming Conventions
- **Components**: PascalCase (e.g., `CollegeCard.tsx`)
- **Files**: camelCase (e.g., `authStore.ts`)
- **Functions**: camelCase (e.g., `fetchColleges`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_URL`)
- **Types/Interfaces**: PascalCase (e.g., `College`, `User`)

## 🧪 Testing

### Writing Tests
```typescript
import { render, screen } from '@testing-library/react';
import CollegeCard from './CollegeCard';

describe('CollegeCard', () => {
  it('renders college name', () => {
    const college = {
      id: '1',
      name: 'Test College',
      // ...
    };
    
    render(<CollegeCard college={college} index={0} />);
    expect(screen.getByText('Test College')).toBeInTheDocument();
  });
});
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 📋 Pull Request Process

### Before Submitting
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Build succeeds

### PR Title Format
```
type(scope): description

Examples:
feat(colleges): add advanced search filters
fix(auth): resolve login redirect issue
docs(readme): update installation steps
style(navbar): improve mobile responsiveness
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, styling
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How the changes were tested

## Screenshots
If applicable

## Checklist
- [ ] Code follows guidelines
- [ ] Self-reviewed
- [ ] Documented
- [ ] Tests added
- [ ] Tests passing
```

## 🎨 Design Guidelines

### Colors
Use Tailwind color classes:
- Primary: `blue-600`, `purple-600`
- Success: `green-500`
- Warning: `yellow-500`
- Error: `red-500`
- Gray scale: `gray-50` to `gray-900`

### Typography
- Headings: `text-2xl` to `text-5xl`, `font-bold`
- Body: `text-base`, `font-normal`
- Small: `text-sm`, `text-xs`

### Spacing
- Small: `p-2`, `m-2` (8px)
- Medium: `p-4`, `m-4` (16px)
- Large: `p-6`, `m-6` (24px)
- XL: `p-8`, `m-8` (32px)

### Components
- Cards: White background, rounded corners, shadow
- Buttons: Gradient or solid, hover effects
- Inputs: Border, focus ring, proper labels

## 🐛 Debugging

### Common Issues

**Build fails**
```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

**Types not working**
```bash
# Restart TypeScript server in VSCode
Cmd/Ctrl + Shift + P > TypeScript: Restart TS Server
```

**Hot reload not working**
```bash
# Restart dev server
Ctrl + C
npm run dev
```

## 📚 Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Tools
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)

## 🎯 Priority Areas

We especially welcome contributions in:
1. **Performance**: Optimize bundle size, lazy loading
2. **Accessibility**: ARIA labels, keyboard navigation
3. **Testing**: Unit tests, integration tests
4. **Documentation**: Code comments, guides
5. **Features**: Check [FEATURES.md](FEATURES.md) for roadmap

## 💬 Communication

### Questions
- Open an issue with "Question:" prefix
- Join our Discord server (coming soon)
- Email: dev@collegeconnect.com

### Discussions
- Feature requests: GitHub Issues
- General chat: Discord
- Bug reports: GitHub Issues

## 🏅 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Given credit in documentation
- Invited to contributor calls

## 📜 Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

### Enforcement
Report violations to: conduct@collegeconnect.com

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution makes CollegeConnect better. Whether it's:
- Fixing a typo
- Reporting a bug
- Suggesting a feature
- Submitting code
- Improving documentation

**We appreciate your effort!** 🎉

---

Happy Contributing! 🚀
