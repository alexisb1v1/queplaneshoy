export interface SettlementBreakdownZoneDto {
  zoneId: string;
  zoneName: string;
  ticketsSold: number;
  revenue: number;
  serviceFee: number;
}

export interface EventSettlementDto {
  publicUuid: string;
  eventId: string;
  eventTitle?: string;
  eventCode?: string;
  status: 'draft' | 'requested' | 'in_review' | 'approved' | 'paid' | 'rejected';
  statusLabel: string;
  isSettlementRequested: boolean;
  totalTicketsSold: number;
  grossAmount: number;
  totalCouponsDiscountAmount: number;
  platformFeeAmount: number;
  gatewayFeeAmount: number;
  totalAdvancesAmount: number;
  adjustmentsAmount: number;
  netPayoutAmount: number;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountCci: string | null;
  bankAccountHolder: string | null;
  accountType?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  transferReference: string | null;
  transferVoucherUrl: string | null;
  requestedAt: string | null;
  paidAt: string | null;
  notes: string | null;
  breakdownByZone?: SettlementBreakdownZoneDto[] | null;
}

export interface RequestEventSettlementParams {
  bankName: string;
  accountType?: string;
  accountHolder: string;
  documentType?: string;
  documentNumber?: string;
  accountNumber: string;
  accountCci?: string;
  notes?: string;
}
