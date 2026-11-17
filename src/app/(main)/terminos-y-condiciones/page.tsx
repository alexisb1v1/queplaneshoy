import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones Generales | queplanhoy",
  description:
    "Términos y condiciones de uso de la plataforma queplanhoy, un servicio operado por OmniCore S.A.C. para la compra, emisión y validación de entradas a espectáculos en el Perú.",
};

export default function TerminosYCondicionesPage() {
  return (
    <div className="bg-[#0B0F19] text-slate-200 min-h-screen py-12 md:py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Cabecera Principal */}
        <div className="border-b border-white/10 pb-8 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-electric-indigo">
            <span className="material-symbols-outlined text-base">gavel</span>
            <span>Marco Legal &amp; Contratación Electrónica</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm text-slate-400">
            Última actualización: Noviembre de 2026. <strong>queplanhoy</strong> es una plataforma tecnológica de boletería digital y servicio provisto por la empresa <strong>OmniCore S.A.C.</strong>, aplicable para todos los usuarios, compradores y promotores en la República del Perú.
          </p>
        </div>

        {/* Contenido Estructurado */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-slate-300">
          
          {/* Sección 1 */}
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                1
              </span>
              Titularidad de la Plataforma e Intermediación
            </h2>
            <p>
              El sitio web y los servicios de boletería digital <strong>queplanhoy</strong> son de exclusiva titularidad y operación de <strong>OmniCore S.A.C.</strong> (en adelante, &quot;La Empresa&quot; o &quot;queplanhoy&quot;), sociedad constituida y domiciliada en la República del Perú.
            </p>
            <p>
              queplanhoy actúa como canal tecnológico de venta y emisión autorizada de entradas por cuenta y orden de los organizadores y productoras de espectáculos (en adelante, &quot;El Organizador&quot;). La responsabilidad del contenido del show, artistas invitados, seguridad en el recinto y horarios corresponde íntegramente al Organizador.
            </p>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                2
              </span>
              Registro y Datos de Contacto del Comprador
            </h2>
            <p>
              Para adquirir entradas en <strong>queplanhoy</strong>, el comprador únicamente proporciona su <strong>Nombre completo, Correo electrónico y Teléfono celular</strong> para la entrega inmediata y soporte de sus boletos. 
            </p>
            <p>
              <strong>No solicitamos ni almacenamos número de Documento de Identidad (DNI/CE/Pasaporte) al comprador final</strong> durante el proceso de compra de entradas, garantizando un proceso de compra ágil, privado y sin fricciones burocráticas.
            </p>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                3
              </span>
              Proceso de Compra, Pasarelas y Comisiones de Servicio
            </h2>
            <p>
              Toda transacción realizada a través de la web se procesa mediante pasarelas de pago seguras y certificadas bajo estándares <strong>PCI-DSS Nivel 1</strong> (admitiendo tarjetas Visa, Mastercard, American Express, Diners Club, transferencias bancarias y billeteras móviles autorizadas).
            </p>
            <p>
              El precio final a pagar puede incluir una <strong>Comisión por Servicio de Boletería (Service Fee)</strong> informada de forma previa y desglosada con total transparencia antes de que el usuario confirme su pago.
            </p>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                4
              </span>
              Entradas al Portador y Validación por Código QR
            </h2>
            <p>
              Las entradas emitidas en <strong>queplanhoy</strong> son <strong>asignadas al portador</strong>. <strong>No aplicamos sistemas de nominación obligatoria de boletos</strong>, por lo que el titular puede transferir o compartir libremente sus entradas con quien desee que asista al evento.
            </p>
            <p>
              Cada entrada digital cuenta con un <strong>código QR oficial único e infalsificable</strong>. En la puerta del recinto, el ingreso se valida escaneando dicho código QR en la pantalla del teléfono móvil o impreso. El acceso se otorga al primer portador que presente el código QR válido; una vez escaneado y registrado el ingreso, dicho código queda automáticamente invalidado para nuevos ingresos, garantizando el control de aforo y evitando clonaciones.
            </p>
          </section>

          {/* Sección 5 */}
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                5
              </span>
              Políticas de Devoluciones y Blindaje del Cargo por Servicio
            </h2>
            <p>
              En <strong>queplanhoy</strong> gestionamos y canalizamos las solicitudes de devolución y reembolso ante eventualidades, cancelaciones o postergaciones de eventos conforme a las directrices del Organizador y la normativa vigente de protección al consumidor.
            </p>
            <p className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-200 text-xs sm:text-sm leading-relaxed">
              <strong>Blindaje de la Comisión por Servicio:</strong> En caso de cancelación o postergación del evento por causas imputables al Organizador o fuerza mayor, la <strong>Comisión por Servicio de Boletería (Service Fee) no será reembolsable</strong> por parte de queplanhoy, ya que corresponde a un servicio tecnológico y de emisión digital efectivamente prestado y consumido al momento de la adquisición de la entrada.
            </p>
            <p>
              Para solicitar una devolución o consultar el estado de tu expediente, el usuario debe comunicarse directamente con nuestros canales oficiales de atención al cliente:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2.5">
                <span className="material-symbols-outlined text-electric-indigo text-xl">mail</span>
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">Correo Oficial</span>
                  <a href="mailto:soporte@queplanhoy.com" className="text-xs sm:text-sm font-bold text-white hover:underline">
                    soporte@queplanhoy.com
                  </a>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2.5">
                <svg className="w-5 h-5 fill-[#25D366] shrink-0" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <div>
                  <span className="text-[11px] uppercase font-bold text-slate-400 block">WhatsApp / Teléfono</span>
                  <a href="https://wa.me/51992884054" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm font-bold text-emerald-400 hover:underline">
                    +51 992 884 054
                  </a>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Nuestro equipo evaluará tu solicitud y procesará el reintegro a través del mismo método de pago original o transferencia bancaria coordinada, según corresponda.
            </p>
          </section>

          {/* Sección 6 */}
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                6
              </span>
              Contracargos y Prevención de Fraude Bancario
            </h2>
            <p>
              Ante desconocimientos de compra (contracargos) originados malintencionadamente por el usuario con su entidad bancaria tras haber adquirido entradas o tras haber asistido al espectáculo, <strong>queplanhoy</strong> recopilará y entregará a las entidades financieras, redes de medios de pago y autoridades competentes las <strong>bitácoras digitales de auditoría, dirección IP, fecha/hora y registros de escaneo del código QR</strong> en los puntos de control de acceso para probar la tenencia y asistencia efectiva.
            </p>
            <p className="text-xs text-slate-400">
              OmniCore S.A.C. se reserva el derecho de suspender definitivamente la cuenta del usuario infractor e iniciar las acciones legales y denuncias pertinentes por fraude o falsedad conforme al Código Penal del Perú.
            </p>
          </section>

          {/* Sección 7 */}
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                7
              </span>
              Derecho de Admisión y Normas de Seguridad en el Recinto
            </h2>
            <p>
              El Organizador y el personal de seguridad del recinto se reservan el derecho de admisión y permanencia conforme a ley, pudiendo negar el ingreso o retirar del evento a cualquier persona que se encuentre en estado de ebriedad, bajo efectos de sustancias ilícitas, porte armas o cualquier objeto contundente, o perturbe el orden público y la seguridad de los demás asistentes.
            </p>
          </section>

          {/* Sección 8 */}
          <section className="space-y-3 bg-zinc-900/60 border border-white/5 p-6 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-electric-indigo/20 text-electric-indigo text-xs font-black flex items-center justify-center shrink-0">
                8
              </span>
              Legislación Aplicable y Jurisdicción
            </h2>
            <p>
              Estos términos se rigen e interpretan bajo las leyes de la República del Perú. Cualquier controversia derivada del presente acuerdo será sometida a la competencia territorial de los jueces y tribunales del Distrito Judicial de Lima o a los procedimientos del Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI).
            </p>
          </section>

        </div>

        {/* Footer de navegación interna */}
        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <Link href="/" className="text-electric-indigo hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Volver a la Cartelera Principal</span>
          </Link>
          <div className="flex gap-4 text-slate-400">
            <Link href="/politicas-de-privacidad" className="hover:text-white transition-colors">
              Políticas de Privacidad
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
