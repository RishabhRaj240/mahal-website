"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ShieldCheck, Calendar, Sparkles } from "lucide-react";

interface PrivateViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivateViewingModal({
  isOpen,
  onClose,
}: PrivateViewingModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    principalType: "Direct Principal",
    residenceInterest: "The Sovereign Palace Compound",
    arrivalMode: "Private Helipad Transfer",
    notes: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-300">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#060608]/90 backdrop-blur-xl"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/30 shadow-[0_20px_80px_rgba(0,0,0,0.8)] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full glass-pill hover:border-[#D4AF37] transition-all text-[#A3A199] hover:text-[#F9F8F5] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-cinzel text-xs tracking-[0.3em] text-[#D4AF37] uppercase font-semibold">
                PRIVATE DIPLOMATIC PROTOCOL
              </span>
            </div>

            <h2 className="font-cinzel text-2xl sm:text-3xl text-[#F9F8F5] tracking-wider mb-2 font-semibold">
              REQUEST PRIVATE VIEWING
            </h2>

            <p className="font-serif italic text-sm sm:text-base text-[#EFE7DA]/80 mb-8 font-light">
              By sovereign invitation and confidential appointment only. Curated for distinguished patrons and sovereign estates.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-[0.2em] text-[#A3A199] uppercase mb-1.5">
                    TITLE & PRINCIPAL NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lord Sterling / Ambassador Vane"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#F9F8F5] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-[0.2em] text-[#A3A199] uppercase mb-1.5">
                    CONFIDENTIAL EMAIL *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="principal@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#F9F8F5] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-[0.2em] text-[#A3A199] uppercase mb-1.5">
                    PRIVATE TELEPHONE *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#F9F8F5] focus:border-[#D4AF37] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-[0.2em] text-[#A3A199] uppercase mb-1.5">
                    REPRESENTATION
                  </label>
                  <select
                    value={formData.principalType}
                    onChange={(e) => setFormData({ ...formData, principalType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D12] border border-white/10 text-sm text-[#F9F8F5] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Direct Principal">Direct Principal</option>
                    <option value="Family Office">Family Office Trustee</option>
                    <option value="Private Legal Counsel">Private Legal Counsel</option>
                    <option value="Diplomatic Envoy">Diplomatic Envoy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-[0.2em] text-[#A3A199] uppercase mb-1.5">
                    RESIDENCE DOMAIN
                  </label>
                  <select
                    value={formData.residenceInterest}
                    onChange={(e) => setFormData({ ...formData, residenceInterest: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D12] border border-white/10 text-sm text-[#F9F8F5] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="The Sovereign Palace Compound">The Entire Sovereign Palace Compound</option>
                    <option value="Presidential Sky Sanctuary">Presidential Sky Sanctuary (14,000 Sq Ft)</option>
                    <option value="Royal Mughal Quadrangle">Royal Mughal Quadrangle Wing</option>
                    <option value="Subterranean Thermal Springs">Imperial Thermal Springs Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-[0.2em] text-[#A3A199] uppercase mb-1.5">
                    PREFERRED ARRIVAL PROTOCOL
                  </label>
                  <select
                    value={formData.arrivalMode}
                    onChange={(e) => setFormData({ ...formData, arrivalMode: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0D0D12] border border-white/10 text-sm text-[#F9F8F5] focus:border-[#D4AF37] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Private Helipad Transfer">Palace Helipad Transfer</option>
                    <option value="Private Jet (Palace Runway)">Private Jet Direct Landing (Runway 09)</option>
                    <option value="Armored Rolls-Royce Escort">Armored Rolls-Royce Escort</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans tracking-[0.2em] text-[#A3A199] uppercase mb-1.5">
                  BESPOKE ACCOMMODATION / SECURITY CONCIERGE NOTES
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify any dietary curations, security clearances, or private date windows..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-[#F9F8F5] focus:border-[#D4AF37] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3 py-2 text-[11px] text-[#A3A199]/70 font-sans">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>Strict Non-Disclosure Agreement (NDA) automatically in effect for all communications.</span>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#AA820A] via-[#D4AF37] to-[#F7D070] text-[#060608] font-cinzel font-bold text-xs sm:text-sm tracking-[0.25em] uppercase hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                SUBMIT PROTOCOL INQUIRY
              </button>
            </form>
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
            </div>

            <span className="font-cinzel text-xs tracking-[0.3em] text-[#D4AF37] uppercase font-semibold mb-2">
              DISPATCH CONFIRMED // DOSSIER MHL-2026-X8
            </span>

            <h3 className="font-cinzel text-2xl sm:text-3xl text-[#F9F8F5] tracking-wider mb-4 font-semibold">
              YOUR INVITATION IS BEING PREPARED
            </h3>

            <p className="font-serif italic text-base text-[#EFE7DA] max-w-md mx-auto mb-6 font-light">
              &ldquo;Welcome to the sovereign circle, {formData.name}. Our Chief Diplomatic Concierge will contact your office within four hours via secure channel.&rdquo;
            </p>

            <div className="p-4 rounded-2xl glass-panel max-w-sm mx-auto mb-8 text-left border border-white/10">
              <div className="text-[10px] font-sans tracking-widest text-[#A3A199] uppercase mb-1">
                ASSIGNED PALACE ATTACHÉ
              </div>
              <div className="text-sm font-cinzel text-[#F9F8F5]">
                Lord Harrison Sterling
              </div>
              <div className="text-xs text-[#D4AF37] font-mono mt-1">
                Direct Encrypted Line: +44 20 7946 0912
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-full border border-[#D4AF37] text-[#D4AF37] font-cinzel text-xs tracking-[0.2em] uppercase hover:bg-[#D4AF37] hover:text-[#060608] transition-all cursor-pointer"
            >
              RETURN TO CINEMATIC TOUR
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
