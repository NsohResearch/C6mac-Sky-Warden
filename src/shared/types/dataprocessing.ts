export interface ProcessingJob {
  id: string;
  tenantId: string;
  name: string;
  type: 'orthomosaic' | '3d_model' | 'point_cloud' | 'thermal_analysis' | 'ndvi_crop_health' | 'volume_measurement' | 'change_detection' | 'object_detection' | 'classification' | 'custom';
  status: 'queued' | 'uploading' | 'processing' | 'post_processing' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  progress: number;
  missionId?: string;
  missionName?: string;
  inputData: {
    imageCount: number;
    totalSize: number;
    format: string;
    gsd: number;
    overlap: { front: number; side: number };
    sensorType: string;
    captureDate: string;
  };
  processingParams: {
    engine: 'internal' | 'pix4d' | 'dronedeploy' | 'webodm' | 'metashape';
    quality: 'draft' | 'medium' | 'high' | 'ultra';
    coordinateSystem: string;
    gcpUsed: boolean;
    gcpCount?: number;
    outputFormats: string[];
  };
  outputs: Array<{
    name: string;
    type: 'geotiff' | 'las' | 'obj' | 'ply' | 'jpg' | 'png' | 'pdf' | 'shapefile' | 'csv' | 'kml';
    size: number;
    resolution?: number;
    downloadUrl?: string;
    previewUrl?: string;
  }>;
  metrics?: {
    processingTime: number;
    pointCount?: number;
    areaSquareMeters?: number;
    volumeCubicMeters?: number;
    accuracy: { horizontal: number; vertical: number };
  };
  createdBy: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  cost: number;
  notes: string;
}

export interface ProcessingTemplate {
  id: string;
  name: string;
  type: ProcessingJob['type'];
  description: string;
  engine: string;
  quality: string;
  outputFormats: string[];
  estimatedTime: string;
  costPerImage: number;
  icon: string;
}

export interface ProcessingStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalProcessingTime: number;
  totalImagesProcessed: number;
  totalOutputSize: number;
  avgProcessingTime: number;
  costThisMonth: number;
  byType: Record<string, number>;
}
