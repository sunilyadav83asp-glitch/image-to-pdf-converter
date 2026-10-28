# Image to PDF Converter 📄✨
> **B.Tech Computer Science & Engineering — Mini Project**

A modern, fast, and secure web application that allows users to upload multiple images (JPG, JPEG, PNG), preview and reorder them, customize page settings (size, orientation, margins), and convert them into a single high-quality PDF document with one click.

---

## 📌 1. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Fast, reactive, component-based user interface |
| **Styling** | Vanilla CSS3 | Clean, responsive blue & white college-project theme |
| **Icons** | Lucide React | Modern, lightweight UI iconography |
| **PDF Engine** | jsPDF | Pure client-side PDF document generation |
| **Backend** | Node.js + Express.js | RESTful API for health check & conversion history |
| **Database** | Supabase PostgreSQL | Cloud relational database for conversion history |

---

## 🌟 2. Key Features

- [x] **Clean, Modern UI**: Designed with a professional blue and white theme.
- [x] **Multiple File Upload**: Drag-and-drop or browse JPG, JPEG, and PNG images.
- [x] **Interactive Previews**: View image thumbnails, file names, file sizes, and page numbers.
- [x] **Page Reordering**: Rearrange image order using arrow buttons or drag-and-drop.
- [x] **Page Removal**: Delete individual images or clear all in one click.
- [x] **PDF Customization**:
  - **Page Size**: A4 ($210 \times 297\text{ mm}$) or Letter ($8.5 \times 11\text{ in}$).
  - **Orientation**: Portrait or Landscape.
  - **Margins**: None ($0\text{ mm}$), Small ($8\text{ mm}$), or Normal ($16\text{ mm}$).
  - **Image Scaling**: Fit (preserves original aspect ratio) or Stretch to page.
  - **Custom Output Name**: Choose your own PDF file name.
- [x] **Pure Client-Side PDF Generation**: Images are processed directly inside the user's browser using jsPDF, ensuring fast speed and total privacy (no files sent over the network).
- [x] **Instant Download**: Direct browser download with re-download option.
- [x] **Conversion History Modal**: View past conversion logs fetched from Supabase PostgreSQL (with automatic in-memory fallback for offline testing).
- [x] **Full Error Handling**: Input validation, unsupported file warnings, and toast notifications.

---

## 📂 3. Project Directory Structure

```text
image-to-pdf/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── Header.jsx           # App title, server status, history trigger
│   │   │   ├── UploadArea.jsx       # Drag & drop upload box
│   │   │   ├── ImagePreviewList.jsx # Image cards, reordering, delete
│   │   │   ├── PdfSettings.jsx      # Page size, orientation, margin, convert button
│   │   │   ├── HistoryModal.jsx     # Supabase history log dialog
│   │   │   ├── Toast.jsx            # Success & error message banners
│   │   │   └── Footer.jsx           # Project attribution and tech badges
│   │   ├── utils/
│   │   │   ├── formatters.js        # File size and date formatting helpers
│   │   │   └── pdfGenerator.js      # jsPDF conversion and aspect ratio engine
│   │   ├── App.jsx             # Main stateful component
│   │   ├── main.jsx            # React root entry point
│   │   └── styles.css          # Blue & white responsive stylesheet
│   ├── index.html              # HTML template with Inter font
│   ├── vite.config.js          # Vite config with API proxy
│   └── package.json            # Frontend dependencies
│
├── server/                     # Backend API (Node.js + Express)
│   ├── server.js               # Express server with Supabase integration
│   ├── package.json            # Backend dependencies
│   ├── .env                    # Local environment variables
│   └── .env.example            # Template for environment variables
│
├── supabase/
│   └── schema.sql              # PostgreSQL schema & Row Level Security (RLS)
│
├── package.json                # Root package with helper scripts
├── .gitignore                  # Git ignore rules
└── README.md                   # Complete documentation & viva guide
```

---

## 🚀 4. How to Run the Project

### Prerequisites
Make sure **Node.js (v18 or higher)** is installed on your computer.

---

### Step 1: Start the Backend Server

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. (Optional) Configure Supabase credentials in `server/.env`:
   ```env
   PORT=5000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-anon-key
   ```
   > **Note:** If Supabase is not configured yet, the server will automatically run in local in-memory fallback mode so you can test the application immediately without errors!

