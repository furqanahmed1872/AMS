export interface FeeHistoryEntry {
  month: number;
  year: number;
  amount_due: number;
  status: "paid" | "unpaid";
  paid_date: string | null;
}

export interface SubjectScore {
  subject: string;
  tests: { name: string; obtained: number; total: number }[];
}

export interface AttendanceDay {
  date: string; // "YYYY-MM-DD"
  status: "P" | "A" | "L";
}

export interface ParentDashboardData {
  studentName: string;
  rollNumber: number;
  className: string;
  subjects: string[];
  monthlyFee: number | null;
  currentMonthFeeStatus: "paid" | "unpaid" | "not_set";
  attendancePercent: number | null;
  attendanceDays: AttendanceDay[];
  testAverage: number | null;
  subjectScores: SubjectScore[];
  feeHistory: FeeHistoryEntry[];
}
