/**
 * Domain contracts for checkout. This module calculates quotes only; it never charges
 * a customer or confirms a real reservation. Money is represented in integer cents.
 */
export type CheckoutStatus = "draft" | "awaiting_payment" | "simulated" | "paid" | "failed" | "cancelled" | "refunded";

export interface CheckoutQuoteInput {
  reservationId: string;
  venueId: string;
  customerId: string;
  amountInCents: number;
  commissionBasisPoints?: number;
}

export interface CheckoutQuote {
  reservationId: string;
  venueId: string;
  customerId: string;
  grossAmountInCents: number;
  platformFeeInCents: number;
  venueAmountInCents: number;
  commissionBasisPoints: number;
  currency: "BRL";
}

export interface CheckoutSimulation {
  id: string;
  status: "simulated";
  provider: "local-demo";
  quote: CheckoutQuote;
  message: string;
  createdAt: string;
}

const DEFAULT_COMMISSION_BASIS_POINTS = 500;

export function createCheckoutQuote(input: CheckoutQuoteInput): CheckoutQuote {
  if (!input.reservationId.trim()) throw new Error("Reserva inválida.");
  if (!input.venueId.trim()) throw new Error("Estabelecimento inválido.");
  if (!input.customerId.trim()) throw new Error("Cliente inválido.");
  if (!Number.isSafeInteger(input.amountInCents) || input.amountInCents <= 0) {
    throw new Error("O valor deve ser um inteiro positivo em centavos.");
  }
  const basisPoints = input.commissionBasisPoints ?? DEFAULT_COMMISSION_BASIS_POINTS;
  if (!Number.isSafeInteger(basisPoints) || basisPoints < 0 || basisPoints > 10_000) {
    throw new Error("A comissão deve estar entre 0% e 100%.");
  }
  const platformFeeInCents = Math.round((input.amountInCents * basisPoints) / 10_000);
  return {
    reservationId: input.reservationId,
    venueId: input.venueId,
    customerId: input.customerId,
    grossAmountInCents: input.amountInCents,
    platformFeeInCents,
    venueAmountInCents: input.amountInCents - platformFeeInCents,
    commissionBasisPoints: basisPoints,
    currency: "BRL",
  };
}

/** A demo never returns paid: it must not unlock a slot or confirm a reservation. */
export function simulateCheckout(quote: CheckoutQuote, now = new Date()): CheckoutSimulation {
  return {
    id: `demo_${quote.reservationId}_${now.getTime()}`,
    status: "simulated",
    provider: "local-demo",
    quote,
    message: "Simulação concluída. Nenhum pagamento real foi realizado.",
    createdAt: now.toISOString(),
  };
}

export function formatBRLFromCents(amountInCents: number): string {
  if (!Number.isSafeInteger(amountInCents)) throw new Error("O valor deve ser inteiro em centavos.");
  return (amountInCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
