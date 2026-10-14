import type { Court, Reservation, Venue, Promotion, StaffMember } from "../types";

export const mockVenue: Venue = {
  name: "Arena Cariri",
  city: "Crato, CE",
  openingTime: "07:00",
  closingTime: "23:00",
  address: "Bairro Pimenta, Crato — CE (endereço demonstrativo)",
  phone: "(88) 99999-0000",
  description: "Espaço esportivo para reunir os amigos e jogar com conforto.",
  amenities: ["Estacionamento", "Vestiário", "Iluminação", "Banheiros", "Lanchonete"],
  rules: ["Chegue 10 minutos antes", "Use calçado adequado", "Cancelamentos devem ser combinados diretamente com o estabelecimento"],
  verified: false,
};

export const mockCourts: Court[] = [
  {
    id: "court-1", name: "Society 1", sport: "Society", pricePerHour: 120, active: true,
    venueName: "Arena Cariri", city: "Crato, CE", neighborhood: "Pimenta",
    description: "Campo society para partidas entre amigos, com iluminação para jogos à noite.",
    amenities: ["Iluminação", "Vestiário", "Estacionamento"], rules: ["Máximo de 14 jogadores em campo", "Chegue 10 minutos antes"],
    rating: 4.8, reviewCount: 18, verified: false,
  },
  {
    id: "court-2", name: "Society 2", sport: "Society", pricePerHour: 100, active: true,
    venueName: "Arena Cariri", city: "Crato, CE", neighborhood: "Pimenta",
    description: "Opção econômica para futebol com a turma.",
    amenities: ["Iluminação", "Banheiros"], rules: ["Use chuteira apropriada"],
    rating: 4.6, reviewCount: 11, verified: false, promotionPercent: 10,
  },
  {
    id: "court-3", name: "Quadra de vôlei", sport: "Vôlei", pricePerHour: 80, active: true,
    venueName: "Arena Cariri", city: "Crato, CE", neighborhood: "Pimenta",
    description: "Quadra para partidas recreativas e treinos de vôlei.",
    amenities: ["Iluminação", "Banheiros", "Bancos"], rules: ["Traga sua própria bola"],
    rating: 4.7, reviewCount: 9, verified: false,
  },
];

function dateOffset(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export const mockReservations: Reservation[] = [
  { id: "res-1001", customerName: "Rafael Martins", phone: "(88) 98811-2233", courtId: "court-1", date: dateOffset(0), startTime: "18:00", endTime: "19:00", status: "Confirmada", estimatedPrice: 120 },
  { id: "res-1002", customerName: "Lucas Ferreira", phone: "(88) 98722-3344", courtId: "court-2", date: dateOffset(0), startTime: "19:00", endTime: "20:00", status: "Pendente", estimatedPrice: 90 },
  { id: "res-1003", customerName: "Marcos Oliveira", phone: "(88) 98633-4455", courtId: "court-1", date: dateOffset(1), startTime: "20:00", endTime: "21:00", status: "Confirmada", estimatedPrice: 120 },
  { id: "res-1004", customerName: "Ana Beatriz", phone: "(88) 98544-5566", courtId: "court-3", date: dateOffset(0), startTime: "17:00", endTime: "18:00", status: "Concluída", estimatedPrice: 80 },
];

export const mockPromotions: Promotion[] = [
  { id: "promo-1", title: "Horário econômico", description: "10% de desconto na Society 2 em horários selecionados.", courtId: "court-2", discountPercent: 10, active: true, daysOfWeek: [1, 2, 3, 4, 5], startTime: "07:00", endTime: "17:00" },
];

export const mockStaff: StaffMember[] = [
  { id: "staff-1", name: "Gestor demonstrativo", email: "gestao@caririplay.demo", role: "Administrador", active: true },
  { id: "staff-2", name: "Atendente demonstrativo", email: "atendimento@caririplay.demo", role: "Atendente", active: true },
];
