# BiztelAI - AI-Powered Workflow Automation System

A web application prototype built for the BiztelAI Engineering Assignment that digitizes handwritten/semi-structured operational documents and converts them into structured, reviewable operational records with analytics and validation workflows.

## Features

1. **Document Upload**: Users can upload images or PDFs of handwritten operational documents.
2. **AI-Based Data Extraction**: Leverages Google Gemini 2.5 Flash Vision OCR to extract structured information (Date, Shift, Emp No, etc.) and assign confidence scores based on legibility.
3. **Review Workflow**: A split-screen interface displaying the uploaded document alongside an editable data grid for manual correction.
4. **Validation & Exception Handling**: Business rules automatically flag suspicious values (e.g., Time taken > 12 hours, invalid shifts, missing quantities) directly in the UI.
5. **Dashboard & Analytics**: Provides operational insights such as total uploads, shift-wise summaries, and machine-wise output.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Local SQLite (`better-sqlite3`)
- **AI/LLM**: Google Gemini API (`@google/genai`)
- **Styling**: Vanilla CSS (CSS Modules) with a custom Glassmorphism UI theme.

## Setup Instructions

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up Environment Variables: 
Create a `.env.local` file in the root directory and add your Gemini API Key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```
4. Run the Development Server:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application. The SQLite database (`biztel.db`) will be automatically initialized on first run.

---

## Architecture & Workflows

Below are the architectural diagrams outlining the system's design and workflows.

### High-Level System Architecture
```mermaid
flowchart TD
    Client[Web Browser Client] -->|Next.js App Router| Frontend[Next.js Frontend UI]
    Frontend -->|API Requests| Backend[Next.js API Routes]
    Backend -->|Read/Write| DB[(SQLite Database)]
    Backend -->|Vision OCR Prompt| Gemini[Google Gemini 2.5 Flash API]
    Backend -->|Business Rules| Validation[Validation Engine]
    
    style Client fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#fff
    style Frontend fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#fff
    style Backend fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff
    style DB fill:#1e293b,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style Gemini fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff
    style Validation fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#fff
```

### 1. Use Case Diagram
```mermaid
usecaseDiagram
    actor "Factory Operator" as operator
    actor "Google Gemini API" as gemini
    
    rectangle "BiztelAI System" {
        usecase "Upload Shop-Floor Log" as UC1
        usecase "Review Extracted Records" as UC2
        usecase "Manually Edit/Correct Fields" as UC3
        usecase "View Operational Dashboard" as UC4
        usecase "Process Vision OCR & Confidence" as UC5
    }
    
    operator --> UC1
    operator --> UC2
    operator --> UC3
    operator --> UC4
    
    UC1 ..> UC5 : <<include>>
    UC5 --> gemini
```

### 2. Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    DOCUMENTS {
        string id PK
        string file_path
        timestamp uploaded_at
        string status
    }
    OPERATIONAL_RECORDS {
        int id PK
        string document_id FK
        int sequence_number
        string log_date
        string shift
        string employee_num
        string operation_code
        string machine_num
        string work_order_num
        int quantity_produced
        float confidence_score
        string validation_status
    }
    DOCUMENTS ||--o{ OPERATIONAL_RECORDS : "contains"
```

### 3. Sequence Diagrams

#### A. Document Upload & Extraction Workflow (UC1 & UC5)
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Factory Operator
    participant UI as Next.js Frontend
    participant API as Next.js Route Handler
    participant DB as SQLite DB
    participant Gemini as Gemini 2.5 Vision API

    Operator->>UI: Upload handwritten image log
    UI->>API: POST /api/upload (FormData)
    API->>DB: Initialize Document Record (Status: Pending)
    API->>Gemini: Pass image bytes + Structured Extraction Prompt
    Gemini-->>API: Return Structured JSON (Fields + Confidence Scores)
    API->>API: Execute Business Validation Rules
    API->>DB: Save extracted rows & validation flags
    API-->>UI: Return parsed data payload
    UI-->>Operator: Render side-by-side editable data grid
```

#### B. Manual Review & Editing Workflow (UC2 & UC3)
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Factory Operator
    participant UI as Next.js Frontend
    participant API as Next.js Route Handler
    participant DB as SQLite DB

    Operator->>UI: View Extracted Records (Split-Screen)
    UI->>Operator: Highlight Low Confidence & Validation Errors
    Operator->>UI: Modify cell data (e.g. fix quantity)
    UI->>API: PUT /api/records (Updated Data)
    API->>API: Re-run Business Validation Rules
    API->>DB: Update Record & clear validation errors if fixed
    API-->>UI: Return Success
    UI-->>Operator: Display "Saved" badge
```

#### C. Dashboard Analytics Workflow (UC4)
```mermaid
sequenceDiagram
    autonumber
    actor Operator as Factory Operator
    participant UI as Next.js Frontend
    participant API as Next.js Route Handler
    participant DB as SQLite DB

    Operator->>UI: Navigate to Dashboard
    UI->>API: GET /api/dashboard
    API->>DB: Query Aggregated Metrics (Uploads, Shifts, Output)
    DB-->>API: Return counts and grouped metrics
    API-->>UI: Return Dashboard Stats JSON
    UI-->>Operator: Render Metrics Cards & Analytics Tables
```

### 4. Class Diagram (Core Services)
```mermaid
classDiagram
    class DocumentController {
        +uploadDocument(req)
        +getDocumentLogs(id)
    }
    class ExtractionService {
        +convertImageToJSON(imageBuffer)
        -buildExtractionPrompt()
    }
    class ValidationEngine {
        +validateRow(rowData)
        -checkShiftValue(shift)
        -checkQuantity(qty)
    }
    class DatabaseClient {
        +saveDocument(docData)
        +saveExtractedRows(rows)
        +getDashboardMetrics()
    }

    DocumentController --> ExtractionService : orchestrates
    ExtractionService --> ValidationEngine : passes data to
    DocumentController --> DatabaseClient : persists via
```

### 5. Activity Diagram
```mermaid
stateDiagram-v2
    [*] --> ImageUploaded : Operator Uploads Form
    ImageUploaded --> Processing : Sent to Gemini Vision API
    
    state Processing {
        [*] --> ExtractingText
        ExtractingText --> AssigningConfidenceScores
        AssigningConfidenceScores --> ApplicationValidation
    }
    
    Processing --> ReviewQueue : Processing Complete
    
    state ReviewQueue {
        [*] --> CheckFlags
        CheckFlags --> HighlightWarnings : High Uncertainty / Validation Failure Found
        CheckFlags --> StandardDisplay : Clean Extracted Row
        HighlightWarnings --> ManualCorrection : Operator Edits Grid
        StandardDisplay --> ManualCorrection : Optional Operator Edit
        ManualCorrection --> Saved : Operator Clicks "Save Record"
    }
    
    ReviewQueue --> DashboardUpdated : Commit to SQLite
    DashboardUpdated --> [*]
```
