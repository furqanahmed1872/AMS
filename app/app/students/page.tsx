"use client";
import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchFilter } from "@/components/shared/SearchFilter";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { useAcademyData } from "@/lib/academy-data/provider";
import { formatCurrency } from "@/lib/utils";
import { Plus, Users, Phone, ChevronRight } from "lucide-react";

export default function StudentsPage() {
  const { role, students, classes } = useAcademyData();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("active");

  const classOptions = [
    { value: "all", label: "All Classes" },
    ...classes.map((c) => ({ value: c.id, label: c.displayName })),
  ];
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "all", label: "All" },
  ];

  const filtered = students
    .filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchClass = classFilter === "all" || s.classId === classFilter;
      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      return matchSearch && matchClass && matchStatus;
    })
    .sort((a, b) => a.rollNumber - b.rollNumber);

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Students"
        subtitle={`${filtered.length} student${filtered.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/app/students/add">
            <Button icon={<Plus size={15} />}>Add Student</Button>
          </Link>
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name..."
        filters={[
          {
            label: "Class",
            options: classOptions,
            value: classFilter,
            onChange: setClassFilter,
          },
          {
            label: "Status",
            options: statusOptions,
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
        onReset={() => {
          setSearch("");
          setClassFilter("all");
          setStatusFilter("active");
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No students found"
          description={
            students.length === 0
              ? "Add your first student to get started."
              : "Try adjusting your filters."
          }
          action={
            <Link href="/app/students/add">
              <Button size="sm">Add Student</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((student) => (
            <Link key={student.id} href={`/app/students/${student.id}`}>
              <Card hover className="p-4 flex items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="bg-surface-3 rounded-xl px-2.5 py-1 text-xs font-bold text-white/50 w-10 text-center shrink-0">
                    #{student.rollNumber}
                  </div>
                  <Avatar name={student.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">
                      {student.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/40">
                        {student.class}
                      </span>
                      {student.phone && (
                        <span className="flex items-center gap-1 text-xs text-white/30">
                          <Phone size={10} />
                          {student.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden sm:block">
                    <Badge
                      variant={
                        student.feeStatus === "paid"
                          ? "paid"
                          : student.feeStatus === "not_set"
                            ? "not_set"
                            : "unpaid"
                      }
                    >
                      {student.feeStatus === "not_set"
                        ? "Not Set"
                        : student.feeStatus === "paid"
                          ? "Paid"
                          : "Unpaid"}
                    </Badge>
                    {role === "admin" && student.monthlyFee && (
                      <p className="text-xs text-white/40 mt-1">
                        {formatCurrency(student.monthlyFee)}/mo
                      </p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
