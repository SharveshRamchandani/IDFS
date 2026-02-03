# Intelligent Demand Forecasting System (IDFS)

A modern, comprehensive web application designed for intelligent inventory management, demand forecasting, and supply chain analytics. Built with performance and user experience in mind, IDFS provides tailored dashboards for different roles within an organization.

## 🚀 Features

### 📊 Role-Based Dashboards
- **Store Manager Dashboard**: Overview of store performance, sales trends, and immediate stock needs.
- **Analyst Dashboard**: Deep dive into data analytics, forecasting accuracy, and seasonal trends.
- **Warehouse Dashboard**: Monitor stock levels, shipments, and order fulfillments.
- **Admin Dashboard**: System-wide settings, user management, and threshold configurations.

### 📦 Inventory Management
- **Real-time Inventory List**: Track current stock levels across all SKUs.
- **Low Stock Alerts**: Immediate notifications for items falling below safety stock.
- **Dead Stock Analysis**: Identify slow-moving items to optimize inventory costs.

### 📈 Advanced Forecasting
- **Demand Forecasting**: AI-assisted predictions for future product demand.
- **Seasonal Analysis**: Visualize seasonal trends and spikes.
- **Accuracy Reporting**: Monitor the precision of forecasting models.

### ⛓️ Supply Chain visibility
- Track orders, shipments, and supplier performance (Modules in development).

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **State Management & Data**: [TanStack Query](https://tanstack.com/query/latest)
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd IDFS/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   To create a production-ready build:
   ```bash
   npm run build
   ```

## 📂 Project Structure

```
src/
├── components/        # Reusable UI components
├── pages/            # Application views and route handlers
│   ├── dashboard/    # Role-specific dashboard views
│   ├── inventory/    # Inventory management pages
│   ├── forecasting/  # Forecasting analytics pages
│   └── ...
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helper functions
└── App.tsx           # Main application component and routing
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
