# Cincinnati Hotel AI Chatbot - Frontend

A sophisticated React + Vite web application with Material UI for the Cincinnati Hotel AI Chatbot system.

## Features

- **Landing Page**: Role selection between Guest and Administrator
- **Guest Chat Interface**: Real-time conversation with hotel AI assistant
- **Admin Dashboard**: PDF upload and statistics visualization
- **Luxury Aesthetic**: Premium hotel design with gold accents and refined typography
- **Material UI Components**: Professional, accessible interface components
- **TypeScript**: Strict type safety throughout

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and builds
- Material UI (MUI) for components
- React Router for navigation
- Axios for API calls
- Emotion for CSS-in-JS styling

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` if needed (default API URL is `http://localhost:3000`):

```
VITE_API_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

Check code style and quality:

```bash
npm run lint
```

## Project Structure

```
src/
├── theme/
│   └── theme.ts              # Material UI theme customization
├── api/
│   └── client.ts             # API client configuration
├── pages/
│   ├── LandingPage.tsx       # Role selection page
│   ├── UserChat.tsx          # Guest chat interface
│   └── AdminDashboard.tsx    # Admin panel
├── App.tsx                   # Main app component
├── App.css                   # Global styles
└── main.tsx                  # Entry point
```

## API Integration

The frontend communicates with the backend API at `/api`:

### Chat Endpoints
- `POST /api/chat/message` - Send message to chatbot
- `GET /api/chat/history/:sessionId` - Get chat history
- `POST /api/chat/session` - Create new session
- `POST /api/chat/contact-form` - Submit contact form

### Admin Endpoints
- `POST /api/admin/upload-pdf` - Upload hotel information PDF
- `GET /api/admin/statistics` - Get usage statistics

## Design System

### Colors
- **Primary**: Deep Navy (#1a2332)
- **Secondary**: Gold (#d4af37)
- **Background**: Light Gray (#f8f9fa)

### Typography
- **Display**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Components
- Custom Material UI theme with luxury aesthetic
- Refined card designs with subtle borders
- Smooth hover and focus transitions
- Gold accent highlights

## Best Practices

✅ TypeScript strict mode enabled  
✅ No `any` types - explicit type annotations  
✅ Component-based architecture  
✅ API client with interceptors  
✅ Environment-based configuration  
✅ ESLint and Prettier configured  
✅ Responsive Material Design  
✅ Accessibility-first components  

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

---

For backend documentation, see [Backend README](../backend/README.md)
