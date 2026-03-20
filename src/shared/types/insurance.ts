export interface InsurancePolicy {
  id: string;
  tenantId: string;
  provider: string;
  providerLogo?: string;
  policyNumber: string;
  type: 'annual_hull' | 'annual_liability' | 'per_flight' | 'on_demand' | 'fleet' | 'comprehensive';
  status: 'active' | 'expired' | 'pending' | 'cancelled' | 'suspended';
  coverage: {
    hullValue: number;
    liabilityLimit: number;
    medicalPayments: number;
    personalInjury: number;
    propertyDamage: number;
    groundEquipment: number;
    nonOwnedDrones?: number;
  };
  premium: { amount: number; frequency: 'monthly' | 'quarterly' | 'annual' | 'per_flight'; paid: boolean; nextPaymentDate: string };
  deductible: number;
  effectiveDate: string;
  expiryDate: string;
  coveredDrones: Array<{ droneId: string; droneName: string; hullValue: number }>;
  coveredPilots: Array<{ pilotId: string; pilotName: string; certNumber: string }>;
  exclusions: string[];
  endorsements: string[];
  documents: Array<{ name: string; type: 'policy' | 'coi' | 'endorsement' | 'receipt'; uploadDate: string }>;
  claims: InsuranceClaim[];
  autoRenew: boolean;
}

export interface InsuranceClaim {
  id: string;
  policyId: string;
  claimNumber: string;
  status: 'filed' | 'under_review' | 'approved' | 'denied' | 'settled' | 'closed';
  type: 'hull_damage' | 'liability' | 'property_damage' | 'injury' | 'theft' | 'lost_drone';
  incidentDate: string;
  filedDate: string;
  description: string;
  amount: number;
  settledAmount?: number;
  adjuster?: string;
  relatedSafetyReport?: string;
  documents: string[];
}

export interface CertificateOfInsurance {
  id: string;
  policyId: string;
  holderName: string;
  holderAddress: string;
  additionalInsured?: string;
  certificateNumber: string;
  issuedDate: string;
  purpose: string;
  operationDescription: string;
  location: string;
  generatedUrl?: string;
}

export interface InsuranceQuote {
  id: string;
  provider: string;
  type: InsurancePolicy['type'];
  premium: number;
  coverage: InsurancePolicy['coverage'];
  deductible: number;
  validUntil: string;
  highlights: string[];
}

export interface InsuranceStats {
  totalPolicies: number;
  activePolicies: number;
  totalCoverage: number;
  totalPremiums: number;
  openClaims: number;
  expiringWithin30Days: number;
  coveredDrones: number;
  uncoveredDrones: number;
}
