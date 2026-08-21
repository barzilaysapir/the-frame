import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { UNVERIFIED_UPAY_RETURN_ID } from "@/lib/payments/verified-paid";
import type { FirebaseIdTokenClaims } from "@/lib/server/auth/firebase-token";
import type { CatalogItemType } from "@/lib/server/catalog/types";
import type { AppDb } from "@/lib/server/db";

/** Paid rows created from uPay's returnurl are not a real charge — see #323. */
const TRUSTED_PAID_SQL = `status = 'paid' AND IFNULL(provider_payment_id, '') != '${UNVERIFIED_UPAY_RETURN_ID}'`;

export interface AppUser {
  firebaseUid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  localePref: Locale;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

interface UserRow {
  firebase_uid: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  locale_pref: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

function mapUser(row: UserRow): AppUser {
  return {
    firebaseUid: row.firebase_uid,
    email: row.email,
    displayName: row.display_name,
    photoUrl: row.photo_url,
    localePref: isLocale(row.locale_pref) ? row.locale_pref : "he",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
  };
}

async function getUserByUid(
  db: AppDb,
  firebaseUid: string,
): Promise<AppUser | null> {
  const row = await db
    .prepare(
      `SELECT firebase_uid, email, display_name, photo_url, locale_pref,
              created_at, updated_at, last_login_at
       FROM users WHERE firebase_uid = ?`,
    )
    .bind(firebaseUid)
    .first<UserRow>();
  return row ? mapUser(row) : null;
}

/**
 * Upsert profile from a verified Firebase ID token (login / sync).
 * `localePref` applies only on first insert; later locale changes use PATCH.
 */
export async function upsertUserFromClaims(
  db: AppDb,
  claims: FirebaseIdTokenClaims,
  localePref?: Locale,
): Promise<AppUser> {
  const locale = localePref ?? "he";
  await db
    .prepare(
      `INSERT INTO users (
         firebase_uid, email, display_name, photo_url, locale_pref,
         created_at, updated_at, last_login_at
       ) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))
       ON CONFLICT(firebase_uid) DO UPDATE SET
         email = excluded.email,
         display_name = COALESCE(excluded.display_name, users.display_name),
         photo_url = COALESCE(excluded.photo_url, users.photo_url),
         updated_at = datetime('now'),
         last_login_at = datetime('now')`,
    )
    .bind(
      claims.uid,
      claims.email,
      claims.name,
      claims.picture,
      locale,
    )
    .run();

  const user = await getUserByUid(db, claims.uid);
  if (!user) {
    throw new Error("Failed to load user after upsert");
  }
  return user;
}

export async function updateUserProfile(
  db: AppDb,
  firebaseUid: string,
  patch: { displayName?: string; localePref?: Locale },
): Promise<AppUser> {
  const current = await getUserByUid(db, firebaseUid);
  if (!current) {
    throw new Error("User not found");
  }

  const displayName =
    patch.displayName !== undefined ? patch.displayName : current.displayName;
  const localePref = patch.localePref ?? current.localePref;

  await db
    .prepare(
      `UPDATE users
       SET display_name = ?, locale_pref = ?, updated_at = datetime('now')
       WHERE firebase_uid = ?`,
    )
    .bind(displayName, localePref, firebaseUid)
    .run();

  const user = await getUserByUid(db, firebaseUid);
  if (!user) {
    throw new Error("Failed to load user after update");
  }
  return user;
}

export interface PaidPurchase {
  id: string;
  itemType: CatalogItemType;
  itemSlug: string;
  provider: string;
  amountIls: number | null;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

interface PurchaseRow {
  id: string;
  item_type: CatalogItemType;
  item_slug: string;
  provider: string;
  amount_ils: number | null;
  currency: string;
  paid_at: string | null;
  created_at: string;
}

export async function listPaidPurchases(
  db: AppDb,
  firebaseUid: string,
): Promise<PaidPurchase[]> {
  const { results } = await db
    .prepare(
      `SELECT id, item_type, item_slug, provider, amount_ils, currency, paid_at, created_at
       FROM purchases
       WHERE firebase_uid = ? AND ${TRUSTED_PAID_SQL}
       ORDER BY COALESCE(paid_at, created_at) DESC`,
    )
    .bind(firebaseUid)
    .all<PurchaseRow>();

  return (results ?? []).map((row) => ({
    id: row.id,
    itemType: row.item_type,
    itemSlug: row.item_slug,
    provider: row.provider,
    amountIls: row.amount_ils,
    currency: row.currency,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  }));
}

/** True if the user has a `paid` purchase row for this exact item. Used to gate playback/detail access. */
export async function hasPaidPurchase(
  db: AppDb,
  firebaseUid: string,
  itemType: CatalogItemType,
  itemSlug: string,
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT 1 FROM purchases
       WHERE firebase_uid = ? AND item_type = ? AND item_slug = ? AND ${TRUSTED_PAID_SQL}
       LIMIT 1`,
    )
    .bind(firebaseUid, itemType, itemSlug)
    .first();
  return row !== null;
}

export interface Purchase {
  id: string;
  firebaseUid: string;
  itemType: CatalogItemType;
  itemSlug: string;
  provider: string;
  providerPaymentId: string | null;
  /** Grow `processId`/`processToken` from `createPaymentProcess`, stored so the webhook can verify its callback is genuine (Grow's callback has no signature — see migration 0038). Null until `attachProviderProcess` runs, and irrelevant once `status` is `paid`. */
  providerProcessId: string | null;
  providerProcessToken: string | null;
  amountIls: number | null;
  currency: string;
  status: "pending" | "paid" | "refunded";
  createdAt: string;
  paidAt: string | null;
}

interface FullPurchaseRow {
  id: string;
  firebase_uid: string;
  item_type: CatalogItemType;
  item_slug: string;
  provider: string;
  provider_payment_id: string | null;
  provider_process_id: string | null;
  provider_process_token: string | null;
  amount_ils: number | null;
  currency: string;
  status: "pending" | "paid" | "refunded";
  created_at: string;
  paid_at: string | null;
}

function mapPurchase(row: FullPurchaseRow): Purchase {
  return {
    id: row.id,
    firebaseUid: row.firebase_uid,
    itemType: row.item_type,
    itemSlug: row.item_slug,
    provider: row.provider,
    providerPaymentId: row.provider_payment_id,
    providerProcessId: row.provider_process_id,
    providerProcessToken: row.provider_process_token,
    amountIls: row.amount_ils,
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
    paidAt: row.paid_at,
  };
}

/** The `paid` purchase row for this exact item, if any. */
export async function findPaidPurchase(
  db: AppDb,
  firebaseUid: string,
  itemType: CatalogItemType,
  itemSlug: string,
): Promise<Purchase | null> {
  const row = await db
    .prepare(
      `SELECT id, firebase_uid, item_type, item_slug, provider, provider_payment_id,
              provider_process_id, provider_process_token,
              amount_ils, currency, status, created_at, paid_at
       FROM purchases
       WHERE firebase_uid = ? AND item_type = ? AND item_slug = ? AND ${TRUSTED_PAID_SQL}
       LIMIT 1`,
    )
    .bind(firebaseUid, itemType, itemSlug)
    .first<FullPurchaseRow>();
  return row ? mapPurchase(row) : null;
}

/** Puts #320's false paid rows back to pending so Continue can reopen uPay. */
export async function reopenUnverifiedUpayReturnPurchases(
  db: AppDb,
  firebaseUid: string,
  itemType: CatalogItemType,
  itemSlug: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE purchases
       SET status = 'pending', provider_payment_id = NULL, paid_at = NULL
       WHERE firebase_uid = ? AND item_type = ? AND item_slug = ?
         AND status = 'paid' AND provider_payment_id = ?`,
    )
    .bind(firebaseUid, itemType, itemSlug, UNVERIFIED_UPAY_RETURN_ID)
    .run();
}

/** The most recent `pending` purchase for this exact item, if any — reused instead of creating a duplicate when the buyer retries checkout. */
export async function findPendingPurchase(
  db: AppDb,
  firebaseUid: string,
  itemType: CatalogItemType,
  itemSlug: string,
): Promise<Purchase | null> {
  const row = await db
    .prepare(
      `SELECT id, firebase_uid, item_type, item_slug, provider, provider_payment_id,
              provider_process_id, provider_process_token,
              amount_ils, currency, status, created_at, paid_at
       FROM purchases
       WHERE firebase_uid = ? AND item_type = ? AND item_slug = ? AND status = 'pending'
       ORDER BY created_at DESC
       LIMIT 1`,
    )
    .bind(firebaseUid, itemType, itemSlug)
    .first<FullPurchaseRow>();
  return row ? mapPurchase(row) : null;
}

export async function getPurchaseById(
  db: AppDb,
  purchaseId: string,
): Promise<Purchase | null> {
  const row = await db
    .prepare(
      `SELECT id, firebase_uid, item_type, item_slug, provider, provider_payment_id,
              provider_process_id, provider_process_token,
              amount_ils, currency, status, created_at, paid_at
       FROM purchases WHERE id = ?`,
    )
    .bind(purchaseId)
    .first<FullPurchaseRow>();
  return row ? mapPurchase(row) : null;
}

/** Updates the charged amount on a reused pending purchase. */
export async function setPendingPurchaseAmount(
  db: AppDb,
  purchaseId: string,
  amountIls: number,
): Promise<void> {
  await db
    .prepare(
      `UPDATE purchases SET amount_ils = ? WHERE id = ? AND status = 'pending'`,
    )
    .bind(amountIls, purchaseId)
    .run();
}

/** Updates the gateway label on a reused pending purchase (card vs Bit). */
export async function setPendingPurchaseProvider(
  db: AppDb,
  purchaseId: string,
  provider: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE purchases SET provider = ? WHERE id = ? AND status = 'pending'`,
    )
    .bind(provider, purchaseId)
    .run();
}

/** Creates a new `pending` purchase row. The amount is always server-computed by the caller — never trust a client-supplied price. */
export async function createPendingPurchase(
  db: AppDb,
  firebaseUid: string,
  itemType: CatalogItemType,
  itemSlug: string,
  amountIls: number,
  provider: string,
): Promise<Purchase> {
  const id = crypto.randomUUID();
  await db
    .prepare(
      `INSERT INTO purchases (id, firebase_uid, item_type, item_slug, provider, amount_ils, currency, status)
       VALUES (?, ?, ?, ?, ?, ?, 'ILS', 'pending')`,
    )
    .bind(id, firebaseUid, itemType, itemSlug, provider, amountIls)
    .run();

  const purchase = await getPurchaseById(db, id);
  if (!purchase) {
    throw new Error("Failed to load purchase after insert");
  }
  return purchase;
}

/**
 * Flips a `pending` purchase to `paid` (idempotent — a purchase already
 * `paid` is left as-is, so a retried/duplicate webhook delivery is safe).
 *
 * Called from the uPay IPN route. Admin can still override with
 * `markPurchasePaidManually` if the callback never arrives.
 */
export async function markPurchasePaid(
  db: AppDb,
  purchaseId: string,
  providerPaymentId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE purchases
       SET status = 'paid', provider_payment_id = ?, paid_at = datetime('now')
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(providerPaymentId, purchaseId)
    .run();
}

/** Manual admin override — the only "mark as paid" path in Phase 1 (no automated gateway confirmation yet). Used after the site owner verifies a Bit payment arrived. */
export async function markPurchasePaidManually(
  db: AppDb,
  purchaseId: string,
): Promise<void> {
  await db
    .prepare(
      `UPDATE purchases
       SET status = 'paid', provider = 'manual', paid_at = datetime('now')
       WHERE id = ? AND status = 'pending'`,
    )
    .bind(purchaseId)
    .run();
}

export async function markPurchaseRefunded(
  db: AppDb,
  purchaseId: string,
): Promise<void> {
  await db
    .prepare(`UPDATE purchases SET status = 'refunded' WHERE id = ?`)
    .bind(purchaseId)
    .run();
}

/** All purchases across all users, most recent first — admin visibility page only. */
export async function listAllPurchases(
  db: AppDb,
  limit = 200,
): Promise<Purchase[]> {
  const { results } = await db
    .prepare(
      `SELECT id, firebase_uid, item_type, item_slug, provider, provider_payment_id,
              provider_process_id, provider_process_token,
              amount_ils, currency, status, created_at, paid_at
       FROM purchases
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .bind(limit)
    .all<FullPurchaseRow>();
  return (results ?? []).map(mapPurchase);
}

export interface FavoriteRow {
  itemType: CatalogItemType;
  itemSlug: string;
  createdAt: string;
}

interface FavoriteDbRow {
  item_type: CatalogItemType;
  item_slug: string;
  created_at: string;
}

export async function listFavorites(
  db: AppDb,
  firebaseUid: string,
): Promise<FavoriteRow[]> {
  const { results } = await db
    .prepare(
      `SELECT item_type, item_slug, created_at
       FROM favorites
       WHERE firebase_uid = ?
       ORDER BY created_at DESC`,
    )
    .bind(firebaseUid)
    .all<FavoriteDbRow>();

  return (results ?? []).map((row) => ({
    itemType: row.item_type,
    itemSlug: row.item_slug,
    createdAt: row.created_at,
  }));
}

export async function addFavorite(
  db: AppDb,
  firebaseUid: string,
  itemType: CatalogItemType,
  itemSlug: string,
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO favorites (firebase_uid, item_type, item_slug)
       VALUES (?, ?, ?)
       ON CONFLICT(firebase_uid, item_type, item_slug) DO NOTHING`,
    )
    .bind(firebaseUid, itemType, itemSlug)
    .run();
}

export async function removeFavorite(
  db: AppDb,
  firebaseUid: string,
  itemType: CatalogItemType,
  itemSlug: string,
): Promise<void> {
  await db
    .prepare(
      `DELETE FROM favorites WHERE firebase_uid = ? AND item_type = ? AND item_slug = ?`,
    )
    .bind(firebaseUid, itemType, itemSlug)
    .run();
}
