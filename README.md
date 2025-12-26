# Self-Control Dashboard - Device Management System

A comprehensive Next.js 16 dashboard for managing Android devices with self-control policies. This admin panel allows you to remotely manage app restrictions, URL blacklists, approval requests, and device settings.

## 🚀 Features

### ✅ Authentication
- Secure JWT-based authentication
- Token verification on app load
- Auto-logout on token expiry
- Protected routes with middleware

### 📱 Device Management
- View all registered devices
- Real-time online/offline status
- Device detail pages with statistics
- Policy version tracking

### 📦 App Management
- Block/unblock apps remotely
- Lock apps to prevent uninstallation
- Search and filter apps
- Optimistic UI updates
- Real-time sync with backend

### 🔗 URL Blacklist
- Add URL patterns with wildcard support
- Remove blacklisted URLs
- Pattern-based blocking (e.g., `*.gambling.*`)
- Description notes for each URL

### ✅ Approval Requests
- Review pending requests from devices
- Approve or deny with admin notes
- **Live countdown timers** for cooldown periods
- Auto-refresh every 10 seconds
- Filter by status (pending/approved/denied)

### 🚨 Violation Logs
- Monitor all policy violations
- Filter by device
- Detailed violation information
- Violation type categorization

### ⚙️ Device Settings
- Configure cooldown periods
- Toggle admin approval requirement
- VPN always-on enforcement
- Factory reset prevention

## 📋 Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Auth Storage**: js-cookie + localStorage

## 📁 Project Structure

```
frontend-management/
├── app/
│   ├── layout.tsx                 # Root layout with providers
│   ├── page.tsx                   # Home redirect
│   ├── login/
│   │   └── page.tsx              # Login page
│   └── dashboard/
│       ├── layout.tsx            # Dashboard layout
│       ├── page.tsx              # Dashboard home
│       ├── devices/
│       │   ├── page.tsx          # Devices list
│       │   └── [id]/page.tsx     # Device detail
│       ├── apps/
│       │   └── [device_id]/page.tsx  # App management
│       ├── urls/
│       │   └── [device_id]/page.tsx  # URL blacklist
│       ├── requests/
│       │   └── page.tsx          # Approval requests
│       ├── violations/
│       │   └── page.tsx          # Violation logs
│       └── settings/
│           └── [device_id]/page.tsx  # Device settings
├── src/
│   ├── components/
│   │   ├── Navigation.tsx        # Sidebar navigation
│   │   ├── Header.tsx            # Top header
│   │   ├── DeviceCard.tsx        # Device card component
│   │   ├── AppRow.tsx            # App table row
│   │   ├── RequestCard.tsx       # Request card with countdown
│   │   ├── ProtectedRoute.tsx    # Auth guard
│   │   └── LoadingSpinner.tsx    # Loading component
│   ├── context/
│   │   ├── AuthContext.tsx       # Authentication state
│   │   └── DeviceContext.tsx     # Device cache
│   ├── lib/
│   │   ├── api.ts               # API client & endpoints
│   │   ├── auth.ts              # Auth utilities
│   │   ├── types.ts             # TypeScript types
│   │   └── utils.ts             # Helper functions
│   └── ...
├── .env.local                    # Environment variables
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## 🔧 Installation

### Prerequisites
- Node.js 18+ or Bun
- Backend API running on `http://localhost:3001`

### Steps

1. **Clone or navigate to the project**
   ```bash
   cd "d:\device owner project\frontend-management"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   The `.env.local` file is already created with:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

### Login Credentials
Use the credentials you created during backend registration:
- **Email**: `admin@selfcontrol.com` (or your registered email)
- **Password**: Your password

### Auth Flow
1. App loads → Checks for token in cookies
2. If token exists → Verifies with backend `/api/auth/verify`
3. If valid → Redirects to `/dashboard`
4. If invalid/missing → Redirects to `/login`
5. On 401 error → Auto-logout and redirect to login

## 📡 API Integration

All API calls are centralized in `src/lib/api.ts`:

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify token

### Devices
- `GET /api/management/devices` - Get all devices
- `GET /api/management/apps/:device_id` - Get device apps

### Policies
- `POST /api/management/app/policy` - Update app policy
- `POST /api/management/url/add` - Add URL to blacklist
- `DELETE /api/management/url/:id` - Remove URL
- `GET /api/management/urls/:device_id` - Get blacklisted URLs

### Requests
- `GET /api/management/requests` - Get approval requests
- `PATCH /api/management/request/:id` - Approve/deny request

### Violations
- `GET /api/management/violations` - Get violation logs

### Settings
- `PATCH /api/management/settings/:device_id` - Update device settings

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive tables and grids
- Touch-friendly buttons

### Dark Mode Support
- Full dark mode implementation
- Automatic system preference detection
- Smooth color transitions

### Loading States
- Skeleton screens
- Spinner indicators
- Optimistic UI updates
- Disabled states during API calls

### Error Handling
- User-friendly error messages
- Toast notifications
- Form validation
- Network error recovery

### Real-time Features
- Live countdown timers on approval requests
- Auto-refresh on requests page (10s interval)
- Online/offline device status
- Optimistic updates for instant feedback

## 🧪 Testing the Dashboard

### 1. Login
- Navigate to `http://localhost:3000`
- Enter your admin credentials
- Should redirect to dashboard

### 2. View Devices
- Dashboard shows device cards
- Click on a device to see details
- Check online/offline status

### 3. Manage Apps
- Go to device detail → "Manage Apps"
- Toggle block/lock status
- Search for specific apps
- Changes sync immediately

### 4. Manage URLs
- Go to device detail → "Manage URLs"
- Add URL patterns (e.g., `reddit.com`)
- Remove URLs from blacklist

### 5. Handle Requests
- Submit a request from Android device
- See it appear in "Approval Requests"
- Watch countdown timer
- Approve or deny with notes

### 6. View Violations
- Check "Violations" page
- Filter by device
- See violation details

### 7. Update Settings
- Go to device detail → "Settings"
- Modify cooldown hours
- Toggle policy options
- Save changes

## 🚀 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |

## 🔒 Security Features

- JWT token stored in httpOnly cookies
- CSRF protection
- XSS prevention with React
- Input sanitization
- Secure API communication
- Auto-logout on token expiry

## 🎯 Success Criteria

✅ **All features implemented:**
1. ✅ Login with admin credentials
2. ✅ View device list with status
3. ✅ Device detail pages
4. ✅ Block/lock apps with toggles
5. ✅ Add/remove URL blacklist
6. ✅ Approve/deny requests with countdown
7. ✅ View violation logs
8. ✅ Update device settings
9. ✅ Logout functionality
10. ✅ Responsive design

## 🐛 Troubleshooting

### Port already in use
```bash
# Kill all node processes
taskkill /F /IM node.exe

# Or use a different port
npm run dev -- -p 3001
```

### API connection errors
- Ensure backend is running on `http://localhost:3001`
- Check `.env.local` configuration
- Verify CORS settings on backend

### TypeScript errors
```bash
# Restart TypeScript server in VSCode
Ctrl+Shift+P → "TypeScript: Restart TS Server"
```

## 📚 Additional Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [date-fns](https://date-fns.org/)

## 👨‍💻 Development

### Code Style
- TypeScript strict mode enabled
- ESLint configured
- Consistent component structure
- Proper error handling

### Best Practices
- Async/await for all API calls
- Loading states for all async operations
- Error boundaries
- Optimistic UI updates
- Proper TypeScript typing

## 📄 License

This project is part of the Self-Control Device Management System.

---

**Built with ❤️ using Next.js 16.1.1 and TypeScript**
