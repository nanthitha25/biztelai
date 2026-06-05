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

Below are the architectural diagrams outlining the system's design and workflows. GitHub natively supports Mermaid diagrams, so these will render automatically.

### 1. Use Case Diagram
```mermaid
flowchart LR
    User([User])
    Upload((Upload Document))
    Review((Review Extracted Data))
    Edit((Edit Data manually))
    Dashboard((View Analytics Dashboard))
    Search((Search/Filter Records))
    
    User --> Upload
    User --> Review
    User --> Edit
    User --> Dashboard
    User --> Search
```

### 2. Entity Relationship Diagram (ERD)
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
    DOCUMENT ||--o{ RECORD : "contains"
```

### 3. Sequence Diagram (Extraction Workflow)
```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as Next.js API
    participant AI as Gemini API
    participant DB as SQLite DB

    User->>UI: Uploads Image/PDF
    UI->>API: POST /api/upload
    API->>AI: Send image for OCR processing
    AI-->>API: Return structured JSON data & confidence scores
    API->>API: Run Validation Logic
    API->>DB: Save Document & extracted Records
    API-->>UI: Return extracted data
    UI-->>User: Display Review UI (Split-screen)
    User->>UI: Edits invalid/low-confidence fields
    UI->>API: PUT /api/records
    API->>DB: Update records
    API-->>UI: Success
```

### 4. Class Diagram (Core Services)
```mermaid
classDiagram
    class DocumentManager {
        +uploadDocument(file)
        +getDocuments()
        +getDocumentById(id)
    }
    class AIProcessor {
        +extractData(imageBuffer)
        -buildPrompt()
        -parseResponse()
    }
    class ValidationEngine {
        +validateRecord(record)
        -checkShift(shift)
        -checkEmployeeFormat(empNo)
        -checkQuantity(qty)
    }
    class RecordRepository {
        +saveRecords(records)
        +updateRecord(id, data)
        +getRecordsByDocument(docId)
        +getAnalytics()
    }
    DocumentManager --> AIProcessor : uses
    DocumentManager --> RecordRepository : uses
    AIProcessor --> ValidationEngine : uses
```

### 5. Activity Diagram
```mermaid
stateDiagram-v2
    [*] --> Upload_Document
    Upload_Document --> AI_Processing
    AI_Processing --> Validation_Check
    Validation_Check --> Review_Queue
    Review_Queue --> User_Review
    
    state User_Review {
        [*] --> Check_Fields
        Check_Fields --> Edit_Data : Found Errors/Low Confidence
        Edit_Data --> Check_Fields
    }
    
    User_Review --> Save_Final_Data : User Approves
    Save_Final_Data --> [*]
```
