# Tech Context

This document outlines the technologies, development setup, and technical constraints relevant to the sales platform project.

## Technologies Used:
- **Backend:**
    - **PHP 8.x:** Core language for Laravel.
    - **Laravel 10.x:** PHP Framework for backend development.
    - **MySQL/MariaDB:** Relational database.
    - **Composer:** PHP dependency manager.
    - **Spatie Laravel Permission:** For role-based access control.
    - **Image Intervention:** PHP library for image manipulation.
    - **Laravel Queue:** For asynchronous task processing.
- **Frontend:**
    - **React 18.x:** JavaScript library for building user interfaces.
    - **TypeScript:** Superset of JavaScript for type safety.
    - **Inertia.js:** Connects Laravel backend with React frontend.
    - **Vite:** Frontend build tool.
    - **Tailwind CSS:** Utility-first CSS framework.
    - **React Hook Form:** For form management.
    - **Zod:** For schema validation.
    - **Axios:** For HTTP requests (though Inertia.js often abstracts this).
    - **Radix UI / Shadcn UI:** For UI components (inferred from `components.json` and common React patterns).
- **Development Tools:**
    - **Node.js:** JavaScript runtime environment.
    - **npm/Yarn:** JavaScript package managers.
    - **Git:** Version control system.
    - **Docker/Devilbox:** For local development environment (inferred from current working directory path).
    - **ESLint & Prettier:** For code linting and formatting.

## Development Setup:
- **Local Environment:** The project is set up within a Devilbox environment, providing a consistent development stack (Nginx, PHP, MySQL).
- **Dependency Management:** Composer for PHP dependencies, npm/Yarn for JavaScript dependencies.
- **Frontend Build:** Vite is used for fast development and optimized production builds.
- **Database:** Local MySQL/MariaDB instance, managed via Laravel migrations.
- **Authentication:** Laravel Breeze or similar scaffolding for user authentication, integrated with Spatie permissions.

## Technical Constraints:
- **PHP Version:** Requires PHP 8.x or higher due to Laravel 10.x requirements.
- **Database Compatibility:** Designed for MySQL/MariaDB. Compatibility with other databases might require adjustments.
- **Frontend Framework:** Tightly coupled with React and Inertia.js. Switching frameworks would be a significant undertaking.
- **Image Processing:** Relies on `Image Intervention` and Laravel queues, requiring proper queue worker setup for production.
- **Deployment:** Assumes a standard LAMP/LEMP stack compatible with Laravel applications.
