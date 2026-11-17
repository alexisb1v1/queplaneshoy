"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FaqItem {
  q: string;
  a: string;
  category: "compras" | "pagos" | "acceso" | "devoluciones" | "promotores";
}

const FAQS_DATA: FaqItem[] = [
  // Compras y Entradas
  {
    category: "compras",
    q: "¿Cómo compro mis entradas en queplanhoy?",
    a: "Selecciona el evento en la cartelera, elige la función y la zona deseada. En el carrito, selecciona la cantidad de entradas, ingresa tu nombre y correo de contacto (sin necesidad de registrar número de DNI) y completa el pago mediante tarjeta de crédito/débito o billetera móvil. Recibirás tus entradas digitales inmediatamente en tu correo y en tu sección 'Mis Entradas'.",
  },
  {
    category: "compras",
    q: "¿Dónde encuentro mis entradas una vez compradas?",
    a: "Tus entradas se envían automáticamente al correo electrónico registrado con el que realizaste la compra. Además, puedes verlas y descargarlas en cualquier momento iniciando sesión y entrando a tu perfil en la pestaña 'Mis Entradas' (queplanhoy.com/profile/tickets).",
  },
  {
    category: "compras",
    q: "¿Las entradas son al portador o requieren nominación?",
    a: "Todas las entradas en queplanhoy son asignadas al portador. No contamos con sistemas de nominación obligatoria de boletos, por lo que puedes transferir o compartir tus entradas con total libertad. El acceso al recinto se otorga al primer portador que presente el código QR oficial.",
  },
  {
    category: "compras",
    q: "¿Existe un límite máximo de entradas por persona?",
    a: "Sí. Cada evento u organizador establece un tope máximo de compra por usuario (habitualmente entre 4 y 8 entradas por orden) para garantizar el acceso equitativo y prevenir compras masivas no autorizadas.",
  },

  // Pagos y Facturación
  {
    category: "pagos",
    q: "¿Qué medios de pago puedo utilizar?",
    a: "Aceptamos todas las tarjetas de crédito y débito Visa, Mastercard, American Express y Diners Club (nacionales e internacionales), así como pagos mediante transferencias y billeteras móviles peruanas autorizadas. Todas las transacciones se encuentran protegidas con certificación de seguridad PCI-DSS y autenticación 3DS.",
  },
  {
    category: "pagos",
    q: "¿Qué es la comisión por servicio (Service Fee)?",
    a: "Es la tarifa correspondiente al servicio de infraestructura tecnológica, procesamiento seguro de pagos, emisión de entradas digitales con código QR único y soporte técnico de control de aforo en puerta. Dicho monto se desglosa con total transparencia antes de que confirmes tu pago.",
  },
  {
    category: "pagos",
    q: "¿Por qué fue rechazada mi tarjeta durante el pago?",
    a: "Las causas más frecuentes son: falta de fondos disponibles, tarjeta no habilitada para compras por internet desde el app de tu banco, o no haber aprobado la verificación de seguridad por SMS/Token digital (3DS). Te recomendamos verificar con tu entidad bancaria o intentar con otro método de pago.",
  },

  // Acceso al Evento
  {
    category: "acceso",
    q: "¿Cómo presento mi entrada el día del espectáculo?",
    a: "Solo debes presentar el código QR oficial de tu entrada directamente en la pantalla de tu teléfono móvil o impreso en buena calidad. El escáner oficial en puerta validará la autenticidad del boleto en menos de un segundo.",
  },
  {
    category: "acceso",
    q: "¿Qué pasa si no tengo conexión a internet en el recinto?",
    a: "Te recomendamos descargar tu entrada en formato PDF a tu teléfono móvil o tomar una captura clara antes de dirigirte al evento. Los lectores de puerta de queplanhoy pueden verificar el boleto de manera instantánea y segura.",
  },
  {
    category: "acceso",
    q: "¿Los menores de edad pueden ingresar?",
    a: "Depende de la restricción de edad establecida para cada evento (Mayores de 18, Mayores de 14 con apoderado, o Todo Público). Esta información se encuentra claramente especificada en la ficha y en la landing page del evento.",
  },

  // Devoluciones y Reprogramaciones
  {
    category: "devoluciones",
    q: "¿Realizan devoluciones de dinero?",
    a: "Sí, realizamos devoluciones y reembolsos. Si necesitas gestionar la devolución de tus entradas por cancelación, reprogramación o motivos particulares, comunícate directamente con nuestro equipo de atención mediante correo a soporte@queplanhoy.com o por WhatsApp al +51 992 884 054 indicando tu número de orden para procesar tu solicitud a la brevedad.",
  },
  {
    category: "devoluciones",
    q: "¿Qué sucede si el evento se cancela o se posterga?",
    a: "En caso de cancelación definitiva o cambio de fecha por parte de la productora, se te notificará de inmediato a tu correo registrado con las pautas y plazos fijados para tramitar el reembolso íntegro de tus entradas.",
  },

  // Para Organizadores
  {
    category: "promotores",
    q: "¿Cómo puedo publicar y vender entradas de mi evento en queplanhoy?",
    a: "Puedes activar tu cuenta de promotor haciendo clic en 'Crear Evento' en la barra superior. Contarás con un asistente paso a paso para configurar recinto, fechas, mapa de zonas, preventas en cascada, cupones de descuento y landing page dedicada exclusiva.",
  },
  {
    category: "promotores",
    q: "¿Cómo funciona el control de accesos en puerta para organizadores?",
    a: "Ponemos a disposición de los promotores la App de Puerta oficial de queplanhoy para smartphones Android e iOS, que escanea y valida códigos QR en menos de 0.3 segundos por asistente, con control estricto de aforo y prevención de boletos duplicados en tiempo real.",
  },
];

