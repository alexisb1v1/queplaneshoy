import { Authentication3DSModel, CheckoutPaymentMethod } from '../models/order.model';

interface CulqiTokenObject {
  id: string;
  email?: string;
  object?: string;
}

interface CulqiOrderObject {
  id: string;
  state?: string;
  payment_code?: string;
}

interface CulqiErrorObject {
  user_message?: string;
  merchant_message?: string;
  message?: string;
}

interface CulqiCheckoutInstance {
  token?: CulqiTokenObject | null;
  order?: CulqiOrderObject | null;
  error?: CulqiErrorObject | null;
  culqi?: () => void;
  open: () => void;
  close?: () => void;
}

interface CulqiCheckoutConstructor {
  new (publicKey: string, config: Record<string, unknown>): CulqiCheckoutInstance;
}

interface CulqiClassicApi {
  publicKey: string;
  token?: CulqiTokenObject | null;
  order?: CulqiOrderObject | null;
  error?: CulqiErrorObject | null;
  settings: (settings: Record<string, unknown>) => void;
  options: (options: Record<string, unknown>) => void;
  open: () => void;
  close?: () => void;
}

interface Culqi3DSGlobal {
  publicKey?: string;
  settings?: Record<string, unknown>;
  options?: Record<string, unknown>;
  generateDevice?: () => Promise<string>;
  initAuthentication?: (tokenId: string) => void;
  reset?: () => void;
}

declare global {
  interface Window {
    CulqiCheckout?: CulqiCheckoutConstructor;
    Culqi?: CulqiClassicApi;
    Culqi3DS?: Culqi3DSGlobal;
    culqi?: () => void;
  }
}

export interface OpenCulqiCheckoutParams {
  publicKey: string;
  checkoutScriptUrl: string;
  rsaId?: string | null;
  rsaPublicKey?: string | null;
  logoUrl?: string | null;
  title: string;
  currency: 'PEN';
  amountInCents: number;
  culqiOrderId: string;
  customerEmail: string;
  preferredMethod: CheckoutPaymentMethod;
}

export type CulqiCheckoutModalOutcome =
  | { type: 'TOKEN'; tokenId: string; isYapeToken: boolean }
  | { type: 'ORDER'; culqiOrderId: string; paymentCode?: string | null }
  | { type: 'CANCELLED' }
  | { type: 'ERROR'; message: string };

export interface ThreeDSChallengeParams {
  publicKey: string;
  threeDsScriptUrl: string;
  tokenId: string;
  email: string;
  amountInCents: number;
}

export type ThreeDSChallengeOutcome =
  | { ok: true; data: Authentication3DSModel }
  | { ok: false; message: string };

const scriptLoadCache = new Map<string, Promise<void>>();

function isValidEnvKey(val?: string | null): val is string {
  if (!val) return false;
  const normalized = val.trim().toLowerCase();
  if (!normalized) return false;
  return (
    !normalized.includes('tu_llave') &&
    !normalized.includes('reemplazar') &&
    !normalized.includes('<') &&
    !normalized.includes('>') &&
    !normalized.includes('xxxx')
  );
}

const QPH_LOCAL_FALLBACK_LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">' +
  '<rect width="100" height="100" rx="20" fill="#6366f1"/>' +
  '<text x="50" y="65" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="42" fill="#ffffff" text-anchor="middle" letter-spacing="-2">QPH</text>' +
  '</svg>';

/**
 * Resuelve el logotipo del comercio para el iframe seguro de Culqi Checkout.
 * Prioriza `NEXT_PUBLIC_CULQI_LOGO_URL` HTTPS; en entornos HTTPS usa `/logo-qph.png`
 * y en desarrollo local HTTP usa Data URI SVG para no ser bloqueado por `upgrade-insecure-requests`.
 */
