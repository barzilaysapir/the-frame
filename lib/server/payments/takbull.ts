import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ApiError } from "@/lib/server/api/auth-context";
import type { AppDb } from "@/lib/server/db";
import type { Locale } from "@/lib/i18n/config";
import {
  findPurchaseByProviderProcessId,
  getPurchaseById,
  markPurchasePaid,
  type Purchase,
} from "@/lib/server/users/repository";

const TAKBULL_API_BASE = "https://api.takbull.co.il/api/ExtranalAPI";

export interface TakbullConfig {
  apiKey: string;
  apiSecret: string;
}

/** Returns null if Takbull isn't configured — callers treat it as an unavailable gateway. */
export async function getTakbullConfig(): Promise<TakbullConfig | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const apiKey = env.TAKBULL_API_KEY;
    const apiSecret = env.TAKBULL_API_SECRET;
    if (!apiKey || !apiSecret) return null;
    return { apiKey, apiSecret };
  } catch (error) {
    console.error("Failed to resolve Cloudflare context for Takbull config:", error);
    return null;
  }
}

export interface CreatePaymentPageInput {
  purchaseId: string;
  amountIls: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  ipnUrl: string;
  locale: Locale;
}

export interface TakbullPaymentPage {
  uniqId: string;
  paymentPageUrl: string;
}

export interface TakbullValidateResult {
  status: string;
  amount: number | null;
  currency: string | null;
  transactionId: string | null;
}

