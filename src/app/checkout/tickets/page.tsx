'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TicketPrintScreen, { TicketPrintScreenProps } from '../../features/orders/ui/ticket-print-screen';

function CheckoutTicketsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [printProps, setPrintProps] = useState<TicketPrintScreenProps | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Intentar cargar desde sessionStorage (enviado desde Mis Entradas o Checkout)
    const stored = sessionStorage.getItem('current_print_ticket');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPrintProps({
          orderNumber: parsed.orderNumber,
          orderRef: parsed.orderRef,
          eventName: parsed.eventName,
          eventSubtitle: parsed.eventSubtitle,
          eventDate: parsed.eventDate,
          eventTime: parsed.eventTime,
          eventVenue: parsed.eventVenue,
          eventAddress: parsed.eventAddress,
          tierName: parsed.tierName,
          tierZone: parsed.tierZone,
          ticketCount: parsed.ticketCount,
          unitPrice: parsed.unitPrice,
          totalAmount: parsed.totalAmount,
          holderName: parsed.holderName,
          holderDni: parsed.holderDni,
          backLabel: parsed.backLabel || (parsed.from === '/profile/tickets' ? 'Volver a Mis Entradas' : 'Volver a la Confirmación'),
          onBack: () => {
            if (parsed.from) {
              router.push(parsed.from);
            } else {
              router.back();
            }
          },
        });
        return;
      } catch (e) {
        console.error('Error parseando current_print_ticket', e);
      }
    }

    // 2. Si hay query params
    const eventName = searchParams.get('eventName');
    const fromParam = searchParams.get('from');
    if (eventName) {
      setPrintProps({
        eventName,
        eventVenue: searchParams.get('venue') || undefined,
        tierZone: searchParams.get('zone') || undefined,
        eventDate: searchParams.get('date') || undefined,
        ticketCount: Number(searchParams.get('qty')) || 1,
        orderNumber: searchParams.get('orderId') || undefined,
        backLabel: fromParam === 'profile' ? 'Volver a Mis Entradas' : 'Volver',
        onBack: () => {
          if (fromParam === 'profile') {
            router.push('/profile/tickets');
          } else {
            router.back();
          }
        },
      });
      return;
    }

    // 3. Fallback: usar los valores por defecto del ticket
    setPrintProps({
      backLabel: fromParam === 'profile' ? 'Volver a Mis Entradas' : 'Volver a la Confirmación',
      backHref: fromParam === 'profile' ? '/profile/tickets' : '/checkout/success',
    });
  }, [router, searchParams]);

  if (!printProps) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined animate-spin text-[36px] text-electric-indigo">refresh</span>
        <p className="text-sm font-semibold text-on-surface-variant">Generando documento oficial de impresión...</p>
      </div>
    );
  }

  return <TicketPrintScreen {...printProps} />;
}

export default function CheckoutTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[36px] text-electric-indigo">refresh</span>
          <p className="text-sm font-semibold text-on-surface-variant">Cargando...</p>
        </div>
      }
    >
      <CheckoutTicketsContent />
    </Suspense>
  );
}
