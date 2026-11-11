export interface OrderModel {
  orderToken: string;
  expiresIn: number; // en segundos
  expiresAt: string; // ISO String
  eventName: string;
  eventLocation: string;
  eventDate: string;
  zoneName: string;
  quantity: number;
  totalAmount: number;
  status: string;
}

export interface SimulateCheckoutItem {
  zoneId: string;
  quantity: number;
}

export interface SimulateCheckoutParams {
  eventId: string;
  showId: string;
  items: SimulateCheckoutItem[];
  paymentMethod: 'card' | 'yape' | 'transfer' | 'cuotealo' | 'apple_pay' | 'google_pay';
  couponCode?: string;
  customerEmail?: string;
  customerName?: string;
  customerDocument?: string;
  forceFailure?: boolean;
}

export interface IssuedTicketModel {
  ticketId: string;
  ticketUuid: string;
  ticketNumber: number;
  zoneName: string;
  tierName: string;
  unitPrice: number;
  qrPayload: string;
}

export interface SimulateCheckoutResponseModel {
  success: boolean;
  orderId: string;
  orderCode: string;
  orderPublicUuid: string;
  status: string;
  subtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  totalAmount: number;
  paymentMethod: string;
  txCode: string;
  message: string;
  tickets: IssuedTicketModel[];
}

export type CheckoutPaymentMethod = 'card' | 'yape' | 'transfer' | 'cuotealo';

export interface PrepareCulqiCheckoutParams {
  eventId: string;
  showId: string;
  items: SimulateCheckoutItem[];
  paymentMethod: CheckoutPaymentMethod;
  couponCode?: string;
  customerPhone?: string;
}

export interface PrepareCulqiCheckoutModel {
  orderId: string;
  orderCode: string;
  orderPublicUuid: string;
  culqiOrderId: string;
  amountInCents: number;
  totalAmount: number;
  currency: 'PEN';
  title: string;
  description: string;
  expiresAt: string;
  publicKey: string;
  checkoutScriptUrl: string;
  threeDsScriptUrl: string;
  rsaId: string | null;
  rsaPublicKey: string | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface Authentication3DSModel {
  eci: string;
  xid: string;
  cavv: string;
  protocolVersion: string;
}

export interface ConfirmCulqiChargeParams {
  orderPublicUuid: string;
  tokenId: string;
  paymentMethod?: CheckoutPaymentMethod;
  deviceFingerPrintId?: string;
  installments?: number;
  authentication3DS?: Authentication3DSModel;
}

export interface ConfirmCulqiChargeModel {
  status: 'PAID' | 'REQUIRES_3DS';
  requires3DS: boolean;
  orderPublicUuid: string;
  tokenId: string;
  checkoutResult: SimulateCheckoutResponseModel | null;
}

export interface CulqiOrderStatusModel {
  orderPublicUuid: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | string;
  culqiState?: string | null;
  paymentCode?: string | null;
  expiresAt?: string | null;
  checkoutResult?: SimulateCheckoutResponseModel | null;
}

export interface CancelPendingCulqiOrderModel {
  released: boolean;
  status: string;
}

export interface ValidateCouponParams {
  eventId: string;
  code: string;
  subtotal: number;
}

export interface ValidateCouponResponseModel {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  newTotal: number;
  message: string;
}

export interface UserOrderTicketModel {
  ticketId: string;
  ticketUuid: string;
  ticketNumber: number;
  zoneName: string;
  tierName: string;
  unitPrice: number;
  qrPayload: string;
  status: string;
}

export interface UserOrderModel {
  orderId: string;
  orderCode: string;
  orderUuid: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  txCode: string;
  ticketCount: number;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  hasLandingPage: boolean;
  category: string;
  venueName: string;
  venueAddress: string;
  city: string;
  bannerImageUrl: string | null;
  eventDateFormatted: string;
  eventTimeFormatted: string;
  showStartTimeIso: string;
  isPast: boolean;
  zoneName: string;
  tickets: UserOrderTicketModel[];
}
