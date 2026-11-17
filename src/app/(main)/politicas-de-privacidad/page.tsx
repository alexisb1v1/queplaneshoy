import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Políticas de Privacidad y Protección de Datos | queplanhoy",
  description:
    "Tratamiento de datos personales en queplanhoy, servicio operado por OmniCore S.A.C., conforme a la Ley N° 29733 de la República del Perú.",
};

export default function PoliticasDePrivacidadPage() {
  return (
    <div className="bg-[#0B0F19] text-slate-200 min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Cabecera Principal */}
        <div className="border-b border-white/10 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-electric-indigo">
            <span className="material-symbols-outlined text-base">security</span>
            <span>Ley N° 29733 &bull; Protección de Datos Personales</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Políticas de Privacidad
          </h1>
          <p className="text-sm text-slate-400">
            En <strong>queplanhoy</strong>, un servicio tecnológico operado por la empresa <strong>OmniCore S.A.C.</strong>, nos tomamos muy en serio la confidencialidad y la seguridad de tu información. Este documento detalla cómo recolectamos, protegemos y tratamos tus datos personales.
          </p>
        </div>

        {/* Bloques de la Política */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-300">
          
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                1
              </span>
              Responsable del Tratamiento y Banco de Datos
            </h2>
            <p>
              El responsable del tratamiento de los datos personales recopilados a través del sitio web y de la aplicación móvil es <strong>OmniCore S.A.C.</strong>, titular de la plataforma <strong>queplanhoy</strong>, cuyos bancos de datos personales se encuentran debidamente administrados conforme a los lineamientos de la <strong>Dirección General de Transparencia, Acceso a la Información Pública y Protección de Datos Personales</strong> del Ministerio de Justicia y Derechos Humanos del Perú.
            </p>
          </section>

          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                2
              </span>
              Información que Recopilamos
            </h2>
            <p>
              En <strong>queplanhoy</strong> aplicamos el principio de minimización de datos. <strong>No solicitamos ni almacenamos el número de documento de identidad (DNI/CE/Pasaporte) al comprador de boletos</strong>.
            </p>
            <p>
              Los datos que recopilamos según tu perfil de usuario son:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Datos del Comprador:</strong> Nombres completos, correo electrónico y teléfono celular (para la entrega instantánea de entradas digitales con código QR único y soporte operativo).</li>
              <li><strong>Datos de Promotores y Organizadores:</strong> Razón social o nombres comerciales, RUC o documento del representante legal, requeridos exclusivamente para contratos de servicio, liquidación de fondos y facturación oficial.</li>
              <li><strong>Datos Transaccionales:</strong> Historial de compras, tickets adquiridos, montos y métodos de pago utilizados (los datos sensibles de tarjetas son procesados exclusivamente por pasarelas certificadas PCI-DSS).</li>
              <li><strong>Datos Técnicos:</strong> Dirección IP, tipo de navegador, registros de auditoría y credenciales de sesión encriptadas.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                3
              </span>
              Finalidades del Tratamiento
            </h2>
            <p>
              Tus datos son tratados de manera lícita para las siguientes finalidades principales:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>Generar, emitir y validar tus entradas digitales al portador mediante código QR único oficial.</li>
              <li>Permitir el control de acceso en puerta mediante escáner QR certificado.</li>
              <li>Procesar cobros, devoluciones, facturación electrónica y liquidaciones financieras.</li>
              <li>Enviarte notificaciones operativas cruciales (confirmación de compra, cambios de hora o recinto, avisos de reprogramación).</li>
              <li>Prevenir fraudes informáticos, compras automatizadas con bots y duplicidad de accesos.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                4
              </span>
              Flujo Transfronterizo y Terceros Autorizados
            </h2>
            <p>
              Para garantizar la alta disponibilidad y la seguridad de nuestras operaciones, realizamos flujo transfronterizo de datos hacia proveedores de infraestructura de primer nivel mundial:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Servidores de Cómputo y Base de Datos:</strong> Almacenamiento con cifrado de alto nivel en reposo y en tránsito (TLS 1.3 / AES-256).</li>
              <li><strong>Pasarelas de Pago:</strong> Proveedores certificados bajo normas internacionales PCI-DSS Nivel 1.</li>
              <li><strong>Organizadores del Evento:</strong> El promotor autorizado únicamente recibe el consolidado numérico y reporte operativo indispensable para la gestión de aforos del espectáculo para el cual adquiriste tu entrada.</li>
            </ul>
          </section>

          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                5
              </span>
              Ejercicio de Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h2>
            <p>
              Como titular de tus datos personales, puedes ejercer en cualquier momento tus derechos de <strong>Acceso, Rectificación, Cancelación u Oposición</strong> enviando una solicitud formal a nuestro correo oficial de atención al cliente:
            </p>
            <div className="p-4 rounded-xl bg-electric-indigo/10 border border-electric-indigo/20 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span className="material-symbols-outlined text-electric-indigo">mail</span>
                <span>soporte@queplanhoy.com</span>
              </div>
              <span className="text-xs text-slate-400">Atención dentro del plazo legal de 10 días hábiles</span>
            </div>
          </section>

        </div>

        {/* Footer de navegación interna */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <Link href="/" className="text-electric-indigo hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Volver a la Cartelera Principal</span>
          </Link>
          <div className="flex gap-4 text-slate-400">
            <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">
              Términos y Condiciones
            </Link>
            <Link href="/politica-de-cookies" className="hover:text-white transition-colors">
              Políticas de Cookies
            </Link>
            <Link href="/centro-de-ayuda" className="hover:text-white transition-colors">
              Centro de Ayuda
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
