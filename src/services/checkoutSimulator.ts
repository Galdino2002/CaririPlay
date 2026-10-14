import {
  createCheckoutQuote,
  simulateCheckout,
  type CheckoutQuoteInput,
  type CheckoutSimulation,
} from "../domain/checkout";

/** Local-only adapter for prototypes. No network, persistence, real charge or reservation authorization. */
export async function runCheckoutSimulation(input: CheckoutQuoteInput): Promise<CheckoutSimulation> {
  return simulateCheckout(createCheckoutQuote(input));
}
