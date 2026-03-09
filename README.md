<div align="center">
  <h1>🏙️ Civic Issue Tracker</h1>
  <p>A smart city governance platform for tracking and resolving urban infrastructure issues.</p>

  <!-- Add Badges here -->
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
</div>

<br />

## 📖 Overview

The **Civic Issue Tracker** bridges the gap between citizens, field workers, and municipal departments. It is a centralized, role-based platform designed to digitise and streamline the management of urban civic infrastructure issues like potholes, street-light failures, garbage accumulation, and drainage blockages.

The platform allows field workers (bikers) to report geo-tagged issues with photographic evidence, administrators to assign tasks across departments, and department officials to monitor and resolve issues within their jurisdiction in real-time on an interactive map.

## 🌟 Key Features

*   🔐 **Role-Based Access Control (RBAC):** Dedicated dashboards and secure routing for Admins, Bikers, and Department Officials.
*   📍 **Geo-Tagged Issue Reporting:** Field workers report issues directly from the ground with automatic browser-based GPS coordinate capture.
*   📸 **Photographic Evidence:** Enforces accountability by requiring before and after visual proof for issue creation and resolution.
*   🗺️ **Interactive GIS Map:** Built-in Leaflet maps for visualizing problem hotspots, assigned areas, and urgent tasks city-wide.
*   🏢 **Department-level Data Isolation:** Departments only see issues relevant to their jurisdiction (enforced by Supabase RLS).
*   📊 **Real-Time Analytics:** Live statistics on pending, resolved, and high-priority issues dynamically updated for all stakeholders.

## 💻 Tech Stack

### Frontend
*   **Framework:** Next.js 15 (App Router)
*   **Library:** React 19, TypeScript
*   **Styling:** Tailwind CSS (Modern Glassmorphism UI)
*   **Maps:** Leaflet & React Leaflet
*   **Icons:** Lucide React

### Backend & Database (Supabase)
*   **Database:** PostgreSQL with Row Level Security (RLS)
*   **Authentication:** Supabase Auth (Email/Password & JWT Sessions)
*   **Storage:** Supabase Storage (Cloud bucket for high-res before/after photos)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   [Node.js](https://nodejs.org/en/) (v18 or higher)
*   A [Supabase](https://supabase.com/) account and project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/civic-issue-tracker.git
    cd "civic-issue-tracker"
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    *   Duplicate the `.env.local.example` file and rename it to `.env.local`.
    *   Add your Supabase project credentials:
        ```env
        NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
        ```

4.  **Database Initialisation (Supabase):**
    *   Navigate to your Supabase project's SQL Editor and run the provided migration scripts located in the root directory:
        *   `migration-department-update.sql`
        *   `migration-solve-feature.sql`
    *   This will automatically create the necessary `users`, `issues`, and `departments` tables alongside RLS policies.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

6.  **View the App:** Open [http://localhost:3000](http://localhost:3000) in your browser.

## � User Roles

| Role | Access URL | Capabilities |
| :--- | :--- | :--- |
| **Admin** | `/admin` | Full system access. Assign tasks across all departments, create biker profiles, view city-wide maps, and monitor comprehensive stats. |
| **Biker** | `/biker` | Ground agents. Uploads geo-tagged issues, assigned problem areas, submits resolution photos, and manages urgent tasks. |
| **Department** | `/department` | Specialized officials. They only receive and resolve issues specifically tagged to their department (e.g., Water, Roads). |

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/civic-issue-tracker/issues).
