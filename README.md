# TicketBari 🚌✈️🚂🚢
### Online Travel Ticket Booking Platform

A full-stack travel ticket booking platform built with the MERN stack where users can discover and book Bus, Train, Launch & Plane tickets across Bangladesh. Features three distinct roles: User, Vendor, and Admin.

## 🌐 Live Site
**[https://ticket-bari-client-one.vercel.app](https://ticket-bari-client-one.vercel.app)**

## 🔐 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | jobayerhosen045@gmail.com | ILOVEYOU@@@ |
| Vendor | kakakaki0@gmail.com | 1234567890 |

## 📁 Repositories

| | Link |
|-|------|
| Client | [TICKET-BARI-CLIENT](https://github.com/JOBAYER07-dev/TICKET-BARI-CLIENT) |
| Server | [ticket-bari-server](https://github.com/JOBAYER07-dev/ticket-bari-server) |

---

## ✨ Key Features

### 👤 User
- Register & login with Email/Password or Google OAuth
- Browse and search tickets by route, transport type, and price
- Book tickets with real-time seat availability
- Stripe-powered secure payment
- View booking history with live countdown timers
- Download E-Ticket as PDF after payment
- Cancel pending bookings

### 🏪 Vendor
- Add, update, and delete travel tickets
- Upload ticket images via imgbb
- Accept or reject booking requests
- Revenue overview with charts (tickets added, sold, total earnings)

### 🛡️ Admin
- Approve or reject vendor-submitted tickets
- Manage user roles (promote to Admin or Vendor)
- Mark fraudulent vendors (hides all their tickets)
- Advertise up to 6 tickets on the homepage

### 🌟 General
- JWT-protected API routes
- Dark / Light mode toggle
- Fully responsive (mobile, tablet, desktop)
- Search by From → To location
- Filter by transport type (Bus, Train, Plane, Launch)
- Sort by price (Low to High / High to Low)
- Pagination on All Tickets page
- Real-time departure countdown timer
- Loading spinners and toast notifications
- Custom 404 error page

---

## 🛠️ Tech Stack

### Frontend
| Package | Purpose |
|---------|---------|
| `next` | React framework (App Router) |
| `react` | UI library |
| `@heroui/react` | Component library |
| `tailwindcss` | Utility-first CSS |
| `framer-motion` | Animations |
| `swiper` | Hero slider |
| `recharts` | Revenue charts |
| `react-toastify` | Toast notifications |
| `lucide-react` | Icons |
| `next-themes` | Dark/Light mode |
| `@react-pdf/renderer` | PDF ticket generation |
| `@stripe/react-stripe-js` | Stripe payment UI |
| `better-auth` | Authentication |

### Backend
| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `mongodb` | Database driver |
| `jsonwebtoken` | JWT auth |
| `bcryptjs` | Password hashing |
| `stripe` | Payment processing |
| `cors` | Cross-origin requests |
| `dotenv` | Environment variables |

---

## 🚀 Local Setup

### Client
```bash
git clone https://github.com/JOBAYER07-dev/TICKET-BARI-CLIENT
cd TICKET-BARI-CLIENT
npm install
```

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_IMGBB_KEY=your_imgbb_key
```

```bash
npm run dev
```

### Server
```bash
git clone https://github.com/JOBAYER07-dev/ticket-bari-server
cd ticket-bari-server
npm install
```

Create `.env`:
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_key
CLIENT_URL=http://localhost:3000
SEED_SECRET=your_seed_secret
```

```bash
npm run dev
```

---

## 🌍 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Images | imgbb |
| Payments | Stripe |

---

*© 2025 TicketBari. All rights reserved.*