export type FulfillmentStatus = "paid" | "pending" | "ignored";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function readString(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function readNumber(record: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

export function amountsMatchIls(expected: number, actual: number): boolean {
  return Math.round(expected * 100) === Math.round(actual * 100);
}

export function isTakbullApproved(status: string): boolean {
  const normalized = status.trim().toLowerCase();
  return normalized === "approved" || normalized === "1" || normalized === "success";
}

/**
 * Hosted-page request body. `PaymentMethodType` is omitted on purpose so
 * Takbull's page can offer every method enabled on the merchant account
 * (cards, Bit, Google Pay) instead of locking the buyer to one rail.
 *
 * Path is `ExtranalAPI` — Takbull's own spelling, not ours.
 */
export function buildPaymentPageRequest(input: CreatePaymentPageInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    order_reference: input.purchaseId,
    OrderTotalSum: input.amountIls,
    RedirectAddress: input.successUrl,
    CancelReturnAddress: input.cancelUrl,
    IPNAddress: input.ipnUrl,
    DisplayType: "redirect",
    Currency: "ILS",
    Language: input.locale,
    CreateDocument: true,
    Products: [
      {
        ProductName: input.description,
        Price: input.amountIls,
        Quantity: 1,
      },
    ],
  };
  return body;
}

/**
 * Pulls correlation ids out of a Takbull IPN, which may arrive as JSON,
 * form posts, or query params (their webhook docs allow GET or POST).
 */
export function parseTakbullIpn(
  source: Record<string, unknown> | URLSearchParams,
): { purchaseId: string | null; uniqId: string | null } {
  const record =
    source instanceof URLSearchParams
      ? Object.fromEntries(source.entries())
      : source;
  return {
    purchaseId: readString(
      record,
      "purchaseId",
      "order_reference",
      "OrderReference",
      "orderReference",
    ),
    uniqId: readString(record, "uniqId", "UniqId", "uniqID"),
  };
}

export function validationFulfillmentError(
  result: TakbullValidateResult,
  purchase: Pick<Purchase, "amountIls" | "status">,
): string | null {
  if (!isTakbullApproved(result.status)) {
    return `Takbull status is ${result.status}`;
  }
  if (purchase.amountIls == null) {
    return "purchase has no stored amount";
  }
  if (result.amount == null) {
    return "Takbull validate response has no amount";
  }
  if (!amountsMatchIls(purchase.amountIls, result.amount)) {
    return `amount mismatch: takbull=${result.amount} expected=${purchase.amountIls}`;
  }
  if (result.currency && result.currency.toUpperCase() !== "ILS") {
    return `currency mismatch: takbull=${result.currency}`;
  }
  return null;
}

async function takbullRequest<T>(
  config: TakbullConfig,
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${TAKBULL_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      API_Key: config.apiKey,
      API_Secret: config.apiSecret,
    },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as T & {
    Status?: unknown;
    Message?: unknown;
    Errors?: unknown;
  };
  if (!response.ok) {
    console.error("[takbull] request failed", path, response.status, json);
    throw new ApiError(502, "Payment provider request failed");
  }
  return json;
}

export async function createPaymentPage(
  config: TakbullConfig,
  input: CreatePaymentPageInput,
): Promise<TakbullPaymentPage> {
  const json = await takbullRequest<{
    uniqId?: unknown;
    PaymentPageUrl?: unknown;
    Status?: unknown;
    Message?: unknown;
  }>(config, "/GetTakbullPaymentPageRedirectUrl", buildPaymentPageRequest(input));

  const uniqId = typeof json.uniqId === "string" ? json.uniqId : null;
  const paymentPageUrl =
    typeof json.PaymentPageUrl === "string" ? json.PaymentPageUrl : null;
  if (!uniqId || !paymentPageUrl || json.Status === 0 || json.Status === "0") {
    console.error("[takbull] create payment page failed", json);
    throw new ApiError(502, "Payment provider request failed");
  }
  return { uniqId, paymentPageUrl };
}

export function parseValidateResult(json: unknown): TakbullValidateResult {
  const record = asRecord(json) ?? {};
  return {
    status: readString(record, "Status", "status") ?? "",
    amount: readNumber(record, "Amount", "amount", "OrderTotalSum"),
    currency: readString(record, "Currency", "currency"),
    transactionId: readString(record, "TransactionId", "transactionId", "Token"),
  };
}

export async function validateNotification(
  config: TakbullConfig,
  uniqId: string,
): Promise<TakbullValidateResult> {
  const json = await takbullRequest<unknown>(config, "/ValidateNotification", {
    uniqId,
  });
  return parseValidateResult(json);
}

/**
 * Marks a purchase paid only after Takbull's authenticated validate call
 * says the charge is approved for the stored amount. The IPN itself is not
 * treated as proof (same class of bug as uPay's unsigned callback, #275).
 */
export async function fulfillValidatedPurchase(
  db: AppDb,
  purchase: Purchase,
  result: TakbullValidateResult,
  expectedUid?: string,
): Promise<FulfillmentStatus> {
  if (purchase.status === "paid") return "paid";
  if (purchase.status !== "pending") return "ignored";
  if (expectedUid && purchase.firebaseUid !== expectedUid) {
    throw new ApiError(403, "Purchase does not belong to this account");
  }

  const error = validationFulfillmentError(result, purchase);
  if (error) {
    console.error(`[takbull] refusing to fulfill ${purchase.id}: ${error}`);
    return isTakbullApproved(result.status) ? "ignored" : "pending";
  }

  await markPurchasePaid(
    db,
    purchase.id,
    result.transactionId || purchase.providerProcessId || purchase.id,
  );
  return "paid";
}

export async function fulfillByUniqId(
  db: AppDb,
  config: TakbullConfig,
  purchase: Purchase,
  uniqId: string,
  expectedUid?: string,
): Promise<FulfillmentStatus> {
  const result = await validateNotification(config, uniqId);
  return fulfillValidatedPurchase(db, purchase, result, expectedUid);
}

export async function getPurchaseForIpn(
  db: AppDb,
  parsed: { purchaseId: string | null; uniqId: string | null },
): Promise<Purchase | null> {
  if (parsed.purchaseId) {
    const byId = await getPurchaseById(db, parsed.purchaseId);
    if (byId) return byId;
  }
  if (parsed.uniqId) {
    return findPurchaseByProviderProcessId(db, parsed.uniqId);
  }
  return null;
}