function resolveCheckoutLogoUrl(explicitUrl?: string | null): string | null {
  const candidate = (explicitUrl || '').trim();
  const hasWindow = typeof window !== 'undefined';
  const isHttpsBrowser = hasWindow && window.location?.protocol === 'https:';

  if (candidate && isValidEnvKey(candidate)) {
    if (candidate.startsWith('https://') || candidate.startsWith('data:image/')) {
      return candidate;
    }
    if (candidate.startsWith('/') && isHttpsBrowser) {
      return `${window.location.origin}${candidate}`;
    }
  }

  if (isHttpsBrowser) {
    return `${window.location.origin}/logo-qph.png`;
  }

  if (hasWindow && typeof window.btoa === 'function') {
    return `data:image/svg+xml;base64,${window.btoa(QPH_LOCAL_FALLBACK_LOGO_SVG)}`;
  }

  return null;
}

/**
 * Resuelve la configuración pública de Culqi combinando variables de entorno NEXT_PUBLIC_*
 * con los valores entregados en tiempo de ejecución por el servidor.
 */
export function resolveCulqiClientConfig(backendFallback: {
  publicKey: string;
  checkoutScriptUrl: string;
  threeDsScriptUrl: string;
  rsaId: string | null;
  rsaPublicKey: string | null;
}) {
  const envPublicKey = process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY;
  const envCheckoutUrl = process.env.NEXT_PUBLIC_CULQI_CHECKOUT_URL;
  const envThreeDsUrl = process.env.NEXT_PUBLIC_CULQI_3DS_URL;
  const envRsaId = process.env.NEXT_PUBLIC_CULQI_RSA_ID;
  const envRsaPublicKey = process.env.NEXT_PUBLIC_CULQI_RSA_PUBLIC_KEY;
  const envLogoUrl = process.env.NEXT_PUBLIC_CULQI_LOGO_URL;

  const publicKey = isValidEnvKey(envPublicKey)
    ? envPublicKey.trim()
    : backendFallback.publicKey;

  const checkoutScriptUrl =
    (envCheckoutUrl && envCheckoutUrl.trim()) ||
    backendFallback.checkoutScriptUrl ||
    'https://js.culqi.com/checkout-js';

  const threeDsScriptUrl =
    (envThreeDsUrl && envThreeDsUrl.trim()) ||
    backendFallback.threeDsScriptUrl ||
    'https://3ds.culqi.com';

  const rsaId = (envRsaId && envRsaId.trim()) || backendFallback.rsaId || null;
  const rawRsaPub =
    (envRsaPublicKey && envRsaPublicKey.trim()) || backendFallback.rsaPublicKey || null;
  const rsaPublicKey = rawRsaPub ? rawRsaPub.replace(/\\n/g, '\n') : null;
  const logoUrl = resolveCheckoutLogoUrl(envLogoUrl);

  return {
    publicKey,
    checkoutScriptUrl,
    threeDsScriptUrl,
    rsaId,
    rsaPublicKey,
    logoUrl,
  };
}

function loadScriptOnce(src: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.reject(new Error('No disponible fuera del navegador.'));
  }

  const existingPromise = scriptLoadCache.get(src);
  if (existingPromise) return existingPromise;

  const promise = new Promise<void>((resolve, reject) => {
    const existingTag = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (existingTag && existingTag.dataset.loaded === 'true') {
      resolve();
      return;
    }

    const script = existingTag || document.createElement('script');
    script.src = src;
    script.async = true;

    const timeout = window.setTimeout(() => {
      scriptLoadCache.delete(src);
      if (!existingTag && script.parentNode) script.remove();
      reject(new Error('Tiempo de espera agotado al cargar el módulo de Culqi.'));
    }, 12000);

    const handleLoad = () => {
      window.clearTimeout(timeout);
      script.dataset.loaded = 'true';
      resolve();
    };

    const handleError = () => {
      window.clearTimeout(timeout);
      scriptLoadCache.delete(src);
      if (!existingTag && script.parentNode) script.remove();
      reject(new Error('No se pudo cargar la pasarela Culqi. Verifica tu conexión.'));
    };

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    if (!existingTag) {
      document.body.appendChild(script);
    }
  });

  scriptLoadCache.set(src, promise);
  return promise;
}

