# 🧪 TOP DRIVE - Test Checklist (20 Test Cases)

## ✅ Test Status Tracker

### 🔐 Authentication & Registration (Tests 1-3)

- [ ] **Test 1**: Register CLIENT → Redirect to /dashboard
  - Email valid, password ≥6 chars
  - localStorage has accessToken + user JSON
  - Returns 201 with accessToken

- [ ] **Test 2**: Register DRIVER → Redirect to /driver
  - role = DRIVER in response
  - DriverProfile created in DB

- [ ] **Test 3**: Register ADMIN → Redirect to /admin
  - role = ADMIN
  - Can access /admin panel

---

### 💻 Client Dashboard Features (Tests 4-6)

- [ ] **Test 4**: Dashboard displays all rides
  - Shows total rides count
  - Displays active ride
  - Recent rides list (max 12)

- [ ] **Test 5**: Active ride card shows details
  - Shows pickup → destination
  - Shows current status
  - "Track" button works

- [ ] **Test 6**: Request Ride button works
  - Navigate to /request
  - Create ride with pickup, destination, city, estimate
  - Ride appears in dashboard

---

### 🚗 Driver Dashboard & Earnings (Tests 7-10)

- [ ] **Test 7**: Driver Dashboard shows requests count
  - REQUESTS card accurate
  - Count updates on accept
  - Auto-refresh works (8s)

- [ ] **Test 8**: Online/Offline toggle works
  - Shows "🟢 Online" or "⚫ Offline"
  - Toggles on click
  - Visual feedback visible

- [ ] **Test 9**: Earnings card shows today's total
  - Sums last 10 completed rides
  - ₦ currency formatted
  - Shows ride count
  - 💰 emoji displays

- [ ] **Test 10**: Accept ride button works
  - Status → ACCEPTED
  - Driver name saved
  - No double-acceptance

---

### 🗺️ Ride Tracking Page (Tests 11-13)

- [ ] **Test 11**: Progress steps display correctly
  - 5 step indicators visible
  - Current step highlighted
  - Completed steps marked
  - Correct titles shown

- [ ] **Test 12**: Auto-refresh every 2 seconds
  - Updates without user action
  - Status changes immediate
  - No page freeze

- [ ] **Test 13**: Payment button appears when COMPLETED
  - Shows only after COMPLETED
  - Amount displayed (₦ format)
  - Click processes payment
  - Result feedback shown

---

### 💳 Payment System (Tests 14-15)

- [ ] **Test 14**: Payment rejects non-completed rides
  - 409 error on REQUESTED status
  - "Ride must be completed" message
  - No orphan payments

- [ ] **Test 15**: Successful payment returns transaction
  - status = COMPLETED
  - success=true response
  - transactionId=TXN-{timestamp}
  - Amount matches

---

### 👨‍💼 Admin Dashboard & APIs (Tests 16-18)

- [ ] **Test 16**: Admin Dashboard metrics display
  - USERS count correct
  - CLIENTS count correct
  - DRIVERS count correct
  - RIDES count correct

- [ ] **Test 17**: Admin APIs return 403 for non-admins
  - CLIENT gets 403 on /api/admin/metrics
  - DRIVER gets 403 on /api/admin/users
  - No data leak

- [ ] **Test 18**: Admin can filter users by role
  - ?role=CLIENT returns only clients
  - ?role=DRIVER returns only drivers
  - Filtering accurate

---

### 🛡️ Security & Error Handling (Tests 19-20)

- [ ] **Test 19**: Duplicate email rejected
  - First registration works
  - Second attempt returns 409
  - "Email already registered"

- [ ] **Test 20**: JWT token expiry enforced
  - Valid token → endpoints work
  - Expired token → 401
  - Invalid token → 401
  - Missing auth → 401

---

## ✅ BONUS: Full E2E Flow Test

Complete user journey validation:

- [ ] Client registers (email A)
- [ ] Driver registers (email B)
- [ ] Admin registers (email C)
- [ ] Client creates ride (REQUESTED)
- [ ] Driver sees ride in requests
- [ ] Driver accepts ride (ACCEPTED)
- [ ] Client sees active ride
- [ ] Client opens /ride/[id]
- [ ] Driver: ARRIVING → IN_PROGRESS → COMPLETED
- [ ] Client: "Pay Now" button visible
- [ ] Payment processes (returns TXN-xxx)
- [ ] Admin: metrics show 3 users, 1 ride
- [ ] Admin: filters rides by COMPLETED (finds 1)

**All steps work seamlessly** ✓

---

## 📊 Test Results Summary

| Category | Tests | Status | Notes |
|----------|-------|--------|-------|
| Auth | 1-3 | [ ] | |
| Client | 4-6 | [ ] | |
| Driver | 7-10 | [ ] | |
| Tracking | 11-13 | [ ] | |
| Payment | 14-15 | [ ] | |
| Admin | 16-18 | [ ] | |
| Security | 19-20 | [ ] | |
| **E2E** | **21** | [ ] | |

---

## 🔗 Quick Links

- **Dev Server**: http://localhost:3000
- **Client Dashboard**: http://localhost:3000/dashboard
- **Driver Dashboard**: http://localhost:3000/driver
- **Admin Dashboard**: http://localhost:3000/admin
- **Register**: http://localhost:3000/register
- **Login**: http://localhost:3000/login

---

## 📝 Test Script Commands

```bash
# Register Client
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123","role":"CLIENT"}'

# Register Driver
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"driver@example.com","password":"pass123","role":"DRIVER"}'

# Register Admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pass123","role":"ADMIN"}'

# Create Ride
curl -X POST http://localhost:3000/api/rides \
  -H "Content-Type: application/json" \
  -d '{"pickup":"Main St","destination":"Oak Ave","city":"Lagos","estimate":5000}'

# Admin Metrics (use admin token)
curl http://localhost:3000/api/admin/metrics \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

**Last Updated**: January 19, 2026
**Total Tests**: 20 + 1 E2E Flow
**Status**: Ready for execution ✅
