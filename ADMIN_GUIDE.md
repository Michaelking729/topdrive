# 👑 TOP DRIVE - Admin Access Guide

## 🔑 Admin Login Credentials

### Default Admin Account
```
Email:    admin@topdrive.com
Password: Admin@123
Role:     ADMIN
```

### How to Create Your Own Admin Account
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"youradmin@example.com",
    "password":"YourSecurePassword123",
    "role":"ADMIN"
  }'
```

---

## 🌐 Navigation Links

### Admin Panel URL
```
http://localhost:3000/admin
```

### Quick Access Links
- **Login Page**: http://localhost:3000/login
- **Admin Dashboard**: http://localhost:3000/admin
- **Register New User**: http://localhost:3000/register

---

## 📊 Admin Dashboard Features

### 1. **Metrics Card**
At the top of the admin dashboard, you'll see 4 cards displaying:
- **USERS**: Total registered users (all roles)
- **CLIENTS**: Users with CLIENT role
- **DRIVERS**: Users with DRIVER role
- **RIDES**: Total rides created in the system

### 2. **Users List Section**
Displays all registered users with:
- Email address
- Full name
- Role (CLIENT, DRIVER, or ADMIN)
- Created date

**Filter by role**: Click on role names in the list to filter users
- View only CLIENTs
- View only DRIVERs
- View only ADMINs

### 3. **Rides List Section**
Displays all rides with:
- Pickup location
- Destination
- Current status (REQUESTED, ACCEPTED, ARRIVING, IN_PROGRESS, COMPLETED, CANCELLED)
- Offered price (₦)
- Driver name (if assigned)
- Ride creation date

**Filter by status**: Click on status badges to filter rides
- REQUESTED: Waiting for driver acceptance
- ACCEPTED: Driver accepted, not yet started
- ARRIVING: Driver on the way
- IN_PROGRESS: Trip in progress
- COMPLETED: Finished trips
- CANCELLED: Cancelled rides

---

## 🔌 Admin API Endpoints

### 1. **GET /api/admin/metrics**
Returns system metrics

**Request**:
```bash
curl -X GET http://localhost:3000/api/admin/metrics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "users": 5,
  "clients": 2,
  "drivers": 2,
  "rides": 8
}
```

---

### 2. **GET /api/admin/users**
List all users (filterable by role)

**Request - Get all users**:
```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Request - Filter by role**:
```bash
# Get only CLIENT users
curl -X GET "http://localhost:3000/api/admin/users?role=CLIENT" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only DRIVER users
curl -X GET "http://localhost:3000/api/admin/users?role=DRIVER" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only ADMIN users
curl -X GET "http://localhost:3000/api/admin/users?role=ADMIN" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "users": [
    {
      "id": "user123",
      "email": "client@example.com",
      "name": "John Client",
      "role": "CLIENT",
      "createdAt": "2026-01-19T10:30:00Z"
    },
    {
      "id": "user456",
      "email": "driver@example.com",
      "name": "Jane Driver",
      "role": "DRIVER",
      "createdAt": "2026-01-19T11:00:00Z"
    }
  ]
}
```

---

### 3. **GET /api/admin/rides**
List all rides (filterable by status)

**Request - Get all rides**:
```bash
curl -X GET http://localhost:3000/api/admin/rides \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Request - Filter by status**:
```bash
# Get only completed rides
curl -X GET "http://localhost:3000/api/admin/rides?status=COMPLETED" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only pending requests
curl -X GET "http://localhost:3000/api/admin/rides?status=REQUESTED" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only in-progress rides
curl -X GET "http://localhost:3000/api/admin/rides?status=IN_PROGRESS" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Valid status values**: `REQUESTED`, `ACCEPTED`, `ARRIVING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**Response**:
```json
{
  "rides": [
    {
      "id": "ride123",
      "pickup": "Victoria Island, Lagos",
      "destination": "Lekki Phase 1",
      "city": "Lagos",
      "estimate": 2500,
      "offeredPrice": 3000,
      "status": "COMPLETED",
      "driverName": "Jane Driver",
      "driverLocation": "Lekki",
      "createdAt": "2026-01-19T10:00:00Z"
    }
  ]
}
```

---

## 🔐 Authentication

### Getting Your Admin Token

1. **Register or Login as Admin**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email":"admin@topdrive.com",
       "password":"Admin@123"
     }'
   ```

