"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeeReceiptPDF } from "@/components/templates/pdf/FeeReceiptPDF";
import { exportElementAsPDF } from "@/lib/export/utils";

export function FeeReceiptButton({
  academyName,
  studentName,
  rollNumber,
  className,
  monthLabel,
  amountPaid,
  paidDate,
}: {
  academyName: string;
  studentName: string;
  rollNumber: number;
  className: string;
  monthLabel: string;
  amountPaid: number;
  paidDate: string | null;
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    // Short delay lets the hidden template mount before capture.
    await new Promise((r) => setTimeout(r, 50));
    await exportElementAsPDF(
      "fee-receipt-pdf-template",
      `receipt-${studentName.replace(/\s+/g, "-")}-${monthLabel.replace(/\s+/g, "-")}`,
      "portrait",
    );
    setDownloading(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<FileDown size={12} />}
        onClick={handleDownload}
        loading={downloading}
      >
        Receipt
      </Button>
      {downloading && (
        <FeeReceiptPDF
          academyName={academyName}
          studentName={studentName}
          rollNumber={rollNumber}
          className={className}
          monthLabel={monthLabel}
          amountPaid={amountPaid}
          paidDate={paidDate ?? new Date().toISOString()}
          receiptNo={`${rollNumber}-${monthLabel.replace(/\s+/g, "")}`}
        />
      )}
    </>
  );
}
