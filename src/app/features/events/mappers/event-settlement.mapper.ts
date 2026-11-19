import { EventSettlementDto } from '../dto/event-settlement.dto';
import { EventSettlementModel } from '../models/event-settlement.model';

export function eventSettlementDtoToModel(dto: EventSettlementDto): EventSettlementModel {
  return {
    publicUuid: dto.publicUuid || '',
    eventId: dto.eventId || '',
    eventTitle: dto.eventTitle || 'Evento',
    eventCode: dto.eventCode || '',
    status: dto.status || 'draft',
    statusLabel: dto.statusLabel || 'Disponible para Liquidación',
    isSettlementRequested: Boolean(dto.isSettlementRequested),
    totalTicketsSold: Number(dto.totalTicketsSold) || 0,
    grossAmount: Number(dto.grossAmount) || 0,
    totalCouponsDiscountAmount: Number(dto.totalCouponsDiscountAmount) || 0,
    platformFeeAmount: Number(dto.platformFeeAmount) || 0,
    gatewayFeeAmount: Number(dto.gatewayFeeAmount) || 0,
    totalAdvancesAmount: Number(dto.totalAdvancesAmount) || 0,
    adjustmentsAmount: Number(dto.adjustmentsAmount) || 0,
    netPayoutAmount: Number(dto.netPayoutAmount) || 0,
    bankName: dto.bankName || null,
    bankAccountNumber: dto.bankAccountNumber || null,
    bankAccountCci: dto.bankAccountCci || null,
    bankAccountHolder: dto.bankAccountHolder || null,
    accountType: dto.accountType || null,
    documentType: dto.documentType || null,
    documentNumber: dto.documentNumber || null,
    transferReference: dto.transferReference || null,
    transferVoucherUrl: dto.transferVoucherUrl || null,
    requestedAt: dto.requestedAt || null,
    paidAt: dto.paidAt || null,
    notes: dto.notes || null,
    breakdownByZone: (dto.breakdownByZone || []).map((z) => ({
      zoneId: String(z.zoneId),
      zoneName: z.zoneName || 'Zona',
      ticketsSold: Number(z.ticketsSold) || 0,
      revenue: Number(z.revenue) || 0,
      serviceFee: Number(z.serviceFee) || 0,
    })),
  };
}
