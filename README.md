# MediaSignage SMB - Digital Signage Management System

A modern, user-friendly digital signage management solution built for small and medium businesses. Manage content, create playlists, and control players from a centralized web interface.

## Features

- **User Authentication**: Secure email/password authentication with JWT tokens
- **Content Management**: Upload and organize images and videos
  - Support for JPEG, PNG, MP4 formats
  - Metadata management (name, description, duration, start/end dates)
  - File validation and size management
- **Playlist Management**: Create and organize content playlists
  - Drag-and-drop content ordering
  - Real-time duration and size calculations
  - Easy content assignment
- **Player Management**: Monitor and control digital signage players
  - Assign playlists to players
  - Track player status (online/offline)
  - View last seen timestamps
  - Screenshot monitoring capability

## Technology Stack

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt for password hashing
- **File Handling**: Multer for uploads

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+

## Getting Started

### 1. Database Setup

Create a PostgreSQL database:

```bash
createdb mediasignage
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/mediasignage?schema=public"

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
MediaSignage-SMB/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth & validation
│   │   ├── utils/           # Helper functions
│   │   └── server.ts        # Express app setup
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── uploads/             # Uploaded content storage
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── services/        # API services
│   │   └── types/           # TypeScript types
│   └── public/
└── docs/                    # Documentation
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Content
- `GET /api/content` - List all content
- `POST /api/content` - Upload content
- `GET /api/content/:id` - Get content by ID
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Playlists
- `GET /api/playlists` - List all playlists
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/:id` - Get playlist by ID
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/content` - Add content to playlist
- `DELETE /api/playlists/:id/content/:contentId` - Remove content from playlist

### Players
- `GET /api/players` - List all players
- `POST /api/players` - Create player
- `GET /api/players/:id` - Get player by ID
- `PUT /api/players/:id` - Update player
- `DELETE /api/players/:id` - Delete player
- `POST /api/players/:id/status` - Update player status
- `POST /api/players/:id/screenshot` - Upload player screenshot

## Database Schema

### User
- id, email, password (hashed), name, timestamps

### Content
- id, name, description, type, filePath, fileSize, duration, startDate, endDate, userId, timestamps

### Playlist
- id, name, userId, timestamps

### PlaylistContent (Junction)
- id, playlistId, contentId, order, timestamps

### Player
- id, name, description, playlistId, userId, status, lastSeen, screenshot, timestamps

## Development

### Backend Development

```bash
cd backend
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run db:studio    # Open Prisma Studio (database GUI)
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/mediasignage?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
PORT=3001
NODE_ENV="development"
UPLOAD_DIR="./uploads"
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Session timeouts
- File type validation
- File size limits
- CORS protection
- SQL injection prevention (Prisma ORM)

## Future Enhancements

- Real-time player synchronization with WebSockets
- Advanced scheduling features
- Multi-zone playlist support
- Analytics and reporting
- Cloud storage integration (S3)
- Mobile app for player management
- Template system for quick content creation
- User roles and permissions

## License

ISC

## Support

For issues and questions, please contact the development team.
