'use client';

import React, { useState } from 'react';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqsManagerProps {
  faqs: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
}

export function FaqsManager({ faqs, onChange }: FaqsManagerProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    const newFaq: FaqItem = {
      id: 'faq-' + Date.now(),
      question: question.trim(),
      answer: answer.trim(),
    };

    onChange([...faqs, newFaq]);
    setQuestion('');
    setAnswer('');
  };

  const handleRemoveFaq = (identifier: string, targetIdx?: number) => {
    onChange(
      faqs.filter((f, idx) => {
        if (f.id && identifier) {
          return f.id !== identifier;
        }
        return idx !== targetIdx;
      }),
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-deep-slate block">
          Preguntas Frecuentes (FAQs)
        </span>
        <p className="text-xs text-on-surface-variant">
          Resuelve dudas comunes sobre accesos, objetos permitidos, estacionamiento y devoluciones.
        </p>
      </div>

      {/* Formulario para añadir FAQ */}
      <div className="p-4 bg-surface-gray rounded-2xl border border-surface-variant/60 space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-deep-slate block">
            Pregunta<span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ej: ¿Hay estacionamiento disponible en el recinto?"
            className="w-full px-3 py-2 rounded-xl bg-white border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-deep-slate block">
            Respuesta<span className="text-red-500 ml-0.5">*</span>
          </label>
          <textarea
            rows={2}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Ej: Sí, contamos con estacionamiento privado con costo adicional de S/ 15.00."
            className="w-full px-3 py-2 rounded-xl bg-white border border-surface-variant/60 text-xs text-deep-slate outline-none focus:border-electric-indigo"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddFaq}
            disabled={!question.trim() || !answer.trim()}
            className="px-4 py-2 rounded-xl bg-electric-indigo text-white font-bold text-xs hover:bg-primary transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            + Añadir Pregunta
          </button>
        </div>
      </div>

      {/* Lista de FAQs */}
      {faqs.length > 0 && (
        <div className="space-y-2">
          {faqs.map((f, idx) => {
            const itemKey = f.id || `faq-item-${idx}-${f.question.slice(0, 10)}`;
            return (
              <div
                key={itemKey}
                className="p-3.5 bg-white rounded-xl border border-surface-variant/60 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <span className="font-bold text-xs text-deep-slate block">
                    {idx + 1}. {f.question}
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {f.answer}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(f.id, idx)}
                  className="text-platinum-silver hover:text-rose-600 p-1 cursor-pointer"
                  title="Eliminar pregunta"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

