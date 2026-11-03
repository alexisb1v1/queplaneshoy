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
  paymentMethod: 'card' | 'yape' | 'transfer' | 'apple_pay' | 'google_pay';
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
  totalAmount: number;
  paymentMethod: string;
  txCode: string;
  message: string;
  tickets: IssuedTicketModel[];
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
