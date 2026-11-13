export interface FeeTierRule {
  readonly id: string;
  readonly label: string;
  readonly minPrice: number;
  readonly maxPrice: number;
  readonly feeType: 'fixed' | 'percentage';
  readonly value: number;
}

/**
 * Escala oficial de comisiones de QuePlanesHoy centralizada en variables:
 * - Tramo 1: Hasta S/ 50.00 -> Comisión fija de S/ 6.00 por entrada.
 * - Tramo 2: De S/ 51.00 a S/ 125.00 -> Comisión fija de S/ 10.00 por entrada.
 * - Tramo 3: A partir de S/ 126.00 -> Comisión porcentual de 8% del precio por entrada.
 */
export const QPH_FEE_RULES = {
  TIER_1: {
    id: 'TIER_1',
    label: 'Hasta S/ 50.00',
    minPrice: 0,
    maxPrice: 50,
    feeType: 'fixed' as const,
    value: 6.0,
  },
  TIER_2: {
    id: 'TIER_2',
    label: 'De S/ 51.00 a S/ 125.00',
    minPrice: 51,
    maxPrice: 125,
    feeType: 'fixed' as const,
    value: 10.0,
  },
  TIER_3: {
    id: 'TIER_3',
    label: 'A partir de S/ 126.00',
    minPrice: 126,
    maxPrice: Infinity,
    feeType: 'percentage' as const,
    value: 0.08,
  },
} as const;

/**
 * Calcula la comisión oficial de QuePlanesHoy aplicable a boletos tanto de precio regular como de preventa.
 */
export function calculatePlatformFee(price: number): number {
  const p = Math.max(0, Number(price) || 0);
  if (p <= 0) return 0;
  if (p <= QPH_FEE_RULES.TIER_1.maxPrice) {
    return QPH_FEE_RULES.TIER_1.value;
  }
  if (p <= QPH_FEE_RULES.TIER_2.maxPrice) {
    return QPH_FEE_RULES.TIER_2.value;
  }
  return Math.round(p * QPH_FEE_RULES.TIER_3.value * 100) / 100;
}

// Alias de retrocompatibilidad
export const calculateQphFee = calculatePlatformFee;

export interface TicketPricingEvaluation {
  basePrice: number;
  officialFee: number;
  finalTariff: number;
  promoterNet: number;
  isFeeIncluded: boolean;
}

/**
 * Resuelve el desglose completo de un ticket (regular o preventa) según si incluye comisión o no.
 */
export function evaluateTicketPricing(
  price: number,
  feeIncluded: boolean,
): TicketPricingEvaluation {
  const basePrice = Math.max(0, Number(price) || 0);
  const officialFee = calculatePlatformFee(basePrice);
  const finalTariff = feeIncluded ? basePrice : basePrice + officialFee;
  const promoterNet = feeIncluded ? Math.max(0, basePrice - officialFee) : basePrice;

  return {
    basePrice,
    officialFee,
    finalTariff,
    promoterNet,
    isFeeIncluded: feeIncluded,
  };
}

