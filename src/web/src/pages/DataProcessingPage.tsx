import { useState } from 'react';
import {
  Cpu, HardDrive, Image, Layers, Map, Cuboid, Thermometer, Leaf, Ruler, Eye,
  Search, Database, Cloud, Download, Upload, Play, Pause, RotateCcw, Trash2,
  Filter, ChevronDown, ChevronUp, Plus, Clock, Calendar, CheckCircle, XCircle,
  AlertCircle, Loader, BarChart2, DollarSign, FileOutput, Settings, Maximize,
  RefreshCw, Zap,
} from 'lucide-react';
import { clsx } from 'clsx';
import type { ProcessingJob, ProcessingTemplate, ProcessingStats } from '../../../shared/types/dataprocessing';

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const mockJobs: ProcessingJob[] = [
  {
    id: 'PJ-001', tenantId: 'T-001', name: 'Highway Bridge Inspection Ortho', type: 'orthomosaic', status: 'completed', priority: 'high', progress: 100,
    missionId: 'MSN-042', missionName: 'Highway 101 Bridge Survey',
    inputData: { imageCount: 486, totalSize: 12400000000, format: 'DNG', gsd: 1.2, overlap: { front: 80, side: 70 }, sensorType: 'Hasselblad L2D-20c', captureDate: '2026-03-10' },
    processingParams: { engine: 'pix4d', quality: 'high', coordinateSystem: 'WGS 84 / UTM zone 10N', gcpUsed: true, gcpCount: 8, outputFormats: ['geotiff', 'jpg', 'kml'] },
    outputs: [
      { name: 'Orthomosaic GeoTIFF', type: 'geotiff', size: 4200000000, resolution: 1.2, downloadUrl: '#', previewUrl: '#' },
      { name: 'Orthomosaic JPEG Preview', type: 'jpg', size: 85000000, resolution: 2.4, downloadUrl: '#', previewUrl: '#' },
      { name: 'KML Overlay', type: 'kml', size: 245000, downloadUrl: '#' },
    ],
    metrics: { processingTime: 7200, areaSquareMeters: 125000, accuracy: { horizontal: 0.023, vertical: 0.035 } },
    createdBy: 'Sarah Park', createdAt: '2026-03-10T14:00:00Z', startedAt: '2026-03-10T14:05:00Z', completedAt: '2026-03-10T16:05:00Z',
    cost: 48.60, notes: 'GCP-corrected ortho for DOT report.',
  },
  {
    id: 'PJ-002', tenantId: 'T-001', name: 'Solar Farm 3D Reconstruction', type: '3d_model', status: 'processing', priority: 'normal', progress: 67,
    missionId: 'MSN-045', missionName: 'Solar Farm Panel Survey',
    inputData: { imageCount: 1240, totalSize: 38500000000, format: 'RAW', gsd: 0.8, overlap: { front: 85, side: 75 }, sensorType: 'Phase One P3', captureDate: '2026-03-15' },
    processingParams: { engine: 'metashape', quality: 'ultra', coordinateSystem: 'WGS 84 / UTM zone 11N', gcpUsed: true, gcpCount: 12, outputFormats: ['obj', 'ply', 'geotiff'] },
    outputs: [],
    createdBy: 'Mike Chen', createdAt: '2026-03-16T08:00:00Z', startedAt: '2026-03-16T08:12:00Z',
    cost: 186.00, notes: 'Ultra quality for panel tilt analysis.',
  },
  {
    id: 'PJ-003', tenantId: 'T-001', name: 'Construction Site Volume Calc', type: 'volume_measurement', status: 'completed', priority: 'high', progress: 100,
    missionId: 'MSN-038', missionName: 'Quarry Stockpile Measurement',
    inputData: { imageCount: 320, totalSize: 8200000000, format: 'JPEG', gsd: 1.5, overlap: { front: 75, side: 65 }, sensorType: 'DJI Zenmuse P1', captureDate: '2026-03-08' },
    processingParams: { engine: 'pix4d', quality: 'high', coordinateSystem: 'NAD83 / State Plane CA Zone 5', gcpUsed: true, gcpCount: 6, outputFormats: ['geotiff', 'csv', 'pdf'] },
    outputs: [
      { name: 'DSM GeoTIFF', type: 'geotiff', size: 1800000000, resolution: 1.5, downloadUrl: '#', previewUrl: '#' },
      { name: 'Volume Report', type: 'pdf', size: 2400000, downloadUrl: '#' },
      { name: 'Stockpile Data CSV', type: 'csv', size: 45000, downloadUrl: '#' },
    ],
    metrics: { processingTime: 3600, volumeCubicMeters: 48520, areaSquareMeters: 85000, accuracy: { horizontal: 0.031, vertical: 0.042 } },
    createdBy: 'James Wu', createdAt: '2026-03-08T10:00:00Z', startedAt: '2026-03-08T10:08:00Z', completedAt: '2026-03-08T11:08:00Z',
    cost: 32.00, notes: 'Monthly stockpile volume measurement.',
  },
  {
    id: 'PJ-004', tenantId: 'T-001', name: 'Agricultural Field NDVI', type: 'ndvi_crop_health', status: 'completed', priority: 'normal', progress: 100,
    missionId: 'MSN-040', missionName: 'North Valley Farm Mapping',
    inputData: { imageCount: 580, totalSize: 6800000000, format: 'TIFF', gsd: 2.0, overlap: { front: 75, side: 65 }, sensorType: 'MicaSense RedEdge-MX', captureDate: '2026-03-05' },
    processingParams: { engine: 'internal', quality: 'high', coordinateSystem: 'WGS 84', gcpUsed: false, outputFormats: ['geotiff', 'shapefile', 'pdf'] },
    outputs: [
      { name: 'NDVI Map', type: 'geotiff', size: 2100000000, resolution: 2.0, downloadUrl: '#', previewUrl: '#' },
      { name: 'Health Zones Shapefile', type: 'shapefile', size: 8500000, downloadUrl: '#' },
      { name: 'Crop Health Report', type: 'pdf', size: 5200000, downloadUrl: '#' },
    ],
    metrics: { processingTime: 4500, areaSquareMeters: 520000, accuracy: { horizontal: 0.045, vertical: 0.065 } },
    createdBy: 'Sarah Park', createdAt: '2026-03-06T09:00:00Z', startedAt: '2026-03-06T09:15:00Z', completedAt: '2026-03-06T10:30:00Z',
    cost: 29.00, notes: 'Weekly crop health monitoring flight.',
  },
  {
    id: 'PJ-005', tenantId: 'T-001', name: 'Thermal Roof Inspection', type: 'thermal_analysis', status: 'failed', priority: 'high', progress: 43,
    missionId: 'MSN-041', missionName: 'Warehouse Complex Thermal',
    inputData: { imageCount: 210, totalSize: 3200000000, format: 'R-JPEG', gsd: 3.5, overlap: { front: 80, side: 70 }, sensorType: 'DJI Zenmuse H20T', captureDate: '2026-03-07' },
    processingParams: { engine: 'internal', quality: 'high', coordinateSystem: 'WGS 84 / UTM zone 10N', gcpUsed: false, outputFormats: ['geotiff', 'pdf'] },
    outputs: [],
    metrics: { processingTime: 1800, accuracy: { horizontal: 0.08, vertical: 0.12 } },
    createdBy: 'Mike Chen', createdAt: '2026-03-07T16:00:00Z', startedAt: '2026-03-07T16:10:00Z',
    error: 'Thermal calibration data missing from 38 images. Verify radiometric JPEG metadata is intact and re-upload.',
    cost: 0, notes: 'Some images captured with incorrect thermal settings.',
  },
  {
    id: 'PJ-006', tenantId: 'T-001', name: 'LiDAR Forest Canopy', type: 'point_cloud', status: 'completed', priority: 'normal', progress: 100,
    missionId: 'MSN-036', missionName: 'Redwood Forest Mapping',
    inputData: { imageCount: 0, totalSize: 22000000000, format: 'LAS 1.4', gsd: 0, overlap: { front: 50, side: 50 }, sensorType: 'DJI Zenmuse L2', captureDate: '2026-02-28' },
    processingParams: { engine: 'internal', quality: 'ultra', coordinateSystem: 'NAD83(2011) / CA Zone 3', gcpUsed: true, gcpCount: 4, outputFormats: ['las', 'geotiff'] },
    outputs: [
      { name: 'Classified Point Cloud', type: 'las', size: 18500000000, downloadUrl: '#' },
      { name: 'Canopy Height Model', type: 'geotiff', size: 850000000, resolution: 0.5, downloadUrl: '#', previewUrl: '#' },
    ],
    metrics: { processingTime: 10800, pointCount: 2400000000, areaSquareMeters: 340000, accuracy: { horizontal: 0.015, vertical: 0.02 } },
    createdBy: 'James Wu', createdAt: '2026-03-01T07:00:00Z', startedAt: '2026-03-01T07:30:00Z', completedAt: '2026-03-01T10:30:00Z',
    cost: 95.00, notes: 'LiDAR point cloud for forestry inventory.',
  },
  {
    id: 'PJ-007', tenantId: 'T-001', name: 'Powerline Change Detection', type: 'change_detection', status: 'completed', priority: 'urgent', progress: 100,
    missionId: 'MSN-044', missionName: 'Powerline Corridor Q1 2026',
    inputData: { imageCount: 890, totalSize: 15600000000, format: 'DNG', gsd: 1.0, overlap: { front: 80, side: 70 }, sensorType: 'Phase One iXM-100', captureDate: '2026-03-14' },
    processingParams: { engine: 'pix4d', quality: 'high', coordinateSystem: 'WGS 84 / UTM zone 10N', gcpUsed: true, gcpCount: 10, outputFormats: ['geotiff', 'shapefile', 'pdf'] },
    outputs: [
      { name: 'Change Detection Map', type: 'geotiff', size: 3200000000, resolution: 1.0, downloadUrl: '#', previewUrl: '#' },
      { name: 'Encroachment Zones', type: 'shapefile', size: 12000000, downloadUrl: '#' },
      { name: 'Change Report', type: 'pdf', size: 8500000, downloadUrl: '#' },
    ],
    metrics: { processingTime: 5400, areaSquareMeters: 280000, accuracy: { horizontal: 0.018, vertical: 0.025 } },
    createdBy: 'Sarah Park', createdAt: '2026-03-14T12:00:00Z', startedAt: '2026-03-14T12:15:00Z', completedAt: '2026-03-14T13:45:00Z',
    cost: 89.00, notes: 'Quarterly vegetation encroachment comparison.',
  },
  {
    id: 'PJ-008', tenantId: 'T-001', name: 'Parking Lot Object Detection', type: 'object_detection', status: 'processing', priority: 'low', progress: 34,
    missionId: 'MSN-046', missionName: 'Mall Parking Survey',
    inputData: { imageCount: 150, totalSize: 4500000000, format: 'JPEG', gsd: 2.5, overlap: { front: 70, side: 60 }, sensorType: 'DJI Mavic 3E', captureDate: '2026-03-18' },
    processingParams: { engine: 'internal', quality: 'medium', coordinateSystem: 'WGS 84', gcpUsed: false, outputFormats: ['geotiff', 'csv', 'kml'] },
    outputs: [],
    createdBy: 'Mike Chen', createdAt: '2026-03-18T15:00:00Z', startedAt: '2026-03-18T15:20:00Z',
    cost: 12.00, notes: 'Vehicle count and occupancy analysis.',
  },
  {
    id: 'PJ-009', tenantId: 'T-001', name: 'Wetland Classification', type: 'classification', status: 'completed', priority: 'normal', progress: 100,
    missionId: 'MSN-037', missionName: 'Delta Wetland Survey',
    inputData: { imageCount: 720, totalSize: 18200000000, format: 'TIFF', gsd: 1.8, overlap: { front: 80, side: 70 }, sensorType: 'MicaSense Altum-PT', captureDate: '2026-03-02' },
    processingParams: { engine: 'internal', quality: 'high', coordinateSystem: 'WGS 84 / UTM zone 10N', gcpUsed: true, gcpCount: 6, outputFormats: ['geotiff', 'shapefile', 'pdf'] },
    outputs: [
      { name: 'Classification Map', type: 'geotiff', size: 2800000000, resolution: 1.8, downloadUrl: '#', previewUrl: '#' },
      { name: 'Land Cover Shapefile', type: 'shapefile', size: 15000000, downloadUrl: '#' },
      { name: 'Classification Report', type: 'pdf', size: 6200000, downloadUrl: '#' },
    ],
    metrics: { processingTime: 6300, areaSquareMeters: 450000, accuracy: { horizontal: 0.028, vertical: 0.038 } },
    createdBy: 'James Wu', createdAt: '2026-03-03T08:00:00Z', startedAt: '2026-03-03T08:25:00Z', completedAt: '2026-03-03T10:10:00Z',
    cost: 54.00, notes: 'Multispectral land cover classification.',
  },
  {
    id: 'PJ-010', tenantId: 'T-001', name: 'Pipeline Corridor Ortho', type: 'orthomosaic', status: 'failed', priority: 'urgent', progress: 12,
    missionId: 'MSN-043', missionName: 'Gas Pipeline Corridor',
    inputData: { imageCount: 1680, totalSize: 42000000000, format: 'DNG', gsd: 0.6, overlap: { front: 85, side: 75 }, sensorType: 'Phase One iXM-100', captureDate: '2026-03-12' },
    processingParams: { engine: 'pix4d', quality: 'ultra', coordinateSystem: 'NAD83(2011) / State Plane TX Central', gcpUsed: true, gcpCount: 15, outputFormats: ['geotiff', 'las', 'pdf'] },
    outputs: [],
    error: 'Insufficient memory: dataset requires 256GB RAM for ultra quality. Reduce quality to high or split into sub-projects.',
    createdBy: 'Sarah Park', createdAt: '2026-03-13T06:00:00Z', startedAt: '2026-03-13T06:30:00Z',
    cost: 0, notes: 'Large corridor — may need to split into segments.',
  },
  {
    id: 'PJ-011', tenantId: 'T-001', name: 'Rooftop Solar Assessment', type: 'orthomosaic', status: 'completed', priority: 'normal', progress: 100,
    missionId: 'MSN-039', missionName: 'Commercial Rooftop Survey',
    inputData: { imageCount: 245, totalSize: 6100000000, format: 'DNG', gsd: 1.0, overlap: { front: 80, side: 70 }, sensorType: 'Hasselblad L2D-20c', captureDate: '2026-03-04' },
    processingParams: { engine: 'dronedeploy', quality: 'high', coordinateSystem: 'WGS 84 / UTM zone 10N', gcpUsed: false, outputFormats: ['geotiff', 'jpg', 'pdf'] },
    outputs: [
      { name: 'Rooftop Orthomosaic', type: 'geotiff', size: 1500000000, resolution: 1.0, downloadUrl: '#', previewUrl: '#' },
      { name: 'JPEG Preview', type: 'jpg', size: 42000000, downloadUrl: '#', previewUrl: '#' },
      { name: 'Solar Potential Report', type: 'pdf', size: 3800000, downloadUrl: '#' },
    ],
    metrics: { processingTime: 2700, areaSquareMeters: 18000, accuracy: { horizontal: 0.035, vertical: 0.05 } },
    createdBy: 'Mike Chen', createdAt: '2026-03-04T13:00:00Z', startedAt: '2026-03-04T13:10:00Z', completedAt: '2026-03-04T13:55:00Z',
    cost: 24.50, notes: 'Assessment for solar panel installation.',
  },
  {
    id: 'PJ-012', tenantId: 'T-001', name: 'Dam Inspection Point Cloud', type: 'point_cloud', status: 'queued', priority: 'high', progress: 0,
    missionId: 'MSN-047', missionName: 'Reservoir Dam Inspection',
    inputData: { imageCount: 0, totalSize: 28000000000, format: 'LAS 1.4', gsd: 0, overlap: { front: 50, side: 50 }, sensorType: 'DJI Zenmuse L2', captureDate: '2026-03-19' },
    processingParams: { engine: 'internal', quality: 'ultra', coordinateSystem: 'NAD83(2011) / State Plane CA Zone 3', gcpUsed: true, gcpCount: 8, outputFormats: ['las', 'obj', 'pdf'] },
    outputs: [],
    createdBy: 'James Wu', createdAt: '2026-03-19T17:00:00Z',
    cost: 0, notes: 'Critical infrastructure — ultra quality required.',
  },
];

