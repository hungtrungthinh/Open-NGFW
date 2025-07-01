# Open-NGFW Frontend

Modern Next.js frontend for the Open-NGFW firewall management dashboard.

## Features

- 🎨 **Modern UI**: Built with Next.js 15, TypeScript, and Tailwind CSS
- 🧩 **Component Library**: shadcn/ui components for consistent design
- 📊 **Real-time Dashboard**: Live firewall status and statistics
- 🔄 **Auto-refresh**: Automatic data updates every 30 seconds
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🎯 **Type Safety**: Full TypeScript support with API type definitions

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts (planned)
- **State Management**: React hooks
- **API Client**: Custom fetch-based client

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Rust backend running on `localhost:3000`

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:8080`

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/            # React components
│   └── ui/               # shadcn/ui components
│       ├── badge.tsx
│       ├── button.tsx
│       └── card.tsx
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── package.json         # Dependencies
```

## API Integration

The frontend communicates with the Rust backend through a custom API client:

```typescript
import { apiClient } from '@/lib/api';

// Get firewall status
const status = await apiClient.getStatus();

// Get firewall rules
const rules = await apiClient.getRules();

// Get network interfaces
const interfaces = await apiClient.getInterfaces();

// Get logs with filters
const logs = await apiClient.getLogs({
  log_type: 'system',
  limit: 100
});
```

## Available Scripts

- `npm run dev` - Start development server on port 8080
- `npm run build` - Build for production
- `npm run start` - Start production server on port 8080
- `npm run lint` - Run ESLint

## Development

### Adding New Pages

1. Create a new file in `app/` directory:
   ```typescript
   // app/rules/page.tsx
   export default function RulesPage() {
     return <div>Firewall Rules Management</div>
   }
   ```

2. Add navigation in the sidebar component

### Adding New Components

1. Create component in `components/`:
   ```typescript
   // components/dashboard/StatusCard.tsx
   export function StatusCard({ status }: { status: FirewallStatus }) {
     return <Card>...</Card>
   }
   ```

2. Import and use in pages

### Styling

- Use Tailwind CSS classes for styling
- Follow the design system in `tailwind.config.js`
- Use custom firewall colors: `firewall-primary`, `firewall-secondary`, etc.

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

## Port Configuration

- **Frontend**: `http://localhost:8080`
- **Backend API**: `http://localhost:3000/api`
- **API Proxy**: Frontend proxies `/api/*` requests to backend

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure Rust backend is running on port 3000
   - Check `NEXT_PUBLIC_API_URL` environment variable

2. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check `tsconfig.json` configuration

3. **Styling Issues**
   - Verify Tailwind CSS is properly configured
   - Check `globals.css` imports

4. **Port Already in Use**
   - Check if port 8080 is available
   - Kill any existing processes on port 8080

### Development Tips

- Use React DevTools for debugging
- Enable TypeScript strict mode for better type safety
- Use the Network tab to debug API calls
- Check browser console for errors

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test on different screen sizes
4. Update documentation for new features

## License

Same as the main Open-NGFW project. 