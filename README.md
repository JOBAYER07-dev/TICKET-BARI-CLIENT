# TicketBari — Online Ticket Booking Platform

## Live URL
https://ticket-bari-client-one.vercel.app

## Purpose
A full-stack travel ticket booking platform where users 
can discover and book Bus, Train, Launch & Plane tickets.
Three roles: User, Vendor, Admin.

## Key Features
- JWT Authentication + Google OAuth
- Vendor can add/update/delete tickets with imgbb image upload
- Admin can approve tickets, manage users, advertise tickets
- Stripe payment integration
- Real-time countdown timer on tickets
- Search, filter by type, sort by price & pagination
- Revenue analytics for vendors
- Fully responsive design with dark/light mode

## NPM Packages Used

### Client
- next, react, @heroui/react
- tailwindcss, framer-motion
- swiper, recharts
- react-toastify, lucide-react
- next-themes, better-auth

### Server
- express, mongodb
- jsonwebtoken, bcryptjs
- stripe, cors, dotenv