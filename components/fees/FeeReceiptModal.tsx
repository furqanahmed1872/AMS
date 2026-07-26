"use client";

import { useState } from "react";
import { FileDown, MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FeeReceiptPDF } from "@/components/templates/pdf/FeeReceiptPDF";
import { exportElementAsPDF } from "@/lib/export/utils";
import { shareElementAsImageToPhone } from "@/lib/export/utils";
import { buildReceiptWhatsAppLink } from "@/lib/fees/whatsapp";

export interface FeeReceiptData {
  academyName: string;
  studentName: string;
  rollNumber: number;
  className: string;
  monthLabel: string;
  amountPaid: number;
  paidDate: string | null;
  phone: string;
}

export function FeeReceiptModal({
  isOpen,
  onClose,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  data: FeeReceiptData | null;
}) {
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);

  if (!data) return null;

  const receiptNo = `${data.rollNumber}-${data.monthLabel.replace(/\s+/g, "")}`;
  const paidDate = data.paidDate ?? new Date().toISOString();

  const handleDownload = async () => {
    setDownloading(true);
    await exportElementAsPDF(
      "fee-receipt-pdf-template",
      `receipt-${data.studentName.replace(/\s+/g, "-")}-${data.monthLabel.replace(/\s+/g, "-")}`,
      "portrait",
    );
    setDownloading(false);
  };

  const handleSendWhatsApp = async () => {
    setSending(true);
    const text = `Fee receipt for ${data.studentName} — ${data.monthLabel}`;
    const result = await shareElementAsImageToPhone(
      "fee-receipt-pdf-template",
      text,
      `receipt-${data.studentName.replace(/\s+/g, "-")}`,
    );

    if (result.method === "download+link") {
      // Desktop: image downloaded above, open a pre-filled text message
      // to the parent's number as a second step — they attach the
      // just-downloaded image manually in WhatsApp Web.
      const link = buildReceiptWhatsAppLink(
        data.phone,
        data.studentName,
        data.className,
        data.amountPaid,
        data.monthLabel,
      );
      if (link) window.open(link, "_blank");
    }
    setSending(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" size="sm">
      <div className="flex flex-col gap-4">
        <div className="rounded-xl overflow-hidden border border-white/10">
          <FeeReceiptPDF
            academyName={data.academyName}
            studentName={data.studentName}
            rollNumber={data.rollNumber}
            className={data.className}
            monthLabel={data.monthLabel}
            amountPaid={data.amountPaid}
            paidDate={paidDate}
            receiptNo={receiptNo}
            visible
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<FileDown size={14} />}
            onClick={handleDownload}
            loading={downloading}
            className="flex-1"
          >
            Download PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<MessageCircle size={14} />}
            onClick={handleSendWhatsApp}
            loading={sending}
            disabled={!data.phone}
            className="flex-1"
          >
            Send via WhatsApp
          </Button>
        </div>
        {!data.phone && (
          <p className="text-xs text-amber-400 text-center">
            No phone number on file for this student.
          </p>
        )}
      </div>
    </Modal>
  );
}
