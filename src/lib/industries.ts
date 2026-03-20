// SkyWarden — 24 Industry Verticals
export interface Industry {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  useCases: string[];
}

export const INDUSTRIES: Industry[] = [
  { id: 'agriculture', name: 'Agriculture', icon: 'Wheat', description: 'Crop monitoring, precision spraying, and yield analysis', useCases: ['Crop health mapping', 'Precision fertilizer application', 'Irrigation monitoring'] },
  { id: 'construction', name: 'Construction', icon: 'HardHat', description: 'Site surveys, progress tracking, and safety inspections', useCases: ['Volumetric surveys', 'Progress documentation', 'Structural inspection'] },
  { id: 'energy', name: 'Energy & Utilities', icon: 'Zap', description: 'Power line inspection, solar panel monitoring, and wind farm surveys', useCases: ['Transmission line inspection', 'Solar array thermal analysis', 'Wind turbine blade inspection'] },
  { id: 'mining', name: 'Mining', icon: 'Mountain', description: 'Stockpile measurement, blast planning, and environmental compliance', useCases: ['Volumetric stockpile analysis', 'Pit progression mapping', 'Environmental monitoring'] },
  { id: 'oil-gas', name: 'Oil & Gas', icon: 'Fuel', description: 'Pipeline inspection, flare monitoring, and facility security', useCases: ['Pipeline leak detection', 'Flare stack monitoring', 'Facility perimeter security'] },
  { id: 'real-estate', name: 'Real Estate', icon: 'Building2', description: 'Aerial photography, 3D modeling, and virtual property tours', useCases: ['Listing photography', 'Property boundary surveys', '3D property models'] },
  { id: 'insurance', name: 'Insurance', icon: 'Shield', description: 'Claims assessment, risk analysis, and catastrophe response', useCases: ['Roof damage assessment', 'Flood area mapping', 'Wildfire damage documentation'] },
  { id: 'telecom', name: 'Telecommunications', icon: 'Radio', description: 'Tower inspection, RF propagation mapping, and fiber route surveys', useCases: ['Cell tower inspection', 'RF coverage mapping', 'Fiber optic route planning'] },
  { id: 'public-safety', name: 'Public Safety', icon: 'Siren', description: 'Search and rescue, disaster response, and crowd management', useCases: ['Search and rescue', 'Traffic accident documentation', 'Hazmat scene assessment'] },
  { id: 'environmental', name: 'Environmental', icon: 'TreePine', description: 'Wildlife monitoring, forest management, and water quality', useCases: ['Wildlife population surveys', 'Deforestation tracking', 'Coastal erosion monitoring'] },
  { id: 'logistics', name: 'Logistics & Delivery', icon: 'Package', description: 'Last-mile delivery, warehouse management, and fleet tracking', useCases: ['Medical supply delivery', 'Inventory management', 'Route optimization'] },
  { id: 'media', name: 'Film & Media', icon: 'Video', description: 'Cinematography, live event coverage, and news gathering', useCases: ['Film production', 'Sports event coverage', 'News aerial footage'] },
  { id: 'surveying', name: 'Land Surveying', icon: 'Map', description: 'Topographic mapping, cadastral surveys, and GIS data collection', useCases: ['Topographic mapping', 'Boundary surveys', 'LiDAR data collection'] },
  { id: 'transportation', name: 'Transportation', icon: 'Train', description: 'Road inspection, railway monitoring, and bridge assessment', useCases: ['Road surface analysis', 'Railway track inspection', 'Bridge structural assessment'] },
  { id: 'maritime', name: 'Maritime', icon: 'Ship', description: 'Port inspection, vessel monitoring, and coastal surveillance', useCases: ['Port security', 'Ship hull inspection', 'Coastal search operations'] },
  { id: 'defense', name: 'Defense & Security', icon: 'ShieldAlert', description: 'Surveillance, reconnaissance, and border monitoring', useCases: ['Perimeter security', 'Intelligence gathering', 'Border surveillance'] },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart', description: 'Medical delivery, emergency response, and facility inspection', useCases: ['Blood/organ transport', 'Emergency medical delivery', 'Hospital rooftop inspection'] },
  { id: 'education', name: 'Education & Research', icon: 'GraduationCap', description: 'STEM programs, field research, and academic surveys', useCases: ['Archaeology surveys', 'Climate research', 'STEM curriculum programs'] },
  { id: 'tourism', name: 'Tourism & Hospitality', icon: 'Plane', description: 'Destination marketing, resort mapping, and tour operations', useCases: ['Destination aerial photography', 'Resort area mapping', 'Guided aerial tours'] },
  { id: 'disaster', name: 'Disaster Response', icon: 'CloudLightning', description: 'Damage assessment, supply delivery, and survivor detection', useCases: ['Post-hurricane assessment', 'Earthquake damage mapping', 'Flood zone monitoring'] },
  { id: 'archaeology', name: 'Archaeology & Heritage', icon: 'Landmark', description: 'Site documentation, artifact mapping, and preservation monitoring', useCases: ['Archaeological site mapping', 'Cultural heritage documentation', 'Monument preservation'] },
  { id: 'water', name: 'Water Management', icon: 'Droplets', description: 'Dam inspection, water treatment, and flood monitoring', useCases: ['Dam structural inspection', 'Water treatment plant monitoring', 'Flood plain mapping'] },
  { id: 'forestry', name: 'Forestry', icon: 'Trees', description: 'Forest inventory, fire detection, and reforestation planning', useCases: ['Timber volume estimation', 'Early fire detection', 'Reforestation monitoring'] },
  { id: 'smart-city', name: 'Smart Cities', icon: 'Building', description: 'Urban planning, traffic management, and infrastructure mapping', useCases: ['Urban 3D modeling', 'Traffic flow analysis', 'Infrastructure asset management'] },
];

export const INDUSTRY_CATEGORIES = [
  { label: 'Infrastructure', ids: ['construction', 'energy', 'telecom', 'transportation', 'water'] },
  { label: 'Natural Resources', ids: ['agriculture', 'mining', 'oil-gas', 'forestry', 'environmental'] },
  { label: 'Public Sector', ids: ['public-safety', 'defense', 'disaster', 'smart-city', 'education'] },
  { label: 'Commercial', ids: ['real-estate', 'insurance', 'logistics', 'media', 'tourism'] },
  { label: 'Specialized', ids: ['healthcare', 'maritime', 'surveying', 'archaeology'] },
];
