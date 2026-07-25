import type { ShoppingVertical } from "./verticals";
import type { GccCountry } from "./gcc";

export type UserRole = "customer" | "dealer" | "admin";

/** Frontend capability flags controlled by admin (customers & dealers). */
export type FrontendPermissions = {
  canBrowseMotors: boolean;
  canBrowseClassifieds: boolean;
  /** Browse auction listings on the frontend — off until admin enables. */
  canBrowseAuctions: boolean;
  canPostAds: boolean;
  /** Place bids — off until admin enables. */
  canBidInAuctions: boolean;
  /** Dealer: list a car in auction — off until admin enables. */
  canPostAuction: boolean;
  canMessage: boolean;
  canSaveWishlist: boolean;
  canContactSellers: boolean;
  canViewPricing: boolean;
  /** Dealer-only style capabilities (ignored for customers unless enabled). */
  canAccessDealerTools: boolean;
  canFeatureListings: boolean;
  canBulkManageAds: boolean;
  showVerifiedBadge: boolean;
  maxAdsPerMonth: number;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  banned: boolean;
  verified: boolean;
  permissions: FrontendPermissions;
};

export type AuthAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  banned: boolean;
  verified: boolean;
  tradeLicense?: string;
  vatTrn?: string;
  permissions: FrontendPermissions;
  createdAt: string;
};

export type ListingStatus = "pending" | "approved" | "rejected";

export type ListingCategory =
  | "boats"
  | "yachts"
  | "villas"
  | "palaces"
  | "chalets"
  | "cars"
  | "motors"
  | "classifieds"
  | string;

export type Listing = {
  id: number;
  /** Amount in BASE_CURRENCY (SAR) — convert for display via gcc/money */
  price: number;
  location: string;
  /** ISO GCC country code (AE/SA/KW/BH/QA/OM) */
  country?: GccCountry;
  category: ListingCategory;
  make?: string;
  model?: string;
  brand?: string;
  img: string;
  verified: boolean;
  date: number;
  description: string;
  status: ListingStatus;
  ownerId?: string;
  ownerName?: string;
  /** Super Luxury vertical; omitted = visible in Super Luxury hub */
  vertical?: ShoppingVertical;
  tags?: string[];
};

export type ListingFilters = {
  q?: string;
  location?: string;
  /** Filter by GCC country code */
  country?: GccCountry;
  category?: string;
  make?: string;
  model?: string;
  status?: ListingStatus | "all";
  includeOwnPending?: boolean;
  userId?: string;
  /** When set: luxury category filter; super = all (incl. legacy) */
  vertical?: ShoppingVertical;
};

export type CmsSnapshot = {
  values: Record<string, string>;
  banners: unknown[];
  design: Record<string, unknown>;
  updatedAt: number;
};

export type CreateListingInput = {
  title: string;
  price: number;
  location: string;
  country?: GccCountry;
  category: ListingCategory;
  make?: string;
  model?: string;
  img: string;
  description: string;
  ownerId?: string;
  ownerName?: string;
  role?: UserRole;
};

/** Applied on every new signup — auction capabilities stay off until admin enables them. */
export const DEFAULT_CUSTOMER_PERMISSIONS: FrontendPermissions = {
  canBrowseMotors: true,
  canBrowseClassifieds: true,
  canBrowseAuctions: false,
  canPostAds: true,
  canBidInAuctions: false,
  canPostAuction: false,
  canMessage: true,
  canSaveWishlist: true,
  canContactSellers: true,
  canViewPricing: true,
  canAccessDealerTools: false,
  canFeatureListings: false,
  canBulkManageAds: false,
  showVerifiedBadge: false,
  maxAdsPerMonth: 5,
};

export const DEFAULT_DEALER_PERMISSIONS: FrontendPermissions = {
  ...DEFAULT_CUSTOMER_PERMISSIONS,
  canAccessDealerTools: true,
  canFeatureListings: true,
  canBulkManageAds: true,
  showVerifiedBadge: true,
  maxAdsPerMonth: 100,
  // Auction browse / bid / post remain false until admin switches them on
  canBrowseAuctions: false,
  canBidInAuctions: false,
  canPostAuction: false,
};

export const DEFAULT_ADMIN_PERMISSIONS: FrontendPermissions = {
  ...DEFAULT_DEALER_PERMISSIONS,
  canBrowseAuctions: true,
  canBidInAuctions: true,
  canPostAuction: true,
  maxAdsPerMonth: 9999,
};

export const BANNED_PERMISSIONS: FrontendPermissions = {
  canBrowseMotors: false,
  canBrowseClassifieds: false,
  canBrowseAuctions: false,
  canPostAds: false,
  canBidInAuctions: false,
  canPostAuction: false,
  canMessage: false,
  canSaveWishlist: false,
  canContactSellers: false,
  canViewPricing: false,
  canAccessDealerTools: false,
  canFeatureListings: false,
  canBulkManageAds: false,
  showVerifiedBadge: false,
  maxAdsPerMonth: 0,
};