3. Start the Express server:
   ```bash
   npm start
   ```
   The server will start on `http://localhost:5000`.

---

### Step 2: Start the Frontend Client

1. Open a **second terminal** and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 🗄️ 5. Supabase Database Setup

To store conversion history in the cloud:

1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project (e.g. `image-to-pdf`).
3. In your Supabase dashboard, click **SQL Editor** on the left menu.
4. Open the file `supabase/schema.sql` from this repository, copy its contents, paste them into the SQL Editor, and click **Run**:

```sql
CREATE TABLE IF NOT EXISTS conversion_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    image_count INTEGER NOT NULL CHECK (image_count > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE conversion_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to conversion history"
ON conversion_history FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert of conversion history"
ON conversion_history FOR INSERT TO anon, authenticated
WITH CHECK (
    char_length(filename) > 0 AND 
    char_length(filename) <= 255 AND 
    image_count > 0 AND 
    image_count <= 200
);
```

5. Go to **Project Settings** -> **API** and copy:
   - **Project URL**
   - **anon / public key**
6. Paste them into `server/.env`:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_KEY=eyJhbGciOi...
   ```
7. Restart the backend server. The history will now persist in Supabase PostgreSQL!

---

## 📡 6. Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns server health status and database connectivity. |
| `GET` | `/api/history` | Fetches the 50 most recent PDF conversion records. |
| `POST` | `/api/history` | Records a new conversion with `{ filename, image_count }`. |

### Example Request (`POST /api/history`):
```json
{
  "filename": "Lecture_Notes.pdf",
  "image_count": 4
}
```

### Example Response:
```json
{
  "success": true,
  "source": "supabase",
  "data": {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "filename": "Lecture_Notes.pdf",
    "image_count": 4,
    "created_at": "2026-10-28T09:15:00.000Z"
  }
}
```

---

## 🎓 7. Project Viva / Oral Exam Q&A Guide

Here are answers to common questions professors ask during college project evaluations:

### Q1: Why generate PDFs on the client-side with jsPDF instead of uploading images to the backend?
> **Answer:** 
> 1. **User Privacy & Security**: User images never leave the browser or get stored on an external server, eliminating data leaks.
> 2. **Scalability & Zero Server Overload**: Large image files consume significant server CPU, memory, and bandwidth. Client-side rendering offloads the heavy processing to the user's browser.
> 3. **Instant Performance**: No network upload delays for multi-megabyte photos.

### Q2: Why choose Supabase PostgreSQL over MongoDB?
> **Answer:**
> 1. **Relational Integrity**: Conversion logs have a structured schema (`id`, `filename`, `image_count`, `created_at`) where SQL data types and constraints (`CHECK (image_count > 0)`) enforce data validity.
> 2. **Row Level Security (RLS)**: Supabase PostgreSQL provides native, database-level security policies to restrict unauthorized modifications without needing complicated backend rules.
> 3. **ACID Compliance**: Ensures reliable transactions and data consistency.

### Q3: How do you prevent image distortion when placing pictures on A4 or Letter pages?
> **Answer:**
> In `client/src/utils/pdfGenerator.js`, we compute the natural aspect ratio of the image:
> $$\text{Ratio} = \frac{\text{Image Width}}{\text{Image Height}}$$
> We then compare it against the printable page area ratio:
> $$\text{Printable Ratio} = \frac{\text{Page Width} - 2 \times \text{Margin}}{\text{Page Height} - 2 \times \text{Margin}}$$
> If the image is wider, we scale by width; if it is taller, we scale by height. This preserves the original proportions without stretching or pixel distortion.

### Q4: How is security handled if user authentication is not implemented?
> **Answer:**
> 1. Privileged Supabase service keys are **never** bundled into the client-side bundle. Only the backend communicates with the database using environment variables (`.env`).
> 2. In PostgreSQL, Row Level Security (RLS) is enabled. Only `SELECT` and sanitized `INSERT` operations are permitted; `UPDATE` and `DELETE` queries are disabled to prevent malicious tampering.
> 3. Backend validates inputs: `filename` length is restricted ($\le 255$ characters) and `image_count` must be a positive integer.

---

## 👨‍💻 8. Author & Credits
- **Project Name**: Image to PDF Converter
- **Course**: B.Tech Computer Science & Engineering
- **Libraries Used**: React, Vite, Express.js, Supabase, jsPDF, Lucide React