const mockTemplates: ProcessingTemplate[] = [
  { id: 'TPL-001', name: 'Orthomosaic (Standard)', type: 'orthomosaic', description: 'Generate high-resolution orthomosaic maps from aerial imagery. Ideal for surveying, mapping, and inspection workflows.', engine: 'pix4d', quality: 'high', outputFormats: ['geotiff', 'jpg', 'kml'], estimatedTime: '1-3 hours', costPerImage: 0.10, icon: 'Map' },
  { id: 'TPL-002', name: '3D Reconstruction', type: '3d_model', description: 'Create detailed 3D models from multi-angle photogrammetry. Perfect for construction monitoring and asset documentation.', engine: 'metashape', quality: 'ultra', outputFormats: ['obj', 'ply', 'geotiff'], estimatedTime: '3-8 hours', costPerImage: 0.15, icon: 'Cuboid' },
  { id: 'TPL-003', name: 'LiDAR Point Cloud', type: 'point_cloud', description: 'Process raw LiDAR data into classified point clouds with ground extraction, vegetation filtering, and building detection.', engine: 'internal', quality: 'ultra', outputFormats: ['las', 'geotiff'], estimatedTime: '2-6 hours', costPerImage: 0.20, icon: 'Database' },
  { id: 'TPL-004', name: 'Thermal Analysis', type: 'thermal_analysis', description: 'Analyze thermal imagery for temperature anomalies, heat loss detection, and equipment monitoring applications.', engine: 'internal', quality: 'high', outputFormats: ['geotiff', 'pdf'], estimatedTime: '30-90 min', costPerImage: 0.12, icon: 'Thermometer' },
  { id: 'TPL-005', name: 'NDVI Crop Health', type: 'ndvi_crop_health', description: 'Generate NDVI vegetation indices from multispectral imagery. Provides crop health zones and stress maps for precision agriculture.', engine: 'internal', quality: 'high', outputFormats: ['geotiff', 'shapefile', 'pdf'], estimatedTime: '1-2 hours', costPerImage: 0.08, icon: 'Leaf' },
  { id: 'TPL-006', name: 'Volume Measurement', type: 'volume_measurement', description: 'Calculate stockpile volumes and cut/fill analysis from aerial survey data. Includes DSM generation and volumetric reporting.', engine: 'pix4d', quality: 'high', outputFormats: ['geotiff', 'csv', 'pdf'], estimatedTime: '1-2 hours', costPerImage: 0.10, icon: 'Ruler' },
  { id: 'TPL-007', name: 'Change Detection', type: 'change_detection', description: 'Compare multi-temporal datasets to identify changes in terrain, vegetation, structures, or land use over time.', engine: 'pix4d', quality: 'high', outputFormats: ['geotiff', 'shapefile', 'pdf'], estimatedTime: '2-4 hours', costPerImage: 0.12, icon: 'RefreshCw' },
  { id: 'TPL-008', name: 'Object Detection', type: 'object_detection', description: 'AI-powered detection and counting of vehicles, structures, equipment, and other objects from aerial imagery.', engine: 'internal', quality: 'medium', outputFormats: ['geotiff', 'csv', 'kml'], estimatedTime: '30-60 min', costPerImage: 0.06, icon: 'Eye' },
];

