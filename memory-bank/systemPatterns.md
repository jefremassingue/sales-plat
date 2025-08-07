# System Patterns

This sales platform is built on a Laravel backend with a React frontend, utilizing Inertia.js for seamless integration.

## System Architecture:
- **Backend (Laravel):** Handles API endpoints, database interactions (Eloquent ORM), business logic, authentication/authorization (Spatie Permission), and image processing (Jobs, Image Intervention).
- **Frontend (React with Inertia.js):** Provides a single-page application (SPA) experience using React components, with Inertia.js bridging the gap between Laravel controllers and React views.
- **Database (MySQL/MariaDB):** Stores all application data, managed by Laravel migrations and Eloquent models.
- **Queue System:** Utilizes Laravel's queue system for background tasks like image resizing (`ResizeImageJob`).

## Key Technical Decisions:
- **Laravel for Backend:** Chosen for its robust features, active community, and rapid development capabilities.
- **React for Frontend:** Provides a modern, component-based UI for a rich user experience.
- **Inertia.js:** Simplifies the development of SPAs by allowing server-side routing and controller logic while rendering client-side React components. This avoids the need for a separate API layer for basic CRUD operations.
- **Spatie Laravel Permission:** Manages roles and permissions for granular access control within the application.
- **Image Intervention:** Used for image manipulation, specifically resizing, integrated with Laravel's queue system for asynchronous processing.

## Design Patterns in Use:
- **MVC (Model-View-Controller):** Followed by Laravel for structuring the backend.
- **Component-Based Architecture:** Applied in the React frontend for reusable UI elements.
- **Repository Pattern (Implicit):** Laravel Eloquent models often act as a form of repository for database interactions.
- **Service Pattern:** Business logic might be encapsulated in services, though not explicitly visible in the file list, it's a common Laravel pattern.
- **Job/Queue Pattern:** For handling long-running tasks like image resizing asynchronously.

## Component Relationships:
- **Laravel Controllers:** Interact with Eloquent Models to fetch/store data and pass it to Inertia.js views.
- **React Components:** Receive data as props from Inertia.js and render the UI. They can also make direct Inertia.js requests (e.g., `Inertia.post`) for form submissions and actions.
- **Models:** Define database schema and relationships, providing an ActiveRecord-like interface for data manipulation.
- **Migrations:** Manage database schema changes.
- **Middleware:** Handles HTTP request filtering, authentication, and Inertia.js setup.
