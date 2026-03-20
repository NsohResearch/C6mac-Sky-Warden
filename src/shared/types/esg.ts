export interface CarbonFootprint {
  id: string;
  tenantId: string;
  period: { start: string; end: string; type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' };
  droneOperations: {
    totalFlights: number;
    totalFlightHours: number;
    totalDistanceKm: number;
    energyConsumedKwh: number;
    co2EmissionsKg: number;
    emissionsPerFlightHour: number;
  };
  traditionalAlternative: {
    method: 'helicopter' | 'truck' | 'manned_aircraft' | 'manual_inspection';
    estimatedCo2Kg: number;
    estimatedFuelLiters: number;
    estimatedCost: number;
    estimatedTime: number;
  };
  savings: { co2SavedKg: number; co2SavedPercent: number; fuelSavedLiters: number; costSaved: number; timeSavedHours: number };
  carbonCredits?: { earned: number; value: number; certified: boolean; standard: string };
  categories: Array<{ missionType: string; flights: number; co2Kg: number; savingsKg: number }>;
}

export interface ESGReport {
  id: string;
  tenantId: string;
  reportPeriod: string;
  environmental: {
    totalCO2Saved: number;
    totalFuelSaved: number;
    noisePollutionReduction: number;
    habitatDisturbance: 'minimal' | 'low' | 'moderate';
    wasteReduction: number;
  };
  social: {
    safetyIncidentRate: number;
    communityComplaints: number;
    jobsCreated: number;
    trainingHoursProvided: number;
    diversityScore: number;
  };
  governance: {
    complianceRate: number;
    auditsPassed: number;
    policiesUpdated: number;
    dataBreaches: number;
    transparencyScore: number;
  };
  overallScore: number;
  rating: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
  benchmarkComparison: { industry: number; peers: number; own: number };
}

export interface ESGStats {
  totalCO2Saved: number;
  totalFuelSaved: number;
  totalCostSaved: number;
  carbonCreditsEarned: number;
  overallESGScore: number;
  esgRating: string;
  monthlyTrend: Array<{ month: string; co2Saved: number; flights: number }>;
}
