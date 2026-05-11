# ManageMate UI - Technical Overview & Project Information

This document provides a detailed breakdown of the ManageMate UI project architecture, key files, and technical implementations.

## 🏗 Project Architecture

ManageMate UI is structured as a feature-driven React application, leveraging TanStack's ecosystem for routing and data management.

### Key Directories

- **`/src/features`**: The core of the application. Each folder (e.g., `dashboard`, `tasks`, `users`, `chats`) contains its own components, hooks, and logic specific to that functional area.
- **`/src/routes`**: File-based routing using TanStack Router. The structure here defines the application's URL paths.
  - `(auth)`: Routes related to authentication flows.
  - `_authenticated`: Protected routes that require a valid session.
- **`/src/components/ui`**: Base UI primitives built on Shadcn (Tailwind + Radix). These are the building blocks for all other components.
- **`/src/context`**: Global React Context providers (e.g., `search-provider.tsx` for the CMD+K search functionality).
- **`/src/hooks`**: Custom reusable React hooks for global logic.
- **`/src/stores`**: Client-side state management using Zustand.

## 📄 Key File Descriptions

| File Path | Purpose |
| :--- | :--- |
| `src/main.tsx` | Entry point of the application. Initializes React and the Router. |
| `src/routes/__root.tsx` | The root layout wrapper, containing the Sidebar, Topbar, and global providers. |
| `src/features/dashboard/index.tsx` | The main dashboard view featuring analytics widgets and charts. |
| `src/context/search-provider.tsx` | Manages the logic for the Command-K global search interface. |
| `src/components/config-drawer.tsx` | The theme configuration panel (Dark/Light mode & Primary color selection). |
| `src/routeTree.gen.ts` | Automatically generated file by TanStack Router based on the `routes` directory. |
| `vite.config.ts` | Configuration for Vite, including path aliases and TanStack Router plugin. |
| `package.json` | Project dependencies, scripts (dev, build, lint), and metadata. |

## 🛠 Technical Implementations

### Routing & Authentication
The project uses **TanStack Router** which provides full type safety for paths and search parameters. Authentication is handled via **Clerk**, wrapped in protected route layouts within `src/routes/_authenticated`.

### Data Fetching
**TanStack Query (React Query)** is used for all asynchronous state. This ensures efficient caching, background updates, and optimistic UI updates for features like Task management.

### Styling System
Built on **Tailwind CSS 4.0**, the project utilizes a sophisticated design system defined in `src/index.css`. It supports:
- Full accessibility (Aria labels, keyboard navigation).
- Dynamic Dark/Light mode support.
- RTL (Right-to-Left) language support for internationalization.

## 🚀 Development Workflow

- **Design First**: Modify `src/components/ui` for foundational changes.
- **Feature Focus**: Build logic within `src/features/[feature-name]`.
- **Type Safety**: Ensure all new routes are correctly placed in `src/routes` to trigger the `routeTree.gen.ts` update.
