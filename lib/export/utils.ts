// lib/export/pdf.ts
// Uses html2canvas + jsPDF to capture a DOM element and save as PDF.
// Install: npm install jspdf html2canvas

import type { jsPDF as JsPDFType } from "jspdf";

export async function exportElementAsPDF(
  elementId: string,
  filename: string,
  orientation: "landscape" | "portrait" = "landscape",
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  // Capture at 2x scale for sharper output
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#0f0f1a",
    logging: false,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf: JsPDFType = new jsPDF({ orientation, unit: "mm", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // If content is taller than one page, scale down to fit
  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  } else {
    const scaledHeight = pageHeight;
    const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
    const xOffset = (pageWidth - scaledWidth) / 2;
    pdf.addImage(imgData, "PNG", xOffset, 0, scaledWidth, scaledHeight);
  }

  pdf.save(`${filename}.pdf`);
}

// lib/export/share.ts
// Captures a DOM element as a PNG image and shares via WhatsApp.
// Uses the Web Share API on mobile (primary device per PRD §12.2),
// falls back to image download on desktop browsers that don't support it.

export async function shareElementAsImage(
  elementId: string,
  text: string,
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  const html2canvas = (await import("html2canvas")).default;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#1a1a2e",
    logging: false,
  });

  canvas.toBlob(async (blob) => {
    if (!blob) return;

    const file = new File([blob], "student-report.png", { type: "image/png" });

    // Web Share API — works on mobile Chrome/Safari
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          text,
          title: "Academy Report",
        });
        return;
      } catch (err) {
        // User cancelled share — not an error
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback 1: WhatsApp deep link with text (no image attachment on desktop)
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    if (isMobile) {
      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encoded}`, "_blank");
      return;
    }

    // Fallback 2: Download image on desktop
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-report.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
