import React, { Fragment, useState } from 'react';
import {
  BookOpen, GraduationCap, Award, Play, CheckCircle, XCircle, Clock, Star, Users,
  DollarSign, TrendingUp, BarChart3, ChevronDown, ChevronUp, Search, Filter, Plus,
  FileText, Video, HelpCircle, Monitor, Wrench, ArrowRight, Download, Trophy,
  Medal, Flame, Target, Zap, Shield, AlertTriangle, Plane, Globe, Settings,
  X, Loader2, GripVertical, Trash2, Eye,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { TrainingCourse, TrainingEnrollment, TrainingStats } from '../../../shared/types/training';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockCourses: TrainingCourse[] = [
  {
    id: 'CRS-001', title: 'FAA Part 107 Exam Prep', description: 'Comprehensive preparation for the FAA Part 107 Remote Pilot Knowledge Test. Covers airspace classification, weather, regulations, operations, and emergency procedures. Includes practice exams with detailed explanations.',
    category: 'part_107_prep', level: 'beginner', duration: 480,
    modules: [
      { id: 'M-001-01', title: 'Introduction to Part 107', type: 'video', duration: 30, content: 'Overview of Part 107 regulations and requirements', order: 1, completed: true, score: undefined },
      { id: 'M-001-02', title: 'Airspace Classification', type: 'video', duration: 45, content: 'Class A through G airspace, special use airspace', order: 2, completed: true, score: undefined },
      { id: 'M-001-03', title: 'Airspace Knowledge Check', type: 'quiz', duration: 20, content: 'Quiz on airspace classifications', order: 3, completed: true, score: 88, passingScore: 70 },
      { id: 'M-001-04', title: 'Weather & Meteorology', type: 'video', duration: 60, content: 'METARs, TAFs, weather effects on UAS', order: 4, completed: true, score: undefined },
      { id: 'M-001-05', title: 'Regulations & Operations', type: 'reading', duration: 45, content: 'Part 107 regulatory requirements', order: 5, completed: false },
      { id: 'M-001-06', title: 'Sectional Charts', type: 'video', duration: 40, content: 'Reading and interpreting sectional charts', order: 6, completed: false },
      { id: 'M-001-07', title: 'Practice Exam 1', type: 'quiz', duration: 60, content: 'Full-length practice exam', order: 7, passingScore: 70 },
      { id: 'M-001-08', title: 'Practice Exam 2', type: 'quiz', duration: 60, content: 'Full-length practice exam', order: 8, passingScore: 70 },
    ],
    instructor: 'Capt. James Wilson', prerequisites: [], certification: { awarded: true, name: 'Part 107 Prep Certificate', validityPeriod: 24 },
    enrollmentCount: 1245, avgRating: 4.8, completionRate: 82, price: 0, tags: ['faa', 'part-107', 'knowledge-test', 'beginner'], createdAt: '2025-06-01', updatedAt: '2026-02-15',
  },
  {
    id: 'CRS-002', title: 'Part 107 Recurrent Training', description: 'Biennial recurrent knowledge training required for Part 107 Remote Pilot Certificate renewal. Updated for 2026 regulatory changes including Remote ID requirements.',
    category: 'part_107_recurrent', level: 'intermediate', duration: 180,
    modules: [
      { id: 'M-002-01', title: 'Regulatory Updates 2025-2026', type: 'reading', duration: 30, content: 'Latest FAA regulatory changes', order: 1, completed: true },
      { id: 'M-002-02', title: 'Remote ID Compliance', type: 'video', duration: 25, content: 'Remote ID requirements and compliance', order: 2, completed: true },
      { id: 'M-002-03', title: 'Updated Airspace Procedures', type: 'video', duration: 30, content: 'New LAANC and airspace procedures', order: 3, completed: true },
      { id: 'M-002-04', title: 'Recurrent Knowledge Exam', type: 'quiz', duration: 45, content: 'Comprehensive recurrent exam', order: 4, completed: true, score: 92, passingScore: 70 },
    ],
    instructor: 'Capt. James Wilson', prerequisites: ['CRS-001'], certification: { awarded: true, name: 'Part 107 Recurrent Certificate', validityPeriod: 24 },
    enrollmentCount: 892, avgRating: 4.6, completionRate: 91, price: 49.99, tags: ['faa', 'part-107', 'recurrent', 'renewal'], createdAt: '2025-08-01', updatedAt: '2026-01-10',
  },
  {
    id: 'CRS-003', title: 'Company SOPs & Operational Standards', description: 'Internal standard operating procedures covering pre-flight checks, mission planning, communication protocols, and emergency response procedures specific to your organization.',
    category: 'company_sop', level: 'beginner', duration: 240,
    modules: [
      { id: 'M-003-01', title: 'Company Overview & Culture', type: 'video', duration: 20, content: 'Organization mission and safety culture', order: 1 },
      { id: 'M-003-02', title: 'Pre-Flight Procedures', type: 'reading', duration: 30, content: 'Step-by-step pre-flight checklist', order: 2 },
      { id: 'M-003-03', title: 'Mission Planning SOP', type: 'video', duration: 35, content: 'Mission planning workflow and tools', order: 3 },
      { id: 'M-003-04', title: 'Communication Protocols', type: 'reading', duration: 25, content: 'Radio and team communication standards', order: 4 },
      { id: 'M-003-05', title: 'SOP Knowledge Check', type: 'quiz', duration: 30, content: 'SOP comprehension test', order: 5, passingScore: 80 },
    ],
    instructor: 'Sarah Kim', prerequisites: [], certification: { awarded: true, name: 'SOP Certified Operator', validityPeriod: 12 },
    enrollmentCount: 456, avgRating: 4.3, completionRate: 78, price: 0, tags: ['sop', 'internal', 'onboarding'], createdAt: '2025-09-15', updatedAt: '2026-03-01',
  },
  {
    id: 'CRS-004', title: 'Advanced UAS Safety Management', description: 'In-depth safety management systems (SMS) training covering hazard identification, risk assessment matrices, safety reporting culture, and accident investigation methods.',
    category: 'safety', level: 'advanced', duration: 360,
    modules: [
      { id: 'M-004-01', title: 'SMS Fundamentals', type: 'video', duration: 40, content: 'Safety Management System overview', order: 1 },
      { id: 'M-004-02', title: 'Hazard Identification', type: 'video', duration: 35, content: 'Methods for identifying hazards', order: 2 },
      { id: 'M-004-03', title: 'Risk Assessment Matrix', type: 'simulation', duration: 60, content: 'Interactive risk assessment exercises', order: 3 },
      { id: 'M-004-04', title: 'Safety Reporting Culture', type: 'reading', duration: 30, content: 'Building a just safety culture', order: 4 },
      { id: 'M-004-05', title: 'Accident Investigation', type: 'video', duration: 45, content: 'Investigation methodologies', order: 5 },
      { id: 'M-004-06', title: 'Safety Management Exam', type: 'quiz', duration: 45, content: 'Comprehensive safety exam', order: 6, passingScore: 80 },
    ],
    instructor: 'Dr. Maria Santos', prerequisites: ['CRS-001'], certification: { awarded: true, name: 'UAS Safety Manager Certificate', validityPeriod: 24 },
    enrollmentCount: 324, avgRating: 4.9, completionRate: 74, price: 149.99, tags: ['safety', 'sms', 'risk-management', 'advanced'], createdAt: '2025-07-01', updatedAt: '2026-02-20',
  },
  {
    id: 'CRS-005', title: 'Emergency Procedures & Crisis Response', description: 'Training on emergency procedures including flyaway recovery, loss of signal protocols, battery emergencies, and coordination with ATC and emergency services.',
    category: 'emergency_procedures', level: 'intermediate', duration: 200,
    modules: [
      { id: 'M-005-01', title: 'Emergency Types Overview', type: 'video', duration: 25, content: 'Classification of UAS emergencies', order: 1 },
      { id: 'M-005-02', title: 'Flyaway Recovery', type: 'simulation', duration: 40, content: 'Simulated flyaway scenarios', order: 2 },
      { id: 'M-005-03', title: 'Loss of Signal Protocols', type: 'video', duration: 30, content: 'C2 link loss procedures', order: 3 },
      { id: 'M-005-04', title: 'ATC Coordination', type: 'reading', duration: 25, content: 'Emergency communication with ATC', order: 4 },
      { id: 'M-005-05', title: 'Emergency Scenarios Exam', type: 'quiz', duration: 30, content: 'Emergency procedure assessment', order: 5, passingScore: 85 },
    ],
    instructor: 'Juan Martinez', prerequisites: ['CRS-001', 'CRS-003'], certification: { awarded: true, name: 'Emergency Response Certified', validityPeriod: 12 },
    enrollmentCount: 567, avgRating: 4.7, completionRate: 85, price: 79.99, tags: ['emergency', 'crisis', 'atc', 'safety'], createdAt: '2025-10-01', updatedAt: '2026-01-15',
  },
  {
    id: 'CRS-006', title: 'International UAS Regulations', description: 'Overview of drone regulations across major markets including EU (EASA), UK (CAA), Canada (RPAS), Australia (CASA), and Japan (MLIT). Essential for multinational operations.',
    category: 'country_regulations', level: 'intermediate', duration: 300,
    modules: [
      { id: 'M-006-01', title: 'EASA EU Drone Regulations', type: 'reading', duration: 45, content: 'EU open, specific, certified categories', order: 1 },
      { id: 'M-006-02', title: 'UK CAA Framework', type: 'reading', duration: 35, content: 'UK drone regulations post-Brexit', order: 2 },
      { id: 'M-006-03', title: 'Transport Canada RPAS', type: 'video', duration: 30, content: 'Canadian drone regulations', order: 3 },
      { id: 'M-006-04', title: 'CASA Australia', type: 'reading', duration: 30, content: 'Australian UAS framework', order: 4 },
      { id: 'M-006-05', title: 'Asia-Pacific Overview', type: 'video', duration: 35, content: 'Japan, Korea, Singapore regulations', order: 5 },
      { id: 'M-006-06', title: 'International Regulations Exam', type: 'quiz', duration: 40, content: 'Multi-jurisdiction knowledge test', order: 6, passingScore: 70 },
    ],
    instructor: 'Dr. Elena Kowalski', prerequisites: [], certification: { awarded: true, name: 'International UAS Regulations Certificate', validityPeriod: 12 },
    enrollmentCount: 234, avgRating: 4.4, completionRate: 68, price: 129.99, tags: ['international', 'easa', 'regulations', 'global'], createdAt: '2025-11-01', updatedAt: '2026-03-05',
  },
  {
    id: 'CRS-007', title: 'DJI Matrice 350 RTK Operations', description: 'Equipment-specific training for the DJI Matrice 350 RTK platform. Covers assembly, calibration, payload management, RTK setup, and advanced flight modes.',
    category: 'equipment_specific', level: 'intermediate', duration: 280,
    modules: [
      { id: 'M-007-01', title: 'Platform Overview & Assembly', type: 'video', duration: 35, content: 'M350 RTK specifications and assembly', order: 1 },
      { id: 'M-007-02', title: 'Calibration & Setup', type: 'practical', duration: 45, content: 'Hands-on calibration procedures', order: 2 },
      { id: 'M-007-03', title: 'Payload Management', type: 'video', duration: 30, content: 'Camera and sensor payloads', order: 3 },
      { id: 'M-007-04', title: 'RTK Configuration', type: 'practical', duration: 40, content: 'RTK base station and rover setup', order: 4 },
      { id: 'M-007-05', title: 'Advanced Flight Modes', type: 'simulation', duration: 50, content: 'Waypoint, orbit, and mapping modes', order: 5 },
      { id: 'M-007-06', title: 'Practical Assessment', type: 'quiz', duration: 30, content: 'Platform knowledge assessment', order: 6, passingScore: 75 },
    ],
    instructor: 'Mike Chen', prerequisites: ['CRS-001'], certification: { awarded: true, name: 'M350 RTK Operator Certified', validityPeriod: 24 },
    enrollmentCount: 389, avgRating: 4.5, completionRate: 72, price: 199.99, tags: ['dji', 'matrice-350', 'rtk', 'equipment'], createdAt: '2025-06-15', updatedAt: '2026-02-10',
  },
  {
    id: 'CRS-008', title: 'Advanced Mapping & Photogrammetry', description: 'Learn advanced drone mapping techniques including photogrammetry, LiDAR processing, orthomosaic generation, 3D modeling, and volumetric analysis for surveying and inspection.',
    category: 'advanced_operations', level: 'advanced', duration: 420,
    modules: [
      { id: 'M-008-01', title: 'Photogrammetry Fundamentals', type: 'video', duration: 45, content: 'Principles of aerial photogrammetry', order: 1 },
      { id: 'M-008-02', title: 'Flight Planning for Mapping', type: 'video', duration: 35, content: 'GSD, overlap, and flight parameters', order: 2 },
      { id: 'M-008-03', title: 'GCP Placement & Survey', type: 'practical', duration: 60, content: 'Ground control point strategies', order: 3 },
      { id: 'M-008-04', title: 'Processing Software', type: 'simulation', duration: 90, content: 'Pix4D, DroneDeploy, Agisoft workflows', order: 4 },
      { id: 'M-008-05', title: 'Deliverables & Analysis', type: 'video', duration: 40, content: 'Orthomosaics, DSM, volumetrics', order: 5 },
      { id: 'M-008-06', title: 'Mapping Project Assessment', type: 'quiz', duration: 45, content: 'Comprehensive mapping knowledge test', order: 6, passingScore: 75 },
    ],
    instructor: 'Dr. Alex Rivera', prerequisites: ['CRS-001', 'CRS-007'], certification: { awarded: true, name: 'Advanced Mapping Specialist', validityPeriod: 24 },
    enrollmentCount: 278, avgRating: 4.7, completionRate: 65, price: 249.99, tags: ['mapping', 'photogrammetry', 'lidar', 'surveying'], createdAt: '2025-08-01', updatedAt: '2026-03-10',
  },
  {
    id: 'CRS-009', title: 'BVLOS Operations Training', description: 'Beyond Visual Line of Sight operations training covering regulatory requirements, DAA systems, command and control links, operational risk assessments, and waiver preparation.',
    category: 'bvlos_training', level: 'advanced', duration: 540,
    modules: [
      { id: 'M-009-01', title: 'BVLOS Regulatory Framework', type: 'reading', duration: 40, content: '14 CFR 107.31 waiver requirements', order: 1 },
      { id: 'M-009-02', title: 'Detect and Avoid Systems', type: 'video', duration: 50, content: 'DAA technology and compliance', order: 2 },
      { id: 'M-009-03', title: 'C2 Link Requirements', type: 'video', duration: 35, content: 'Command and control link standards', order: 3 },
      { id: 'M-009-04', title: 'CONOPS Development', type: 'simulation', duration: 90, content: 'Building a BVLOS concept of operations', order: 4 },
      { id: 'M-009-05', title: 'Risk Assessment (SORA)', type: 'simulation', duration: 60, content: 'Specific Operations Risk Assessment', order: 5 },
      { id: 'M-009-06', title: 'Waiver Application Workshop', type: 'practical', duration: 60, content: 'Preparing FAA BVLOS waiver applications', order: 6 },
      { id: 'M-009-07', title: 'BVLOS Comprehensive Exam', type: 'quiz', duration: 60, content: 'Full BVLOS knowledge assessment', order: 7, passingScore: 85 },
    ],
    instructor: 'Aisha Patel', prerequisites: ['CRS-001', 'CRS-004', 'CRS-005'], certification: { awarded: true, name: 'BVLOS Operations Specialist', validityPeriod: 12 },
    enrollmentCount: 156, avgRating: 4.9, completionRate: 58, price: 399.99, tags: ['bvlos', 'waiver', 'daa', 'advanced'], createdAt: '2025-12-01', updatedAt: '2026-03-15',
  },
  {
    id: 'CRS-010', title: 'Thermal Imaging & Inspection', description: 'Specialist training on thermal imaging for infrastructure inspection, energy audits, search and rescue, and agricultural applications using thermal-equipped drones.',
    category: 'equipment_specific', level: 'intermediate', duration: 320,
    modules: [
      { id: 'M-010-01', title: 'Thermal Imaging Fundamentals', type: 'video', duration: 40, content: 'Principles of infrared thermography', order: 1 },
      { id: 'M-010-02', title: 'Camera Settings & Calibration', type: 'practical', duration: 35, content: 'Emissivity, reflected temp, calibration', order: 2 },
      { id: 'M-010-03', title: 'Infrastructure Inspection', type: 'video', duration: 45, content: 'Roof, solar panel, and building inspections', order: 3 },
      { id: 'M-010-04', title: 'Search & Rescue Applications', type: 'simulation', duration: 40, content: 'SAR thermal search patterns', order: 4 },
      { id: 'M-010-05', title: 'Report Generation', type: 'reading', duration: 30, content: 'Creating professional thermal reports', order: 5 },
      { id: 'M-010-06', title: 'Thermal Imaging Assessment', type: 'quiz', duration: 40, content: 'Thermal imaging knowledge test', order: 6, passingScore: 75 },
    ],
    instructor: 'Aisha Patel', prerequisites: ['CRS-001'], certification: { awarded: true, name: 'Thermal Imaging Specialist', validityPeriod: 24 },
    enrollmentCount: 312, avgRating: 4.6, completionRate: 71, price: 179.99, tags: ['thermal', 'inspection', 'infrared', 'specialist'], createdAt: '2025-09-01', updatedAt: '2026-02-28',
  },
];

const mockEnrollments: TrainingEnrollment[] = [
  {
    id: 'ENR-001', userId: 'USR-001', userName: 'Juan Martinez', courseId: 'CRS-001', courseName: 'FAA Part 107 Exam Prep',
    status: 'in_progress', enrolledAt: '2026-01-15', startedAt: '2026-01-16', progress: 50, currentModule: 5, totalModules: 8,
    quizScores: [{ moduleId: 'M-001-03', moduleName: 'Airspace Knowledge Check', score: 88, passingScore: 70, attempts: 1, passed: true }],
    certificateIssued: false, timeSpent: 185,
  },
  {
    id: 'ENR-002', userId: 'USR-002', userName: 'Sarah Kim', courseId: 'CRS-002', courseName: 'Part 107 Recurrent Training',
    status: 'completed', enrolledAt: '2026-01-10', startedAt: '2026-01-10', completedAt: '2026-02-05', progress: 100, currentModule: 4, totalModules: 4,
    quizScores: [{ moduleId: 'M-002-04', moduleName: 'Recurrent Knowledge Exam', score: 92, passingScore: 70, attempts: 1, passed: true }],
    certificateIssued: true, certificateUrl: '#', certificateExpiry: '2028-02-05', timeSpent: 165,
  },
  {
    id: 'ENR-003', userId: 'USR-003', userName: 'Robert Chen', courseId: 'CRS-001', courseName: 'FAA Part 107 Exam Prep',
    status: 'enrolled', enrolledAt: '2026-03-18', progress: 0, currentModule: 1, totalModules: 8,
    quizScores: [], certificateIssued: false, timeSpent: 0,
  },
  {
    id: 'ENR-004', userId: 'USR-004', userName: 'Aisha Patel', courseId: 'CRS-009', courseName: 'BVLOS Operations Training',
    status: 'in_progress', enrolledAt: '2026-02-01', startedAt: '2026-02-02', progress: 72, currentModule: 6, totalModules: 7,
    quizScores: [],
    certificateIssued: false, timeSpent: 340,
  },
  {
    id: 'ENR-005', userId: 'USR-001', userName: 'Juan Martinez', courseId: 'CRS-005', courseName: 'Emergency Procedures & Crisis Response',
    status: 'completed', enrolledAt: '2025-11-01', startedAt: '2025-11-02', completedAt: '2025-12-10', progress: 100, currentModule: 5, totalModules: 5,
    quizScores: [{ moduleId: 'M-005-05', moduleName: 'Emergency Scenarios Exam', score: 94, passingScore: 85, attempts: 1, passed: true }],
    certificateIssued: true, certificateUrl: '#', certificateExpiry: '2026-12-10', timeSpent: 195,
  },
  {
    id: 'ENR-006', userId: 'USR-002', userName: 'Sarah Kim', courseId: 'CRS-004', courseName: 'Advanced UAS Safety Management',
    status: 'in_progress', enrolledAt: '2026-02-15', startedAt: '2026-02-16', progress: 33, currentModule: 3, totalModules: 6,
    quizScores: [],
    certificateIssued: false, timeSpent: 95,
  },
  {
    id: 'ENR-007', userId: 'USR-003', userName: 'Robert Chen', courseId: 'CRS-003', courseName: 'Company SOPs & Operational Standards',
    status: 'failed', enrolledAt: '2025-10-01', startedAt: '2025-10-02', completedAt: '2025-11-15', progress: 100, currentModule: 5, totalModules: 5,
    quizScores: [{ moduleId: 'M-003-05', moduleName: 'SOP Knowledge Check', score: 58, passingScore: 80, attempts: 3, passed: false }],
    certificateIssued: false, timeSpent: 210,
  },
  {
    id: 'ENR-008', userId: 'USR-004', userName: 'Aisha Patel', courseId: 'CRS-010', courseName: 'Thermal Imaging & Inspection',
    status: 'completed', enrolledAt: '2025-08-01', startedAt: '2025-08-02', completedAt: '2025-10-15', progress: 100, currentModule: 6, totalModules: 6,
    quizScores: [{ moduleId: 'M-010-06', moduleName: 'Thermal Imaging Assessment', score: 96, passingScore: 75, attempts: 1, passed: true }],
    certificateIssued: true, certificateUrl: '#', certificateExpiry: '2027-10-15', timeSpent: 290,
  },
];

const mockStats: TrainingStats = {
  totalCourses: 10,
  totalEnrollments: 48,
  activeEnrollments: 18,
  completionRate: 76,
  avgScore: 86.4,
  certificatesIssued: 32,
  revenueGenerated: 24850,
  popularCourses: [
    { name: 'Part 107 Exam Prep', enrollments: 1245 },
    { name: 'Recurrent Training', enrollments: 892 },
    { name: 'Emergency Procedures', enrollments: 567 },
    { name: 'Company SOPs', enrollments: 456 },
    { name: 'M350 RTK Ops', enrollments: 389 },
  ],
};

const leaderboard = [
  { name: 'Aisha Patel', coursesCompleted: 6, avgScore: 95.2, certificates: 6 },
  { name: 'Juan Martinez', coursesCompleted: 5, avgScore: 91.8, certificates: 5 },
  { name: 'Sarah Kim', coursesCompleted: 4, avgScore: 89.5, certificates: 4 },
  { name: 'Mike Chen', coursesCompleted: 3, avgScore: 87.0, certificates: 3 },
  { name: 'Robert Chen', coursesCompleted: 1, avgScore: 72.3, certificates: 0 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────────

const categoryConfig: Record<TrainingCourse['category'], { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  part_107_prep: { label: 'Part 107 Prep', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: <Shield className="h-4 w-4" /> },
  part_107_recurrent: { label: 'Part 107 Recurrent', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/30', icon: <Shield className="h-4 w-4" /> },
  company_sop: { label: 'Company SOP', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: <FileText className="h-4 w-4" /> },
  safety: { label: 'Safety', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: <AlertTriangle className="h-4 w-4" /> },
  emergency_procedures: { label: 'Emergency', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30', icon: <Zap className="h-4 w-4" /> },
  country_regulations: { label: 'International', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: <Globe className="h-4 w-4" /> },
  equipment_specific: { label: 'Equipment', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: <Wrench className="h-4 w-4" /> },
  advanced_operations: { label: 'Advanced Ops', color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/30', icon: <Target className="h-4 w-4" /> },
  bvlos_training: { label: 'BVLOS', color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/30', icon: <Eye className="h-4 w-4" /> },
};

const levelConfig: Record<TrainingCourse['level'], { label: string; color: string; bg: string }> = {
  beginner: { label: 'Beginner', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  intermediate: { label: 'Intermediate', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  advanced: { label: 'Advanced', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
};

const enrollmentStatusConfig: Record<TrainingEnrollment['status'], { label: string; color: string; bg: string }> = {
  enrolled: { label: 'Enrolled', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
  in_progress: { label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  failed: { label: 'Failed', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  expired: { label: 'Expired', color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30' },
};

const moduleTypeIcons: Record<string, React.ReactNode> = {
  video: <Video className="h-3.5 w-3.5" />,
  reading: <FileText className="h-3.5 w-3.5" />,
  quiz: <HelpCircle className="h-3.5 w-3.5" />,
  simulation: <Monitor className="h-3.5 w-3.5" />,
  practical: <Wrench className="h-3.5 w-3.5" />,
};

const thumbnailColors: Record<TrainingCourse['category'], string> = {
  part_107_prep: 'from-blue-600 to-blue-800',
  part_107_recurrent: 'from-cyan-600 to-cyan-800',
  company_sop: 'from-purple-600 to-purple-800',
  safety: 'from-red-600 to-red-800',
  emergency_procedures: 'from-orange-600 to-orange-800',
  country_regulations: 'from-emerald-600 to-emerald-800',
  equipment_specific: 'from-yellow-600 to-yellow-800',
  advanced_operations: 'from-pink-600 to-pink-800',
  bvlos_training: 'from-indigo-600 to-indigo-800',
};

const formatDuration = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const getEnrollmentForCourse = (courseId: string): TrainingEnrollment | undefined => {
  return mockEnrollments.find(e => e.courseId === courseId);
};

// ─── Component ───────────────────────────────────────────────────────────────────

export function TrainingPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'enrollments' | 'leaderboard' | 'builder'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [expandedEnrollmentId, setExpandedEnrollmentId] = useState<string | null>(null);

  // Course builder state
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderCategory, setBuilderCategory] = useState<TrainingCourse['category']>('company_sop');
  const [builderLevel, setBuilderLevel] = useState<TrainingCourse['level']>('beginner');
  const [builderDescription, setBuilderDescription] = useState('');
  const [builderPrice, setBuilderPrice] = useState('0');
  const [builderModules, setBuilderModules] = useState<Array<{ type: string; title: string; content: string; duration: string; passingScore: string }>>([
    { type: 'video', title: '', content: '', duration: '30', passingScore: '' },
  ]);

  const addModule = () => {
    setBuilderModules(prev => [...prev, { type: 'video', title: '', content: '', duration: '30', passingScore: '' }]);
  };

  const removeModule = (idx: number) => {
    setBuilderModules(prev => prev.filter((_, i) => i !== idx));
  };

  const updateModule = (idx: number, field: string, value: string) => {
    setBuilderModules(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  };

  const moveModule = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === builderModules.length - 1)) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    setBuilderModules(prev => {
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
  };

  // Filter courses
  const filteredCourses = mockCourses.filter(c => {
    if (categoryFilter !== 'all' && c.category !== categoryFilter) return false;
    if (levelFilter !== 'all' && c.level !== levelFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.includes(q));
    }
    return true;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} className={clsx('h-3.5 w-3.5', s <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600')} />
        ))}
        <span className="ml-1 text-xs text-gray-400">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Training & Certification</h1>
          <p className="text-sm text-gray-400 mt-1">LMS platform for pilot training, compliance courses, and professional certifications</p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-7">
        {[
          { label: 'Total Courses', value: mockStats.totalCourses, icon: <BookOpen className="h-3.5 w-3.5" />, color: 'text-white' },
          { label: 'Enrollments', value: mockStats.totalEnrollments, icon: <Users className="h-3.5 w-3.5" />, color: 'text-white' },
          { label: 'Active', value: mockStats.activeEnrollments, icon: <Play className="h-3.5 w-3.5" />, color: 'text-yellow-400' },
          { label: 'Completion Rate', value: `${mockStats.completionRate}%`, icon: <TrendingUp className="h-3.5 w-3.5" />, color: 'text-green-400' },
          { label: 'Avg Score', value: `${mockStats.avgScore}%`, icon: <BarChart3 className="h-3.5 w-3.5" />, color: 'text-blue-400' },
          { label: 'Certificates', value: mockStats.certificatesIssued, icon: <Award className="h-3.5 w-3.5" />, color: 'text-purple-400' },
          { label: 'Revenue', value: `$${mockStats.revenueGenerated.toLocaleString()}`, icon: <DollarSign className="h-3.5 w-3.5" />, color: 'text-emerald-400' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mb-1">{stat.icon}{stat.label}</div>
            <div className={clsx('text-2xl font-bold', stat.color)}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 rounded-xl border border-gray-700/50 bg-gray-800/50 p-1">
        {([
          ['catalog', 'Course Catalog', <BookOpen key="c" className="h-4 w-4" />],
          ['enrollments', 'My Enrollments', <GraduationCap key="e" className="h-4 w-4" />],
          ['leaderboard', 'Leaderboard', <Trophy key="l" className="h-4 w-4" />],
          ['builder', 'Course Builder', <Settings key="b" className="h-4 w-4" />],
        ] as const).map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={clsx('flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex-1 justify-center', activeTab === key ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700/50')}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ── Course Catalog ── */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search courses..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="all">All Categories</option>
              {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
              <option value="all">All Levels</option>
              {Object.entries(levelConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map(course => {
              const cat = categoryConfig[course.category];
              const lvl = levelConfig[course.level];
              const enrollment = getEnrollmentForCourse(course.id);
              const expanded = expandedCourseId === course.id;

              return (
                <div key={course.id} className="rounded-xl border border-gray-700/50 bg-gray-800/50 overflow-hidden flex flex-col">
                  {/* Thumbnail */}
                  <div className={clsx('h-32 bg-gradient-to-br flex items-center justify-center relative', thumbnailColors[course.category])}>
                    <div className="text-white/20">{React.cloneElement(cat.icon as React.ReactElement, { className: 'h-16 w-16' })}</div>
                    {course.price === 0 && (
                      <div className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-bold text-white">FREE</div>
                    )}
                    {course.price > 0 && (
                      <div className="absolute top-2 right-2 rounded-full bg-gray-900/80 px-2.5 py-0.5 text-xs font-bold text-white">${course.price}</div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', cat.bg, cat.color)}>{cat.icon}{cat.label}</span>
                      <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', lvl.bg, lvl.color)}>{lvl.label}</span>
                    </div>

                    {/* Title & Info */}
                    <h3 className="text-sm font-semibold text-white mb-1">{course.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(course.duration)}</span>
                      <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.modules.length} modules</span>
                      {course.instructor && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" />{course.instructor}</span>}
                    </div>

                    {/* Rating & Enrollment */}
                    <div className="flex items-center justify-between mb-2">
                      {renderStars(course.avgRating)}
                      <span className="text-xs text-gray-500">{course.enrollmentCount.toLocaleString()} enrolled</span>
                    </div>

                    {/* Completion rate */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1.5 rounded-full bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full bg-green-500" style={{ width: `${course.completionRate}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{course.completionRate}% completion</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {course.tags.slice(0, 4).map(tag => (
                        <span key={tag} className="rounded bg-gray-700/50 px-1.5 py-0.5 text-xs text-gray-400">{tag}</span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto flex items-center gap-2">
                      {enrollment ? (
                        enrollment.status === 'completed' ? (
                          <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600/20 border border-green-600/30 px-3 py-2 text-sm font-medium text-green-400">
                            <CheckCircle className="h-4 w-4" />Completed
                          </button>
                        ) : enrollment.status === 'failed' ? (
                          <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600/20 border border-red-600/30 px-3 py-2 text-sm font-medium text-red-400">
                            <XCircle className="h-4 w-4" />Retry
                          </button>
                        ) : (
                          <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-yellow-600/20 border border-yellow-600/30 px-3 py-2 text-sm font-medium text-yellow-400">
                            <Play className="h-4 w-4" />Continue ({enrollment.progress}%)
                          </button>
                        )
                      ) : (
                        <button className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                          <Plus className="h-4 w-4" />Enroll
                        </button>
                      )}
                      <button onClick={() => setExpandedCourseId(expanded ? null : course.id)} className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expanded && (
                    <div className="border-t border-gray-700/50 p-4 space-y-4 bg-gray-900/40">
                      {/* Description */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Description</h4>
                        <p className="text-sm text-gray-300">{course.description}</p>
                      </div>

                      {/* Prerequisites */}
                      {course.prerequisites.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Prerequisites</h4>
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites.map(pid => {
                              const prereq = mockCourses.find(c => c.id === pid);
                              return <span key={pid} className="rounded-full bg-gray-700/50 border border-gray-600 px-2 py-0.5 text-xs text-gray-300">{prereq?.title ?? pid}</span>;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Module List */}
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Modules ({course.modules.length})</h4>
                        <div className="space-y-1.5">
                          {course.modules.map(mod => (
                            <div key={mod.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">{moduleTypeIcons[mod.type]}</span>
                                {mod.completed ? <CheckCircle className="h-3.5 w-3.5 text-green-400" /> : <div className="h-3.5 w-3.5 rounded-full border border-gray-600" />}
                                <span className={clsx('text-sm', mod.completed ? 'text-gray-300' : 'text-gray-400')}>{mod.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {mod.score !== undefined && (
                                  <span className={clsx('text-xs font-medium', mod.score >= (mod.passingScore ?? 70) ? 'text-green-400' : 'text-red-400')}>{mod.score}%</span>
                                )}
                                <span className="text-xs text-gray-500">{formatDuration(mod.duration)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certification */}
                      {course.certification.awarded && (
                        <div className="flex items-center gap-3 rounded-xl bg-purple-500/10 border border-purple-500/30 p-3">
                          <Award className="h-5 w-5 text-purple-400" />
                          <div>
                            <div className="text-sm font-medium text-purple-300">{course.certification.name}</div>
                            <div className="text-xs text-purple-400/70">Valid for {course.certification.validityPeriod} months</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {filteredCourses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <BookOpen className="h-10 w-10 mb-2" />
              <p className="text-sm">No courses match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* ── My Enrollments ── */}
      {activeTab === 'enrollments' && (
        <div className="space-y-4">
          {mockEnrollments.map(enrollment => {
            const sc = enrollmentStatusConfig[enrollment.status];
            const expanded = expandedEnrollmentId === enrollment.id;
            return (
              <div key={enrollment.id} className="rounded-xl border border-gray-700/50 bg-gray-800/50 overflow-hidden">
                <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-700/20 transition-colors" onClick={() => setExpandedEnrollmentId(expanded ? null : enrollment.id)}>
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white truncate">{enrollment.courseName}</span>
                        <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', sc.bg, sc.color)}>{sc.label}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{enrollment.userName}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Enrolled {enrollment.enrolledAt}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDuration(enrollment.timeSpent)} spent</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Progress bar */}
                    <div className="flex items-center gap-2 w-40">
                      <div className="flex-1 h-2 rounded-full bg-gray-700 overflow-hidden">
                        <div className={clsx('h-full rounded-full', enrollment.status === 'completed' ? 'bg-green-500' : enrollment.status === 'failed' ? 'bg-red-500' : 'bg-blue-500')} style={{ width: `${enrollment.progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-8 text-right">{enrollment.progress}%</span>
                    </div>
                    <div className="text-xs text-gray-500">Module {enrollment.currentModule}/{enrollment.totalModules}</div>
                    <div className="flex items-center gap-1">
                      {enrollment.certificateIssued && (
                        <button className="rounded-lg p-1.5 text-purple-400 hover:bg-gray-700 transition-colors" title="Download Certificate">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      {(enrollment.status === 'enrolled' || enrollment.status === 'in_progress') && (
                        <button className="rounded-lg p-1.5 text-blue-400 hover:bg-gray-700 transition-colors" title="Resume">
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {expanded ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                    </div>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-gray-700/50 p-4 bg-gray-900/40 space-y-4">
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 text-sm">
                      <div><span className="text-gray-500">Enrolled:</span> <span className="text-white">{enrollment.enrolledAt}</span></div>
                      <div><span className="text-gray-500">Started:</span> <span className="text-white">{enrollment.startedAt ?? '—'}</span></div>
                      <div><span className="text-gray-500">Completed:</span> <span className="text-white">{enrollment.completedAt ?? '—'}</span></div>
                      <div><span className="text-gray-500">Time Spent:</span> <span className="text-white">{formatDuration(enrollment.timeSpent)}</span></div>
                    </div>

                    {enrollment.quizScores.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Quiz Scores</h4>
                        <div className="space-y-2">
                          {enrollment.quizScores.map(q => (
                            <div key={q.moduleId} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2">
                              <div className="flex items-center gap-2">
                                <HelpCircle className="h-3.5 w-3.5 text-gray-500" />
                                <span className="text-sm text-gray-300">{q.moduleName}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500">{q.attempts} attempt{q.attempts > 1 ? 's' : ''}</span>
                                <span className={clsx('text-sm font-medium', q.passed ? 'text-green-400' : 'text-red-400')}>{q.score}%</span>
                                <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', q.passed ? 'bg-green-400/10 border-green-400/30 text-green-400' : 'bg-red-400/10 border-red-400/30 text-red-400')}>
                                  {q.passed ? 'Pass' : 'Fail'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {enrollment.certificateIssued && (
                      <div className="flex items-center gap-3 rounded-xl bg-purple-500/10 border border-purple-500/30 p-3">
                        <Award className="h-5 w-5 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-purple-300">Certificate Issued</div>
                          <div className="text-xs text-purple-400/70">Expires: {enrollment.certificateExpiry}</div>
                        </div>
                        <button className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-500 transition-colors">
                          <Download className="h-3.5 w-3.5" />Download
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Leaderboard ── */}
      {activeTab === 'leaderboard' && (
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 overflow-hidden">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Trophy className="h-4 w-4 text-yellow-400" />Top Completers</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                <th className="px-4 py-3 w-12">Rank</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Courses Completed</th>
                <th className="px-4 py-3">Avg Score</th>
                <th className="px-4 py-3">Certificates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {leaderboard.map((entry, idx) => (
                <tr key={entry.name} className="hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3">
                    {idx === 0 && <Trophy className="h-5 w-5 text-yellow-400" />}
                    {idx === 1 && <Medal className="h-5 w-5 text-gray-300" />}
                    {idx === 2 && <Medal className="h-5 w-5 text-amber-600" />}
                    {idx > 2 && <span className="text-gray-500 font-medium">{idx + 1}</span>}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{entry.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{entry.coursesCompleted}</span>
                      <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-gray-700 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${(entry.coursesCompleted / 10) * 100}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('font-medium', entry.avgScore >= 90 ? 'text-green-400' : entry.avgScore >= 75 ? 'text-yellow-400' : 'text-red-400')}>{entry.avgScore}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-purple-400" />
                      <span className="text-white font-medium">{entry.certificates}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Course Builder ── */}
      {activeTab === 'builder' && (
        <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Settings className="h-4 w-4 text-gray-400" />Create New Course</h3>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Course Title</label>
                <input type="text" value={builderTitle} onChange={e => setBuilderTitle(e.target.value)} placeholder="Enter course title..." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                  <select value={builderCategory} onChange={e => setBuilderCategory(e.target.value as TrainingCourse['category'])} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    {Object.entries(categoryConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Level</label>
                  <select value={builderLevel} onChange={e => setBuilderLevel(e.target.value as TrainingCourse['level'])} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                    {Object.entries(levelConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                <textarea value={builderDescription} onChange={e => setBuilderDescription(e.target.value)} rows={3} placeholder="Course description..." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Price ($)</label>
                <input type="number" value={builderPrice} onChange={e => setBuilderPrice(e.target.value)} min="0" step="0.01" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
          </div>

          {/* Modules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Modules ({builderModules.length})</h4>
              <button onClick={addModule} className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-gray-700 transition-colors">
                <Plus className="h-3.5 w-3.5" />Add Module
              </button>
            </div>
            <div className="space-y-3">
              {builderModules.map((mod, idx) => (
                <div key={idx} className="rounded-xl border border-gray-700 bg-gray-900/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveModule(idx, 'up')} disabled={idx === 0} className="text-gray-500 hover:text-white disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                      <button onClick={() => moveModule(idx, 'down')} disabled={idx === builderModules.length - 1} className="text-gray-500 hover:text-white disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                    </div>
                    <GripVertical className="h-4 w-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500">Module {idx + 1}</span>
                    <div className="flex-1" />
                    {builderModules.length > 1 && (
                      <button onClick={() => removeModule(idx)} className="rounded-lg p-1 text-gray-500 hover:text-red-400 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select value={mod.type} onChange={e => updateModule(idx, 'type', e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none">
                        <option value="video">Video</option>
                        <option value="reading">Reading</option>
                        <option value="quiz">Quiz</option>
                        <option value="simulation">Simulation</option>
                        <option value="practical">Practical</option>
                      </select>
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Title</label>
                      <input type="text" value={mod.title} onChange={e => updateModule(idx, 'title', e.target.value)} placeholder="Module title..." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Duration (min)</label>
                        <input type="number" value={mod.duration} onChange={e => updateModule(idx, 'duration', e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none" />
                      </div>
                      {mod.type === 'quiz' && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Pass %</label>
                          <input type="number" value={mod.passingScore} onChange={e => updateModule(idx, 'passingScore', e.target.value)} placeholder="70" className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-4">
                      <label className="block text-xs text-gray-500 mb-1">Content / Description</label>
                      <textarea value={mod.content} onChange={e => updateModule(idx, 'content', e.target.value)} rows={2} placeholder="Module content..." className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Builder Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700/50">
            <button className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 transition-colors">Save as Draft</button>
            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
              <Plus className="h-4 w-4" />Publish Course
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