2. **Response contains your token**:
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "admin123",
       "email": "admin@topdrive.com",
       "role": "ADMIN",
       "name": "Administrator"
     }
   }
   ```

3. **Copy the accessToken** and use it in API requests

### Token Details
- **Expiry**: 15 minutes
- **Stored in**: localStorage (after browser login)
- **Sent in requests**: `Authorization: Bearer {token}`

---

## 🎯 Step-by-Step: First Admin Login

### Via Browser
1. Open http://localhost:3000/register
2. Fill in:
   - Email: `admin@topdrive.com`
   - Password: `Admin@123`
   - Role: Select **ADMIN**
3. Click **Register**
4. You'll be automatically redirected to `/admin`
5. Dashboard will load with metrics and user/ride lists

### Via Terminal (curl)
```bash
# Step 1: Register or Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@topdrive.com","password":"Admin@123"}'

# Step 2: Copy the accessToken from response

# Step 3: Get metrics
curl -X GET http://localhost:3000/api/admin/metrics \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Step 4: Get users
curl -X GET http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Step 5: Get rides
curl -X GET http://localhost:3000/api/admin/rides \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📋 Admin Dashboard Sections

### Header
- **Left**: Shows "Admin Panel" title + logged-in email and role
- **Right**: 
  - **Refresh** button: Reload all data
  - **Logout** button: Sign out and return to login

### Metrics Section
4 cards showing system overview (Users, Clients, Drivers, Rides)

### Users List
- Shows 200 most recent users
- Displays: Email, Name, Role, Created Date
- Red backgrounds for DRIVER roles, Blue for ADMIN

### Rides List
- Shows 200 most recent rides
- Displays: Pickup, Destination, Status, Price, Driver Name, Created Date
- Status color-coded (yellow for REQUESTED, green for COMPLETED, etc)

---

## ⚙️ Admin Permissions

### What ADMIN Role Can Do
✅ View all users (all roles)  
✅ View all rides (all statuses)  
✅ View system metrics  
✅ Filter users by role  
✅ Filter rides by status  
✅ Refresh dashboard data  
✅ Access /admin endpoint  

### What ADMIN Role CANNOT Do (Future)
❌ Delete users (planned for Phase 2)  
❌ Modify ride details (planned for Phase 2)  
❌ Process refunds (planned for Phase 2)  
❌ Adjust pricing (planned for Phase 2)  

---

## 🔒 Security Notes

1. **Tokens expire in 15 minutes** - You'll need to re-login after
2. **Only ADMINs can access /admin** - Returns 403 for other roles
3. **All API calls require Authorization header** - With valid JWT token
4. **Passwords are hashed with bcryptjs** - Never stored in plain text

---

## 🐛 Troubleshooting

### Issue: "Not logged in" error on admin dashboard
**Solution**: Refresh the page or login again with your admin credentials

### Issue: 403 Unauthorized when calling /api/admin/metrics
**Solution**: 
- Check your role is ADMIN (not CLIENT or DRIVER)
- Verify your token is valid
- Ensure Authorization header format: `Bearer {token}`

### Issue: Admin dashboard loads but no data appears
**Solution**:
- Click "Refresh" button
- Check browser console for errors (F12)
- Verify dev server is running: `npm run dev`

### Issue: Can't register as ADMIN
**Solution**: ADMIN role is available to register, just select it in the role dropdown

---

## 📱 Dashboard Views Comparison

| Feature | CLIENT | DRIVER | ADMIN |
|---------|--------|--------|-------|
| View own rides | ✓ | ✓ | ✗ |
| Track ride progress | ✓ | ✓ | ✗ |
| See earnings | ✗ | ✓ | ✗ |
| View all users | ✗ | ✗ | ✓ |
| View all rides | ✗ | ✗ | ✓ |
| View metrics | ✗ | ✗ | ✓ |
| Request rides | ✓ | ✗ | ✗ |
| Accept rides | ✗ | ✓ | ✗ |

---

## 🚀 Next Steps

1. **Login to Admin Dashboard**: http://localhost:3000/admin
2. **Review the 20-test checklist**: [TEST_CHECKLIST.md](TEST_CHECKLIST.md)
3. **Run the admin tests** (Tests 19-21):
   - Test 19: Admin can see all users
   - Test 20: Admin can filter users by role
   - Test 21: Admin can see all rides and filter by status
4. **Explore the API** using curl commands above
5. **Monitor the system** as rides are created and completed

---

## 📞 Quick Reference Card

```
╔════════════════════════════════════════════╗
║         ADMIN QUICK REFERENCE              ║
╠════════════════════════════════════════════╣
║ Email:      admin@topdrive.com             ║
║ Password:   Admin@123                      ║
║ Dashboard:  http://localhost:3000/admin    ║
║                                            ║
║ API Endpoints:                             ║
║ • GET /api/admin/metrics                   ║
║ • GET /api/admin/users?role=CLIENT|DRIVER  ║
║ • GET /api/admin/rides?status=COMPLETED    ║
║                                            ║
║ Token Format: Authorization: Bearer {jwt}  ║
║ Token Expiry: 15 minutes                   ║
╚════════════════════════════════════════════╝
```

