# Quick Start Guide - Self-Control Dashboard

## 🚀 Getting Started (30 seconds)

```bash
# 1. Start the dashboard
cd "d:\device owner project\frontend-management"
npm run dev

# 2. Open browser
# Navigate to: http://localhost:3000

# 3. Login
# Email: admin@selfcontrol.com
# Password: [your password]
```

## 📱 Main Features

### Dashboard Home (`/dashboard`)
- Overview of all devices
- Quick stats (total, restricted, online)
- Device cards with status indicators

### Devices (`/dashboard/devices`)
- List all registered devices
- Click device → See details
- Quick actions: Manage Apps, URLs, Settings

### App Management (`/dashboard/apps/[device_id]`)
- **Block apps**: Prevent app from launching
- **Lock apps**: Prevent uninstallation
- Search functionality
- Instant updates

### URL Blacklist (`/dashboard/urls/[device_id]`)
- Add URL patterns (e.g., `reddit.com`, `*.gambling.*`)
- Remove URLs
- Optional descriptions

### Approval Requests (`/dashboard/requests`)
- **Live countdown timers** ⏱️
- Approve/Deny with notes
- Auto-refresh every 10s
- Filter by status

### Violations (`/dashboard/violations`)
- Monitor policy violations
- Filter by device
- Detailed violation info

### Settings (`/dashboard/settings/[device_id]`)
- Cooldown period (hours)
- Admin approval toggle
- VPN always-on
- Factory reset prevention

## 🔑 Key Components

| Component | Purpose |
|-----------|---------|
| `AuthContext` | Manages login state & token |
| `DeviceContext` | Caches device list |
| `Navigation` | Sidebar menu |
| `Header` | Top bar with logout |
| `DeviceCard` | Device status card |
| `AppRow` | App with block/lock toggles |
| `RequestCard` | Request with countdown timer |

## 🌐 API Endpoints Used

```typescript
// Auth
POST /api/auth/login
POST /api/auth/verify

// Devices
GET /api/management/devices
GET /api/management/apps/:device_id

// Policies
POST /api/management/app/policy
POST /api/management/url/add
DELETE /api/management/url/:id
GET /api/management/urls/:device_id

// Requests
GET /api/management/requests
PATCH /api/management/request/:id

// Violations
GET /api/management/violations

// Settings
PATCH /api/management/settings/:device_id
```

## 🎨 UI Patterns

### Loading States
```typescript
{isLoading && <LoadingSpinner size="lg" text="Loading..." />}
```

### Error Handling
```typescript
{error && (
  <div className="bg-red-50 ...">
    <AlertCircle />
    <p>{error}</p>
  </div>
)}
```

### Success Messages
```typescript
{successMessage && (
  <div className="bg-green-50 ...">
    <p>{successMessage}</p>
  </div>
)}
```

### Optimistic Updates
```typescript
// Update UI immediately
setApps(prev => prev.map(a => 
  a.id === app.id ? { ...a, is_blocked: true } : a
));

// Then sync with backend
await policyApi.updateAppPolicy(...);
```

## 🔧 Common Tasks

### Add a new page
1. Create file in `app/dashboard/[name]/page.tsx`
2. Add route to `Navigation.tsx`
3. Implement with TypeScript types from `lib/types.ts`

### Add a new API endpoint
1. Add function to `lib/api.ts`
2. Add TypeScript types to `lib/types.ts`
3. Use in component with error handling

### Style a component
```typescript
// Use Tailwind classes
className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"

// Dark mode
className="text-gray-900 dark:text-white"
```

## 🐛 Debug Tips

### Check auth state
```typescript
// In any component
const { user, token, isAuthenticated } = useAuth();
console.log({ user, token, isAuthenticated });
```

### Check API calls
```typescript
// All API calls log to console
// Check Network tab in DevTools
```

### Check device cache
```typescript
const { devices } = useDevices();
console.log('Cached devices:', devices);
```

## 📦 File Locations

```
Key files you'll edit most:

📄 API Client:        src/lib/api.ts
📄 Types:             src/lib/types.ts
📄 Auth Context:      src/context/AuthContext.tsx
📄 Navigation:        src/components/Navigation.tsx
📄 Dashboard Home:    app/dashboard/page.tsx
📄 Requests Page:     app/dashboard/requests/page.tsx
```

## 🎯 Testing Checklist

- [ ] Login works
- [ ] Dashboard shows devices
- [ ] Can block/unblock apps
- [ ] Can add/remove URLs
- [ ] Approval requests show countdown
- [ ] Can approve/deny requests
- [ ] Violations display correctly
- [ ] Settings save successfully
- [ ] Logout works
- [ ] Responsive on mobile

## 💡 Pro Tips

1. **Use Context7 for Next.js docs**: Already integrated!
2. **Optimistic updates**: Update UI first, sync later
3. **Loading states**: Always show feedback
4. **Error handling**: Catch all API errors
5. **TypeScript**: Use strict types everywhere
6. **Dark mode**: Test both themes
7. **Mobile**: Test responsive design
8. **Auto-refresh**: Requests page refreshes every 10s

---

**Need help?** Check the main README.md for full documentation.
