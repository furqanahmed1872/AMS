// lib/fees/types.ts
export type FeeRecordStudent = {
  id: string;
  rollNumber: number;
  name: string;
  cells: (number | "X" | null)[];
};

export const ACADEMIC_MONTHS: {
  label: string;
  month: number;
  yearOffset: number;
}[] = [
  { label: "May", month: 5, yearOffset: 0 },
  { label: "Jun", month: 6, yearOffset: 0 },
  { label: "Jul", month: 7, yearOffset: 0 },
  { label: "Aug", month: 8, yearOffset: 0 },
  { label: "Sep", month: 9, yearOffset: 0 },
  { label: "Oct", month: 10, yearOffset: 0 },
  { label: "Nov", month: 11, yearOffset: 0 },
  { label: "Dec", month: 12, yearOffset: 0 },
  { label: "Jan", month: 1, yearOffset: 1 },
  { label: "Feb", month: 2, yearOffset: 1 },
  { label: "Mar", month: 3, yearOffset: 1 },
];