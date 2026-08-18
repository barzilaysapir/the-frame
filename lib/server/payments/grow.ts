import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Client for Grow (Meshulam)'s Light API — see developers.grow.business.
 * Chosen over uPay (see #256, closed) because Grow publishes a real,
 * indexed API reference: exact endpoints, request/response shapes, and a
 * documented (if signature-less) server-to-server callback. Nothing here
 * is guessed — every field name below is confirmed against the live docs
 * as of 2026-08-18 (Authentication, Regular Payment, Response,
 * Server-to-Server Callback, and Approve Transaction pages).
 *
 * Sandbox vs production is just `GROW_BASE_URL` (sandbox:
 * https://sandbox.meshulam.co.il/api/light/server/1.0, production:
 * https://secure.meshulam.co.il/api/light/server/1.0) — Grow's own docs
 * describe switching this way, so there's no env-guessing here.
 *
 * IMPORTANT sandbox limitation (from Grow's Testing Environment page):
 * Bit, Apple Pay, and Google Pay have NO sandbox — those payment methods
 * are always live and charge for real, even when GROW_BASE_URL points at
 * sandbox.meshulam.co.il. Only card-number testing (4580458045804580 etc.)
 * is safe pre-launch.
 */

export interface GrowConfig {
  userId: string;
  pageCode: string;
  baseUrl: string;
}

/** Returns null if Grow isn't configured yet (missing secrets) — callers should fall back to the manual Bit flow, not throw. */
export async function getGrowConfig(): Promise<GrowConfig | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const userId = env.GROW_USER_ID;
    const pageCode = env.GROW_PAGE_CODE;
    const baseUrl = env.GROW_BASE_URL;
    if (!userId || !pageCode || !baseUrl) return null;
    return { userId, pageCode, baseUrl };
  } catch (error) {
    console.error("Failed to resolve Cloudflare context for Grow config:", error);
    return null;
  }
}

export interface CreatePaymentProcessParams {
  sum: number;
  description: string;
  fullName: string;
  phone: string;
  successUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  /** Our internal purchase id — round-tripped by Grow as `customFields.cField1` in the webhook, so the callback can look the purchase back up without a separate lookup table. */
  purchaseId: string;
}

export interface CreatePaymentProcessResult {
  processId: string;
  processToken: string;
  url: string;
}

interface GrowApiResponse<T> {
  status: 0 | 1;
  err: string | { id: number; message: string };
  data: T | "";
}

/** All Grow requests are FormData, never JSON — confirmed on every Light API reference page ("All data transmitted in the body of HTTP requests is in FormData format"). */
function toFormData(fields: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  return form;
}

/**
 * Creates a hosted payment process (card or Bit — the Generic Payment Page
 * pageCode supports both) and returns the URL to redirect the buyer to.
 */
export async function createPaymentProcess(
  config: GrowConfig,
  params: CreatePaymentProcessParams,
): Promise<CreatePaymentProcessResult> {
  const form = toFormData({
    pageCode: config.pageCode,
    userId: config.userId,
    sum: params.sum.toFixed(2),
    description: params.description,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
    notifyUrl: params.notifyUrl,
    "pageField[fullName]": params.fullName,
    "pageField[phone]": params.phone,
    cField1: params.purchaseId,
  });

  const res = await fetch(`${config.baseUrl}/createPaymentProcess`, {
    method: "POST",
    body: form,
  });
  const body = (await res.json()) as GrowApiResponse<CreatePaymentProcessResult>;
  if (body.status !== 1 || !body.data) {
    const message =
      typeof body.err === "string" ? body.err : body.err?.message || "Unknown Grow error";
    throw new Error(`Grow createPaymentProcess failed: ${message}`);
  }
  return body.data;
}

/**
 * The server-to-server callback Grow POSTs to `notifyUrl` after the buyer
 * completes the payment page. Field shape confirmed on the
 * "Server-to-Server Callback" reference page. Delivered as form-encoded
 * data (same convention as every other Light API call), NOT JSON — parse
 * accordingly in the webhook route.
 */
export interface GrowWebhookPayload {
  asmachta: string;
  cardSuffix?: string;
  cardType?: string;
  cardTypeCode?: string;
  cardBrand?: string;
  cardBrandCode?: string;
  cardExp?: string;
  firstPaymentSum: string;
  periodicalPaymentSum: string;
  status: string;
  statusCode: string;
  transactionTypeId: string;
  paymentType: string;
  sum: string;
  paymentsNum: string;
  allPaymentsNum: string;
  paymentDate: string;
  description: string;
  fullName: string;
  payerPhone: string;
  payerEmail: string;
  transactionId: string;
  transactionToken: string;
  processId: string;
  processToken: string;
  /** cField1 == the purchase id we sent when creating the process. */
  cField1?: string;
}

/**
 * Acknowledges receipt of the server update. Per Grow's docs this is
 * best-effort: "the transaction will still be processed even if the
 * ApproveTransaction request is not executed or fails" — so callers should
 * log a failure here, not treat it as fatal to marking the purchase paid.
 */
export async function approveTransaction(
  config: GrowConfig,
  payload: GrowWebhookPayload,
): Promise<void> {
  const form = toFormData({
    pageCode: config.pageCode,
    transactionId: payload.transactionId,
    transactionToken: payload.transactionToken,
    transactionTypeId: payload.transactionTypeId,
    paymentType: payload.paymentType,
    sum: payload.sum,
    firstPaymentSum: payload.firstPaymentSum,
    periodicalPaymentSum: payload.periodicalPaymentSum,
    paymentsNum: payload.paymentsNum,
    allPaymentsNum: payload.allPaymentsNum,
    paymentDate: payload.paymentDate,
    asmachta: payload.asmachta,
    description: payload.description,
    fullName: payload.fullName,
    payerPhone: payload.payerPhone,
    payerEmail: payload.payerEmail,
    cardSuffix: payload.cardSuffix ?? "",
    cardType: payload.cardType ?? "",
    cardTypeCode: payload.cardTypeCode ?? "",
    cardBrand: payload.cardBrand ?? "",
    cardBrandCode: payload.cardBrandCode ?? "",
    cardExp: payload.cardExp ?? "",
    processId: payload.processId,
    processToken: payload.processToken,
  });

  const res = await fetch(`${config.baseUrl}/approveTransaction`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    throw new Error(`Grow approveTransaction responded with ${res.status}`);
  }
}
