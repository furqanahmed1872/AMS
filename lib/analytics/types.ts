/** A single point on any month-indexed trend line. */
export interface TrendPoint {
  /** "2026-07" — sortable key */
  key: string;
  /** "Jul 26" — display label */
  label: string;
  value: number;
}

export interface CollectionTrendPoint extends TrendPoint {
  collected: number;
  due: number;
}

export interface BranchPerformance {
  branchId: string;
  branchName: string;
  activeStudents: number;
  collectionRate: number;
  attendancePercent: number;
  avgScore: number;
  collected: number;
  due: number;
}

export interface ClassPerformance {
  classId: string;
  className: string;
  studentCount: number;
  attendancePercent: number;
  avgScore: number;
}

export interface AdminAnalytics {
  /** Collection rate %, last N months */
  collectionTrend: CollectionTrendPoint[];
  /** Academy-wide attendance %, last N months */
  attendanceTrend: TrendPoint[];
  /** Active student headcount by admission month, cumulative */
  enrollmentTrend: TrendPoint[];
  branchPerformance: BranchPerformance[];
  classPerformance: ClassPerformance[];
  totals: {
    lifetimeCollected: number;
    outstanding: number;
    avgCollectionRate: number;
    avgAttendance: number;
  };
}
