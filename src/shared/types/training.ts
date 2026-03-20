export interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  category: 'part_107_prep' | 'part_107_recurrent' | 'company_sop' | 'safety' | 'emergency_procedures' | 'country_regulations' | 'equipment_specific' | 'advanced_operations' | 'bvlos_training';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  modules: Array<{
    id: string;
    title: string;
    type: 'video' | 'reading' | 'quiz' | 'simulation' | 'practical';
    duration: number;
    content: string;
    order: number;
    completed?: boolean;
    score?: number;
    passingScore?: number;
  }>;
  instructor?: string;
  prerequisites: string[];
  certification: { awarded: boolean; name: string; validityPeriod: number; };
  enrollmentCount: number;
  avgRating: number;
  completionRate: number;
  price: number;
  thumbnail?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingEnrollment {
  id: string;
  userId: string;
  userName: string;
  courseId: string;
  courseName: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'failed' | 'expired';
  enrolledAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
  currentModule: number;
  totalModules: number;
  quizScores: Array<{ moduleId: string; moduleName: string; score: number; passingScore: number; attempts: number; passed: boolean }>;
  certificateIssued: boolean;
  certificateUrl?: string;
  certificateExpiry?: string;
  timeSpent: number; // minutes
}

export interface TrainingStats {
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  avgScore: number;
  certificatesIssued: number;
  revenueGenerated: number;
  popularCourses: Array<{ name: string; enrollments: number }>;
}
