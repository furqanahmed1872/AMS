// lib/teachers/types.ts
export type TeacherStatus = "active" | "inactive";
export type AttendanceStatus = "P" | "A" | "L";
export type SalaryStatus = "paid" | "unpaid";

export interface Teacher {
  id: string;
  academyId: string;
  branchId: string | null;
  name: string;
  phone: string | null;
  subject: string | null;
  monthlySalary: number | null;
  joiningDate: string;
  status: TeacherStatus;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  date: string;
  status: AttendanceStatus;
}

export interface TeacherSalaryRecord {
  id: string;
  teacherId: string;
  month: number;
  year: number;
  amountDue: number;
  status: SalaryStatus;
  paidDate: string | null;
}

export interface TeacherSalaryRow {
  id: string;
  name: string;
  subject: string | null;
  cells: (number | "X" | null)[];
}
