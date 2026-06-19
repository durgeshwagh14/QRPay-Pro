# QRPay Pro — Production-Ready QR Payment SaaS Platform

QRPay Pro is a complete enterprise-grade, mobile-first SaaS platform enabling businesses to register, manage UPI QR codes, track payments with real-time analytics, and accept customer payments via an integrated checkout page.

---

## 🛠️ Project Structure

This project is set up as an npm monorepo containing two packages:
- **`backend/`**: Express, Node.js, Mongoose/MongoDB, Redis cache/session manager, Winston, and Zod validator.
- **`frontend/`**: React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, Framer Motion, and Zustand.

---

## 🚀 How to Run the Application

You can run the application either using **Docker** (recommended for quick startup) or **Locally in Development Mode**.

### Option 1: Running with Docker (One-Command Launch)

This option automatically spins up MongoDB, Redis, the backend server, and the frontend server.

1. Ensure you have **Docker** and **Docker Compose** installed on your system.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Once running:
   - **Frontend App**: Access at [http://localhost](http://localhost) (runs on port 80).
   - **Backend API**: Access at [http://localhost:5000](http://localhost:5000).

---

### Option 2: Running Locally (Development Mode)

#### 1. Setup Active Workspace
Make sure your IDE (e.g., VS Code) is opened to the subdirectory:
`C:\Users\Durgesh Wagh\.gemini\antigravity\scratch\qrpay-pro`

#### 2. Install Monorepo Dependencies
From the root directory:
```bash
npm install
```

#### 3. Run Backend & Frontend in Development
The root `package.json` includes scripts to run both apps simultaneously using npm workspaces:

```bash
# Run both Backend & Frontend in parallel:
npm run dev

# Alternatively, run separately:
npm run dev:backend
npm run dev:frontend
```

*Note: For the local backend to run, ensure MongoDB is running at `mongodb://localhost:27017/qrpay-pro`. If Redis is not running locally, the backend will automatically fallback to an in-memory cache.*

---

## ⚙️ Environment Variables Config

### Backend Configuration (`backend/.env`)
Create a `.env` file inside the `backend` directory (default setup already created):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/qrpay-pro
REDIS_URL=redis://localhost:6379
JWT_SECRET=super_secret_jwt_access_token_key_12345
JWT_REFRESH_SECRET=super_secret_jwt_refresh_token_key_12345

# Optional Integrations
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### Frontend Configuration (`frontend/.env`)
Create a `.env` file inside the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔑 Key Features
- 🚀 **Dynamic QR Codes**: Generated with real-time tracking, customized styling, logo overlays, and quick sharing.
- 💳 **Payment Integrations**: Simulated and Razorpay-powered online gateway flows.
- 📊 **Interactive Analytics**: Graphs for revenues, customer insights, and transaction status.
- 🔒 **Secure Auth**: JWT Access token with Refresh Token rotation.
- ⚙️ **RBAC Roles**: Super Admin, Admin, Business Owner, Employee, and Accountant.
