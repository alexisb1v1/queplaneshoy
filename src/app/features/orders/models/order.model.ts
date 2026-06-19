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
