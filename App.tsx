import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CalendarDays, Check, CircleDollarSign, Clock3, MapPin, Plus, ShieldCheck, Trophy, X } from "lucide-react-native";
import { mockVenue } from "./src/data/mockData";
import { loadCourts, loadReservations, saveReservations } from "./src/services/localStore";
import type { Court, Reservation, ReservationStatus } from "./src/types";

type Tab = "Início" | "Agenda" | "Quadras" | "Reservas";

const COLORS = {
  background: "#07130F",
  surface: "#101F19",
  surfaceRaised: "#172A22",
  border: "#263B30",
  primary: "#B8F36B",
  text: "#F4F7F2",
  muted: "#9BAFA3",
  green: "#58D68D",
  orange: "#F4B860",
  red: "#F07878",
};

const currency = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function dateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function StatusPill({ status }: { status: ReservationStatus }) {
  const color = status === "Confirmada" || status === "Concluída"
    ? COLORS.green
    : status === "Pendente" ? COLORS.orange : COLORS.red;
  return (
    <View style={[styles.statusPill, { borderColor: color + "55", backgroundColor: color + "18" }]}>
      <Text style={[styles.statusText, { color }]}>{status}</Text>
    </View>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("Início");
  const [courts, setCourts] = useState<Court[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [loadedCourts, loadedReservations] = await Promise.all([loadCourts(), loadReservations()]);
    setCourts(loadedCourts);
    setReservations(loadedReservations);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const todayReservations = useMemo(
    () => reservations.filter((reservation) => reservation.date === todayKey() && reservation.status !== "Cancelada"),
    [reservations],
  );
  const pendingCount = reservations.filter((reservation) => reservation.status === "Pendente").length;
  const confirmedCount = todayReservations.filter((reservation) => reservation.status === "Confirmada").length;
  const revenueToday = todayReservations
    .filter((reservation) => reservation.status === "Confirmada" || reservation.status === "Concluída")
    .reduce((total, reservation) => {
      const court = courts.find((item) => item.id === reservation.courtId);
      return total + (court?.pricePerHour ?? 0);
    }, 0);

  const updateStatus = (reservation: Reservation, status: ReservationStatus) => {
    Alert.alert(
      status === "Cancelada" ? "Cancelar reserva?" : `${status} reserva`,
      `${reservation.customerName} • ${reservation.startTime}`,
      [
        { text: "Voltar", style: "cancel" },
        {
          text: "Confirmar",
          style: status === "Cancelada" ? "destructive" : "default",
          onPress: () => {
            const updated = reservations.map((item) => item.id === reservation.id ? { ...item, status } : item);
            setReservations(updated);
            void saveReservations(updated);
          },
        },
      ],
    );
  };

  const createDemoReservation = () => {
    const availableCourt = courts.find((court) => court.active);
    if (!availableCourt) {
      Alert.alert("Nenhuma quadra ativa", "Cadastre ou ative uma quadra antes de criar uma reserva.");
      return;
    }
    const slots = ["07:00", "08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "21:00", "22:00"];
    const slot = slots.find((time) => !reservations.some((item) =>
      item.courtId === availableCourt.id && item.date === todayKey() && item.startTime === time && item.status !== "Cancelada",
    ));
    if (!slot) {
      Alert.alert("Sem horário de demonstração", "Todos os horários de teste desta quadra estão ocupados.");
      return;
    }
    const [hour] = slot.split(":").map(Number);
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      customerName: "Novo cliente",
      phone: "",
      courtId: availableCourt.id,
      date: todayKey(),
      startTime: slot,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`,
      status: "Pendente",
    };
    const updated = [newReservation, ...reservations];
    setReservations(updated);
    void saveReservations(updated);
    Alert.alert("Reserva de demonstração criada", `Hoje às ${slot}. Você pode confirmar na aba Reservas.`);
  };

  const renderReservation = ({ item }: { item: Reservation }) => {
    const court = courts.find((candidate) => candidate.id === item.courtId);
    return (
      <View style={styles.reservationCard}>
        <View style={styles.reservationTop}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{item.customerName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</Text></View>
          <View style={styles.reservationInfo}>
            <Text style={styles.cardTitle}>{item.customerName}</Text>
            <Text style={styles.mutedText}>{court?.name ?? "Quadra removida"} · {dateLabel(item.date)}</Text>
          </View>
          <StatusPill status={item.status} />
        </View>
        <View style={styles.reservationBottom}>
          <View style={styles.inlineMeta}><Clock3 color={COLORS.primary} size={15} /><Text style={styles.metaText}>{item.startTime}–{item.endTime}</Text></View>
          <Text style={styles.priceText}>{currency(court?.pricePerHour ?? 0)}</Text>
        </View>
        {item.status === "Pendente" && (
          <View style={styles.actionRow}>
            <Pressable style={styles.confirmButton} onPress={() => updateStatus(item, "Confirmada")}><Check color={COLORS.background} size={15} /><Text style={styles.confirmButtonText}>Confirmar</Text></Pressable>
            <Pressable style={styles.cancelButton} onPress={() => updateStatus(item, "Cancelada")}><X color={COLORS.red} size={15} /><Text style={styles.cancelButtonText}>Cancelar</Text></Pressable>
          </View>
        )}
        {item.status === "Confirmada" && (
          <View style={styles.actionRow}>
            <Pressable style={styles.secondaryButton} onPress={() => updateStatus(item, "Concluída")}><Check color={COLORS.green} size={15} /><Text style={styles.secondaryButtonText}>Marcar como concluída</Text></Pressable>
            <Pressable style={styles.cancelButton} onPress={() => updateStatus(item, "Cancelada")}><X color={COLORS.red} size={15} /><Text style={styles.cancelButtonText}>Cancelar</Text></Pressable>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return <SafeAreaView style={styles.loading}><StatusBar barStyle="light-content" /><ActivityIndicator color={COLORS.primary} size="large" /><Text style={styles.mutedText}>Preparando o CaririPlay...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <View style={styles.brandMark}><Trophy color={COLORS.background} size={21} strokeWidth={2.5} /></View>
        <View style={styles.brandTextWrap}>
          <Text style={styles.brandName}>Cariri<Text style={{ color: COLORS.primary }}>Play</Text></Text>
          <View style={styles.locationLine}><MapPin color={COLORS.muted} size={12} /><Text style={styles.locationText}>{mockVenue.name} · {mockVenue.city}</Text></View>
        </View>
        <View style={styles.demoBadge}><View style={styles.demoDot} /><Text style={styles.demoText}>DEMO</Text></View>
      </View>

      <View style={styles.tabs}>
        {(["Início", "Agenda", "Quadras", "Reservas"] as Tab[]).map((item) => (
          <Pressable key={item} onPress={() => setTab(item)} style={[styles.tab, tab === item && styles.activeTab]}>
            <Text style={[styles.tabText, tab === item && styles.activeTabText]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === "Início" && (
          <>
            <View style={styles.hero}>
              <View style={styles.heroGlow} />
              <Text style={styles.eyebrow}>PAINEL DO PROPRIETÁRIO</Text>
              <Text style={styles.heroTitle}>Seu espaço esportivo,{ "\n" }sob controle.</Text>
              <Text style={styles.heroSubtitle}>Acompanhe sua operação e mantenha o jogo em movimento.</Text>
              <Pressable style={styles.heroButton} onPress={() => setTab("Agenda")}><CalendarDays color={COLORS.background} size={17} /><Text style={styles.heroButtonText}>Ver agenda de hoje</Text></Pressable>
            </View>
            <Text style={styles.sectionTitle}>Resumo de hoje</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}><View style={styles.statIcon}><CalendarDays color={COLORS.primary} size={18} /></View><Text style={styles.statValue}>{todayReservations.length}</Text><Text style={styles.statLabel}>Reservas hoje</Text></View>
              <View style={styles.statCard}><View style={styles.statIcon}><Clock3 color={COLORS.orange} size={18} /></View><Text style={styles.statValue}>{pendingCount}</Text><Text style={styles.statLabel}>Aguardando</Text></View>
              <View style={styles.statCard}><View style={styles.statIcon}><ShieldCheck color={COLORS.green} size={18} /></View><Text style={styles.statValue}>{confirmedCount}</Text><Text style={styles.statLabel}>Confirmadas hoje</Text></View>
              <View style={styles.statCard}><View style={styles.statIcon}><CircleDollarSign color={COLORS.primary} size={18} /></View><Text style={styles.statValue}>{currency(revenueToday)}</Text><Text style={styles.statLabel}>Valor reservado*</Text></View>
            </View>
            <Text style={styles.sectionTitle}>Próximas reservas</Text>
            {todayReservations.length ? todayReservations.slice().sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 3).map((item) => <View key={item.id}>{renderReservation({ item })}</View>) : <EmptyState title="Dia livre por enquanto" description="Crie uma reserva de demonstração para testar o fluxo." />}
            <Text style={styles.disclaimer}>*Estimativa de reservas confirmadas, não representa pagamento recebido.</Text>
            <Pressable style={styles.primaryButton} onPress={createDemoReservation}><Plus color={COLORS.background} size={18} /><Text style={styles.primaryButtonText}>Criar reserva de teste</Text></Pressable>
          </>
        )}

        {tab === "Agenda" && (
          <>
            <ScreenHeading title="Agenda" subtitle="Visualize as reservas de hoje e os horários ocupados." />
            <View style={styles.dateCard}><CalendarDays color={COLORS.primary} size={20} /><View style={{ flex: 1 }}><Text style={styles.cardTitle}>Hoje · {dateLabel(todayKey())}</Text><Text style={styles.mutedText}>{mockVenue.openingTime}–{mockVenue.closingTime}</Text></View><Text style={styles.dateCount}>{todayReservations.length} reservas</Text></View>
            {courts.filter((court) => court.active).map((court) => {
              const items = todayReservations.filter((reservation) => reservation.courtId === court.id).sort((a, b) => a.startTime.localeCompare(b.startTime));
              return <View key={court.id} style={styles.courtSchedule}><View style={styles.courtScheduleHead}><Text style={styles.cardTitle}>{court.name}</Text><Text style={styles.mutedText}>{currency(court.pricePerHour)}/h</Text></View>{items.length ? items.map((item) => <View key={item.id} style={styles.slotRow}><View style={styles.slotTime}><Text style={styles.slotTimeText}>{item.startTime}</Text><Text style={styles.slotEndText}>{item.endTime}</Text></View><View style={styles.slotBar}><Text style={styles.slotCustomer}>{item.customerName}</Text><Text style={styles.slotStatus}>{item.status}</Text></View></View>) : <Text style={styles.emptyInline}>Nenhuma reserva para hoje.</Text>}</View>;
            })}
          </>
        )}

        {tab === "Quadras" && (
          <>
            <ScreenHeading title="Quadras" subtitle="Estrutura cadastrada neste estabelecimento." />
            {courts.map((court) => <View key={court.id} style={styles.courtCard}><View style={styles.courtSymbol}><Trophy color={COLORS.primary} size={22} /></View><View style={styles.courtDetails}><Text style={styles.cardTitle}>{court.name}</Text><Text style={styles.mutedText}>{court.sport} · {court.active ? "Ativa" : "Inativa"}</Text><Text style={styles.courtPrice}>{currency(court.pricePerHour)} <Text style={styles.mutedText}>/ hora</Text></Text></View><View style={[styles.activeDot, { backgroundColor: court.active ? COLORS.green : COLORS.red }]} /></View>)}
            <View style={styles.infoPanel}><Text style={styles.infoTitle}>Próxima melhoria</Text><Text style={styles.mutedText}>Cadastro e edição de quadras estarão disponíveis na próxima etapa do MVP. Por enquanto, estes dados são exemplos.</Text></View>
          </>
        )}

        {tab === "Reservas" && (
          <>
            <ScreenHeading title="Reservas" subtitle="Confirme solicitações e acompanhe os agendamentos." />
            <View style={styles.filterSummary}><Text style={styles.mutedText}>{reservations.length} registros no total</Text><Text style={styles.pendingText}>{pendingCount} pendentes</Text></View>
            {reservations.slice().sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map((item) => <View key={item.id}>{renderReservation({ item })}</View>)}
            <Pressable style={styles.primaryButton} onPress={createDemoReservation}><Plus color={COLORS.background} size={18} /><Text style={styles.primaryButtonText}>Criar reserva de teste</Text></Pressable>
          </>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        {([
          { label: "Início" as Tab, icon: Trophy },
          { label: "Agenda" as Tab, icon: CalendarDays },
          { label: "Quadras" as Tab, icon: MapPin },
          { label: "Reservas" as Tab, icon: Clock3 },
        ]).map(({ label, icon: Icon }) => (
          <Pressable key={label} onPress={() => setTab(label)} style={styles.bottomItem}>
            <Icon size={19} color={tab === label ? COLORS.primary : COLORS.muted} />
            <Text style={[styles.bottomLabel, tab === label && styles.bottomLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

function ScreenHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return <View style={styles.screenHeading}><Text style={styles.screenTitle}>{title}</Text><Text style={styles.screenSubtitle}>{subtitle}</Text></View>;
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <View style={styles.emptyState}><CalendarDays color={COLORS.muted} size={25} /><Text style={styles.cardTitle}>{title}</Text><Text style={styles.mutedText}>{description}</Text></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: COLORS.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, gap: 11 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center" },
  brandTextWrap: { flex: 1, gap: 2 },
  brandName: { fontSize: 23, fontWeight: "900", color: COLORS.text, letterSpacing: -0.7 },
  locationLine: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { color: COLORS.muted, fontSize: 11 },
  demoBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderColor: COLORS.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6 },
  demoDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  demoText: { color: COLORS.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  tabs: { flexDirection: "row", paddingHorizontal: 16, gap: 5, paddingBottom: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: { backgroundColor: COLORS.surfaceRaised },
  tabText: { fontSize: 12, color: COLORS.muted, fontWeight: "600" },
  activeTabText: { color: COLORS.primary },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 32, gap: 14 },
  hero: { backgroundColor: COLORS.surfaceRaised, borderRadius: 22, padding: 20, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border, gap: 10 },
  heroGlow: { position: "absolute", width: 150, height: 150, borderRadius: 75, right: -50, top: -60, backgroundColor: "#B8F36B12" },
  eyebrow: { color: COLORS.primary, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  heroTitle: { color: COLORS.text, fontSize: 27, lineHeight: 32, fontWeight: "800", letterSpacing: -0.8 },
  heroSubtitle: { color: COLORS.muted, fontSize: 13, lineHeight: 19, maxWidth: 290 },
  heroButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: COLORS.primary, borderRadius: 11, paddingVertical: 11, paddingHorizontal: 14, marginTop: 4 },
  heroButtonText: { color: COLORS.background, fontSize: 12, fontWeight: "800" },
  sectionTitle: { color: COLORS.text, fontSize: 17, fontWeight: "800", marginTop: 5, letterSpacing: -0.3 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: { width: "48%", flexGrow: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, gap: 7 },
  statIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: COLORS.surfaceRaised, alignItems: "center", justifyContent: "center" },
  statValue: { color: COLORS.text, fontSize: 24, fontWeight: "800", letterSpacing: -0.5 },
  statLabel: { color: COLORS.muted, fontSize: 11 },
  reservationCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, gap: 13 },
  reservationTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 13, backgroundColor: COLORS.surfaceRaised, alignItems: "center", justifyContent: "center" },
  avatarText: { color: COLORS.primary, fontSize: 12, fontWeight: "800" },
  reservationInfo: { flex: 1, gap: 4 },
  cardTitle: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  mutedText: { color: COLORS.muted, fontSize: 11, lineHeight: 16 },
  statusPill: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 },
  statusText: { fontSize: 9, fontWeight: "800" },
  reservationBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 11 },
  inlineMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: COLORS.text, fontSize: 12, fontWeight: "600" },
  priceText: { color: COLORS.primary, fontSize: 13, fontWeight: "800" },
  actionRow: { flexDirection: "row", gap: 8 },
  confirmButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9 },
  confirmButtonText: { color: COLORS.background, fontSize: 11, fontWeight: "800" },
  cancelButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, borderWidth: 1, borderColor: COLORS.red + "44", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9 },
  cancelButtonText: { color: COLORS.red, fontSize: 11, fontWeight: "700" },
  secondaryButton: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderColor: COLORS.green + "44", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9 },
  secondaryButtonText: { color: COLORS.green, fontSize: 11, fontWeight: "700" },
  disclaimer: { color: COLORS.muted, fontSize: 10, lineHeight: 15 },
  primaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12, marginTop: 3 },
  primaryButtonText: { color: COLORS.background, fontSize: 13, fontWeight: "800" },
  screenHeading: { gap: 5, marginBottom: 4, marginTop: 4 },
  screenTitle: { color: COLORS.text, fontSize: 27, fontWeight: "800", letterSpacing: -0.7 },
  screenSubtitle: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
  dateCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, padding: 14, borderRadius: 15 },
  dateCount: { color: COLORS.primary, fontSize: 11, fontWeight: "800" },
  courtSchedule: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 14, gap: 12 },
  courtScheduleHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  slotRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  slotTime: { width: 43, justifyContent: "center" },
  slotTimeText: { color: COLORS.text, fontSize: 11, fontWeight: "800" },
  slotEndText: { color: COLORS.muted, fontSize: 10, marginTop: 3 },
  slotBar: { flex: 1, backgroundColor: COLORS.surfaceRaised, borderLeftWidth: 3, borderLeftColor: COLORS.primary, borderRadius: 7, padding: 10, gap: 4 },
  slotCustomer: { color: COLORS.text, fontSize: 11, fontWeight: "700" },
  slotStatus: { color: COLORS.muted, fontSize: 10 },
  emptyInline: { color: COLORS.muted, fontSize: 11, paddingVertical: 8 },
  courtCard: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 15 },
  courtSymbol: { width: 46, height: 46, borderRadius: 14, backgroundColor: COLORS.surfaceRaised, alignItems: "center", justifyContent: "center" },
  courtDetails: { flex: 1, gap: 4 },
  courtPrice: { color: COLORS.primary, fontSize: 14, fontWeight: "800", marginTop: 3 },
  activeDot: { width: 9, height: 9, borderRadius: 5 },
  infoPanel: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, padding: 14, gap: 7, backgroundColor: COLORS.surfaceRaised },
  infoTitle: { color: COLORS.primary, fontSize: 12, fontWeight: "800" },
  filterSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 2 },
  pendingText: { color: COLORS.orange, fontSize: 11, fontWeight: "800" },
  emptyState: { alignItems: "center", gap: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: 24 },
  bottomBar: { flexDirection: "row", paddingTop: 10, paddingBottom: 8, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  bottomItem: { flex: 1, alignItems: "center", gap: 5, paddingVertical: 4 },
  bottomLabel: { color: COLORS.muted, fontSize: 10, fontWeight: "600" },
  bottomLabelActive: { color: COLORS.primary },
});
