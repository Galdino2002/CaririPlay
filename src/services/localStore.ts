import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockCourts, mockReservations } from "../data/mockData";
import type { Court, Reservation } from "../types";

const COURTS_KEY = "@caririplay/courts:v1";
const RESERVATIONS_KEY = "@caririplay/reservations:v1";

export async function loadCourts(): Promise<Court[]> {
  try {
    const raw = await AsyncStorage.getItem(COURTS_KEY);
    if (raw) return JSON.parse(raw) as Court[];
  } catch {
    // If local data is unreadable, fall back to the demo dataset.
  }
  await saveCourts(mockCourts);
  return mockCourts;
}

export async function saveCourts(courts: Court[]): Promise<void> {
  await AsyncStorage.setItem(COURTS_KEY, JSON.stringify(courts));
}

export async function loadReservations(): Promise<Reservation[]> {
  try {
    const raw = await AsyncStorage.getItem(RESERVATIONS_KEY);
    if (raw) return JSON.parse(raw) as Reservation[];
  } catch {
    // If local data is unreadable, fall back to the demo dataset.
  }
  await saveReservations(mockReservations);
  return mockReservations;
}

export async function saveReservations(reservations: Reservation[]): Promise<void> {
  await AsyncStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
}
