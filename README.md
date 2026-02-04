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
- Track orders, shipments, and supplier performance.

## 🛠️ Tech Stack

- **Framework (Frontend)**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Framework (Backend)**: [FastAPI](https://fastapi.tiangolo.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Frontend), [Python](https://www.python.org/) (Backend)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [SQLAlchemy](https://www.sqlalchemy.org/))
- **Data Science**: [Pandas](https://pandas.pydata.org/), [Scikit-learn](https://scikit-learn.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Visualization**: [Recharts](https://recharts.org/)

## 📂 Project Structure

The project consists of a React frontend and a FastAPI backend:

```
IDFS/
├── frontend/           # The React client application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/            # The FastAPI server application
│   ├── app/            # Application source code
│   │   ├── api/        # API endpoints
│   │   ├── core/       # Configurations
│   │   ├── db/         # Database models and session
│   │   ├── models/     # SQLAlchemy models
│   │   └── schemas/    # Pydantic schemas
│   ├── requirements.txt # Python dependencies
│   └── main.py         # Entry point script
└── README.md           # This file
```

## 🏁 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation & Running

### Installation & Running

#### 1. Backend Setup

1.  **Navigate to the backend directory**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (Optional but Recommended)**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Initialize the Database**
    ```bash
    # Update backend/app/core/config.py with your DB credentials if needed
    # Default is SQLite for local development
    python app/db/init_db.py
    ```

5.  **Start the Backend Server**
    ```bash
    python main.py
    # The API will be available at http://127.0.0.1:8000
    # Interactive Docs: http://127.0.0.1:8000/docs
    ```

#### 2. Frontend Setup

1.  **Navigate to the frontend directory** (from project root)
    ```bash
    cd frontend
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    To create a production-ready build:
    ```bash
    npm run build
    ```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License.