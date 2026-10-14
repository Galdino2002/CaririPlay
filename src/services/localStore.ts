import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockCourts, mockReservations, mockPromotions, mockStaff } from "../data/mockData";
import type { AppNotification, BlockedSlot, Court, Promotion, Reservation, Review, StaffMember } from "../types";

const KEYS = {
  courts: "@caririplay/courts:v2",
  reservations: "@caririplay/reservations:v2",
  favorites: "@caririplay/favorites:v1",
  reviews: "@caririplay/reviews:v1",
  blockedSlots: "@caririplay/blocked-slots:v1",
  notifications: "@caririplay/notifications:v1",
  promotions: "@caririplay/promotions:v1",
  staff: "@caririplay/staff:v1",
};

async function loadList<T>(key: string, fallback: T[]): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // Malformed local data falls back to the demo defaults.
  }
  await AsyncStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}
async function saveList<T>(key: string, value: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
export const loadCourts = () => loadList<Court>(KEYS.courts, mockCourts);
export const saveCourts = (value: Court[]) => saveList(KEYS.courts, value);
export const loadReservations = () => loadList<Reservation>(KEYS.reservations, mockReservations);
export const saveReservations = (value: Reservation[]) => saveList(KEYS.reservations, value);
export const loadFavorites = () => loadList<string>(KEYS.favorites, []);
export const saveFavorites = (value: string[]) => saveList(KEYS.favorites, value);
export const loadReviews = () => loadList<Review>(KEYS.reviews, []);
export const saveReviews = (value: Review[]) => saveList(KEYS.reviews, value);
export const loadBlockedSlots = () => loadList<BlockedSlot>(KEYS.blockedSlots, []);
export const saveBlockedSlots = (value: BlockedSlot[]) => saveList(KEYS.blockedSlots, value);
export const loadNotifications = () => loadList<AppNotification>(KEYS.notifications, []);
export const saveNotifications = (value: AppNotification[]) => saveList(KEYS.notifications, value);
export const loadPromotions = () => loadList<Promotion>(KEYS.promotions, mockPromotions);
export const savePromotions = (value: Promotion[]) => saveList(KEYS.promotions, value);
export const loadStaff = () => loadList<StaffMember>(KEYS.staff, mockStaff);
export const saveStaff = (value: StaffMember[]) => saveList(KEYS.staff, value);
