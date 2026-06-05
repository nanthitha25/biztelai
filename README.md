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
- **Testing**: Jest & React Testing Library (TDD Approach for Validation Logic)

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory and add your Gemini API Key:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application. The SQLite database (`biztel.db`) will be automatically initialized on first run.

---

## Architecture & Workflows

Below are the architectural diagrams outlining the system's design and workflows, incorporating our Test-Driven Development (TDD) and QA strategies at every layer. GitHub natively supports Mermaid diagrams, so these will render automatically.

### 1. System Architecture Diagram
```mermaid
flowchart TD
    subgraph Client
        UI[Next.js React Frontend]
    end
    subgraph Server
        API[Next.js API Routes]
        Val[Validation Engine]
    end
    subgraph External
        AI[Gemini 2.5 Vision API]
    end
    subgraph Data
        DB[(SQLite Database)]
    end
    subgraph Testing
        Jest[Jest / TDD Suite]
        Playwright[E2E Testing]
    end
    
    UI -->|HTTP Requests| API
    API -->|Prompt & Image| AI
    AI -->|JSON Data| API
    API -->|Validates| Val
    Val -->|Reads/Writes| DB
    Jest -.->|Unit Tests| Val
    Jest -.->|Unit Tests| API
    Playwright -.->|UI Tests| UI
```

### 2. Use Case Diagram
```mermaid
flowchart LR
    User([Factory Operator])
    Tester([QA / Automated TDD Suite])
    
    Upload((Upload Document))
    Review((Review Extracted Data))
    Edit((Edit Data manually))
    Dashboard((View Analytics Dashboard))
    Search((Search/Filter Records))
    Test((Execute Unit/Integration Tests))
    
    User --> Upload
    User --> Review
    User --> Edit
    User --> Dashboard
    User --> Search
    
    Tester -.-> Test
    Test -.-> Upload : verifies
    Test -.-> Review : validates
```

### 3. Entity Relationship Diagram (ERD)
```mermaid
erDiagram
    DOCUMENT {
        string id PK
        string filename
        string originalImageUrl
        datetime uploadedAt
        string status
    }
    RECORD {
        string id PK
        string documentId FK
        string date
        int shift
        string empNo
        string opnCode
        string machineNo
        string workOrderNo
        int qtyProd
        float timeTaken
        string confidenceData
        string validationErrors
        string status
    }
    TEST_REPORT {
        string testId PK
        string component FK
        boolean passed
        datetime executedAt
    }
    DOCUMENT ||--o{ RECORD : "contains"
    TEST_REPORT }o--|| RECORD : "validates data shape"
```

### 4. Sequence Diagrams

#### A. Upload & Extraction Workflow (With TDD Mocks)
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as Next.js API
    participant AI as Gemini API
    participant Test as Jest Unit Tests
    participant DB as SQLite DB

    Test->>API: Execute TDD Mock: POST /api/upload
    User->>UI: Uploads Image/PDF
    UI->>API: POST /api/upload
    API->>AI: Send image for OCR processing
    AI-->>API: Return structured JSON data
    API->>Test: Assert Validation Logic Engine
    API->>DB: Save Document & extracted Records
    API-->>UI: Return extracted data
```

#### B. Review & Edit Workflow
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as Next.js API
    participant DB as SQLite DB
    participant Test as E2E Testing

    Test->>UI: Assert UI components render correctly
    User->>UI: Edits invalid/low-confidence fields
    User->>UI: Clicks Save Record
    UI->>API: PUT /api/records
    API->>API: Re-run strict validation logic
    API->>DB: Update record & clear flags
    DB-->>API: Success
    API-->>UI: Row marked as verified
```

#### C. View Operational Dashboard Workflow
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as Next.js API
    participant DB as SQLite DB

    User->>UI: Navigates to Dashboard
    UI->>API: GET /api/dashboard
    API->>DB: Execute Aggregate SQL Queries (SUM, COUNT)
    DB-->>API: Return dashboard statistics
    API-->>UI: JSON response mapping
    UI-->>User: Render interactive Charts & Tables
```

### 5. Class Diagram (Core Services)
```mermaid
classDiagram
    class DocumentManager {
        +uploadDocument(file)
        +getDocuments()
    }
    class AIProcessor {
        +extractData(imageBuffer)
        -buildPrompt()
    }
    class ValidationEngine {
        +validateRecord(record)
        -checkShift(shift)
        -checkQuantity(qty)
    }
    class RecordRepository {
        +saveRecords(records)
        +getAnalytics()
    }
    class TDD_Runner {
        <<Testing>>
        +mockGeminiResponse()
        +assertValidationRules()
    }
    
    DocumentManager --> AIProcessor : uses
    DocumentManager --> RecordRepository : uses
    AIProcessor --> ValidationEngine : uses
    TDD_Runner ..> ValidationEngine : tests rigorously
```

### 6. Activity Diagram
```mermaid
stateDiagram-v2
    [*] --> TDD_Pipeline : CI/CD Triggers
    TDD_Pipeline --> Upload_Document : Tests Pass
    
    Upload_Document --> AI_Processing
    AI_Processing --> Validation_Check
    Validation_Check --> Review_Queue
    
    state Review_Queue {
        [*] --> Check_Fields
        Check_Fields --> Edit_Data : Found Errors/Low Confidence
        Edit_Data --> Check_Fields
    }
    
    Review_Queue --> Save_Final_Data : User Approves
    Save_Final_Data --> [*]
```
