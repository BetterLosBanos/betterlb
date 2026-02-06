/**
 * Mock API endpoints for local admin UI testing
 *
 * To use: Add these mock handlers to your Vite dev server
 * or create a mock server
 */
import type { ReviewItem } from '../../src/pages/admin/ReviewQueue';

// Mock review queue data
export const mockReviewQueue: ReviewItem[] = [
  {
    id: '1',
    item_type: 'document',
    item_id: 'resolution_sb_12_2024-001',
    issue_type: 'low_ocr_confidence',
    description: 'OCR confidence below 50% - manual review required',
    source_type: 'pdf',
    source_url: 'https://losbanos.gov.ph/resolutions/2024-001.pdf',
    status: 'pending',
    assigned_to: null,
    resolution: null,
    created_at: '2024-01-31T10:00:00Z',
    resolved_at: null,
    document: {
      id: 'resolution_sb_12_2024-001',
      type: 'resolution',
      number: '2024-001',
      title: 'AN ORDINANCE ENACTING THE SUPPLEMENTAL BUDGET',
      date_enacted: '2024-01-15',
    },
  },
  {
    id: '2',
    item_type: 'document',
    item_id: 'ordinance_sb_12_2025-2460',
    issue_type: 'missing_author',
    description: 'Could not match author from extracted text',
    source_type: 'pdf',
    source_url: 'https://losbanos.gov.ph/ordinances/2025-2460.pdf',
    status: 'in_progress',
    assigned_to: 'mock-user',
    resolution: null,
    created_at: '2024-01-31T09:30:00Z',
    resolved_at: null,
    document: {
      id: 'ordinance_sb_12_2025-2460',
      type: 'ordinance',
      number: '2025-2460',
      title: 'SUPPLEMENTAL BUDGET FOR FY 2025',
      date_enacted: '2025-01-20',
    },
  },
  {
    id: '3',
    item_type: 'session',
    item_id: 'sb_12_2025-01-15',
    issue_type: 'attendance_mismatch',
    description: 'Absent count does not match between sources',
    source_type: 'pdf',
    source_url: 'https://losbanos.gov.ph/sessions/2025-01-15.pdf',
    status: 'pending',
    assigned_to: null,
    resolution: null,
    created_at: '2024-01-31T08:00:00Z',
    resolved_at: null,
  },
];

// Mock error logs
export const mockErrors = [
  {
    filename: 'Ordinance No. 2025-2460.pdf',
    doc_type: 'ordinance',
    pdf_url: 'https://losbanos.gov.ph/ordinances/2025-2460.pdf',
    error_type: 'extraction_failure',
    error_message: 'OCR confidence below threshold (45%)',
    timestamp: '2024-01-31T15:45:00Z',
    attempted_methods: ['pdfplumber', 'pypdf2', 'ocr'],
    file_size: 644200,
    pages_processed: 2,
  },
  {
    filename: 'Resolution No. 2019-01.pdf',
    doc_type: 'resolution',
    pdf_url: 'https://losbanos.gov.ph/resolutions/2019-01.pdf',
    error_type: 'low_quality',
    error_message: 'Low OCR confidence (48%) - may contain errors',
    timestamp: '2024-01-31T15:40:00Z',
    attempted_methods: ['ocr'],
    file_size: 433200,
    pages_processed: 2,
  },
];

// Mock conflicts
export const mockConflicts = [
  {
    id: 'fb_1234567890',
    document_id: 'resolution_sb_12_2024-099',
    conflict_type: 'moved_by',
    facebook_value: 'Hon. Juan Dela Cruz',
    govph_value: 'Hon. Maria Santos',
    resolved_value: null,
    status: 'unresolved',
    created_at: '2024-01-31T10:00:00Z',
    document: {
      id: 'resolution_sb_12_2024-099',
      type: 'resolution',
      number: '2024-099',
      title: 'RESOLUTION AUTHORIZING THE USE OF MULTI-PURPOSE FUNDS',
      date_enacted: '2024-01-10',
    },
  },
  {
    id: 'fb_1234567891',
    document_id: 'ordinance_sb_12_2024-050',
    conflict_type: 'seconded_by',
    facebook_value: 'Hon. Pedro Reyes',
    govph_value: 'Hon. Ana Garcia',
    resolved_value: null,
    status: 'unresolved',
    created_at: '2024-01-31T09:00:00Z',
    document: {
      id: 'ordinance_sb_12_2024-050',
      type: 'ordinance',
      number: '2024-050',
      title: 'AN ORDINANCE REGULATING TRICYCLE OPERATIONS',
      date_enacted: '2024-01-08',
    },
  },
];

// Mock session data
export const mockSession = {
  user: {
    id: 'mock-user-1',
    login: 'mock-user',
    name: 'Mock User',
    email: 'mock@example.com',
    avatar_url: 'https://github.com/github.png',
  },
};
