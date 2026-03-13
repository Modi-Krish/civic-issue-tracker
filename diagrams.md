# Civic Issue Tracker - Diagrams

## 1. Use Case Diagram

```mermaid
usecaseDiagram
    actor Admin
    actor Biker
    actor DepartmentOfficial

    rectangle "Civic Issue Tracker System" {
        usecase "Login & Authenticate" as UC1
        usecase "View Global Statistics & Map" as UC2
        usecase "Manage All Issues" as UC3
        usecase "Manage Bikers/Workers" as UC4
        
        usecase "Report New Issue (GPS + Photo)" as UC5
        usecase "View Assigned Tasks Map" as UC6
        usecase "Upload Resolution Proof" as UC7
        
        usecase "View Department-Specific Issues" as UC8
        usecase "Verify Proof & Mark Resolved" as UC9
    }

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4

    Biker --> UC1
    Biker --> UC5
    Biker --> UC6
    Biker --> UC7

    DepartmentOfficial --> UC1
    DepartmentOfficial --> UC8
    DepartmentOfficial --> UC9
```

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    DEPARTMENTS {
        UUID id PK
        TEXT name UK
        TEXT description
        TIMESTAMPTZ created_at
    }

    USERS {
        UUID id PK
        TEXT email
        TEXT full_name
        TEXT role "admin | biker | department"
        UUID department_id FK
        TEXT avatar_url
        TEXT phone
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    ISSUES {
        UUID id PK
        TEXT title
        TEXT description
        FLOAT lat
        FLOAT lng
        TEXT photo_url
        TEXT status "pending | in_progress | resolved"
        TEXT priority "low | medium | high"
        UUID department_id FK
        UUID assigned_biker_id FK
        UUID reported_by FK
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ resolved_at
    }

    ISSUE_UPDATES {
        UUID id PK
        UUID issue_id FK
        UUID user_id FK
        TEXT comment
        TEXT photo_url
        TEXT old_status
        TEXT new_status
        TIMESTAMPTZ created_at
    }

    DEPARTMENTS ||--o{ USERS : "has members"
    DEPARTMENTS ||--o{ ISSUES : "receives issues"
    USERS ||--o{ ISSUES : "reports / is assigned"
    ISSUES ||--o{ ISSUE_UPDATES : "has activity log"
    USERS ||--o{ ISSUE_UPDATES : "creates updates"
```

## 3. Data Flow Diagram (Level 0 - Context)

```mermaid
flowchart LR
    Admin(("👤 Admin\n(Municipal Authority)"))
    Biker(("👤 Biker\n(Field Worker)"))
    Dept(("👤 Department Official"))

    System["Civic Issue Tracker\nSystem"]

    Admin -- "Login credentials" --> System
    System -- "Global dashboard stats,\nGlobal Map data" --> Admin
    Admin -- "Create biker profile,\nAssign task" --> System

    Biker -- "Login credentials" --> System
    Biker -- "Issue report\n(GPS, initial photo)" --> System
    Biker -- "Resolution proof\n(Final photo, comment)" --> System
    System -- "Assigned localized tasks,\nArea Maps" --> Biker

    Dept -- "Login credentials" --> System
    System -- "Department-filtered\nissue queue" --> Dept
    Dept -- "Verify & Resolve issue" --> System
```

## 4. Data Flow Diagram (Level 1)

```mermaid
flowchart TB
    Admin(("👤 Admin"))
    Biker(("👤 Biker"))
    Dept(("👤 Department Official"))

    P1["1.0\nAuthentication\nController"]
    P2["2.0\nIssue Handling\nEngine"]
    P3["3.0\nBiker Assignment\nManager"]
    P4["4.0\nDepartment\nRouting Array"]
    P5["5.0\nEvidence & Image\nStorage API"]
    P6["6.0\nGIS Map\nRendering Engine"]

    D1[("D1. Users Table")]
    D2[("D2. Issues Table")]
    D3[("D3. Departments Table")]
    D4[("D4. Issue Updates Audit")]
    D5[("D5. Supabase Storage Bucket")]

    Admin -- Auth --> P1
    Biker -- Auth --> P1
    Dept -- Auth --> P1
    P1 <--> D1
    P1 -- JWT Token + Role --> Admin
    P1 -- JWT Token + Role --> Biker
    P1 -- JWT Token + Role --> Dept

    Admin -- Manage issues --> P2
    Biker -- Submit new issue --> P2
    P2 <--> D2
    P2 <-- Read --> D3

    Admin -- Create/Assign --> P3
    P3 <--> D1
    P3 -- Link to Issue --> D2

    D2 -- Filtered Issue Stream --> P4
    D3 -- Dept Metadata --> P4
    P4 --> Dept
    Dept -- Update Status command --> P4
    P4 -- Update Record --> D2
    P4 -- Log transaction --> D4

    Biker -- Browser Image Upload --> P5
    P5 -- Store Blob --> D5
    P5 -- Return Public URL --> D2
    P5 -- Create Update Log --> D4

    D2 -- Extract (Lat, Lng, Status) --> P6
    P6 -- Render Global Layers --> Admin
    P6 -- Render Assigned/Proximity Layers --> Biker
```
