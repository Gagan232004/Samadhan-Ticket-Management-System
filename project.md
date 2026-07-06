## 🎯 Core Features
### 🎫 Ticket Management & Operations
* **Ticket Lifecycle:** Create, edit, update, close, reopen, and delete (Admin only) tickets.
* **Unique Identification:** Unique Ticket ID generation for every request.
* **Audit & History:** Comprehensive ticket history and audit logs tracking all changes.
* **Relational Handling:**
  * **Merge Tickets:** Combine duplicate tickets from the same customer into a single thread.
  * **Parent-Child Links:** Link related tickets (e.g., multiple user reports mapped to one system outage issue).
### 📥 Omnichannel Ingestion (Channels)
* **Web Portal:** Native dashboard for ticket submission.
* **Email-to-Ticket:** Automatically parse incoming emails (e.g., support@company.com) and convert them into tickets.
* **Web Widget:** Embeddable support chat/form widget for external websites.
### 👥 User Management
* **Authentication:** User Registration & Login with secure authentication (JWT/OAuth), Password Reset, and Email Verification.
* **Access Control:** Role-Based Access Control (Admin, Agent, Customer) with fine-grained permissions.
* **Profiles:** User Profile Management.
### 📌 Ticket Assignment & Routing
* **Manual Assignment:** Direct assignment by managers or agents.
* **Automatic Routing:** Workload-based, team-wise, or department-wise ticket allocation.
* **Collaborative Support:** Assign multiple agents to complex tickets if required.
### 🚦 Priority & SLA Management
* **Priority Levels:** Low, Medium, High, Critical.
* **Service Level Agreements (SLAs):**
  * Define target response and resolution times based on priority and category.
  * **Business Hours:** Configure working hours and holiday calendars to pause SLA timers.
* **Escalation Policies:** Automated actions (e.g., escalate priority, notify manager, reassign) when an SLA is breached.
### 📂 Categories & Tags
* **Standard Categories:** Technical Issue, Software Bug, Refund, Billing, Complaint, Feature Request, General Query.
* **Customization:** Add Custom Categories as needed.
* **Tags/Labels:** Custom tagging for flexible filtering and grouping independent of categories.
### 📚 Knowledge Base (Self-Service)
* **Article Management (CMS):** Create, categorize, and publish help articles, guides, and FAQs.
* **Ticket Deflection:** Automatically suggest relevant articles to users as they type their request to reduce ticket volume.
### 💬 Communication & Collaboration
* **External Communication:** Customer Replies and Ticket Comments.
* **Internal Collaboration:** Internal Notes invisible to customers, and Team Member @mentions.
* **Attachments:** File attachments (images, PDFs, logs) with preview and download capabilities.
### 🤖 AI Features
* **AI Ticket Categorization & Priority:** Automatically detect and assign category and priority based on text analysis.
* **Suggested Responses:** AI-generated reply which should give a human touch
* **Duplicate Detection:** Flag potentially duplicate tickets automatically.
* **Sentiment Analysis:** Detect frustrated or angry customers to expedite critical support.
* **AI Knowledge Base Search:** Semantic search across help articles using vector embeddings.
### 📈 Dashboard & Analytics
* **Overview Metrics:** Total, Open, Closed, Pending tickets.
* **Performance Tracking:** Average Resolution Time, First Response Time, Agent Performance, Department Performance.
* **Trend Analysis:** Ticket Trends and Monthly/Weekly Reports.

### 🔍 Search & Filters
* **Basic Search:** By Ticket ID, Customer, Agent, Category, Status.
* **Advanced Filters:** Date Range, Tag, Priority, SLA Status.
* **Saved Filters:** Save common search criteria for quick access.

Also add admin login too.

## 🛠️ Developer Notes & Utilities
* **Ticket ID Parsing:** Use the `parseTicketId(id: string)` utility function located in `frontend/src/lib/utils.ts` whenever you need to display a short, formatted ticket ID on the frontend (e.g. slicing the CUID down to 8 characters).
* **Component Architecture:** Avoid creating massive monolithic files (like placing all logic and UI of a complex page into a single `.tsx` file). Always break complex pages down into smaller, highly cohesive sub-components (e.g., `frontend/src/components/ticket-details/`) to keep the code modular, readable, and maintainable.
