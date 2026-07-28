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

// ─────────────────────────────────────────────────────────────────
// exportElementAsCardPDF — for content sized like a physical card
// (e.g. Student ID cards) rather than a full page. Places the
// element(s) at true CR80 print dimensions (85.6mm × 54mm) instead of
// stretching to fill an A4 page, which is what exportElementAsPDF does.
//
// Renders each `elementIds` entry on its own page at card size, centered,
// so front/back can be printed as two consecutive pages of one PDF.
// ─────────────────────────────────────────────────────────────────
const CARD_WIDTH_MM = 85.6;
const CARD_HEIGHT_MM = 54;

export async function exportElementAsCardPDF(
  elementIds: string[],
  filename: string,
): Promise<void> {
  const elements = elementIds
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  if (elements.length === 0) {
    console.error(`None of the elements [${elementIds.join(", ")}] were found`);
    return;
  }

  const html2canvas = (await import("html2canvas")).default;
  const { jsPDF } = await import("jspdf");

  const pdf: JsPDFType = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [CARD_WIDTH_MM, CARD_HEIGHT_MM],
  });

  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i], {
      scale: 4, // higher scale since the physical output is small
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage([CARD_WIDTH_MM, CARD_HEIGHT_MM], "landscape");
    pdf.addImage(imgData, "PNG", 0, 0, CARD_WIDTH_MM, CARD_HEIGHT_MM);
  }

  pdf.save(`${filename}.pdf`);
}

// ─────────────────────────────────────────────────────────────────
// exportElementAsPNG — plain PNG download of a DOM element, no share
// sheet involved. Used where the user wants a print-ready image file
// rather than triggering the WhatsApp share flow (e.g. ID cards meant
// for a print shop).
// ─────────────────────────────────────────────────────────────────
export async function exportElementAsPNG(
  elementId: string,
  filename: string,
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    scale: 4,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
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

// ─────────────────────────────────────────────────────────────────
// shareElementAsImageToPhone — same capture as shareElementAsImage, but
// reports back which path was taken instead of handling everything
// internally. FeeReceiptModal needs this because on desktop it must
// open a *second*, separate step (a pre-filled wa.me link to a specific
// parent phone number, built by buildReceiptWhatsAppLink) after the
// image downloads — there's no way to attach a file to a wa.me link, so
// the parent has to attach the just-downloaded image manually in
// WhatsApp Web. On mobile, the Web Share API handles image + text
// together in one native share sheet, so no second step is needed.
// ─────────────────────────────────────────────────────────────────
export interface ShareToPhoneResult {
  method: "shared" | "cancelled" | "download+link";
}

export async function shareElementAsImageToPhone(
  elementId: string,
  text: string,
  filename: string,
): Promise<ShareToPhoneResult> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return { method: "download+link" };
  }

  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve({ method: "download+link" });
        return;
      }

      const file = new File([blob], `${filename}.png`, { type: "image/png" });

      // Mobile: native share sheet can carry the image + text together —
      // no separate wa.me step needed.
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text, title: "Fee Receipt" });
          resolve({ method: "shared" });
          return;
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            resolve({ method: "cancelled" });
            return;
          }
          // Any other share error — fall through to the download path.
        }
      }

      // Desktop (or share unsupported/failed): download the image now,
      // then let the caller open the pre-filled wa.me link as a second
      // step so the parent can attach the image manually.
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve({ method: "download+link" });
    }, "image/png");
  });
}