const mockStats: ProcessingStats = {
  totalJobs: mockJobs.length,
  activeJobs: mockJobs.filter((j) => j.status === 'processing' || j.status === 'uploading' || j.status === 'post_processing').length,
  completedJobs: mockJobs.filter((j) => j.status === 'completed').length,
  failedJobs: mockJobs.filter((j) => j.status === 'failed').length,
  totalProcessingTime: mockJobs.filter((j) => j.metrics).reduce((s, j) => s + (j.metrics?.processingTime ?? 0), 0),
  totalImagesProcessed: mockJobs.filter((j) => j.status === 'completed').reduce((s, j) => s + j.inputData.imageCount, 0),
  totalOutputSize: mockJobs.reduce((s, j) => s + j.outputs.reduce((os, o) => os + o.size, 0), 0),
  avgProcessingTime: Math.round(mockJobs.filter((j) => j.metrics).reduce((s, j) => s + (j.metrics?.processingTime ?? 0), 0) / mockJobs.filter((j) => j.metrics).length),
  costThisMonth: mockJobs.reduce((s, j) => s + j.cost, 0),
  byType: mockJobs.reduce((acc, j) => { acc[j.type] = (acc[j.type] ?? 0) + 1; return acc; }, {} as Record<string, number>),
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

type TabId = 'jobs' | 'templates' | 'analytics';
type StatusFilter = 'all' | ProcessingJob['status'];
type TypeFilter = 'all' | ProcessingJob['type'];
type EngineFilter = 'all' | ProcessingJob['processingParams']['engine'];
type PriorityFilter = 'all' | ProcessingJob['priority'];

const statusColors: Record<ProcessingJob['status'], { bg: string; text: string; dot: string }> = {
  queued: { bg: 'bg-gray-50', text: 'text-gray-700', dot: 'bg-gray-400' },
  uploading: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-400' },
  processing: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  post_processing: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  completed: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  failed: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const statusIcons: Record<ProcessingJob['status'], typeof CheckCircle> = {
  queued: Clock,
  uploading: Upload,
  processing: Loader,
  post_processing: Loader,
  completed: CheckCircle,
  failed: XCircle,
  cancelled: XCircle,
};

const priorityColors: Record<ProcessingJob['priority'], { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-500' },
  normal: { label: 'Normal', color: 'text-blue-600' },
  high: { label: 'High', color: 'text-amber-600' },
  urgent: { label: 'Urgent', color: 'text-red-600' },
};

const typeConfig: Record<ProcessingJob['type'], { label: string; icon: typeof Map; color: string }> = {
  orthomosaic: { label: 'Orthomosaic', icon: Map, color: 'bg-blue-100 text-blue-700' },
  '3d_model': { label: '3D Model', icon: Cuboid, color: 'bg-purple-100 text-purple-700' },
  point_cloud: { label: 'Point Cloud', icon: Database, color: 'bg-cyan-100 text-cyan-700' },
  thermal_analysis: { label: 'Thermal', icon: Thermometer, color: 'bg-orange-100 text-orange-700' },
  ndvi_crop_health: { label: 'NDVI', icon: Leaf, color: 'bg-green-100 text-green-700' },
  volume_measurement: { label: 'Volume', icon: Ruler, color: 'bg-amber-100 text-amber-700' },
  change_detection: { label: 'Change Detection', icon: RefreshCw, color: 'bg-indigo-100 text-indigo-700' },
  object_detection: { label: 'Object Detection', icon: Eye, color: 'bg-pink-100 text-pink-700' },
  classification: { label: 'Classification', icon: Layers, color: 'bg-teal-100 text-teal-700' },
  custom: { label: 'Custom', icon: Settings, color: 'bg-gray-100 text-gray-700' },
};

const engineLabels: Record<string, string> = {
  internal: 'C6mac Engine',
  pix4d: 'Pix4D',
  dronedeploy: 'DroneDeploy',
  webodm: 'WebODM',
  metashape: 'Metashape',
};

const templateIcons: Record<string, typeof Map> = {
  Map, Cuboid, Database, Thermometer, Leaf, Ruler, RefreshCw, Eye,
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(i > 1 ? 1 : 0)} ${sizes[i]}`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function elapsed(start: string): string {
  const diff = Math.floor((Date.now() - new Date(start).getTime()) / 1000);
  return formatDuration(diff > 0 ? diff : 0);
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function DataProcessingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('jobs');
  const [showNewJobForm, setShowNewJobForm] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [engineFilter, setEngineFilter] = useState<EngineFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // New job form state
  const [newJob, setNewJob] = useState({
    name: '', type: 'orthomosaic' as ProcessingJob['type'], missionId: '', imageCount: 0,
    totalSize: 0, format: 'DNG', gsd: 1.0, overlapFront: 80, overlapSide: 70,
    sensorType: '', engine: 'pix4d' as ProcessingJob['processingParams']['engine'],
    quality: 'high' as ProcessingJob['processingParams']['quality'],
    coordinateSystem: 'WGS 84 / UTM zone 10N', gcpUsed: false, gcpCount: 0,
    outputFormats: ['geotiff'] as string[], priority: 'normal' as ProcessingJob['priority'], notes: '',
  });

  // Filter jobs
  const filteredJobs = mockJobs.filter((j) => {
    if (statusFilter !== 'all' && j.status !== statusFilter) return false;
    if (typeFilter !== 'all' && j.type !== typeFilter) return false;
    if (engineFilter !== 'all' && j.processingParams.engine !== engineFilter) return false;
    if (priorityFilter !== 'all' && j.priority !== priorityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return j.name.toLowerCase().includes(q) || j.id.toLowerCase().includes(q) || (j.missionName?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const tabs: { id: TabId; label: string; icon: typeof Cpu }[] = [
    { id: 'jobs', label: 'Jobs', icon: Cpu },
    { id: 'templates', label: 'Templates', icon: FileOutput },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  ];

  // Analytics data
  const monthlyVolume = [
    { month: 'Oct', jobs: 8 }, { month: 'Nov', jobs: 12 }, { month: 'Dec', jobs: 6 },
    { month: 'Jan', jobs: 15 }, { month: 'Feb', jobs: 11 }, { month: 'Mar', jobs: 12 },
  ];

  const costByType: { type: string; cost: number }[] = Object.entries(
    mockJobs.reduce((acc, j) => { acc[j.type] = (acc[j.type] ?? 0) + j.cost; return acc; }, {} as Record<string, number>)
  ).map(([type, cost]) => ({ type, cost })).sort((a, b) => b.cost - a.cost);

  const storageByType: { type: string; size: number }[] = Object.entries(
    mockJobs.reduce((acc, j) => {
      const s = j.outputs.reduce((os, o) => os + o.size, 0);
      acc[j.type] = (acc[j.type] ?? 0) + s;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, size]) => ({ type, size })).sort((a, b) => b.size - a.size);

  const avgTimeByType: { type: string; time: number }[] = Object.entries(
    mockJobs.filter((j) => j.metrics).reduce((acc, j) => {
      if (!acc[j.type]) acc[j.type] = { total: 0, count: 0 };
      acc[j.type].total += j.metrics?.processingTime ?? 0;
      acc[j.type].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>)
  ).map(([type, v]) => ({ type, time: Math.round(v.total / v.count) })).sort((a, b) => b.time - a.time);

  const topMissions = mockJobs
    .filter((j) => j.missionName)
    .reduce((acc, j) => {
      const key = j.missionName!;
      acc[key] = (acc[key] ?? 0) + j.inputData.totalSize;
      return acc;
    }, {} as Record<string, number>);
  const topMissionsList = Object.entries(topMissions).map(([name, size]) => ({ name, size })).sort((a, b) => b.size - a.size).slice(0, 5);

  function applyTemplate(tpl: ProcessingTemplate) {
    setNewJob((prev) => ({
      ...prev,
      name: '',
      type: tpl.type,
      engine: tpl.engine as ProcessingJob['processingParams']['engine'],
      quality: tpl.quality as ProcessingJob['processingParams']['quality'],
      outputFormats: [...tpl.outputFormats],
    }));
    setActiveTab('jobs');
    setShowNewJobForm(true);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Cpu className="h-7 w-7 text-indigo-600" />
              Data Processing Pipeline
            </h1>
            <p className="text-sm text-gray-500 mt-1">Process aerial imagery, LiDAR, and sensor data into actionable deliverables</p>
          </div>
          {activeTab === 'jobs' && (
            <button
              onClick={() => setShowNewJobForm(!showNewJobForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              New Processing Job
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {/* ─── Jobs Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { label: 'Total Jobs', value: mockStats.totalJobs, icon: Layers, color: 'text-gray-700' },
                { label: 'Active', value: mockStats.activeJobs, icon: Loader, color: 'text-amber-600', spin: true },
                { label: 'Completed', value: mockStats.completedJobs, icon: CheckCircle, color: 'text-green-600' },
                { label: 'Failed', value: mockStats.failedJobs, icon: XCircle, color: 'text-red-600' },
                { label: 'Processing Time', value: formatDuration(mockStats.totalProcessingTime), icon: Clock, color: 'text-indigo-600' },
                { label: 'Images Processed', value: mockStats.totalImagesProcessed.toLocaleString(), icon: Image, color: 'text-blue-600' },
                { label: 'Output Size', value: formatBytes(mockStats.totalOutputSize), icon: HardDrive, color: 'text-purple-600' },
                { label: 'Cost This Month', value: `$${mockStats.costThisMonth.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-600' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={clsx('h-4 w-4', stat.color, stat.spin && 'animate-spin')} />
                      <span className="text-xs text-gray-500">{stat.label}</span>
                    </div>
                    <div className={clsx('text-lg font-bold', stat.color)}>{stat.value}</div>
                  </div>
                );
              })}
            </div>

            {/* New Job Form */}
            {showNewJobForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-indigo-600" />
                    New Processing Job
                  </h3>
                  <button onClick={() => setShowNewJobForm(false)} className="text-gray-400 hover:text-gray-600">
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Job Name</label>
                    <input
                      type="text" value={newJob.name} onChange={(e) => setNewJob((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Highway Bridge Ortho"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Processing Type</label>
                    <div className="grid grid-cols-2 gap-1">
                      {(Object.entries(typeConfig) as [ProcessingJob['type'], typeof typeConfig['orthomosaic']][]).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        return (
                          <button
                            key={key}
                            onClick={() => setNewJob((p) => ({ ...p, type: key }))}
                            className={clsx(
                              'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors border',
                              newJob.type === key ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                            )}
                          >
                            <Icon className="h-3 w-3" />
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mission */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Mission</label>
                    <select
                      value={newJob.missionId} onChange={(e) => setNewJob((p) => ({ ...p, missionId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select mission...</option>
                      <option value="MSN-042">Highway 101 Bridge Survey</option>
                      <option value="MSN-045">Solar Farm Panel Survey</option>
                      <option value="MSN-038">Quarry Stockpile Measurement</option>
                      <option value="MSN-040">North Valley Farm Mapping</option>
                      <option value="MSN-047">Reservoir Dam Inspection</option>
                    </select>
                  </div>

                  {/* Input Data Section */}
                  <div className="col-span-full">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Upload className="h-4 w-4" /> Input Data</h4>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Image Count</label>
                    <input type="number" value={newJob.imageCount} onChange={(e) => setNewJob((p) => ({ ...p, imageCount: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Total Size (GB)</label>
                    <input type="number" step="0.1" value={(newJob.totalSize / 1e9).toFixed(1)} onChange={(e) => setNewJob((p) => ({ ...p, totalSize: Number(e.target.value) * 1e9 }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                    <select value={newJob.format} onChange={(e) => setNewJob((p) => ({ ...p, format: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="DNG">DNG</option><option value="RAW">RAW</option><option value="TIFF">TIFF</option>
                      <option value="JPEG">JPEG</option><option value="R-JPEG">R-JPEG</option><option value="LAS 1.4">LAS 1.4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">GSD (cm/px)</label>
                    <input type="number" step="0.1" value={newJob.gsd} onChange={(e) => setNewJob((p) => ({ ...p, gsd: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Front Overlap (%)</label>
                    <input type="number" value={newJob.overlapFront} onChange={(e) => setNewJob((p) => ({ ...p, overlapFront: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Side Overlap (%)</label>
                    <input type="number" value={newJob.overlapSide} onChange={(e) => setNewJob((p) => ({ ...p, overlapSide: Number(e.target.value) }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sensor Type</label>
                    <input type="text" value={newJob.sensorType} onChange={(e) => setNewJob((p) => ({ ...p, sensorType: e.target.value }))}
                      placeholder="e.g. Hasselblad L2D-20c"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>

                  {/* Processing Params Section */}
                  <div className="col-span-full">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1"><Settings className="h-4 w-4" /> Processing Parameters</h4>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Engine</label>
                    <select value={newJob.engine} onChange={(e) => setNewJob((p) => ({ ...p, engine: e.target.value as typeof newJob.engine }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      {Object.entries(engineLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
                    <select value={newJob.quality} onChange={(e) => setNewJob((p) => ({ ...p, quality: e.target.value as typeof newJob.quality }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="draft">Draft</option><option value="medium">Medium</option>
                      <option value="high">High</option><option value="ultra">Ultra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Coordinate System</label>
                    <input type="text" value={newJob.coordinateSystem} onChange={(e) => setNewJob((p) => ({ ...p, coordinateSystem: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={newJob.gcpUsed} onChange={(e) => setNewJob((p) => ({ ...p, gcpUsed: e.target.checked }))}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      Use GCPs
                    </label>
                    {newJob.gcpUsed && (
                      <div>
                        <input type="number" value={newJob.gcpCount} onChange={(e) => setNewJob((p) => ({ ...p, gcpCount: Number(e.target.value) }))}
                          placeholder="GCP count" className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm" />
                      </div>
                    )}
                  </div>
                  <div className="col-span-full md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Output Formats</label>
                    <div className="flex flex-wrap gap-2">
                      {['geotiff', 'las', 'obj', 'ply', 'jpg', 'png', 'pdf', 'shapefile', 'csv', 'kml'].map((fmt) => (
                        <label key={fmt} className="flex items-center gap-1 text-xs text-gray-700 cursor-pointer">
                          <input
                            type="checkbox" checked={newJob.outputFormats.includes(fmt)}
                            onChange={(e) => setNewJob((p) => ({
                              ...p,
                              outputFormats: e.target.checked ? [...p.outputFormats, fmt] : p.outputFormats.filter((f) => f !== fmt),
                            }))}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3 w-3"
                          />
                          {fmt.toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                    <select value={newJob.priority} onChange={(e) => setNewJob((p) => ({ ...p, priority: e.target.value as typeof newJob.priority }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                      <option value="low">Low</option><option value="normal">Normal</option>
                      <option value="high">High</option><option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="col-span-full md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                    <textarea value={newJob.notes} onChange={(e) => setNewJob((p) => ({ ...p, notes: e.target.value }))}
                      rows={2} placeholder="Optional notes..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button onClick={() => setShowNewJobForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                  <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">
                    <Play className="h-4 w-4" /> Submit Job
                  </button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs by name, ID, or mission..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors',
                    showFilters ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  )}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(statusFilter !== 'all' || typeFilter !== 'all' || engineFilter !== 'all' || priorityFilter !== 'all') && (
                    <span className="bg-indigo-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {[statusFilter, typeFilter, engineFilter, priorityFilter].filter((f) => f !== 'all').length}
                    </span>
                  )}
                </button>
                <span className="text-sm text-gray-500">{filteredJobs.length} jobs</span>
              </div>

              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                      <option value="all">All Statuses</option>
                      {Object.keys(statusColors).map((s) => (<option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                      <option value="all">All Types</option>
                      {Object.entries(typeConfig).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Engine</label>
                    <select value={engineFilter} onChange={(e) => setEngineFilter(e.target.value as EngineFilter)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                      <option value="all">All Engines</option>
                      {Object.entries(engineLabels).map(([k, v]) => (<option key={k} value={k}>{v}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
                      className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                      <option value="all">All Priorities</option>
                      {Object.entries(priorityColors).map(([k, v]) => (<option key={k} value={k}>{v.label}</option>))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Job List */}
            <div className="space-y-3">
              {filteredJobs.map((job) => {
                const isExpanded = expandedJob === job.id;
                const tc = typeConfig[job.type];
                const TypeIcon = tc.icon;
                const sc = statusColors[job.status];
                const StatusIcon = statusIcons[job.status];
                const pc = priorityColors[job.priority];
                const isActive = job.status === 'processing' || job.status === 'uploading' || job.status === 'post_processing';

                return (
                  <div key={job.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedJob(isExpanded ? null : job.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={clsx('flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium', tc.color)}>
                            <TypeIcon className="h-3 w-3" />
                            {tc.label}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-sm truncate">{job.name}</span>
                              <span className="text-xs text-gray-400">{job.id}</span>
                            </div>
                            {job.missionName && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Map className="h-3 w-3" />
                                {job.missionName}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Status Badge */}
                          <div className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', sc.bg, sc.text)}>
                            <StatusIcon className={clsx('h-3 w-3', isActive && 'animate-spin')} />
                            {job.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </div>

                          {/* Engine & Quality */}
                          <div className="hidden md:flex items-center gap-2">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{engineLabels[job.processingParams.engine]}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded capitalize">{job.processingParams.quality}</span>
                          </div>

                          {/* Image Count & Size */}
                          <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500">
                            {job.inputData.imageCount > 0 && (
                              <span className="flex items-center gap-1">
                                <Image className="h-3 w-3" />
                                {job.inputData.imageCount.toLocaleString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatBytes(job.inputData.totalSize)}
                            </span>
                          </div>

                          {/* Time */}
                          <div className="hidden lg:block text-xs text-gray-500">
                            {isActive && job.startedAt ? (
                              <span className="flex items-center gap-1 text-amber-600">
                                <Clock className="h-3 w-3" />
                                {elapsed(job.startedAt)}
                              </span>
                            ) : job.metrics?.processingTime ? (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(job.metrics.processingTime)}
                              </span>
                            ) : null}
                          </div>

                          {/* Cost */}
                          {job.cost > 0 && (
                            <span className="text-xs font-medium text-gray-700">${job.cost.toFixed(2)}</span>
                          )}

                          {/* Priority */}
                          <span className={clsx('text-xs font-medium', pc.color)}>{pc.label}</span>

                          <ChevronDown className={clsx('h-4 w-4 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {isActive && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span className="font-medium text-amber-600">{job.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Input Data */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                              <Upload className="h-3 w-3" /> Input Data
                            </h4>
                            <div className="space-y-1 text-xs text-gray-600">
                              {job.inputData.imageCount > 0 && <div>Images: <span className="font-medium text-gray-800">{job.inputData.imageCount.toLocaleString()}</span></div>}
                              <div>Size: <span className="font-medium text-gray-800">{formatBytes(job.inputData.totalSize)}</span></div>
                              <div>Format: <span className="font-medium text-gray-800">{job.inputData.format}</span></div>
                              {job.inputData.gsd > 0 && <div>GSD: <span className="font-medium text-gray-800">{job.inputData.gsd} cm/px</span></div>}
                              <div>Overlap: <span className="font-medium text-gray-800">{job.inputData.overlap.front}% / {job.inputData.overlap.side}%</span></div>
                              <div>Sensor: <span className="font-medium text-gray-800">{job.inputData.sensorType}</span></div>
                              <div>Captured: <span className="font-medium text-gray-800">{formatDate(job.inputData.captureDate)}</span></div>
                            </div>
                          </div>

                          {/* Processing Params */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                              <Settings className="h-3 w-3" /> Processing Parameters
                            </h4>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>Engine: <span className="font-medium text-gray-800">{engineLabels[job.processingParams.engine]}</span></div>
                              <div>Quality: <span className="font-medium text-gray-800 capitalize">{job.processingParams.quality}</span></div>
                              <div>CRS: <span className="font-medium text-gray-800">{job.processingParams.coordinateSystem}</span></div>
                              <div>GCPs: <span className="font-medium text-gray-800">{job.processingParams.gcpUsed ? `Yes (${job.processingParams.gcpCount})` : 'No'}</span></div>
                              <div>Outputs: <span className="font-medium text-gray-800">{job.processingParams.outputFormats.map((f) => f.toUpperCase()).join(', ')}</span></div>
                            </div>
                          </div>

                          {/* Metrics */}
                          {job.metrics && (
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <BarChart2 className="h-3 w-3" /> Metrics
                              </h4>
                              <div className="space-y-1 text-xs text-gray-600">
                                <div>Processing Time: <span className="font-medium text-gray-800">{formatDuration(job.metrics.processingTime)}</span></div>
                                {job.metrics.pointCount != null && <div>Point Count: <span className="font-medium text-gray-800">{job.metrics.pointCount.toLocaleString()}</span></div>}
                                {job.metrics.areaSquareMeters != null && <div>Area: <span className="font-medium text-gray-800">{(job.metrics.areaSquareMeters / 10000).toFixed(1)} ha</span></div>}
                                {job.metrics.volumeCubicMeters != null && <div>Volume: <span className="font-medium text-gray-800">{job.metrics.volumeCubicMeters.toLocaleString()} m³</span></div>}
                                <div>Accuracy (H/V): <span className="font-medium text-gray-800">{job.metrics.accuracy.horizontal}m / {job.metrics.accuracy.vertical}m</span></div>
                              </div>
                            </div>
                          )}

                          {/* Error */}
                          {job.error && (
                            <div className="col-span-full">
                              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-xs font-medium text-red-700">Error</span>
                                  <p className="text-xs text-red-600 mt-0.5">{job.error}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Outputs */}
                          {job.outputs.length > 0 && (
                            <div className="col-span-full">
                              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                                <FileOutput className="h-3 w-3" /> Outputs ({job.outputs.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {job.outputs.map((out, idx) => (
                                  <div key={idx} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2">
                                    <div className="min-w-0">
                                      <div className="text-xs font-medium text-gray-800 truncate">{out.name}</div>
                                      <div className="text-xs text-gray-500">
                                        {out.type.toUpperCase()} — {formatBytes(out.size)}
                                        {out.resolution != null && ` — ${out.resolution} cm/px`}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                      {out.previewUrl && (
                                        <button className="p-1 text-gray-400 hover:text-indigo-600" title="Preview">
                                          <Maximize className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                      {out.downloadUrl && (
                                        <button className="p-1 text-gray-400 hover:text-indigo-600" title="Download">
                                          <Download className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Timestamps */}
                          <div className="col-span-full">
                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-200">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Created: {formatDateTime(job.createdAt)}</span>
                              {job.startedAt && <span className="flex items-center gap-1"><Play className="h-3 w-3" /> Started: {formatDateTime(job.startedAt)}</span>}
                              {job.completedAt && <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Completed: {formatDateTime(job.completedAt)}</span>}
                              <span>By: <span className="font-medium text-gray-700">{job.createdBy}</span></span>
                              {job.notes && <span className="italic text-gray-400">Note: {job.notes}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200">
                          {job.outputs.length > 0 && (
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700">
                              <Download className="h-3 w-3" /> Download All
                            </button>
                          )}
                          {isActive && (
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200">
                              <Pause className="h-3 w-3" /> Cancel
                            </button>
                          )}
                          {job.status === 'failed' && (
                            <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200">
                              <RotateCcw className="h-3 w-3" /> Retry
                            </button>
                          )}
                          <button className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 ml-auto">
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredJobs.length === 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-500 font-medium">No jobs found</h3>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Templates Tab ────────────────────────────────────────────── */}
        {activeTab === 'templates' && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Processing Templates</h2>
              <p className="text-sm text-gray-500">Pre-configured workflows to quickly start new processing jobs</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockTemplates.map((tpl) => {
                const Icon = templateIcons[tpl.icon] ?? Cpu;
                const tc = typeConfig[tpl.type];
                return (
                  <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={clsx('p-2 rounded-lg', tc.color)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{tpl.name}</h3>
                        <span className={clsx('text-xs px-1.5 py-0.5 rounded', tc.color)}>{tc.label}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-3">{tpl.description}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Engine</span>
                        <span className="font-medium text-gray-700">{engineLabels[tpl.engine] ?? tpl.engine}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Quality</span>
                        <span className="font-medium text-gray-700 capitalize">{tpl.quality}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Est. Time</span>
                        <span className="font-medium text-gray-700">{tpl.estimatedTime}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Cost/Image</span>
                        <span className="font-medium text-gray-700">${tpl.costPerImage.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {tpl.outputFormats.map((fmt) => (
                        <span key={fmt} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{fmt.toUpperCase()}</span>
                      ))}
                    </div>
                    <button
                      onClick={() => applyTemplate(tpl)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <Zap className="h-3 w-3" /> Use Template
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Analytics Tab ────────────────────────────────────────────── */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Processing Analytics</h2>
              <p className="text-sm text-gray-500">Insights across all data processing activity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Jobs by Type */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" /> Jobs by Type
                </h3>
                <div className="space-y-3">
                  {Object.entries(mockStats.byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                    const tc = typeConfig[type as ProcessingJob['type']];
                    const maxCount = Math.max(...Object.values(mockStats.byType));
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-700 font-medium">{tc?.label ?? type}</span>
                          <span className="text-gray-500">{count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Volume */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-blue-600" /> Monthly Processing Volume
                </h3>
                <div className="flex items-end gap-2 h-40">
                  {monthlyVolume.map((m) => {
                    const maxJobs = Math.max(...monthlyVolume.map((mv) => mv.jobs));
                    return (
                      <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-gray-500 font-medium">{m.jobs}</span>
                        <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(m.jobs / maxJobs) * 120}px` }} />
                        <span className="text-[10px] text-gray-500">{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Success / Failure Rate */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" /> Success / Failure Rate
                </h3>
                <div className="flex items-center justify-center h-40">
                  <div className="relative w-32 h-32">
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#22c55e" strokeWidth="3"
                        strokeDasharray={`${(mockStats.completedJobs / mockStats.totalJobs) * 100} ${100 - (mockStats.completedJobs / mockStats.totalJobs) * 100}`}
                        strokeDashoffset="25" strokeLinecap="round" />
                      <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#ef4444" strokeWidth="3"
                        strokeDasharray={`${(mockStats.failedJobs / mockStats.totalJobs) * 100} ${100 - (mockStats.failedJobs / mockStats.totalJobs) * 100}`}
                        strokeDashoffset={`${25 - (mockStats.completedJobs / mockStats.totalJobs) * 100}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-gray-900">{Math.round((mockStats.completedJobs / mockStats.totalJobs) * 100)}%</span>
                      <span className="text-[10px] text-gray-500">Success</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-green-500" /> Completed ({mockStats.completedJobs})</span>
                  <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-red-500" /> Failed ({mockStats.failedJobs})</span>
                  <span className="flex items-center gap-1 text-xs"><span className="w-2 h-2 rounded-full bg-gray-300" /> Other ({mockStats.totalJobs - mockStats.completedJobs - mockStats.failedJobs})</span>
                </div>
              </div>

              {/* Avg Processing Time by Type */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" /> Avg Processing Time by Type
                </h3>
                <div className="space-y-3">
                  {avgTimeByType.map(({ type, time }) => {
                    const tc = typeConfig[type as ProcessingJob['type']];
                    const maxTime = Math.max(...avgTimeByType.map((t) => t.time));
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-700 font-medium">{tc?.label ?? type}</span>
                          <span className="text-gray-500">{formatDuration(time)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(time / maxTime) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" /> Cost Breakdown by Type
                </h3>
                <div className="space-y-3">
                  {costByType.filter((c) => c.cost > 0).map(({ type, cost }) => {
                    const tc = typeConfig[type as ProcessingJob['type']];
                    const maxCost = Math.max(...costByType.map((c) => c.cost));
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-700 font-medium">{tc?.label ?? type}</span>
                          <span className="text-gray-500">${cost.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(cost / maxCost) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700">Total This Month</span>
                  <span className="font-bold text-emerald-600">${mockStats.costThisMonth.toFixed(2)}</span>
                </div>
              </div>

              {/* Storage Usage */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-purple-600" /> Storage Usage Breakdown
                </h3>
                <div className="space-y-3">
                  {storageByType.filter((s) => s.size > 0).map(({ type, size }) => {
                    const tc = typeConfig[type as ProcessingJob['type']];
                    const maxSize = Math.max(...storageByType.map((s) => s.size));
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-700 font-medium">{tc?.label ?? type}</span>
                          <span className="text-gray-500">{formatBytes(size)}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(size / maxSize) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700">Total Output</span>
                  <span className="font-bold text-purple-600">{formatBytes(mockStats.totalOutputSize)}</span>
                </div>
              </div>

              {/* Top Missions by Data Volume */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-cyan-600" /> Top Missions by Data Volume
                </h3>
                <div className="space-y-3">
                  {topMissionsList.map(({ name, size }, idx) => {
                    const maxSize = topMissionsList[0]?.size ?? 1;
                    return (
                      <div key={name} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-5 text-right">{idx + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-700 font-medium">{name}</span>
                            <span className="text-gray-500">{formatBytes(size)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: `${(size / maxSize) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
