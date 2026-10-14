export type ReservationStatus = "Pendente" | "Confirmada" | "Cancelada" | "Concluída";

export type Court = {
  id: string;
  name: string;
  sport: "Society" | "Vôlei";
  pricePerHour: number;
  active: boolean;
  venueName?: string;
  city?: string;
  neighborhood?: string;
  description?: string;
  amenities?: string[];
  rules?: string[];
  rating?: number;
  reviewCount?: number;
  verified?: boolean;
  promotionPercent?: number;
};

export type Reservation = {
  id: string;
  customerName: string;
  phone: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
  estimatedPrice?: number;
  recurrenceId?: string;
  createdAt?: string;
};

export type Venue = {
  name: string;
  city: string;
  openingTime: string;
  closingTime: string;
  address?: string;
  phone?: string;
  description?: string;
  amenities?: string[];
  rules?: string[];
  verified?: boolean;
};

export type Review = {
  id: string;
  reservationId: string;
  courtId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  verified: true;
};

export type BlockedSlot = {
  id: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  kind: "reserva" | "lembrete" | "sistema";
  reservationId?: string;
};

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: "Administrador" | "Atendente" | "Leitura";
  active: boolean;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  courtId?: string;
  discountPercent: number;
  active: boolean;
  daysOfWeek: number[];
  startTime?: string;
  endTime?: string;
};
