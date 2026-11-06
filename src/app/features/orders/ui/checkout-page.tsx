'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrderUseCase } from '../index';
import { OrderModel } from '../models/order.model';

interface CheckoutPageComponentProps {
  orderToken: string;
}

export default function CheckoutPageComponent({ orderToken }: CheckoutPageComponentProps) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderModel | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); // segundos
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Estados del Formulario de Pago
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Cargar Orden
  useEffect(() => {
    let active = true;
    getOrderUseCase.execute(orderToken).match(
      (data) => {
        if (active) {
          setOrder(data);
          // Calcular segundos restantes basados en la fecha de expiración si está disponible
          const expiresTime = new Date(data.expiresAt).getTime();
          const now = Date.now();
          const diffSeconds = Math.max(0, Math.floor((expiresTime - now) / 1000));
          setTimeLeft(diffSeconds > 0 ? diffSeconds : data.expiresIn);
          setIsLoading(false);
        }
      },
      (error) => {
        if (active) {
          setErrorMsg(error.message || 'No se pudo cargar el resumen de tu compra.');
          setIsLoading(false);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [orderToken]);

  // Temporizador
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Formatear Tiempo (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLeft <= 0) {
      alert('La reserva ha expirado. Por favor, vuelve a seleccionar tus entradas.');
      return;
    }

    setIsProcessing(true);

    // Simular procesamiento de pago
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);

      // Si la orden es mock, actualizar su estado a pagado en sessionStorage
      if (orderToken.startsWith('mock-order-')) {
        const stored = sessionStorage.getItem(`order_${orderToken}`);
        if (stored) {
          const mockData = JSON.parse(stored) as OrderModel;
          mockData.status = 'completed';
          sessionStorage.setItem(`order_${orderToken}`, JSON.stringify(mockData));
        }
      }

      // Redirigir al listado de entradas compradas
      setTimeout(() => {
        router.push('/profile/tickets');
      }, 1500);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-background">
        <span className="material-symbols-outlined animate-spin text-[40px] text-electric-indigo">refresh</span>
        <p className="text-on-surface-variant font-semibold">Cargando el resumen de tu compra...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <span className="material-symbols-outlined text-[48px] text-red-500">error</span>
        <h2 className="text-2xl font-bold text-deep-slate">Enlace inválido o expirado</h2>
        <p className="text-on-surface-variant max-w-md">{errorMsg || 'La orden especificada no existe.'}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 px-6 py-3 bg-electric-indigo text-white rounded-xl font-semibold shadow-md active:scale-95 transition-all"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  const isExpired = timeLeft <= 0;

  return (
    <div className="w-full">
      {/* Header Contextual del Checkout */}
      <header className="bg-white border-b border-outline-variant/10 sticky top-0 z-40 shadow-sm">
        <div className="flex justify-between items-center w-full px-8 h-20 max-w-container-max mx-auto">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => router.push('/')}
          >
            <img src="/logo-qph.svg" className="w-8 h-8 rounded-md object-contain" alt="queplaneshoy logo" />
            <span className="font-extrabold text-xl tracking-tight text-deep-slate">
              queplanes<span className="text-electric-indigo">hoy</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant font-semibold text-sm">
            <span className="material-symbols-outlined text-lg">shield</span>
            <span className="hidden sm:inline">Checkout Seguro</span>
          </div>
        </div>
      </header>

      {/* Temporizador Superior */}
      <div className={`w-full py-3 text-center transition-colors font-semibold text-sm flex items-center justify-center gap-2 ${
        isExpired 
          ? 'bg-red-100 text-red-700' 
          : timeLeft < 120 
            ? 'bg-amber-100 text-amber-800 animate-pulse' 
            : 'bg-electric-indigo/10 text-electric-indigo'
      }`}>
        <span className="material-symbols-outlined text-[18px]">timer</span>
        <span>
          {isExpired 
            ? 'Tu reserva ha expirado. Las entradas han sido liberadas.' 
            : `Tus entradas están reservadas por ${formatTime(timeLeft)} minutos.`}
        </span>
      </div>

      <main className="max-w-container-max mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Column Izquierda: Métodos de Pago y Formulario */}
          <div className="lg:col-span-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-deep-slate mb-2">Método de Pago</h1>
              <p className="text-on-surface-variant">Selecciona tu forma de pago preferida para completar la reserva.</p>
            </div>

            {/* Billeteras Digitales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                type="button"
                disabled={isExpired}
                className="flex items-center justify-center gap-3 p-4 border border-outline-variant/30 rounded-xl hover:bg-surface-gray transition-all font-semibold bg-white cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => alert('Pago con Apple Pay simulado')}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>phone_iphone</span>
                <span>Apple Pay</span>
              </button>
              <button 
                type="button"
                disabled={isExpired}
                className="flex items-center justify-center gap-3 p-4 border border-outline-variant/30 rounded-xl hover:bg-surface-gray transition-all font-semibold bg-white cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => alert('Pago con Google Pay simulado')}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                <span>Google Pay</span>
              </button>
            </div>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-outline-variant/20"></div>
              <span className="flex-shrink mx-4 text-on-surface-variant font-semibold text-xs uppercase tracking-widest">
                O paga con tarjeta de crédito
              </span>
              <div className="flex-grow border-t border-outline-variant/20"></div>
            </div>

            {/* Formulario de Tarjeta */}
            <form className="space-y-6" onSubmit={handlePaymentSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="cardName">
                  Nombre en la tarjeta
                </label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all"
                  id="cardName"
                  placeholder="Ej. Juan Pérez"
                  required
                  type="text"
                  disabled={isExpired || isPaid}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="cardNumber">
                  Número de tarjeta
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all"
                    id="cardNumber"
                    placeholder="0000 0000 0000 0000"
                    required
                    type="text"
                    maxLength={19}
                    disabled={isExpired || isPaid}
                    value={cardNumber}
                    onChange={(e) => {
                      // Formateador simple de tarjeta de crédito
                      const val = e.target.value.replace(/\s?/g, '').replace(/[^0-9]/g, '');
                      let formatted = '';
                      for (let i = 0; i < val.length; i++) {
                        if (i > 0 && i % 4 === 0) formatted += ' ';
                        formatted += val[i];
                      }
                      setCardNumber(formatted);
                    }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-platinum-silver">
                    <span className="material-symbols-outlined">credit_card</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="expiry">
                    Vencimiento
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all"
                    id="expiry"
                    placeholder="MM / AA"
                    required
                    type="text"
                    maxLength={7}
                    disabled={isExpired || isPaid}
                    value={expiry}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      if (val.length >= 2) {
                        setExpiry(`${val.slice(0, 2)} / ${val.slice(2, 4)}`);
                      } else {
                        setExpiry(val);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="cvc">
                    CVC
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant bg-white focus:border-electric-indigo focus:ring-1 focus:ring-electric-indigo outline-none transition-all"
                    id="cvc"
                    placeholder="123"
                    required
                    type="password"
                    maxLength={4}
                    disabled={isExpired || isPaid}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
                <input
                  className="mt-1 rounded text-electric-indigo focus:ring-electric-indigo border-outline-variant cursor-pointer"
                  id="saveCard"
                  type="checkbox"
                  disabled={isExpired || isPaid}
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                />
                <label className="text-sm text-on-surface-variant cursor-pointer select-none" htmlFor="saveCard">
                  Guardar esta tarjeta para mis próximas compras en queplaneshoy de forma segura.
                </label>
              </div>

              <button
                className={`w-full py-4 rounded-xl text-white font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-electric-indigo/20 ${
                  isExpired 
                    ? 'bg-gray-400 shadow-none cursor-not-allowed opacity-50' 
                    : isPaid 
                      ? 'bg-green-600 shadow-green-600/10' 
                      : 'bg-electric-indigo hover:brightness-110 active:scale-95 cursor-pointer'
                }`}
                type="submit"
                disabled={isExpired || isProcessing || isPaid}
              >
                {isProcessing && (
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    refresh
                  </span>
                )}
                {isPaid && (
                  <span className="material-symbols-outlined text-[20px]">
                    check_circle
                  </span>
                )}
                {isExpired 
                  ? 'Reserva Expirada' 
                  : isPaid 
                    ? '¡Compra Completada!' 
                    : isProcessing 
                      ? 'Procesando Pago...' 
                      : 'Completar Compra'}
              </button>
            </form>

            {/* Badges de Confianza */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-6 opacity-60">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tighter text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">lock</span>
                <span>Pago Seguro SSL</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tighter text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">verified_user</span>
                <span>Garantía de entradas</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-tighter text-on-surface-variant">
                <span className="material-symbols-outlined text-lg">shield</span>
                <span>Normativa PSD2</span>
              </div>
            </div>
          </div>

          {/* Column Derecha: Resumen del Pedido */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden">
              <div className="relative h-36 overflow-hidden">
                <img
                  alt="Fondo del Evento"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnd8-6_1mxS3dZFtHk9XFlFw3P0KN3s3jBI7R0CsQGAd5qSojJImmoWKoQAequo_GBLwop9XD2E7G5q3GK-5CoO6-NBQ_QRd9sZuxPW5LA82L-X5_Wvmq0B4H_dbbi19Zt7skdIljIs-uTI2zIboIarNOLbbQmLhUk1ZO5UWbuwr5maC8WfWwH_lYm3OaAxPNBn8SvnH-lbOXUaXsTsWxTqBxNYhtCtb0NZV8H1tajvL8hMzjePt5C_qhvS19rf5BN3oRIFjdDXiU8"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-slate to-transparent opacity-70"></div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <span className="inline-block bg-electric-indigo/10 text-electric-indigo text-[11px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                    Concierto
                  </span>
                  <h2 className="text-xl font-bold text-deep-slate leading-tight mb-2">
                    {order.eventName}
                  </h2>
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    <span>{order.eventDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold mt-1">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span>{order.eventLocation}</span>
                  </div>
                </div>

                {/* Resumen Contable Simplificado (Solo muestra el total) */}
                <div className="border-t border-outline-variant/20 pt-6">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-on-background font-bold text-sm">
                        {order.quantity}x Entrada{order.quantity > 1 ? 's' : ''} {order.zoneName}
                      </span>
                      <span className="text-on-surface-variant text-xs mt-1">
                        Acceso Digital verificado
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total Final sin Desgloses */}
                <div className="border-t border-outline-variant/20 pt-6 flex justify-between items-center">
                  <span className="text-lg font-bold text-deep-slate">Monto Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-electric-indigo">
                      €{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-surface-gray rounded-xl flex items-center gap-3 border border-outline-variant/10">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-electric-indigo shadow-sm flex-shrink-0">
                    <span className="material-symbols-outlined">qr_code_2</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-deep-slate">Ticket Digital Directo</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Recibirás tu entrada en el móvil al instante.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mensaje de Garantía */}
            <div className="mt-6 p-4 border border-outline-variant/30 border-dashed rounded-xl">
              <p className="text-xs text-on-surface-variant text-center leading-relaxed">
                <span className="material-symbols-outlined text-green-600 align-middle mr-1 text-[16px]">check_circle</span>
                Tus datos están protegidos. Esta transacción cumple con la normativa de seguridad europea PSD2.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
