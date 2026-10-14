import type { Court, Reservation, Venue } from "../types";

export const mockVenue: Venue = {
  name: "Arena Cariri",
  city: "Crato, CE",
  openingTime: "07:00",
  closingTime: "23:00",
};

export const mockCourts: Court[] = [
  { id: "court-1", name: "Society 1", sport: "Society", pricePerHour: 120, active: true },
  { id: "court-2", name: "Society 2", sport: "Society", pricePerHour: 100, active: true },
  { id: "court-3", name: "Quadra de vôlei", sport: "Vôlei", pricePerHour: 80, active: true },
];

function dateOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const mockReservations: Reservation[] = [
  {
    id: "res-1001",
    customerName: "Rafael Martins",
    phone: "(88) 98811-2233",
    courtId: "court-1",
    date: dateOffset(0),
    startTime: "18:00",
    endTime: "19:00",
    status: "Confirmada",
  },
  {
    id: "res-1002",
    customerName: "Lucas Ferreira",
    phone: "(88) 98722-3344",
    courtId: "court-2",
    date: dateOffset(0),
    startTime: "19:00",
    endTime: "20:00",
    status: "Pendente",
  },
  {
    id: "res-1003",
    customerName: "Marcos Oliveira",
    phone: "(88) 98633-4455",
    courtId: "court-1",
    date: dateOffset(1),
    startTime: "20:00",
    endTime: "21:00",
    status: "Confirmada",
  },
  {
    id: "res-1004",
    customerName: "Ana Beatriz",
    phone: "(88) 98544-5566",
    courtId: "court-3",
    date: dateOffset(0),
    startTime: "17:00",
    endTime: "18:00",
    status: "Confirmada",
  },
];
