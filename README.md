# Green Coin Backend API Documentation

Welcome to the Green Coin Backend API documentation. This API handles user authentication, waste management (IoT integration), product rewards, leaderboards, and analytics.

---

## Table of Contents
- [Authentication Routes (`/api/auth`)](#authentication-routes-apiauth)
- [IoT & Waste Management Routes (`/api/iot`)](#iot--waste-management-routes-apiiot)
- [Admin Management Routes (`/api/admin`)](#admin-management-routes-apiadmin)
- [User Routes (`/api/user`)](#user-routes-apiuser)
- [Product Routes (`/api/products`)](#product-routes-apiproducts)
- [Leaderboard Routes (`/api/leaderboard`)](#leaderboard-routes-apileaderboard)
- [Analytics Routes (`/api/analytics`)](#analytics-routes-apianalytics)

---

## Authentication Routes (`/api/auth`)

### 1. Register a new user
**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**Input (JSON Body):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "rollNo": "12345"
}
```
**Success Response (210):**
```json
{
  "message": "User registered successfully",
  "user": { ... }
}
```
**Error Messages:**
- `400`: Name, email, password, and roll number are required
- `400`: User with this email or roll number already exists
- `500`: Server error

### 2. Login User
**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Input (JSON Body):**
```json
{
  "identifier": "john@example.com", // or rollNo
  "password": "securepassword"
}
```
**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... }
}
```
**Error Messages:**
- `400`: Email/Roll number and password are required
- `400`: Invalid credentials
- `500`: Server error

### 3. Get Current User Details
**Endpoint:** `GET /api/auth/getMe`  
**Access:** Private (Authenticated users)  
**Success Response (200):**
```json
{
  "message": "User details fetched successfully",
  "user": { ... }
}
```

---

## IoT & Waste Management Routes (`/api/iot`)

### 1. Create a Dustbin
**Endpoint:** `POST /api/iot/dustbin/create`  
**Access:** Private (Admin only)  
**Input (JSON Body):**
```json
{
  "name": "Bin A1",
  "capacity": 5000
}
```
**Success Response (201):**
```json
{
  "message": "Dustbin created successfully",
  "dustbin": { ... }
}
```

### 2. Reduce Dustbin Fill Level
**Endpoint:** `PATCH /api/iot/dustbin/reduce`  
**Access:** Private (Admin only - Requires UID in body)  
**Input (JSON Body):**
```json
{
  "dustbinId": "ID_HERE",
  "weight": 1000,
  "uid": "ADMIN_RFID_UID"
}
```
**Success Response (200):**
```json
{
  "message": "Dustbin fill level reduced successfully",
  "reducedWeight": 1000,
  "dustbin": { ... }
}
```

### 3. Log Waste Deposit
**Endpoint:** `POST /api/iot/deposit`  
**Access:** Public (Called by IoT devices)  
**Input (JSON Body):**
```json
{
  "uid": "USER_RFID_UID",
  "weight": 50.5,
  "dustbinId": "ID_HERE"
}
```
**Success Response (201):**
```json
{
  "message": "Waste added & rewarded",
  "weight": 50.5,
  "points": 10,
  "wasteLog": { ... }
}
```
**Note:** Returns "Max limit exceed. Try in next date." if user has reached daily reward limit.

---

## Admin Management Routes (`/api/admin`)

### 1. Add a Product
**Endpoint:** `POST /api/admin/products`  
**Access:** Private (Admin only)  
**Input:** `multipart/form-data` with `name`, `price`, and `image` (file).
**Success Response (201):** `{ "message": "Product added successfully", "product": { ... } }`

### 2. Delete a Product
**Endpoint:** `DELETE /api/admin/products/:id`  
**Access:** Private (Admin only)  
**Success Response (200):** `{ "message": "Product deleted successfully", "product": { ... } }`

### 3. Get All Students
**Endpoint:** `GET /api/admin/students`  
**Access:** Private (Admin only)  
**Success Response (200):** `{ "message": "Students retrieved successfully", "students": [...] }`

### 4. Update Student UID
**Endpoint:** `PATCH /api/admin/students/:id/uid`  
**Access:** Private (Admin only)  
**Input:** `{ "uid": "NEW_UID" }`

### 5. Promote User to Admin
**Endpoint:** `PATCH /api/admin/users/:id/promote`  
**Access:** Private (Admin only)  

### 6. Get All Transactions
**Endpoint:** `GET /api/admin/transactions`  
**Access:** Private (Admin only)  
**Query Params:** `uid`, `status` (success/failed), `type` (reward/purchase), `date` (today).

---

## User Routes (`/api/user`)

### 1. Get Wallet Balance
**Endpoint:** `GET /api/user/balance`  
**Access:** Private (Authenticated users)  
**Success Response (200):**
```json
{
  "success": true,
  "wallet": "0x...",
  "balance": "150.0",
  "symbol": "GC"
}
```

---

## Product Routes (`/api/products`)

### 1. Get All Products
**Endpoint:** `GET /api/products`  
**Access:** Private (Authenticated users)  

### 2. Get Product by ID
**Endpoint:** `GET /api/products/:id`  
**Access:** Private (Authenticated users)  

---

## Leaderboard Routes (`/api/leaderboard`)

### 1. Get Leaderboard
**Endpoint:** `GET /api/leaderboard`  
**Access:** Private (Authenticated users)  
**Success Response (200):**
```json
{
  "message": "Leaderboard retrieved successfully",
  "leaderboard": [
    { "rank": 1, "name": "...", "points": 100, "_id": "..." },
    ...
  ]
}
```

---

## Analytics Routes (`/api/analytics`)

### 1. Weekly College Waste Data
**Endpoint:** `GET /api/analytics/weekly/college`  
**Access:** Private (Admin only)  

### 2. My Weekly Waste Data
**Endpoint:** `GET /api/analytics/weekly/my`  
**Access:** Private (Authenticated users)  

### 3. Weekly Waste Data by User ID
**Endpoint:** `GET /api/analytics/weekly/user/:id`  
**Access:** Private (Admin only)  

### 4. Total Waste Analytics
**Endpoint:** `GET /api/analytics/total`  
**Access:** Private (Authenticated users)  
**Success Response (200):**
```json
{
  "success": true,
  "totalWasteGram": 1250,
  "totalWasteKG": "1.25",
  "message": "Total waste weight retrieved successfully"
}
```

---

## Error Handling
The API returns standard HTTP status codes:
- `200/201`: Success
- `400`: Bad Request (Missing fields or invalid data)
- `401/403`: Unauthorized or Forbidden (Access denied)
- `404`: Not Found (User, Dustbin, or Product not found)
- `500`: Internal Server Error