export default function CentroDeAyudaPage() {
  const [activeCategory, setActiveCategory] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = FAQS_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === "todos" || item.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      query === "" ||
      item.q.toLowerCase().includes(query) ||
      item.a.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="bg-[#0B0F19] text-slate-200 min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Cabecera Hero del Centro de Ayuda */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-electric-indigo/10 text-electric-indigo text-xs font-extrabold uppercase tracking-widest border border-electric-indigo/20">
            <span className="material-symbols-outlined text-base">support_agent</span>
            <span>Centro de Ayuda &amp; Soporte</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            ¿Cómo podemos ayudarte hoy?
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Encuentra respuestas rápidas sobre compra de entradas, métodos de pago, acceso a recintos y políticas de eventos.
          </p>

          {/* Buscador de Preguntas Frecuentes */}
          <div className="pt-2">
            <div className="relative max-w-xl mx-auto">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Busca por palabra clave (ej. QR, entradas, reembolso, tarjeta...)"
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-zinc-900 border border-white/10 text-sm text-white placeholder-slate-500 outline-none focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo shadow-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros por Categoría */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { id: "todos", label: "Todas las preguntas", icon: "help_center" },
            { id: "compras", label: "Compras & Entradas", icon: "confirmation_number" },
            { id: "pagos", label: "Pagos & Facturación", icon: "credit_card" },
            { id: "acceso", label: "Día del Evento", icon: "door_front" },
            { id: "devoluciones", label: "Cancelaciones & Reembolsos", icon: "currency_exchange" },
            { id: "promotores", label: "Organizadores", icon: "stadium" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setOpenIndex(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeCategory === cat.id
                  ? "bg-electric-indigo text-white shadow-md shadow-electric-indigo/25"
                  : "bg-zinc-900/80 text-slate-400 hover:text-white border border-white/5 hover:border-white/15"
                }`}
            >
              <span className="material-symbols-outlined text-base">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Acordeón de FAQs */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl bg-zinc-900/80 border border-white/10 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-white">
                      {faq.q}
                    </span>
                    <span
                      className={`material-symbols-outlined text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-electric-indigo" : ""
                        }`}
                    >
                      expand_more
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-zinc-900/50 rounded-2xl border border-dashed border-white/10 space-y-2">
              <span className="material-symbols-outlined text-3xl text-slate-500">search_off</span>
              <p className="text-sm font-bold text-white">No se encontraron resultados para &quot;{searchQuery}&quot;</p>
              <p className="text-xs text-slate-400">Intenta buscar con otra palabra clave o contáctanos directamente.</p>
            </div>
          )}
        </div>

        {/* Tarjetas de Contacto Directo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">

          {/* Tarjeta WhatsApp */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <svg className="w-4 h-4 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>Atención Rápida por WhatsApp</span>
              </div>
              <h3 className="text-base font-extrabold text-white">¿Tienes dudas con tu compra?</h3>
              <p className="text-xs text-slate-400">
                Escríbenos directamente a nuestra línea oficial de atención para asistirte en tiempo real con tus entradas.
              </p>
            </div>
            <a
              href="https://wa.me/51992884054"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs transition-colors shadow-md"
            >
              <svg className="w-4 h-4 fill-black shrink-0" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>Chatear al +51 992 884 054</span>
            </a>
          </div>

          {/* Tarjeta Correo */}
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-electric-indigo font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-base">mail</span>
                <span>Soporte por Correo</span>
              </div>
              <h3 className="text-base font-extrabold text-white">Mesa de Ayuda a Clientes</h3>
              <p className="text-xs text-slate-400">
                Para solicitudes de postventa, constancias de pago o consultas institucionales sobre espectáculos.
              </p>
            </div>
            <a
              href="mailto:soporte@queplanhoy.com"
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs transition-colors border border-white/15"
            >
              <span className="material-symbols-outlined text-base">forward_to_inbox</span>
              <span>soporte@queplanhoy.com</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
