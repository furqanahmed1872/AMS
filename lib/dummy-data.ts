export type Role = "admin" | "teacher";

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  rollNumber: number;
  class: string;
  classId: string;
  phone: string;
  address: string;
  admissionDate: string;
  monthlyFee: number | null;
  feeStatus: "paid" | "unpaid" | "not_set";
  status: "active" | "inactive";
  teacherRemarks?: string;
  avgScore: number;
  attendancePercent: number;
}

export interface ClassItem { id: string; name: string; section?: string; displayName: string; studentCount: number; }
export interface Subject { id: string; name: string; }
export interface Test { id: string; name: string; subject: string; subjectId: string; class: string; classId: string; date: string; totalMarks: number; marksEntered: number; totalStudents: number; }
export interface TestResult { studentId: string; studentName: string; rollNumber: number; marksObtained: number | null; isAbsent: boolean; }
export interface AttendanceRecord { studentId: string; name: string; rollNumber: number; status: "P" | "A" | "L" | null; }
export interface FeeRecord { studentId: string; name: string; rollNumber: number; prevStatus: "paid" | "unpaid" | null; currentStatus: "paid" | "unpaid" | "not_set"; amount: number | null; }
export interface Notification { id: string; type: string; message: string; studentName: string; studentId?: string; class: string; createdAt: string; isResolved: boolean; }

export const CLASSES: ClassItem[] = [
  { id: "c1", name: "10th", section: "Blue", displayName: "10th Blue", studentCount: 28 },
  { id: "c2", name: "10th", section: "Red", displayName: "10th Red", studentCount: 24 },
  { id: "c3", name: "9th", section: "A", displayName: "9th A", studentCount: 31 },
  { id: "c4", name: "9th", section: "B", displayName: "9th B", studentCount: 27 },
  { id: "c5", name: "8th", displayName: "8th", studentCount: 22 },
];

export const SUBJECTS: Subject[] = [
  { id: "s1", name: "Mathematics" },
  { id: "s2", name: "Physics" },
  { id: "s3", name: "Chemistry" },
  { id: "s4", name: "Biology" },
  { id: "s5", name: "English" },
  { id: "s6", name: "Urdu" },
  { id: "s7", name: "Computer Science" },
];

export const STUDENTS: Student[] = [
  { id: "st1", name: "Ahmad Irfan", fatherName: "Irfan Ahmed", rollNumber: 1, class: "10th Blue", classId: "c1", phone: "0312-3456789", address: "House 12, Street 4, Lahore", admissionDate: "2024-04-01", monthlyFee: 4000, feeStatus: "paid", status: "active", avgScore: 87, attendancePercent: 92 },
  { id: "st2", name: "Ali Haider Rizwan", fatherName: "Haider Rizwan", rollNumber: 2, class: "10th Blue", classId: "c1", phone: "0333-9876543", address: "Block C, DHA Phase 5", admissionDate: "2024-04-01", monthlyFee: 4000, feeStatus: "unpaid", status: "active", avgScore: 79, attendancePercent: 85 },
  { id: "st3", name: "Faizan Shakeel", fatherName: "Shakeel Ahmed", rollNumber: 3, class: "10th Blue", classId: "c1", phone: "0321-1234567", address: "Model Town, Lahore", admissionDate: "2024-05-15", monthlyFee: 4000, feeStatus: "paid", status: "active", avgScore: 45, attendancePercent: 72 },
  { id: "st4", name: "Zainab Malik", fatherName: "Malik Usman", rollNumber: 4, class: "10th Blue", classId: "c1", phone: "0300-7654321", address: "Gulberg III, Lahore", admissionDate: "2024-04-01", monthlyFee: 4000, feeStatus: "paid", status: "active", avgScore: 95, attendancePercent: 98 },
  { id: "st5", name: "Hassan Tariq", fatherName: "Tariq Mehmood", rollNumber: 5, class: "10th Blue", classId: "c1", phone: "0345-2345678", address: "Johar Town, Lahore", admissionDate: "2024-06-01", monthlyFee: null, feeStatus: "not_set", status: "active", avgScore: 0, attendancePercent: 68 },
  { id: "st6", name: "Sana Fatima", fatherName: "Fateh Ali", rollNumber: 1, class: "10th Red", classId: "c2", phone: "0311-8765432", address: "Canal Road, Lahore", admissionDate: "2024-04-01", monthlyFee: 3500, feeStatus: "unpaid", status: "active", avgScore: 72, attendancePercent: 88 },
  { id: "st7", name: "Bilal Chaudhry", fatherName: "Chaudhry Yasir", rollNumber: 2, class: "10th Red", classId: "c2", phone: "0322-3456789", address: "Wapda Town, Lahore", admissionDate: "2024-04-01", monthlyFee: 3500, feeStatus: "paid", status: "active", avgScore: 83, attendancePercent: 91 },
  { id: "st8", name: "Ayesha Noor", fatherName: "Noor Muhammad", rollNumber: 3, class: "10th Red", classId: "c2", phone: "0344-9876543", address: "Bahria Town, Lahore", admissionDate: "2024-04-01", monthlyFee: 3500, feeStatus: "paid", status: "active", avgScore: 91, attendancePercent: 95 },
];

export const TESTS: Test[] = [
  { id: "t1", name: "T1", subject: "Mathematics", subjectId: "s1", class: "10th Blue", classId: "c1", date: "2025-05-10", totalMarks: 30, marksEntered: 5, totalStudents: 5 },
  { id: "t2", name: "T2", subject: "Mathematics", subjectId: "s1", class: "10th Blue", classId: "c1", date: "2025-06-01", totalMarks: 30, marksEntered: 5, totalStudents: 5 },
  { id: "t3", name: "T1", subject: "Physics", subjectId: "s2", class: "10th Blue", classId: "c1", date: "2025-05-15", totalMarks: 20, marksEntered: 4, totalStudents: 5 },
  { id: "t4", name: "T1", subject: "Chemistry", subjectId: "s3", class: "10th Red", classId: "c2", date: "2025-06-05", totalMarks: 25, marksEntered: 3, totalStudents: 4 },
  { id: "t5", name: "Chapter 11 Test", subject: "English", subjectId: "s5", class: "9th A", classId: "c3", date: "2025-06-10", totalMarks: 50, marksEntered: 0, totalStudents: 6 },
];

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "fee_not_set", message: "New student 'Hassan Tariq' added to 10th Blue by Teacher — fee not set.", studentName: "Hassan Tariq", class: "10th Blue", createdAt: "2025-06-01T09:30:00", isResolved: false },
];

export const DASHBOARD_STATS = {
  activeStudents: 132,
  totalClasses: 5,
  totalTests: 24,
  collectedThisMonth: 486000,
  dueThisMonth: 42000,
};

export const MONTHLY_ATTENDANCE: AttendanceRecord[] = [
  { studentId: "st1", name: "Ahmad Irfan", rollNumber: 1, status: "P" },
  { studentId: "st2", name: "Ali Haider Rizwan", rollNumber: 2, status: "A" },
  { studentId: "st3", name: "Faizan Shakeel", rollNumber: 3, status: "P" },
  { studentId: "st4", name: "Zainab Malik", rollNumber: 4, status: "P" },
  { studentId: "st5", name: "Hassan Tariq", rollNumber: 5, status: "L" },
];