function buildSortedPaymentMethods(preferredMethod: CheckoutPaymentMethod): string[] {
  switch (preferredMethod) {
    case 'yape':
      return ['yape', 'billetera', 'tarjeta', 'bancaMovil', 'agente', 'cuotealo'];
    case 'card':
      return ['tarjeta', 'yape', 'billetera', 'bancaMovil', 'agente', 'cuotealo'];
    case 'transfer':
      return ['bancaMovil', 'agente', 'yape', 'billetera', 'tarjeta', 'cuotealo'];
    case 'cuotealo':
      return ['cuotealo', 'tarjeta', 'yape', 'billetera', 'bancaMovil', 'agente'];
    default:
      return ['tarjeta', 'yape', 'billetera', 'bancaMovil', 'agente', 'cuotealo'];
  }
}

function isElementChainVisible(element: HTMLElement): boolean {
  let current: HTMLElement | null = element;
  while (current) {
    const style = window.getComputedStyle(current);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.opacity === '0'
    ) {
      return false;
    }
    current = current.parentElement;
  }
  return true;
}

function isCulqiOverlayVisible(): boolean {
  if (typeof document === 'undefined') return false;
  const candidates = document.querySelectorAll(
    'iframe[src*="culqi"], iframe[id*="culqi"], div[id*="culqi-checkout"], #culqi_checkout_frame',
  );

  for (const node of Array.from(candidates)) {
    if (!(node instanceof HTMLElement)) continue;
    const rect = node.getBoundingClientRect();
    if (rect.width <= 50 || rect.height <= 50) continue;
    if (isElementChainVisible(node)) {
      return true;
    }
  }

  return false;
}

/**
 * Carga Culqi 3DS (si está disponible) y genera el `deviceFingerPrintId` para prevención de fraude.
 */
export async function generateCulqiDeviceFingerprint(
  publicKey: string,
  threeDsScriptUrl: string,
): Promise<string | undefined> {
  if (!publicKey || typeof window === 'undefined') return undefined;

  try {
    await loadScriptOnce(threeDsScriptUrl);
    if (!window.Culqi3DS?.generateDevice) return undefined;
    window.Culqi3DS.publicKey = publicKey;

    const deviceId = await Promise.race<string | undefined>([
      window.Culqi3DS.generateDevice(),
      new Promise<undefined>((resolve) => window.setTimeout(() => resolve(undefined), 4000)),
    ]);

    return typeof deviceId === 'string' && deviceId.trim() ? deviceId.trim() : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Ejecuta el desafío 3D Secure mediante `Culqi3DS.initAuthentication` cuando el emisor bancario lo solicita.
 */
export async function authenticateWithCulqi3DS(
  params: ThreeDSChallengeParams,
): Promise<ThreeDSChallengeOutcome> {
  try {
    await loadScriptOnce(params.threeDsScriptUrl);
  } catch (err: any) {
    return {
      ok: false,
      message: err?.message || 'No se pudo cargar el módulo de verificación 3D Secure.',
    };
  }

  const culqi3DS = window.Culqi3DS;
  if (!culqi3DS?.initAuthentication) {
    return {
      ok: false,
      message: 'El módulo Culqi 3DS no se encuentra disponible en este momento.',
    };
  }

  return new Promise<ThreeDSChallengeOutcome>((resolve) => {
    let settled = false;

    const cleanup = () => {
      window.removeEventListener('message', handle3DSMessage);
      window.clearTimeout(timeout);
    };

    const finish = (outcome: ThreeDSChallengeOutcome) => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        culqi3DS.reset?.();
      } catch {
        // Ignorar limpieza opcional
      }
      resolve(outcome);
    };

    const timeout = window.setTimeout(() => {
      finish({
        ok: false,
        message: 'La verificación 3D Secure excedió el tiempo límite.',
      });
    }, 180000);

    const handle3DSMessage = (event: MessageEvent) => {
      if (!event.origin.includes('culqi.com')) return;

      let payload: Record<string, any> | null = null;
      if (event.data && typeof event.data === 'object') {
        payload = event.data;
      } else if (typeof event.data === 'string') {
        try {
          payload = JSON.parse(event.data);
        } catch {
          payload = null;
        }
      }

      if (!payload) return;

      const authParams = payload.parameters3DS || payload;
      if (
        authParams &&
        typeof authParams.eci === 'string' &&
        typeof authParams.cavv === 'string'
      ) {
        finish({
          ok: true,
          data: {
            eci: authParams.eci,
            xid: String(authParams.xid || ''),
            cavv: authParams.cavv,
            protocolVersion: String(authParams.protocolVersion || '2.1.0'),
          },
        });
        return;
      }

      if (payload.error || payload.user_message) {
        finish({
          ok: false,
          message:
            String(payload.user_message || payload.error || 'Autenticación 3D Secure rechazada.'),
        });
      }
    };

    window.addEventListener('message', handle3DSMessage);

    culqi3DS.publicKey = params.publicKey;
    culqi3DS.settings = {
      charge: {
        totalAmount: params.amountInCents,
        returnUrl: window.location.href,
      },
      card: {
        email: params.email,
      },
    };
    culqi3DS.options = {
      showModal: true,
      showLoading: true,
      showIcon: true,
      closeModalAction: () => {
        finish({
          ok: false,
          message: 'Cancelaste la verificación de seguridad 3D Secure de tu banco.',
        });
      },
    };

    culqi3DS.initAuthentication?.(params.tokenId);
  });
}

