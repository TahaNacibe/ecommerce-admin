# Ecommerce Admin Panel

This is a comprehensive admin panel for a freelance e-commerce project, built with Next.js, Prisma, MongoDB, NextAuth, Tailwind CSS, and shadcn UI. Designed to provide full control over the e-commerce platform, it combines robust security, detailed inventory management, and user-friendly interfaces to enable efficient business operations. The project is intended as a professional-grade portfolio piece to showcase expertise in full-stack web development, database management, and modern authentication strategies.

---

## Features

- **Role-Based Security**: Admin, manager, and staff roles with fine-grained permissions to access specific parts of the panel.
- **Session Management**: Secure authentication and session tracking with NextAuth, including token handling and expiration.
- **Stock Management**: Monitor, update, and manage product inventory in real-time, with low-stock alerts.
- **Orders Monitoring**: Track incoming and processed orders, generate reports, and manage shipping statuses.
- **Recipe Generation**: For products that require compositional data, create and manage recipes with dynamic inputs.
- **Category and Product Management**: Add, edit, and organize product categories, as well as detailed product attributes, descriptions, and media.
- **Interactive Dashboard**: Visual analytics, charts, and quick action panels to manage day-to-day operations efficiently.
- **Responsive Design**: Built with Tailwind CSS and shadcn UI for clean, consistent styling across devices.
- **Data Validation and Error Handling**: Ensures integrity of stock, orders, and product information.
- **Portfolio Showcase**: Demonstrates full-stack development skills, modern JS frameworks, database modeling with Prisma, authentication flows, and UI/UX design.

---

## Technologies Used

- **Frontend:** Next.js, Tailwind CSS, shadcn UI, TypeScript
- **Backend:** Prisma ORM, MongoDB
- **Authentication:** NextAuth
- **Other Tools:** Node.js, REST API endpoints, session handling, JWT tokens

---

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- MongoDB instance or connection string.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/TahaNacibe/ecommerce-admin.git
cd ecommerce-admin
```

2. Install dependencies:

```bash
npm install
```

3. Set environment variables:

```
NEXTAUTH_URL=<your-url>
DATABASE_URL=<your-mongo-url>
```

4. Run the application:

```bash
npm run dev
```

---

## License

MIT License - see [LICENSE](LICENSE).

