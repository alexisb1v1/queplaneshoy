"use client";

import React, { useState } from "react";
import Link from "next/link";

interface FaqItem {
  q: string;
  a: string;
  category: "acceso" | "seguridad" | "pagos" | "promotores";
}

const FAQS_DATA: FaqItem[] = [
  // 1. Sobre la entrega y acceso (Las más urgentes)
  {
    category: "acceso",
    q: "¿Necesito imprimir mi entrada para ingresar al evento?",
    a: "No es necesario. Puedes presentar el código QR directamente desde la pantalla de tu celular. Te recomendamos descargar el archivo PDF o tomarle una captura de pantalla antes de salir de casa, y subirle el brillo a tu pantalla al momento de llegar a la puerta para que el escáner lo lea rápidamente.",
  },
  {
    category: "acceso",
    q: "Compré mi entrada pero no me llega el correo, ¿qué hago?",
    a: "Primero, revisa tu bandeja de 'Correos no deseados' o 'SPAM'. Si tampoco está ahí, no te preocupes: ingresa a queplanhoy.com, inicia sesión con el correo que usaste para la compra y dirígete a la sección 'Mis Entradas' (queplanhoy.com/profile/tickets). Allí encontrarás todos tus códigos QR listos para usar.",
  },
  {
    category: "acceso",
    q: "¿Piden DNI al momento de ingresar?",
    a: "No. En queplanhoy usamos un sistema de entradas al portador. El acceso se otorga a la primera persona que presente un código QR válido en la puerta. Por esta razón, el control de identidad no es necesario; tu código QR es tu única llave de acceso.",
  },
  {
    category: "acceso",
    q: "¿Qué pasa si no tengo conexión a internet en el recinto del evento?",
    a: "Te recomendamos descargar tu entrada en formato PDF a la memoria de tu teléfono o tomarle una captura de pantalla nítida antes de salir. Los lectores de puerta de queplanhoy pueden verificar el boleto de forma instantánea incluso sin cobertura móvil en el asistente.",
  },

  // 2. Sobre transferencias y seguridad
  {
    category: "seguridad",
    q: "Compré varias entradas con mi correo, ¿puedo dárselas a mis amigos?",
    a: "¡Sí, por supuesto! Como las entradas son al portador, puedes enviarle el PDF o la imagen del QR a cada uno de tus amigos por WhatsApp. Cada código QR es único. Importante: Asegúrate de enviar un código diferente a cada persona.",
  },
  {
    category: "seguridad",
    q: "¿Es seguro publicar una foto de mi entrada en redes sociales?",
    a: "NUNCA publiques tu código QR en redes sociales ni en grupos públicos. Si alguien toma una captura de pantalla de tu QR y llega al evento antes que tú, el sistema validará su ingreso y tu entrada quedará automáticamente anulada. Cuida tu QR como si fuera dinero en efectivo.",
  },
  {
    category: "seguridad",
    q: "¿Son seguras las entradas de reventa?",
    a: "queplanhoy (OmniCore S.A.C.) no garantiza ni se hace responsable por entradas adquiridas fuera de nuestra plataforma oficial. Recuerda que al ser entradas al portador, un revendedor podría vender el mismo código QR a múltiples personas, y solo ingresará el primero que llegue a la puerta.",
  },

  // 3. Sobre Pagos y Devoluciones
  {
    category: "pagos",
    q: "Me equivoqué de zona/fecha al comprar, ¿puedo pedir un reembolso o cambio?",
    a: "Una vez confirmada la transacción, no se aceptan cambios de zona, fecha, ni devoluciones por errores del comprador o por no poder asistir al evento. Por favor, verifica bien los datos de tu compra antes de procesar el pago.",
  },
  {
    category: "pagos",
    q: "¿Qué sucede si el organizador cancela o posterga el evento?",
    a: "Si el evento es cancelado definitivamente por el organizador, queplanhoy habilitará un proceso de devolución del valor del ticket a través del mismo medio de pago. Nota: La Comisión por Servicio de Boletería (Service Fee) no es reembolsable, ya que corresponde al servicio tecnológico y de procesamiento de pagos que ya fue brindado.",
  },
  {
    category: "pagos",
    q: "¿Qué medios de pago están disponibles para comprar?",
    a: "Aceptamos tarjetas de crédito y débito Visa, Mastercard, American Express y Diners Club (nacionales e internacionales), además de billeteras electrónicas autorizadas en Perú. Todos los pagos están resguardados con encriptación bancaria y autenticación 3D Secure.",
  },
  {
    category: "pagos",
    q: "¿Cómo gestiono una devolución si el evento fue cancelado o reprogramado?",
    a: "En caso de cancelación o postergación oficial, comunícate directamente con nuestro equipo de atención escribiendo a soporte@queplanhoy.com o por WhatsApp al +51 992 884 054 adjuntando tu código de orden para coordinar el reintegro según el protocolo del promotor.",
  },

  // 4. Preguntas Frecuentes exclusivas para el Organizador
  {
    category: "promotores",
    q: "¿Cuándo y cómo recibo el dinero de la taquilla?",
    a: "Las liquidaciones se realizan de forma automática. El saldo total de tus ventas (descontando las comisiones por uso de plataforma) será transferido a la cuenta bancaria de tu empresa entre 2 a 3 días hábiles después de finalizado el evento con éxito. También puedes solicitar adelantos parciales según el volumen de tus ventas y previa coordinación con tu asesor comercial de queplanhoy.",
  },
  {
    category: "promotores",
    q: "¿Cómo escaneo y valido las entradas el día del evento?",
    a: "No necesitas alquilar equipos costosos ni descargar aplicaciones en las tiendas de apps. Desde tu panel de Organizador, tienes acceso a nuestro módulo de escáner web. Solo necesitas que tu personal de puerta inicie sesión desde cualquier smartphone (Android o iPhone) con acceso a internet, y la cámara del teléfono validará los códigos QR en tiempo real contra nuestra base de datos.",
  },
  {
    category: "promotores",
    q: "¿Qué pasa si un asistente compra una entrada falsa a un revendedor?",
    a: "Nuestro sistema de códigos QR dinámicos e infalsificables garantiza que cada entrada sea única. Si un código QR es escaneado y validado en la puerta, quedará inhabilitado automáticamente. Si otra persona intenta ingresar con una fotocopia o captura de pantalla del mismo código, el escáner mostrará una alerta roja de 'Entrada ya utilizada'.",
  },
  {
    category: "promotores",
    q: "¿Quién se encarga de las devoluciones si me veo obligado a cancelar mi evento?",
    a: "Como Organizador, tú eres el único responsable legal del espectáculo. En caso de cancelación o postergación, debes notificar a queplanhoy inmediatamente. El monto nominal de las entradas será devuelto a los compradores con cargo a los fondos recaudados del evento. La comisión por servicio (Service Fee) no es reembolsable al usuario, y los costos de las transacciones bancarias por devolución serán asumidos por tu productora.",
  },
  {
    category: "promotores",
    q: "¿Cómo puedo publicar y vender entradas de mi evento en queplanhoy?",
    a: "Puedes activar tu cuenta de promotor haciendo clic en 'Crear Evento' en la barra superior. Contarás con un asistente paso a paso para configurar recinto, funciones, mapa de zonas, preventas escalonadas, cupones de descuento y landing page dedicada exclusiva.",
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
            Respuestas claras y directas para compradores y organizadores de espectáculos en queplanhoy.
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
                placeholder="Busca por palabra clave (ej. QR, entradas, reembolso, organizador, escáner...)"
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
            { id: "acceso", label: "Entrega & Acceso en Puerta", icon: "qr_code_scanner" },
            { id: "seguridad", label: "Transferencias & Seguridad", icon: "security" },
            { id: "pagos", label: "Pagos & Devoluciones", icon: "payments" },
            { id: "promotores", label: "Para Organizadores", icon: "stadium" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setOpenIndex(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeCategory === cat.id
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
                      className={`material-symbols-outlined text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-electric-indigo" : ""
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
              <h3 className="text-base font-extrabold text-white">¿Tienes dudas con tu compra o tu evento?</h3>
              <p className="text-xs text-slate-400">
                Escríbenos directamente a nuestra línea oficial de atención para asistirte en tiempo real con tus entradas o la producción de tu evento.
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
              <h3 className="text-base font-extrabold text-white">Mesa de Ayuda &amp; Promotores</h3>
              <p className="text-xs text-slate-400">
                Para solicitudes de postventa, constancias de pago, liquidaciones o convenios de venta de eventos.
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