/**
 * Abre el modal oficial de Culqi Checkout Custom (`checkout-js`) y captura el resultado (`TOKEN`, `ORDER`, `CANCELLED` o `ERROR`).
 */
export async function openCulqiCheckoutModal(
  params: OpenCulqiCheckoutParams,
): Promise<CulqiCheckoutModalOutcome> {
  if (!isValidEnvKey(params.publicKey)) {
    return {
      type: 'ERROR',
      message: 'La llave pública de Culqi aún no está configurada en las variables de entorno.',
    };
  }

  try {
    await loadScriptOnce(params.checkoutScriptUrl);
  } catch (err: any) {
    return {
      type: 'ERROR',
      message: err?.message || 'No se pudo cargar Culqi Checkout Custom.',
    };
  }

  const settingsPayload: Record<string, unknown> = {
    title: params.title,
    currency: params.currency,
    amount: params.amountInCents,
    order: params.culqiOrderId,
    ...(params.rsaId && params.rsaPublicKey
      ? {
          xculqirsaid: params.rsaId,
          rsapublickey: params.rsaPublicKey,
        }
      : {}),
  };

  const clientPayload: Record<string, unknown> = {
    email: params.customerEmail,
  };

  const sortedMethods = buildSortedPaymentMethods(params.preferredMethod);
  const optionsPayload: Record<string, unknown> = {
    lang: 'es',
    installments: true,
    modal: true,
    paymentMethods: {
      tarjeta: true,
      yape: true,
      billetera: true,
      bancaMovil: true,
      agente: true,
      cuotealo: true,
    },
    paymentMethodsSort: sortedMethods,
  };

  const resolvedLogoUrl = resolveCheckoutLogoUrl(params.logoUrl);

  // Culqi Joi schema solo permite bannerColor, buttonBackground, menuColor, linksColor, buttonTextColor y priceColor.
  const defaultStylePayload = {
    bannerColor: '#0F172A',
    buttonBackground: '#4F46E5',
    menuColor: '#4F46E5',
    linksColor: '#4F46E5',
    buttonTextColor: '#FFFFFF',
    priceColor: '#4F46E5',
  };

  const appearancePayload: Record<string, unknown> = {
    theme: 'default',
    hiddenCulqiLogo: false,
    hiddenBannerContent: false,
    hiddenBanner: false,
    hiddenToolBarAmount: false,
    hiddenEmail: false,
    menuType: 'sidebar',
    ...(resolvedLogoUrl ? { logo: resolvedLogoUrl } : {}),
    defaultStyle: defaultStylePayload,
  };

  return new Promise<CulqiCheckoutModalOutcome>((resolve) => {
    let settled = false;
    let instance: CulqiCheckoutInstance | null = null;
    let sawOverlayMounted = false;

    const cleanup = () => {
      window.clearInterval(closeWatcherInterval);
      window.removeEventListener('message', handleWindowMessage);
    };

    const finish = (outcome: CulqiCheckoutModalOutcome) => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        instance?.close?.();
        window.Culqi?.close?.();
      } catch {
        // Ignorar si ya estaba cerrado
      }
      resolve(outcome);
    };

    const handleCulqiResult = () => {
      const token = instance?.token || window.Culqi?.token;
      const order = instance?.order || window.Culqi?.order;
      const error = instance?.error || window.Culqi?.error;

      if (token?.id) {
        const isYapeToken =
          token.object === 'yape' || token.id.startsWith('ype_');
        finish({ type: 'TOKEN', tokenId: token.id, isYapeToken });
        return;
      }

      if (order?.id) {
        finish({
          type: 'ORDER',
          culqiOrderId: order.id,
          paymentCode: order.payment_code ?? null,
        });
        return;
      }

      if (error) {
        finish({
          type: 'ERROR',
          message:
            error.user_message ||
            error.merchant_message ||
            error.message ||
            'Ocurrió un error al procesar en la pasarela Culqi.',
        });
        return;
      }

      finish({ type: 'CANCELLED' });
    };

    const isCloseSignal = (raw: unknown): boolean => {
      if (typeof raw === 'string') {
        const normalized = raw.trim();
        return (
          normalized === 'close' ||
          normalized === 'culqi.close' ||
          normalized === 'checkout_cerrado' ||
          normalized === 'closeCheckout' ||
          normalized === 'modal_closed' ||
          normalized.includes('checkout_cerrado')
        );
      }

      if (raw && typeof raw === 'object') {
        const payload = raw as Record<string, unknown>;
        return (
          payload.action === 'close' ||
          payload.action === 'checkout_cerrado' ||
          payload.event === 'close' ||
          payload.event === 'checkout_cerrado' ||
          payload.type === 'close' ||
          payload.type === 'checkout_cerrado' ||
          payload.method === 'close'
        );
      }

      return false;
    };

    const handleWindowMessage = (event: MessageEvent) => {
      if (!event.origin.includes('culqi.com')) return;
      if (isCloseSignal(event.data)) {
        window.setTimeout(() => {
          if (!settled) {
            finish({ type: 'CANCELLED' });
          }
        }, 200);
      }
    };

    window.addEventListener('message', handleWindowMessage);

    // Detecta cuando el usuario cierra manualmente el modal Culqi con la "X"
    const openedAt = Date.now();
    const closeWatcherInterval = window.setInterval(() => {
      const visible = isCulqiOverlayVisible();
      if (visible) {
        sawOverlayMounted = true;
        return;
      }
      const elapsed = Date.now() - openedAt;
      if (sawOverlayMounted || elapsed > 5000) {
        // Pequeña espera para permitir que window.culqi() resuelva primero si ocurrió en el mismo frame
        window.setTimeout(() => {
          if (!settled) {
            finish({ type: 'CANCELLED' });
          }
        }, 350);
      }
    }, 450);

    window.culqi = handleCulqiResult;

    if (typeof window.CulqiCheckout === 'function') {
      instance = new window.CulqiCheckout(params.publicKey, {
        settings: settingsPayload,
        client: clientPayload,
        options: optionsPayload,
        appearance: appearancePayload,
      });
      instance.culqi = handleCulqiResult;
      instance.open();
      return;
    }

    if (window.Culqi) {
      window.Culqi.publicKey = params.publicKey;
      window.Culqi.settings(settingsPayload);
      window.Culqi.options({
        ...optionsPayload,
        style: {
          ...(resolvedLogoUrl ? { logo: resolvedLogoUrl } : {}),
          ...defaultStylePayload,
        },
      });
      window.Culqi.open();
      return;
    }

    finish({
      type: 'ERROR',
      message: 'No se pudo inicializar el objeto global de Culqi Checkout.',
    });
  });
}
