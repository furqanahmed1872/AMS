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

export interface ParentNotice {
  title: string;
  message: string;
  createdAt: string;
}

// From lib/exam-schedule/actions.ts — resolved to "does this apply to
// this student" server-side before it ever reaches the client.
export interface ParentExamNotice {
  examName: string;
  subjectName: string;
  examDate: string;
  startTime: string | null;
  endTime: string | null;
  venue: string | null;
  notes: string | null;
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
  notices: ParentNotice[];
  upcomingExams: ParentExamNotice[];
}
