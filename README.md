# Samadhan - Intelligent AI Ticket Management System 🚀

![Samadhan Dashboard](https://img.shields.io/badge/Status-Active-success) ![License](https://img.shields.io/badge/License-MIT-blue) ![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20Node.js%20%7C%20PostgreSQL-blueviolet)

Samadhan is a next-generation, AI-powered helpdesk and ticket management platform designed to automate customer support workflows. Built alongside the **Antigravity CLI** agentic AI, Samadhan leverages cutting-edge LLMs to read, route, and instantly resolve customer issues based on a custom knowledge base.

## ✨ Features

- **🤖 AI Auto-Resolution:** Integrates **Groq (Llama 3.3 70B)** to automatically read incoming emails, classify them, and generate instant, polite resolutions for common problems based strictly on your Knowledge Base.
- **⚡ Smart Agent Tools:** Built-in AI tools for human agents to instantly summarize long email threads and polish their drafted replies for a professional and empathetic tone.
- **📊 Predictive SLA Monitoring:** Background workers (`pg-boss`) proactively monitor open tickets and predict the risk of Service Level Agreement (SLA) breaches before they happen.
- **✉️ Seamless Email Integration:** Connects directly via IMAP/SMTP (SendGrid) to turn customer emails into tickets, and system replies back into email threads.
- **🔐 Role-Based Access Control:** Secure dashboards tailored for **Admins**, **Agents**, and **Customers** using `better-auth`.
- **🌙 Dynamic UI:** A stunning, modern interface with a responsive dark-mode aesthetic and smooth micro-animations.

## 🛠️ Tech Stack

### Frontend
- **React.js (Vite)** with TypeScript
- **Tailwind CSS** (Custom Design System)
- **React Router** for navigation

### Backend
- **Node.js** & **Express** with TypeScript
- **PostgreSQL** & **Prisma ORM**
- **pg-boss** for robust background job processing
- **Better Auth** for secure session management

### AI & Integrations
- **Groq AI (Llama 3.3 70B)** via Vercel AI SDK for blazing-fast inference and JSON structured outputs
- **Google Gemini** for vector embeddings
- **SendGrid** for outgoing email delivery
- **IMAP integration** for incoming email parsing

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+) or Bun
- PostgreSQL database

### 1. Clone the repository
```bash
git clone https://github.com/Gagan232004/Samadhan-Ticket-Management-System.git
cd Samadhan-Ticket-Management-System
```

### 2. Setup Environment Variables
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/helpdesk?schema=public"
BETTER_AUTH_SECRET="your-super-secret-key"
BETTER_AUTH_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:5173"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="password123"

# APIs
GROQ_API_KEY="your-groq-api-key"
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="support@yourdomain.com"
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 4. Start the Application
You'll need three terminal windows to run the full stack locally:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run start
```
*(Note: This automatically pushes the Prisma schema and seeds the database with the admin user).*

**Terminal 2 (Background Workers):**
```bash
cd backend
npm run dev:workers
```

**Terminal 3 (Frontend):**
```bash
cd frontend
npm run dev
```

## 🧠 Architecture Overview
When a customer sends an email:
1. The backend periodically polls IMAP or receives a webhook.
2. The email is parsed and pushed into the PostgreSQL database as an `Open` ticket.
3. A background job (`classify-ticket`) is queued.
4. The background worker uses the **Groq Llama 3.3** API to determine the ticket's Priority, Category, and whether it can be auto-resolved using the Knowledge Base.
5. If yes, it emails the customer the resolution and marks it `Resolved`. If no, it assigns it to the queue for a human Agent.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Gagan232004/Samadhan-Ticket-Management-System/issues).

---
*Built with ❤️ and Antigravity CLI.*
