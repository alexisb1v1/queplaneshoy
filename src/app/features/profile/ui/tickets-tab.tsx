'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderModel } from '../../orders/models/order.model';

interface TicketItem {
  id: string;
  eventName: string;
  category: string;
  zoneName: string;
  date: string;
  time: string;
  location: string;
  quantity: number;
  imageUrl: string;
  badgeStyle: string;
  isPast?: boolean;
}

const DEFAULT_TICKETS: TicketItem[] = [
  {
    id: 't-1',
    eventName: 'Indigo Nights: Global Tour 2024',
    category: 'CONCIERTO',
    zoneName: 'VIP Central',
    date: 'Sábado, 15 de Agosto, 2024',
    time: '20:00 - 23:30',
    location: 'Estadio Metropolitano, Madrid',
    quantity: 2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzBbrltIs-fIbHDL4onoqGmap5SeYGxE1nANvOHbwBeY-itYLshMyST6tRevk4vRp46vBptUHF2ERSpAp8O-wiJ98ebkjYntRHoPJ5jXkdZwBCejwBrmQD8Ct4_zLCLZb56Z_EhLOTUojZ1CsIS20tUa0kT0NHrSAdHkSIYmy3TsG0oFKTYXuhQErYFftuiZAXswJa0Si6zq9PHzAMXC6F3L58o6AUmxYC5lITe4mtIaujmp7o6MJAJn7tq9shTZluPSVjuhMbwdjx',
    badgeStyle: 'bg-vip-gold text-white',
  },
  {
    id: 't-2',
    eventName: 'El Fantasma de la Ópera',
    category: 'TEATRO CLÁSICO',
    zoneName: 'Entrada General',
    date: 'Martes, 22 de Agosto, 2024',
    time: '19:30 - 22:00',
    location: 'Teatro Real, Madrid',
    quantity: 1,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUaFe5zdOqq1gSgua4nA3UXO3gKEg8-atw-CBSV_EbMZyHOtDXsUaQuDAWd_XUF7K2hoPz-x7QnEGNajrKn_kf7uTDq3olWZ24rZT1ir6TKmJ3w8punFPAKFlxpKUvJyFQK4x00JjoK9bEZTR9Pb3sZDsUxnXfH5LG2BePAohS-BX_dNXkWjhht1L2bqY6Rf8a0RYbwm-S1JNJd3bmXpDw2jyqhXrwh7jmuHrJ8ntpi0D3z0tNWSRKDWMcu2VED4dj5W_vRS7lOUqc',
    badgeStyle: 'bg-deep-slate text-white',
  },
];

const PAST_TICKETS_DEMO: TicketItem[] = [
  {
    id: 't-past-1',
    eventName: 'Noche de Electrónica',
    category: 'FESTIVAL',
    zoneName: 'VIP',
    date: 'Sábado, 15 de Julio, 2023',
    time: '21:00 - 04:00',
    location: 'Estadio Olímpico, Madrid',
    quantity: 2,
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzBbrltIs-fIbHDL4onoqGmap5SeYGxE1nANvOHbwBeY-itYLshMyST6tRevk4vRp46vBptUHF2ERSpAp8O-wiJ98ebkjYntRHoPJ5jXkdZwBCejwBrmQD8Ct4_zLCLZb56Z_EhLOTUojZ1CsIS20tUa0kT0NHrSAdHkSIYmy3TsG0oFKTYXuhQErYFftuiZAXswJa0Si6zq9PHzAMXC6F3L58o6AUmxYC5lITe4mtIaujmp7o6MJAJn7tq9shTZluPSVjuhMbwdjx',
    badgeStyle: 'bg-vip-gold text-white',
    isPast: true,
  },
];

