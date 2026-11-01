"use client";

import React from "react";

export interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
  canNavigateToStep2?: boolean;
}

export default function CheckoutStepper({
  currentStep,
  onStepClick,
  canNavigateToStep2 = true,
}: CheckoutStepperProps) {
  return (
    <nav className="flex items-center justify-between mb-8 w-full max-w-2xl mx-auto">
      {/* Paso 1: Entradas */}
      <div
        onClick={() => onStepClick && onStepClick(1)}
        className={`flex flex-col items-center sm:items-start gap-1 ${
          onStepClick ? "cursor-pointer" : ""
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
              currentStep === 1
                ? "border-electric-indigo bg-electric-indigo text-white shadow-md shadow-electric-indigo/25 ring-4 ring-electric-indigo/20"
                : "border-electric-indigo bg-electric-indigo text-white shadow-md"
            }`}
          >
            {currentStep > 1 ? (
              <span className="material-symbols-outlined text-sm font-black">check</span>
            ) : (
              "1"
            )}
          </span>
          <span className="font-bold text-xs sm:text-sm text-electric-indigo hidden sm:inline">
            Entradas
          </span>
        </div>
        <span className="text-[11px] font-medium text-electric-indigo sm:hidden">Entradas</span>
      </div>

      {/* Conector Paso 1 -> 2 */}
      <div
        className={`flex-grow h-[2px] mx-2 sm:mx-4 self-center transition-colors ${
          currentStep >= 2 ? "bg-electric-indigo" : "bg-surface-variant"
        }`}
      />

      {/* Paso 2: Pago y Método */}
      <div
        onClick={() => {
          if (onStepClick && canNavigateToStep2) onStepClick(2);
        }}
        className={`flex flex-col items-center sm:items-start gap-1 ${
          onStepClick && canNavigateToStep2 ? "cursor-pointer" : currentStep < 2 ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
              currentStep === 2
                ? "border-electric-indigo bg-electric-indigo text-white shadow-md shadow-electric-indigo/25 ring-4 ring-electric-indigo/20"
                : currentStep > 2
                ? "border-electric-indigo bg-electric-indigo text-white shadow-md"
                : "border-surface-variant text-on-surface-variant bg-surface-container-low"
            }`}
          >
            {currentStep > 2 ? (
              <span className="material-symbols-outlined text-sm font-black">check</span>
            ) : (
              "2"
            )}
          </span>
          <span
            className={`font-bold text-xs sm:text-sm hidden sm:inline ${
              currentStep >= 2 ? "text-electric-indigo" : "text-on-surface-variant"
            }`}
          >
            Pago y Método
          </span>
        </div>
        <span
          className={`text-[11px] font-medium sm:hidden ${
            currentStep >= 2 ? "text-electric-indigo" : "text-on-surface-variant"
          }`}
        >
          Pago
        </span>
      </div>

      {/* Conector Paso 2 -> 3 */}
      <div
        className={`flex-grow h-[2px] mx-2 sm:mx-4 self-center transition-colors ${
          currentStep >= 3 ? "bg-electric-indigo" : "bg-surface-variant"
        }`}
      />

      {/* Paso 3: Confirmación */}
      <div className="flex flex-col items-center sm:items-start gap-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
              currentStep === 3
                ? "border-electric-indigo bg-electric-indigo text-white shadow-md shadow-electric-indigo/25 ring-4 ring-electric-indigo/20"
                : "border-surface-variant text-on-surface-variant bg-surface-container-low"
            }`}
          >
            {currentStep === 3 ? (
              <span className="material-symbols-outlined text-sm font-black">check</span>
            ) : (
              "3"
            )}
          </span>
          <span
            className={`font-bold text-xs sm:text-sm hidden sm:inline ${
              currentStep === 3 ? "text-electric-indigo" : "text-on-surface-variant"
            }`}
          >
            Confirmación
          </span>
        </div>
        <span
          className={`text-[11px] font-medium sm:hidden ${
            currentStep === 3 ? "text-electric-indigo" : "text-on-surface-variant"
          }`}
        >
          Confirmar
        </span>
      </div>
    </nav>
  );
}
