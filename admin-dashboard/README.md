# Admin Dashboard

A separate admin dashboard for managing the GULIT e-commerce platform.

## Features

- **Authentication**: Secure admin login
- **Dashboard**: Overview of key metrics
- **Products**: Manage product inventory
- **Orders**: Track and manage orders
- **Customers**: View customer information
- **Reports**: Sales and analytics reports
- **Settings**: Store configuration

## Setup

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:5174`

### Build for Production

```bash
npm run build
```

## Project Structure

```
admin-dashboard/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Orders.jsx
│   │   ├── Products.jsx
│   │   ├── Customers.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── context/
│   │   └── AdminContext.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Authentication

Replace the dummy authentication in `Login.jsx` with your actual backend API call.

## API Integration

Update the API endpoints in each page to connect with your backend server.