export default function TicketsTab() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [tickets, setTickets] = useState<TicketItem[]>(DEFAULT_TICKETS);
  const [pastTickets, setPastTickets] = useState<TicketItem[]>(PAST_TICKETS_DEMO);
  
  // Estado para el modal de visualización de entrada
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  // Leer compras de la sesión
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Buscar compras de sesión completadas
    const loadedTickets: TicketItem[] = [...DEFAULT_TICKETS];
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('order_')) {
        try {
          const orderData = JSON.parse(sessionStorage.getItem(key)!) as OrderModel;
          if (orderData.status === 'completed') {
            // Evitar duplicados
            if (!loadedTickets.some((t) => t.id === orderData.orderToken)) {
              loadedTickets.unshift({
                id: orderData.orderToken,
                eventName: orderData.eventName,
                category: 'CONCIERTO',
                zoneName: orderData.zoneName,
                date: orderData.eventDate.split(' • ')[0] || orderData.eventDate,
                time: orderData.eventDate.split(' • ')[1] || '20:00 - 23:00',
                location: orderData.eventLocation,
                quantity: orderData.quantity,
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnd8-6_1mxS3dZFtHk9XFlFw3P0KN3s3jBI7R0CsQGAd5qSojJImmoWKoQAequo_GBLwop9XD2E7G5q3GK-5CoO6-NBQ_QRd9sZuxPW5LA82L-X5_Wvmq0B4H_dbbi19Zt7skdIljIs-uTI2zIboIarNOLbbQmLhUk1ZO5UWbuwr5maC8WfWwH_lYm3OaAxPNBn8SvnH-lbOXUaXsTsWxTqBxNYhtCtb0NZV8H1tajvL8hMzjePt5C_qhvS19rf5BN3oRIFjdDXiU8',
                badgeStyle: orderData.zoneName.includes('VIP') || orderData.zoneName.includes('Box') ? 'bg-vip-gold text-white' : 'bg-deep-slate text-white',
              });
            }
          }
        } catch (e) {
          console.error('Error parseando orden de compra', e);
        }
      }
    }
    setTickets(loadedTickets);
  }, []);

  const handleOpenTicket = (ticket: TicketItem) => {
    setSelectedTicket(ticket);
    setShowQRModal(true);
  };

  const listToShow = activeTab === 'upcoming' ? tickets : pastTickets;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header and Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-deep-slate tracking-tight">Mis Entradas</h1>
          <p className="text-on-surface-variant text-sm mt-1">Gestiona tus próximos eventos y revisa tu historial.</p>
        </div>

        {/* Custom Segmented Tabs */}
        <div className="relative flex bg-gray-100 p-1 rounded-xl w-full md:w-auto self-start">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'bg-white text-electric-indigo shadow-sm'
                : 'text-on-surface-variant hover:text-deep-slate'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === 'past'
                ? 'bg-white text-electric-indigo shadow-sm'
                : 'text-on-surface-variant hover:text-deep-slate'
            }`}
          >
            Pasados
          </button>
        </div>
      </div>

      {listToShow.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white border border-outline-variant/20 rounded-xl p-8 shadow-sm">
          <div className="w-20 h-20 bg-surface-gray rounded-full flex items-center justify-center text-platinum-silver">
            <span className="material-symbols-outlined text-[40px]">confirmation_number</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-deep-slate">No tienes entradas en esta sección</h3>
            <p className="text-on-surface-variant text-sm mt-2 max-w-sm mx-auto">
              Tus planes finalizados aparecerán aquí una vez que hayan ocurrido.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-electric-indigo text-white px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-md shadow-electric-indigo/10"
          >
            Explorar eventos
          </button>
        </div>
      ) : (
        /* Grid of Tickets */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listToShow.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-outline-variant/10 flex flex-col group transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-44 w-full overflow-hidden relative">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  src={ticket.imageUrl}
                  alt={ticket.eventName}
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${ticket.badgeStyle}`}>
                    {ticket.zoneName}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col gap-4">
                <div>
                  <span className="font-bold text-[10px] text-electric-indigo uppercase tracking-wider">
                    {ticket.category}
                  </span>
                  <h3 className="text-lg font-bold text-deep-slate mt-1 group-hover:text-electric-indigo transition-colors">
                    {ticket.eventName}
                  </h3>
                </div>
                
                <div className="space-y-1.5 text-xs text-on-surface-variant font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span>{ticket.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>{ticket.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span>{ticket.location}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-2 border-t border-outline-variant/10">
                  <button
                    onClick={() => handleOpenTicket(ticket)}
                    className="flex-grow bg-electric-indigo text-white font-bold text-xs py-3 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">qr_code</span>
                    <span>Ver Entrada</span>
                  </button>
                  <button
                    onClick={() => alert('Entrada descargada en PDF (simulado)')}
                    className="p-3 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:bg-surface-gray hover:text-deep-slate transition-colors"
                    title="Descargar PDF"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Visualizador de Entrada QR */}
      {showQRModal && selectedTicket && (
        <div className="fixed inset-0 bg-deep-slate/60 backdrop-blur-sm z-[99] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/20 animate-in fade-in zoom-in duration-200">
            {/* Header del Ticket */}
            <div className="bg-deep-slate p-5 text-white flex justify-between items-center relative">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-platinum-silver">ENTRADA DIGITAL</span>
                <h4 className="text-base font-bold truncate max-w-[200px] mt-0.5">{selectedTicket.eventName}</h4>
              </div>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedTicket(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center">
              {/* QR Container */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-outline-variant/20 mb-6 flex flex-col items-center justify-center relative">
                <div className="w-48 h-48 bg-gray-50 flex items-center justify-center rounded-xl border border-dashed border-gray-300 select-none">
                  {/* Icono de QR grande para simular */}
                  <span className="material-symbols-outlined text-[130px] text-deep-slate" style={{ fontVariationSettings: "'FILL' 1" }}>
                    qr_code_2
                  </span>
                </div>
                <div className="w-full flex items-center justify-between mt-3 text-[10px] font-bold text-on-surface-variant tracking-widest px-2 uppercase">
                  <span>QPH-{selectedTicket.id.toUpperCase()}</span>
                  <span>QTY: {selectedTicket.quantity}</span>
                </div>
              </div>

              {/* Detalle de entrada */}
              <div className="w-full space-y-4 text-left border-t border-outline-variant/20 pt-6">
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Zona / Ubicación</span>
                  <span className="text-sm font-extrabold text-electric-indigo mt-0.5 block uppercase tracking-wide">
                    {selectedTicket.zoneName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Fecha</span>
                    <span className="text-xs font-bold text-deep-slate mt-0.5 block">
                      {selectedTicket.date.replace(/, 2024/, '')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Horario</span>
                    <span className="text-xs font-bold text-deep-slate mt-0.5 block">
                      {selectedTicket.time.split(' - ')[0]}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Lugar</span>
                  <span className="text-xs font-bold text-deep-slate mt-0.5 block">
                    {selectedTicket.location}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-on-surface-variant text-center mt-8 italic leading-relaxed">
                Muestra este código en la puerta del evento. El brillo de la pantalla se ajustará al máximo automáticamente.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
