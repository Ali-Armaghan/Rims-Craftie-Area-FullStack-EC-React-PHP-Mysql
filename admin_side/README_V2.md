# ManageMate UI 🚀

ManageMate UI is a premium, high-performance Admin Dashboard built with **React 19**, **Vite**, and **Shadcn UI**. It is designed for developers who need a robust, scalable, and beautiful foundation for their enterprise applications.

![ManageMate Preview](public/images/shadcn-admin.png)

## ✨ Core Features

- 🌓 **Advanced Theming**: Dynamic Light/Dark mode switching with custom color accents.
- 🔍 **Command Palette**: Global search (CMD+K) for quick navigation across the entire app.
- 📱 **Mobile First**: Fully responsive layouts with an intelligent sidebar.
- 🔒 **Enterprise Auth**: Seamless integration with Clerk for secure user management.
- 📊 **Data Visualization**: Beautifully crafted charts using Recharts.
- 📋 **Task Management**: Integrated Kanban boards and data tables.
- 🌐 **RTL Support**: First-class support for Right-to-Left languages.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Data Management**: [TanStack Query](https://tanstack.com/query)
- **State**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS)
- pnpm (Recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/manage-mate-ui.git
   cd manage-mate-ui/shadcn-admin
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file based on `.env.example` and add your Clerk credentials.

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

## 📂 Project Structure

```text
src/
├── components/     # Reusable UI components & Layouts
├── context/        # Global React Context providers
├── features/       # Modular features (Dashboard, Tasks, Users, etc.)
├── hooks/          # Custom utility hooks
├── lib/            # Shared libraries and utilities
├── routes/         # Type-safe file-based routing
└── stores/         # Zustand state stores
```

## 📄 Documentation

For a more detailed breakdown of the technical architecture and file-specific information, please refer to [PROJECT_INFO.md](./PROJECT_INFO.md).

---

Built with ❤️ by [Ali-Armaghan](https://github.com/Ali-Armaghan)
