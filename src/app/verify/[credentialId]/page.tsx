"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  ArrowLeft,
  QrCode,
  Share2
} from "lucide-react";

export default function CredentialVerificationPage() {
  const params = useParams();
  const credentialId = params?.credentialId as string;

  const [data, setData] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (credentialId) {
      verifyCredential();
    }
  }, [credentialId]);

  const verifyCredential = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/credentials/${credentialId}`);
      if (!res.ok) {
        setError("Invalid credential ID or verification record not found.");
        setLoading(false);
        return;
      }

      const json = await res.json();
      setData(json.credential);

      // Generate dynamic QR code
      const currentUrl = window.location.href;
      const qr = await QRCode.toDataURL(currentUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: "#242423",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(qr);
    } catch (err: any) {
      setError(err.message || "Failed to verify credential");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-xs font-semibold text-brand-onyx dark:text-brand-sage">
        Verifying credential record against platform ledger...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-brand-card border border-brand-sage/70 dark:border-brand-onyx text-center space-y-4 shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-brand-black dark:text-brand-cream">
            Verification Not Found
          </h2>
          <p className="text-xs text-brand-onyx dark:text-brand-sage">
            The credential ID <span className="font-mono font-bold">{credentialId}</span> could not be verified in the SkillRoute AI registry.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-brand-yellow text-brand-black font-bold text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      {/* -------------------------------------------------------------
          Official Verification Certificate Card
      ------------------------------------------------------------- */}
      <div className="rounded-3xl bg-white dark:bg-brand-card border-2 border-brand-yellow/80 shadow-xl overflow-hidden">
        {/* Certificate Header Banner */}
        <div className="bg-brand-black text-brand-cream p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-brand-yellow text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SkillRoute AI Platform Verification Authority</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Verified Competency Credential
            </h1>
          </div>

          <div className="sm:text-right">
            <span className="font-mono text-xs font-bold text-brand-yellow block">
              {data.credentialId}
            </span>
            <span className="text-[11px] text-brand-sage">
              Status: <span className="text-emerald-400 font-bold uppercase">{data.status}</span>
            </span>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Student & Competency Details (2 Cols) */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60 block mb-1">
                  Recipient Identity
                </span>
                <div className="text-2xl font-extrabold text-brand-black dark:text-brand-cream">
                  {data.studentName}
                </div>
                <div className="text-xs text-brand-onyx dark:text-brand-sage flex items-center space-x-1.5 mt-1 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" />
                  <span>{data.university} • {data.department}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-onyx/60 dark:text-brand-sage/60 block mb-1">
                  Demonstrated Competency
                </span>
                <div className="text-lg font-bold text-brand-black dark:text-brand-cream">
                  {data.competencyTitle}
                </div>
                <div className="text-xs text-brand-onyx dark:text-brand-sage mt-1">
                  Evaluation Score: <span className="font-extrabold text-amber-600 dark:text-brand-yellow">{data.score} / 100</span> • Type: {data.assessmentType}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-onyx/60 dark:text-brand-sage/60 block">
                    Issued Date
                  </span>
                  <span className="font-semibold text-brand-black dark:text-brand-cream">
                    {new Date(data.issuedAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-onyx/60 dark:text-brand-sage/60 block">
                    Verification Method
                  </span>
                  <span className="font-semibold text-brand-black dark:text-brand-cream">
                    {data.assessmentType === "EMPLOYER_VERIFIED"
                      ? "Direct Employer Recruitment Endorsement"
                      : data.assessmentType === "PROJECT_REVIEWED"
                      ? "Portfolio Artifact Multi-Criteria Review"
                      : "Mission Arena Practical Assessment"}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code Verification Display */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-brand-cream/50 dark:bg-brand-onyx/40 border border-brand-sage/60 dark:border-brand-onyx text-center space-y-2">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Verification for ${data.credentialId}`}
                  className="w-36 h-36 rounded-xl border border-brand-sage/60 dark:border-brand-onyx bg-white p-1"
                />
              ) : (
                <div className="w-36 h-36 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xs">
                  Generating QR...
                </div>
              )}
              <span className="text-[10px] font-semibold text-brand-onyx/80 dark:text-brand-sage/80">
                Scan to verify authenticity
              </span>
            </div>
          </div>

          {/* Official Responsible AI Disclaimer */}
          <div className="pt-6 border-t border-brand-sage/40 dark:border-brand-onyx p-4 rounded-xl bg-brand-cream/40 dark:bg-brand-onyx/30 text-xs text-brand-onyx/80 dark:text-brand-sage/80 leading-relaxed space-y-1">
            <span className="font-bold text-brand-black dark:text-brand-cream block">
              Official Credential Authority Notice:
            </span>
            <p>{data.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
