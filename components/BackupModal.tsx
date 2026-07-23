"use client";

import React, { useState, useRef } from "react";
import { useData } from "@/context/DataContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import {
  Download,
  Upload,
  Calendar,
  Clock,
  History,
  RotateCcw,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  FileJson,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    accounts,
    records,
    lastBackupDate,
    backupHistory,
    exportBackupData,
    importBackupData,
    restoreSnapshot,
    deleteSnapshot,
  } = useData();

  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmImportData, setConfirmImportData] = useState<{
    accounts?: any[];
    records?: any[];
  } | null>(null);

  const isRtl = language === "fa";

  if (!isOpen) return null;

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle Export JSON
  const handleExport = () => {
    try {
      const { blob, filename } = exportBackupData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("success", t("backup.lastBackup", language) + " " + filename);
    } catch (err: any) {
      showToast("error", err?.message || t("msg.error", language));
    }
  };

  // Handle File Select & Validate
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: max 10MB
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_SIZE) {
      showToast("error", t("backup.errorSize", language));
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Validation check for accounts & records array
        if (!parsed || (typeof parsed !== "object")) {
          throw new Error(t("backup.errorInvalidJson", language));
        }

        const validAccounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
        const validRecords = Array.isArray(parsed.records) ? parsed.records : [];

        if (validAccounts.length === 0 && validRecords.length === 0 && !parsed.accounts && !parsed.records) {
          throw new Error(t("backup.errorInvalidJson", language));
        }

        // Show confirmation modal
        setConfirmImportData({ accounts: validAccounts, records: validRecords });
      } catch (err: any) {
        showToast("error", err?.message || t("backup.errorInvalidJson", language));
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsText(file);
  };

  // Execute Import after confirmation
  const handleConfirmImport = () => {
    if (!confirmImportData) return;
    try {
      importBackupData(confirmImportData);
      setConfirmImportData(null);
      showToast("success", t("backup.successImport", language));
    } catch (err: any) {
      showToast("error", err?.message || t("msg.error", language));
    }
  };

  // Restore snapshot from local history
  const handleRestoreSnapshot = (id: string) => {
    const confirmRestore = window.confirm(
      isRtl
        ? "آیا از بازیابی این نسخه پشتیبان محلی مطمئن هستید؟"
        : "Restore this local snapshot?"
    );

    if (confirmRestore) {
      restoreSnapshot(id);
      showToast("success", t("backup.successSnapshot", language));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                {t("backup.title", language)}
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                {t("backup.subtitle", language)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
              toast.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1">{toast.message}</span>
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Last Backup Info Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-gray-300">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span className="font-medium">{t("backup.lastBackup", language)}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {lastBackupDate || t("backup.never", language)}
              </span>
            </div>

            <div className="text-xs text-slate-500 dark:text-gray-400">
              {accounts.length} {isRtl ? "حساب" : "accounts"} | {records.length}{" "}
              {isRtl ? "رکورد" : "records"}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Export JSON */}
            <button
              onClick={handleExport}
              className="p-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white flex flex-col items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all group"
            >
              <Download className="w-6 h-6 group-hover:-translate-y-0.5 transition-transform" />
              <span className="font-bold text-sm">{t("backup.export", language)}</span>
            </button>

            {/* Import JSON */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json,application/json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-5 rounded-2xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 active:scale-[0.98] text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 transition-all group"
              >
                <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:-translate-y-0.5 transition-transform" />
                <span className="font-bold text-sm">{t("backup.import", language)}</span>
              </button>
            </div>
          </div>

          {/* Backup History Snapshots List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-gray-200">
              <History className="w-4 h-4 text-indigo-500" />
              <span>{t("backup.history", language)}</span>
            </div>

            {backupHistory.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center text-xs text-slate-500 dark:text-gray-400">
                {t("backup.noHistory", language)}
              </div>
            ) : (
              <div className="space-y-2">
                {backupHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-gray-100">
                          {item.jalaliDate}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                          {item.accountsCount} {isRtl ? "حساب" : "accounts"}،{" "}
                          {item.recordsCount} {isRtl ? "رکورد" : "records"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleRestoreSnapshot(item.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-medium transition-colors flex items-center gap-1"
                        title={t("backup.restore", language)}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{t("backup.restore", language)}</span>
                      </button>

                      <button
                        onClick={() => deleteSnapshot(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title={t("backup.delete", language)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {confirmImportData && (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm p-6 flex items-center justify-center">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  {t("backup.confirmTitle", language)}
                </h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed">
                {t("backup.confirmMessage", language)}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs space-y-1">
                <p>
                  <strong className="text-slate-900 dark:text-white">
                    {isRtl ? "تعداد حساب‌های جدید:" : "New Accounts:"}
                  </strong>{" "}
                  {confirmImportData.accounts?.length || 0}
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-white">
                    {isRtl ? "تعداد رکوردهای جدید:" : "New Records:"}
                  </strong>{" "}
                  {confirmImportData.records?.length || 0}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setConfirmImportData(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  {isRtl ? "انصراف" : "Cancel"}
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-colors"
                >
                  {isRtl ? "تأیید و جایگزینی" : "Confirm & Replace"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupModal;
