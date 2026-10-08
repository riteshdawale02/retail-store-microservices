# CloudRetail – Independent React Frontend

Next-generation React storefront built with **React 18/19**, **Vite**, and **Vanilla CSS Design System**, communicating with the Java Spring Boot Microservices architecture via the API Gateway.

---

## 🚀 Running Independently

### 1. Local Development (with Vite dev server & proxy)

Make sure the backend microservices are running on `http://localhost:8080` (via Docker Compose or Maven):

```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at:
👉 **http://localhost:3000**

All `/api/*` calls are automatically proxied to `http://localhost:8080` via Vite's dev server proxy.

---

### 2. Production Build

```bash
npm run build
npm run preview
```

---

### 3. Docker Container

Build and run the standalone containerized frontend:

```bash
docker build -t retail-frontend .
docker run -p 3000:80 retail-frontend
```

---

## 🧩 Architectural Integration

| Endpoint | Target Microservice | Storage/Technology |
| :--- | :--- | :--- |
| `/api/products` | `product-service:8081` | MySQL (`retail_product_db`) |
| `/api/cart/{userId}` | `cart-service:8082` | Redis Key-Value Store |
| `/api/orders/checkout` | `order-service:8083` | MySQL (`retail_order_db`) |
| `/api/system/health` | `api-gateway:8080` | Live Cluster Telemetry |
