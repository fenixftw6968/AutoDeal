# AutoDeal — Group Car Buying Platform

AutoDeal is a full-stack group car buying platform engineered to help car buyers pool their purchasing demand in a specific metro area to negotiate fleet pricing directly with authorized dealerships.

---

## 1. System Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, STOMP.js + SockJS Client.
- **Backend**: Java 21, Spring Boot 3.4.2, Spring Security with stateless JWT, Spring WebSocket + STOMP broker, Spring Data MongoDB, Spring Data Redis.
- **Database**: MongoDB (users, car catalog, campaigns, dealership quotations, persistent chat messages).
- **Cache**: Redis with tailored TTL policies (car catalog: 30m, featured campaigns: 3m, campaign summaries: 2m).
- **Deployment**: Docker, Docker Compose, Nginx reverse proxy.

---

## 2. Key Features Implemented

1. **Minimalist & Trustworthy UI/UX**:
   - Modern, clutter-free aesthetic tailored to automotive retail.
   - Comprehensive landing page with car search, brand/metro filters, featured campaigns, a 3-step mechanics guide, trust indicators, and interactive FAQ.
   - Distinct verified dealership badges, clear quote breakdowns, and quota progress indicators.

2. **Spring Security & Role-Based Access Control**:
   - Customer and Dealership registration and authentication.
   - Stateless JWT authentication filter with bcrypt password encryption.
   - Server-enforced permissions prohibiting customers from submitting dealership quotations.

3. **Group-Buy Campaigns**:
   - Launch campaigns specifying brand, model, preferred variant trim, metro, buyer quota, and deadline.
   - Full lifecycle management (`OPEN`, `TARGET_REACHED`, `NEGOTIATING`, `OFFER_AVAILABLE`, `COMPLETED`, `EXPIRED`).
   - Server-side validations preventing duplicate memberships and joins to closed pools.

4. **Mandatory Persistent Campaign Group Chat (STOMP WebSocket)**:
   - Dedicated authenticated chat room per campaign (`/topic/campaigns/{id}/chat`).
   - Strict channel authorization interceptor validating campaign membership before allowing STOMP subscriptions or message sending.
   - Messages are persistently saved to MongoDB with sender identities, timestamps, and date separators.
   - Live connection state monitor with auto-reconnection and REST fallback.

5. **Live Campaign Updates**:
   - Real-time broadcasts (`/topic/campaigns/{id}/events`) when members join, leave, or quotas are achieved.
   - Instant notifications when dealerships submit new binding offers.

6. **Dealership Dashboard & Offer Comparison**:
   - Dealership portal tracking regional demand pools.
   - Offer submission capturing ex-showroom price, volume discounts, estimated on-road price, inclusions, exclusions, and terms.
   - Side-by-side offer comparison table separating ex-showroom and on-road prices.

7. **Database Seeding**:
   - Automatic seeding of popular car models (Hyundai Creta, Kia Seltos, Tata Harrier, Mahindra XUV700), demo buyer accounts, verified dealer partner, and demo campaigns.

---

## 3. Quick Start (Local Development)

### Prerequisites:
- Java 21 JDK
- Node.js 20+ & npm
- MongoDB running on `localhost:27017`
- Redis running on `localhost:6379`

### 1. Run Frontend:
```bash
cd frontend
npm install
npm run dev
```
Accessible at: `http://localhost:5173`

### 2. Run Backend:
```bash
cd backend
mvn spring-boot:run
```
API running at: `http://localhost:8080`

### Quick Demo Logins:
- **Buyer**: `buyer@autodeal.com` / `password123`
- **Dealer**: `dealer@autodeal.com` / `password123`
- **Admin**: `admin@autodeal.com` / `password123`

---

## 4. Docker Deployment

Deploy the entire stack with a single command:
```bash
docker-compose up --build
```
This runs:
- `autodeal-frontend`: Nginx proxy + React on `http://localhost:80`
- `autodeal-backend`: Spring Boot 3.4.2 on port `8080`
- `autodeal-mongodb`: MongoDB 7.0 on port `27017`
- `autodeal-redis`: Redis 7 on port `6379`
