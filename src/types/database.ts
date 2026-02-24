/* ===== TypeScript types matching the database schema ===== */

export type UserRole = "admin" | "biker" | "department";

export type IssueStatus = "pending" | "in_progress" | "resolved";

export type IssuePriority = "low" | "medium" | "high";

/* ---------- Row types ---------- */

export interface Department {
    id: string;
    name: string;
    description: string | null;
    created_at: string;
}

export interface User {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    department_id: string | null;
    avatar_url: string | null;
    phone: string | null;
    created_at: string;
    updated_at: string;
}

export interface Issue {
    id: string;
    title: string;
    description: string | null;
    lat: number;
    lng: number;
    photo_url: string | null;
    status: IssueStatus;
    priority: IssuePriority;
    department_id: string;
    assigned_biker_id: string | null;
    reported_by: string | null;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
}

export interface IssueUpdate {
    id: string;
    issue_id: string;
    user_id: string;
    comment: string | null;
    photo_url: string | null;
    old_status: string | null;
    new_status: string | null;
    created_at: string;
}

/* ===== Supabase Database schema type for createServerClient<Database> ===== */

export type Database = {
    public: {
        Tables: {
            users: {
                Row: User;
                Insert: Omit<User, "created_at" | "updated_at">;
                Update: Partial<Omit<User, "id" | "created_at" | "updated_at">>;
                Relationships: [
                    {
                        foreignKeyName: "users_department_id_fkey";
                        columns: ["department_id"];
                        isOneToOne: false;
                        referencedRelation: "departments";
                        referencedColumns: ["id"];
                    }
                ];
            };
            departments: {
                Row: Department;
                Insert: Omit<Department, "id" | "created_at">;
                Update: Partial<Omit<Department, "id" | "created_at">>;
                Relationships: [];
            };
            issues: {
                Row: Issue;
                Insert: Omit<Issue, "id" | "created_at" | "updated_at">;
                Update: Partial<Omit<Issue, "id" | "created_at" | "updated_at">>;
                Relationships: [
                    {
                        foreignKeyName: "issues_department_id_fkey";
                        columns: ["department_id"];
                        isOneToOne: false;
                        referencedRelation: "departments";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "issues_assigned_biker_id_fkey";
                        columns: ["assigned_biker_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "issues_reported_by_fkey";
                        columns: ["reported_by"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
            issue_updates: {
                Row: IssueUpdate;
                Insert: Omit<IssueUpdate, "id" | "created_at">;
                Update: Partial<Omit<IssueUpdate, "id" | "created_at">>;
                Relationships: [
                    {
                        foreignKeyName: "issue_updates_issue_id_fkey";
                        columns: ["issue_id"];
                        isOneToOne: false;
                        referencedRelation: "issues";
                        referencedColumns: ["id"];
                    },
                    {
                        foreignKeyName: "issue_updates_user_id_fkey";
                        columns: ["user_id"];
                        isOneToOne: false;
                        referencedRelation: "users";
                        referencedColumns: ["id"];
                    }
                ];
            };
        };
        Views: Record<string, never>;
        Functions: Record<string, never>;
        Enums: {
            user_role: UserRole;
            issue_status: IssueStatus;
            issue_priority: IssuePriority;
        };
    };
};
