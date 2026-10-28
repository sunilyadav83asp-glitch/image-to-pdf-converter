/**
 * ============================================================================
 * Image to PDF Converter - Express Backend Server
 * Technology: Node.js, Express.js, Supabase PostgreSQL
 * College Project: B.Tech Computer Science & Engineering
 * ============================================================================
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS so the React frontend (running on e.g. http://localhost:5173) can communicate with this API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Log incoming HTTP requests for debugging and visibility
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================================================
// Supabase Database Client Initialization
// ============================================================================
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const supabaseKey = process.env.SUPABASE_KEY?.trim();

let supabase = null;
const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project.supabase.co')
);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set or placeholder detected in .env.');
  console.log('ℹ️ Server will use in-memory store for local testing until Supabase is configured.');
}

// In-memory fallback storage when Supabase credentials are not configured yet
// This allows the student to run and test the project immediately out of the box!
const memoryHistory = [
  {
    id: 'demo-sample-1',
    filename: 'Sample_Assignment_Notes.pdf',
    image_count: 3,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// ============================================================================
// API Endpoints
// ============================================================================

/**
 * 1. Health Check Endpoint
 * GET /api/health
 * Used by frontend and diagnostic tools to verify server status.
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Image to PDF Converter Server is running smoothly!',
    timestamp: new Date().toISOString(),
    database: {
      type: 'Supabase PostgreSQL',
      configured: isSupabaseConfigured && supabase !== null
    }
  });
});

/**
 * 2. Get Conversion History
 * GET /api/history
 * Returns the most recent PDF conversion records, sorted by creation time (descending).
 */
app.get('/api/history', async (req, res) => {
  try {
    // If Supabase is connected, query the PostgreSQL database
    if (supabase) {
      const { data, error } = await supabase
        .from('conversion_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Supabase query error:', error.message);
        // Fall back gracefully to memory if table does not exist yet
        return res.status(200).json({
          success: true,
          source: 'memory_fallback',
          warning: `Supabase table query issue: ${error.message}. Ensure table 'conversion_history' is created using supabase/schema.sql.`,
          data: memoryHistory
        });
      }

      return res.status(200).json({
        success: true,
        source: 'supabase',
        data: data || []
      });
    }

    // In-memory fallback
    return res.status(200).json({
      success: true,
      source: 'memory',
      note: 'Operating in local memory mode. Configure SUPABASE_URL and SUPABASE_KEY in server/.env to persist in Supabase PostgreSQL.',
      data: memoryHistory
    });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversion history',
      details: err.message
    });
  }
});

/**
 * 3. Save Conversion History Record
 * POST /api/history
 * Request Body: { filename: string, image_count: number }
 * Validates input and saves conversion record into Supabase PostgreSQL.
 */
app.post('/api/history', async (req, res) => {
  try {
    const { filename, image_count } = req.body;

    // --- Validation Rules ---
    if (!filename || typeof filename !== 'string' || filename.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: "filename" is required and must be a non-empty string.'
      });
    }

    const cleanFilename = filename.trim();
    if (cleanFilename.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: "filename" exceeds maximum length of 255 characters.'
      });
    }

    const count = Number(image_count);
    if (!Number.isInteger(count) || count <= 0 || count > 500) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: "image_count" must be an integer between 1 and 500.'
      });
    }

    const newRecord = {
      filename: cleanFilename.endsWith('.pdf') ? cleanFilename : `${cleanFilename}.pdf`,
      image_count: count,
      created_at: new Date().toISOString()
    };

    // If Supabase is connected, insert record into PostgreSQL table
    if (supabase) {
      const { data, error } = await supabase
        .from('conversion_history')
        .insert([newRecord])
        .select();

      if (error) {
        console.error('Supabase insert error:', error.message);
        // Fall back to memory cache if table is missing so user doesn't face fatal failure
        const fallbackRecord = { id: `local-${Date.now()}`, ...newRecord };
        memoryHistory.unshift(fallbackRecord);

        return res.status(201).json({
          success: true,
          source: 'memory_fallback',
          warning: `Supabase insert failed: ${error.message}. Saved to local memory. Please run supabase/schema.sql in Supabase SQL editor.`,
          data: fallbackRecord
        });
      }

      console.log('Saved conversion record to Supabase:', data?.[0]);
      return res.status(201).json({
        success: true,
        source: 'supabase',
        data: data?.[0] || newRecord
      });
    }

    // Fallback: save to memory history
    const savedRecord = {
      id: `local-${Date.now()}`,
      ...newRecord
    };
    memoryHistory.unshift(savedRecord);
    console.log('Saved conversion record to memory store:', savedRecord);

    return res.status(201).json({
      success: true,
      source: 'memory',
      note: 'Saved in memory. Set Supabase credentials in server/.env for cloud PostgreSQL storage.',
      data: savedRecord
    });
  } catch (err) {
    console.error('Error saving history record:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to record conversion history',
      details: err.message
    });
  }
});

// 404 Route Handler for undefined endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Start Express HTTP server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Image to PDF Converter Server running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👉 History API:  http://localhost:${PORT}/api/history`);
  console.log(`=======================================================`);
});

