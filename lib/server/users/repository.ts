import "server-only";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import type { FirebaseIdTokenClaims } from "@/lib/server/auth/firebase-token";
import type { AppDb } from "@/lib/server/db";

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
  routineSlug: string;
  provider: string;
  amountIls: number | null;
  currency: string;
  paidAt: string | null;
  createdAt: string;
}

interface PurchaseRow {
  id: string;
  routine_slug: string;
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
      `SELECT id, routine_slug, provider, amount_ils, currency, paid_at, created_at
       FROM purchases
       WHERE firebase_uid = ? AND status = 'paid'
       ORDER BY COALESCE(paid_at, created_at) DESC`,
    )
    .bind(firebaseUid)
    .all<PurchaseRow>();

  return (results ?? []).map((row) => ({
    id: row.id,
    routineSlug: row.routine_slug,
    provider: row.provider,
    amountIls: row.amount_ils,
    currency: row.currency,
    paidAt: row.paid_at,
    createdAt: row.created_at,
  }));
}

/**
 * `internal_course` is reserved for a future internally-hosted, multi-lesson
 * course — no catalog table/repository method backs it yet, so nothing can
 * actually produce one today (see migrations/0036). Kept in the union here
 * so call sites are forced to consider it once it's real, rather than
 * silently mishandling it.
 */
export type FavoriteItemType = "lesson" | "internal_course" | "external_course";

export interface FavoriteRow {
  itemType: FavoriteItemType;
  itemSlug: string;
  createdAt: string;
}

interface FavoriteDbRow {
  item_type: FavoriteItemType;
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
  itemType: FavoriteItemType,
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
  itemType: FavoriteItemType,
  itemSlug: string,
): Promise<void> {
  await db
    .prepare(
      `DELETE FROM favorites WHERE firebase_uid = ? AND item_type = ? AND item_slug = ?`,
    )
    .bind(firebaseUid, itemType, itemSlug)
    .run();
}
