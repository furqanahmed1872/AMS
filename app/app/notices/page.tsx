"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { useAcademyData } from "@/lib/academy-data/provider";
import {
  getNoticesAction,
  createNoticeAction,
  deleteNoticeAction,
  type Notice,
} from "@/lib/notices/actions";
import { NoticeCard } from "@/components/templates/share/NoticeCard";
import { shareElementAsImage } from "@/lib/export/utils";
import { Megaphone, Plus, Share2, Trash2, X as XIcon } from "lucide-react";

// Fetched client-side on mount, same as AttendancePage's monthly-record tab
// (getMonthlyAttendanceAction) — this is a brand-new, low-traffic module so
// there's no bootstrap-data entry for it and no realtime subscription.
export default function NoticesPage() {
  const { role, classes, academyName } = useAcademyData();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    setNotices(await getNoticesAction());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const classOptions = [
    { value: "", label: "All Classes (academy-wide)" },
    ...classes.map((c) => ({ value: c.id, label: c.displayName })),
  ];

  // ── Compose modal state ──────────────────────────────────────────
  const [composeOpen, setComposeOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setClassId("");
    setTitle("");
    setMessage("");
    setFormError("");
  };

  const handleCreate = async () => {
    setFormError("");
    setSaving(true);
    const result = await createNoticeAction({
      classId: classId || null,
      title,
      message,
    });
    setSaving(false);

    if (!result.success) {
      setFormError(result.error ?? "Something went wrong.");
      return;
    }

    // Optimistic prepend — matches the shape getNoticesAction() returns.
    setNotices((prev) => [
      {
        id: crypto.randomUUID(),
        classId: classId || null,
        title: title.trim(),
        message: message.trim(),
        createdByRole: role,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    resetForm();
    setComposeOpen(false);
  };

  // ── Delete state ──────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deleteNoticeAction(id);
    setDeletingId(null);
    if (result.success) {
      setNotices((prev) => prev.filter((n) => n.id !== id));
    }
  };

  // ── Share state ────────────────────────────────────────────────────
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<Notice | null>(null);

  const classNameFor = (cid: string | null) =>
    cid
      ? (classes.find((c) => c.id === cid)?.displayName ?? "Class")
      : "All Classes";

  const handleShare = async (notice: Notice) => {
    setSharingId(notice.id);
    setShareTarget(notice);
    // Let the hidden card render with the new target before capturing it.
    await new Promise((r) => setTimeout(r, 80));
    await shareElementAsImage(
      "notice-share-card",
      `${notice.title}\n\n${notice.message}\n\nShared via Academy Management System`,
    );
    setSharingId(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Notices"
        subtitle="Compose and share class or academy-wide notices"
        actions={
          <Button
            icon={<Plus size={15} />}
            onClick={() => setComposeOpen(true)}
          >
            New Notice
          </Button>
        }
      />

      {loading ? (
        <Card className="p-10 text-center text-white/30 text-sm">Loading…</Card>
      ) : notices.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Megaphone size={28} />}
            title="No notices yet"
            description="Compose a notice to share with a class or the whole academy via WhatsApp."
            action={
              <Button
                icon={<Plus size={15} />}
                onClick={() => setComposeOpen(true)}
              >
                New Notice
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <Badge variant="default">
                      {classNameFor(notice.classId)}
                    </Badge>
                    <span className="text-xs text-white/30">
                      {new Date(notice.createdAt).toLocaleDateString("en-PK", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white truncate">
                    {notice.title}
                  </h3>
                  <p className="text-sm text-white/60 mt-1 whitespace-pre-wrap break-words">
                    {notice.message}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Share2 size={14} />}
                    loading={sharingId === notice.id}
                    onClick={() => handleShare(notice)}
                  >
                    Share
                  </Button>
                  {role === "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      loading={deletingId === notice.id}
                      onClick={() => handleDelete(notice.id)}
                      className="text-rose-400/70 hover:text-rose-400"
                    >
                      {""}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ══ COMPOSE MODAL ═══════════════════════════════════════════ */}
      <Modal
        isOpen={composeOpen}
        onClose={() => {
          setComposeOpen(false);
          resetForm();
        }}
        title="New Notice"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Audience"
            options={classOptions}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-term exam schedule"
              className="input-field"
              maxLength={120}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the notice content…"
              rows={5}
              className="input-field resize-none"
              maxLength={1000}
            />
          </div>

          {formError && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              {formError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              icon={<XIcon size={14} />}
              onClick={() => {
                setComposeOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button className="flex-1" loading={saving} onClick={handleCreate}>
              Publish Notice
            </Button>
          </div>
        </div>
      </Modal>

      {/* ══ HIDDEN WHATSAPP SHARE CARD (off-screen, html2canvas target) ═ */}
      {shareTarget && (
        <NoticeCard
          academyName={academyName}
          title={shareTarget.title}
          message={shareTarget.message}
          className={classNameFor(shareTarget.classId)}
          date={new Date(shareTarget.createdAt).toLocaleDateString("en-PK", {
            dateStyle: "medium",
          })}
        />
      )}
    </div>
  );
}
