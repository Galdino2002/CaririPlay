export type ReservationStatus = "Pendente" | "Confirmada" | "Cancelada" | "Concluída";

export type Court = {
  id: string;
  name: string;
  sport: "Society" | "Vôlei";
  pricePerHour: number;
  active: boolean;
};

export type Reservation = {
  id: string;
  customerName: string;
  phone: string;
  courtId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ReservationStatus;
  notes?: string;
};

export type Venue = {
  name: string;
  city: string;
  openingTime: string;
  closingTime: string;
};
