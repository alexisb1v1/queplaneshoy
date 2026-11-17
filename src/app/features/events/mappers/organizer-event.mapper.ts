import { OrganizerEventDto } from '../dto/organizer-event.dto';
import { OrganizerEventModel } from '../models/organizer-event.model';

/**
 * Transforma un DTO de evento del panel de organizador a su modelo de dominio en frontend.
 *
 * @param dto - Objeto recibido desde `GET /api/events/organizer`
 * @returns Modelo limpio para renderizado en UI
 */
export function organizerEventDtoToModel(dto: OrganizerEventDto): OrganizerEventModel {
  return {
    id: String(dto.id),
    publicUuid: dto.publicUuid,
    eventCode: dto.eventCode || `#EV-${dto.publicUuid.substring(0, 8).toUpperCase()}`,
    slug: dto.slug,
    name: dto.name,
    category: dto.category || 'CONCERTS',
    status: dto.status || 'draft',
    observationReason: dto.observationReason || null,
    isSoldOut: Boolean(dto.isSoldOut),
    statusLabel: dto.statusLabel || 'Borrador',
    hasLandingPage: Boolean(dto.hasLandingPage),
    imageUrl: dto.imageUrl || null,
    venue: dto.venue || null,
    city: dto.city || 'Perú',
    firstShowStartTime: dto.firstShowStartTime ? new Date(dto.firstShowStartTime) : null,
    dateFormatted: dto.dateFormatted || 'Fecha por definir',
    showsCount: Number(dto.showsCount) || 0,
    capacity: Number(dto.capacity) || 0,
    ticketsSold: Number(dto.ticketsSold) || 0,
    remainingTickets: Number(dto.remainingTickets) || 0,
    occupancyPercentage: Number(dto.occupancyPercentage) || 0,
    grossRevenue: Number(dto.grossRevenue) || 0,
    couponsDiscountAmount: Number(dto.couponsDiscountAmount) || 0,
    netSalesRevenue: Number(dto.netSalesRevenue) || 0,
    targetRevenue: Number(dto.targetRevenue) || 0,
    settlementStatus: dto.settlementStatus || null,
    advancesCount: Number(dto.advancesCount) || 0,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : new Date(),
    draftChecklist: {
      hasShows: Boolean(dto.draftChecklist?.hasShows),
      hasZones: Boolean(dto.draftChecklist?.hasZones),
      hasBanner: Boolean(dto.draftChecklist?.hasBanner),
      completionPercent: Number(dto.draftChecklist?.completionPercent) || 0,
      missingItems: Array.isArray(dto.draftChecklist?.missingItems)
        ? dto.draftChecklist.missingItems
        : [],
    },
    zones: Array.isArray(dto.zones)
      ? dto.zones.map((zone) => ({
          id: String(zone.id),
          publicUuid: zone.publicUuid,
          name: zone.name,
          title: zone.title || null,
          color: zone.color || '#6366F1',
          capacity: Number(zone.capacity) || 0,
          soldCount: Number(zone.soldCount) || 0,
          lockedCount: Number(zone.lockedCount) || 0,
          remainingTickets: Number(zone.remainingTickets) || 0,
          occupancyPercentage: Number(zone.occupancyPercentage) || 0,
          regularPrice: Number(zone.regularPrice) || 0,
          activePrice: Number(zone.activePrice) || 0,
          activeTierName: zone.activeTierName || 'Venta Regular',
          isPresaleActive: Boolean(zone.isPresaleActive),
          statusBadge: zone.statusBadge || 'Disponible',
          revenue: Number(zone.revenue) || 0,
        }))
      : [],
  };
}

