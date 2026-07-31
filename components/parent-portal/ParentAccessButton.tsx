"use client";

import { useState, useCallback, useEffect } from "react";
import { KeyRound, Copy, Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import {
  getParentAccessInfo,
  setParentPinAction,
} from "@/lib/parent-portal/admin-actions";
import { ToastProvider, useToast } from "./Toast";

function ParentAccessButtonInner({ studentId }: { studentId: string }) {
  const { show } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState(false);
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const info = await getParentAccessInfo(studentId);
    if (info) {
      setShareToken(info.shareToken);
      setHasPin(info.hasPin);
    }
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const link =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/parent/${shareToken}`
      : "";

  const handleSetPin = async () => {
    setSaving(true);
    const result = await setParentPinAction(studentId, pin);
    setSaving(false);
    if (result.success) {
      setHasPin(true);
      setPin("");
      show(hasPin ? "PIN reset." : "PIN set.", "success");
    } else {
      show(result.error ?? "Something went wrong.", "error");
    }
  };

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    show("Link copied.", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon={<KeyRound size={14} />}
        onClick={() => setOpen(true)}
      >
        Parent Access
      </Button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Parent Access"
        size="sm"
      >
        {loading ? (
          <p className="text-sm text-white/50">Loading…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-white/50 mb-1.5">Share link</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70">
                  {link || "—"}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={copied ? <Check size={14} /> : <Copy size={14} />}
                  onClick={handleCopy}
                  disabled={!link}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs text-white/50 mb-1.5">
                {hasPin ? "Reset PIN" : "Set PIN"}
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="4–6 digits"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  icon={hasPin ? <RotateCw size={14} /> : undefined}
                  onClick={handleSetPin}
                  loading={saving}
                  disabled={pin.length < 4}
                >
                  {hasPin ? "Reset" : "Set"}
                </Button>
              </div>
              {hasPin && (
                <p className="mt-1.5 text-xs text-white/40">
                  A PIN is already set. Setting a new one replaces it.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export function ParentAccessButton({ studentId }: { studentId: string }) {
  return (
    <ToastProvider>
      <ParentAccessButtonInner studentId={studentId} />
    </ToastProvider>
  );
}
