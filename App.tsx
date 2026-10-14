import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator, Alert, Platform, Pressable, SafeAreaView, ScrollView,
  StatusBar, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle,
} from "react-native";
import {
  ArrowLeft, CalendarDays, Check, ChevronRight, Clock3, Compass, Heart,
  Home, MapPin, Plus, Search, ShieldCheck, SlidersHorizontal,
  Trophy, Wallet, X, Volleyball, CircleDollarSign, ClipboardList,
} from "lucide-react-native";
import { mockVenue } from "./src/data/mockData";
import { loadCourts, loadReservations, saveCourts, saveReservations } from "./src/services/localStore";
import type { Court, Reservation, ReservationStatus } from "./src/types";
import { colors, radius, spacing } from "./src/design-system/tokens";
import { AppButton } from "./src/components/atoms/AppButton";
import { AppText } from "./src/components/atoms/AppText";
import { StatusBadge } from "./src/components/atoms/StatusBadge";
import { SectionHeading } from "./src/components/molecules/SectionHeading";
import { TimeSlot } from "./src/components/molecules/TimeSlot";

type Role = "Cliente" | "Gestão";
type Screen = "Início" | "Explorar" | "Reservas" | "Favoritos" | "Painel" | "Agenda" | "Quadras" | "booking";
type SportFilter = "Todas" | "Society" | "Vôlei";

const currency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });
const todayKey = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};
const dateOffset = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};
const dateLabel = (date: string, includeWeekday = false) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", includeWeekday
    ? { weekday: "short", day: "2-digit", month: "short" }
    : { day: "2-digit", month: "long" });
};
const initials = (value: string) => value.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();

function AppCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function ScreenTitle({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return <View style={styles.screenTitleWrap}>
    {eyebrow ? <AppText variant="caption" color={colors.success} weight="800">{eyebrow.toUpperCase()}</AppText> : null}
    <AppText variant="display">{title}</AppText>
    {subtitle ? <AppText color={colors.muted}>{subtitle}</AppText> : null}
  </View>;
}

function EmptyState({ icon, title, description, action, onAction }: { icon?: ReactNode; title: string; description: string; action?: string; onAction?: () => void }) {
  return <View style={styles.emptyState}>
    <View style={styles.emptyIcon}>{icon ?? <CalendarDays color={colors.muted} size={24} />}</View>
    <AppText variant="subtitle">{title}</AppText>
    <AppText color={colors.muted} style={styles.centerText}>{description}</AppText>
    {action && onAction ? <AppButton label={action} onPress={onAction} variant="secondary" /> : null}
  </View>;
}

function CourtCard({ court, venueName, onPress, favorite, onFavorite }: {
  court: Court; venueName: string; onPress: () => void; favorite: boolean; onFavorite: () => void;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Ver ${court.name}, ${currency(court.pricePerHour)} por hora`} onPress={onPress} style={({ pressed }) => [styles.venueCard, pressed && styles.pressed]}>
    <View style={styles.courtArtwork}>
      <View style={styles.artworkBadge}><Trophy size={14} color={colors.primary} /><Text style={styles.artworkBadgeText}>{court.sport}</Text></View>
      <View style={styles.fieldLines}><View style={styles.fieldCircle} /><View style={styles.fieldMidline} /></View>
      <Pressable accessibilityRole="button" accessibilityLabel={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} hitSlop={10} onPress={(event) => { event.stopPropagation(); onFavorite(); }} style={styles.favoriteButton}>
        <Heart size={19} color={favorite ? colors.danger : colors.primary} fill={favorite ? colors.danger : "transparent"} />
      </Pressable>
      <View style={styles.artworkCaption}><Text style={styles.artworkVenue}>{venueName}</Text><View style={styles.artworkLocation}><MapPin size={12} color="#FFFFFF" /><Text style={styles.artworkLocationText}>Crato, CE</Text></View></View>
    </View>
    <View style={styles.venueCardBody}>
      <View style={styles.venueTitleRow}>
        <View style={{ flex: 1, gap: 3 }}><AppText variant="subtitle">{court.name}</AppText><AppText variant="small" color={colors.muted}>Reserva por hora · Consulte horários</AppText></View>
        <View style={styles.priceBlock}><AppText variant="subtitle" weight="800">{currency(court.pricePerHour)}</AppText><AppText variant="caption" color={colors.muted}>/ hora</AppText></View>
      </View>
      <View style={styles.venueFooter}><View style={styles.availableTag}><View style={styles.availableDot} /><AppText variant="caption" color={colors.success} weight="700">Consulte disponibilidade</AppText></View><ChevronRight color={colors.muted} size={19} /></View>
    </View>
  </Pressable>;
}

function ReservationCard({ reservation, court, ownerMode, onStatus }: {
  reservation: Reservation; court?: Court; ownerMode: boolean; onStatus: (reservation: Reservation, status: ReservationStatus) => void;
}) {
  return <AppCard>
    <View style={styles.reservationHeader}>
      <View style={styles.reservationAvatar}><AppText color={colors.primary} weight="800">{initials(reservation.customerName)}</AppText></View>
      <View style={{ flex: 1, gap: 3 }}>
        <AppText weight="700">{ownerMode ? reservation.customerName : (court?.name ?? "Quadra")}</AppText>
        <AppText variant="small" color={colors.muted}>{ownerMode ? (court?.name ?? "Quadra") : mockVenue.name}</AppText>
      </View>
      <StatusBadge status={reservation.status} />
    </View>
    <View style={styles.reservationDetails}>
      <View style={styles.metaLine}><CalendarDays size={15} color={colors.success} /><AppText variant="small">{dateLabel(reservation.date, true)}</AppText></View>
      <View style={styles.metaLine}><Clock3 size={15} color={colors.success} /><AppText variant="small">{reservation.startTime}–{reservation.endTime}</AppText></View>
      <View style={styles.metaLine}><CircleDollarSign size={15} color={colors.success} /><AppText variant="small" weight="700">{currency(court?.pricePerHour ?? 0)}</AppText></View>
    </View>
    {ownerMode && reservation.status === "Pendente" ? <View style={styles.inlineActions}>
      <View style={{ flex: 1 }}><AppButton label="Confirmar" onPress={() => onStatus(reservation, "Confirmada")} compact icon={<Check size={15} color={colors.primary} />} /></View>
      <View style={{ flex: 1 }}><AppButton label="Recusar" onPress={() => onStatus(reservation, "Cancelada")} compact variant="danger" icon={<X size={15} color={colors.danger} />} /></View>
    </View> : null}
    {!ownerMode && (reservation.status === "Pendente" || reservation.status === "Confirmada") ? <AppButton label="Cancelar reserva" onPress={() => onStatus(reservation, "Cancelada")} compact variant="danger" icon={<X size={15} color={colors.danger} />} /> : null}
    {ownerMode && reservation.status === "Confirmada" ? <View style={styles.inlineActions}>
      <View style={{ flex: 1 }}><AppButton label="Concluir reserva" onPress={() => onStatus(reservation, "Concluída")} compact variant="secondary" icon={<Check size={15} color={colors.success} />} /></View>
      <View style={{ flex: 1 }}><AppButton label="Cancelar" onPress={() => onStatus(reservation, "Cancelada")} compact variant="danger" icon={<X size={15} color={colors.danger} />} /></View>
    </View> : null}
  </AppCard>;
}

export default function App() {
  const [role, setRole] = useState<Role>("Cliente");
  const [screen, setScreen] = useState<Screen>("Início");
  const [courts, setCourts] = useState<Court[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState<SportFilter>("Todas");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [showCourtForm, setShowCourtForm] = useState(false);
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [editingCourtPrice, setEditingCourtPrice] = useState("");
  const [courtName, setCourtName] = useState("");
  const [courtPrice, setCourtPrice] = useState("");
  const [courtSport, setCourtSport] = useState<"Society" | "Vôlei">("Society");

  const refresh = useCallback(async () => {
    try {
      const [loadedCourts, loadedReservations] = await Promise.all([loadCourts(), loadReservations()]);
      setCourts(loadedCourts);
      setReservations(loadedReservations);
    } catch {
      Alert.alert("Não foi possível carregar", "Tente fechar e abrir o aplicativo novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const selectedCourt = courts.find(court => court.id === selectedCourtId);
  const activeCourts = courts.filter(court => court.active);
  const filteredCourts = useMemo(() => activeCourts.filter(court => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    const matchesQuery = !query || court.name.toLocaleLowerCase("pt-BR").includes(query) || mockVenue.name.toLocaleLowerCase("pt-BR").includes(query) || mockVenue.city.toLocaleLowerCase("pt-BR").includes(query);
    return matchesQuery && (sportFilter === "Todas" || court.sport === sportFilter);
  }), [activeCourts, search, sportFilter]);
  const customerReservations = reservations.filter(item =>
    item.customerName.toLocaleLowerCase("pt-BR") === customerName.trim().toLocaleLowerCase("pt-BR")
    && customerName.trim().length > 0
    && (!customerPhone.replace(/\\D/g, "") || item.phone.replace(/\\D/g, "") === customerPhone.replace(/\\D/g, ""))
  );
  const todayReservations = reservations.filter(item => item.date === todayKey() && item.status !== "Cancelada");
  const pendingCount = reservations.filter(item => item.status === "Pendente").length;
  const reservedValue = todayReservations.filter(item => item.status === "Confirmada" || item.status === "Concluída").reduce((sum, item) => sum + (courts.find(c => c.id === item.courtId)?.pricePerHour ?? 0), 0);
  const timeSlots = Array.from({ length: 16 }, (_, index) => `${String(index + 7).padStart(2, "0")}:00`);
  const isSlotTaken = (courtId: string, date: string, startTime: string) => reservations.some(item => item.courtId === courtId && item.date === date && item.startTime === startTime && item.status !== "Cancelada");

  const changeStatus = (reservation: Reservation, status: ReservationStatus) => {
    Alert.alert(status === "Cancelada" ? "Cancelar esta reserva?" : `${status} reserva?`, `${reservation.customerName} · ${reservation.date} · ${reservation.startTime}`, [
      { text: "Voltar", style: "cancel" },
      { text: "Confirmar", style: status === "Cancelada" ? "destructive" : "default", onPress: () => {
        const updated = reservations.map(item => item.id === reservation.id ? { ...item, status } : item);
        setReservations(updated);
        void saveReservations(updated).catch(() => Alert.alert("Erro ao salvar", "A alteração não foi salva neste dispositivo."));
      } },
    ]);
  };

  const openBooking = (court: Court) => {
    setSelectedCourtId(court.id);
    setSelectedDate(todayKey());
    setSelectedTime(null);
    setBookingNote("");
    setScreen("booking");
  };

  const submitBooking = async () => {
    if (!selectedCourt || !customerName.trim() || customerPhone.replace(/\D/g, "").length < 10 || !selectedTime) {
      Alert.alert("Confira seus dados", "Informe nome, telefone válido, data e horário para continuar.");
      return;
    }
    if (isSlotTaken(selectedCourt.id, selectedDate, selectedTime)) {
      Alert.alert("Horário indisponível", "Alguém acabou de solicitar esse horário. Escolha outro.");
      setSelectedTime(null);
      return;
    }
    const hour = Number(selectedTime.slice(0, 2));
    const newReservation: Reservation = {
      id: `res-${Date.now()}`, customerName: customerName.trim(), phone: customerPhone.trim(),
      courtId: selectedCourt.id, date: selectedDate, startTime: selectedTime,
      endTime: `${String(hour + 1).padStart(2, "0")}:00`, status: "Pendente",
      notes: bookingNote.trim() || undefined,
    };
    const updated = [newReservation, ...reservations];
    try {
      await saveReservations(updated);
      setReservations(updated);
      setSelectedTime(null);
      setScreen("Reservas");
      Alert.alert("Solicitação enviada", "Sua reserva está aguardando a confirmação do estabelecimento. O pagamento é feito diretamente ao local.");
    } catch {
      Alert.alert("Não foi possível reservar", "Seus dados continuam na tela. Tente novamente.");
    }
  };

  const addCourt = async () => {
    const price = Number(courtPrice.replace(",", "."));
    if (!courtName.trim() || !Number.isFinite(price) || price <= 0) {
      Alert.alert("Confira os dados", "Informe o nome da quadra e um preço por hora maior que zero.");
      return;
    }
    const updated = [...courts, { id: `court-${Date.now()}`, name: courtName.trim(), sport: courtSport, pricePerHour: price, active: true }];
    try {
      await saveCourts(updated);
      setCourts(updated);
      setCourtName("");
      setCourtPrice("");
      setShowCourtForm(false);
    } catch {
      Alert.alert("Erro ao salvar", "Não foi possível salvar a quadra neste dispositivo.");
    }
  };

  const toggleCourt = async (court: Court) => {
    const updated = courts.map(item => item.id === court.id ? { ...item, active: !item.active } : item);
    try { await saveCourts(updated); setCourts(updated); }
    catch { Alert.alert("Erro ao salvar", "Não foi possível atualizar a quadra."); }
  };

  const updateCourtPrice = async (court: Court) => {
    const price = Number(editingCourtPrice.replace(",", "."));
    if (!Number.isFinite(price) || price <= 0) {
      Alert.alert("Preço inválido", "Informe um valor por hora maior que zero.");
      return;
    }
    const updated = courts.map(item => item.id === court.id ? { ...item, pricePerHour: price } : item);
    try {
      await saveCourts(updated);
      setCourts(updated);
      setEditingCourtId(null);
      setEditingCourtPrice("");
    } catch {
      Alert.alert("Erro ao salvar", "Não foi possível atualizar o preço.");
    }
  };

  const toggleFavorite = (courtId: string) => setFavorites(previous => previous.includes(courtId) ? previous.filter(id => id !== courtId) : [...previous, courtId]);

  const switchRole = (nextRole: Role) => {
    setRole(nextRole);
    setScreen(nextRole === "Cliente" ? "Início" : "Painel");
  };

  const navItems = role === "Cliente"
    ? [
      { label: "Início" as Screen, icon: Home },
      { label: "Explorar" as Screen, icon: Compass },
      { label: "Reservas" as Screen, icon: CalendarDays },
      { label: "Favoritos" as Screen, icon: Heart },
    ]
    : [
      { label: "Painel" as Screen, icon: Home },
      { label: "Agenda" as Screen, icon: CalendarDays },
      { label: "Quadras" as Screen, icon: Trophy },
      { label: "Reservas" as Screen, icon: ClipboardList },
    ];

  const renderCourtList = (list: Court[]) => list.length ? list.map(court => (
    <CourtCard key={court.id} court={court} venueName={mockVenue.name} onPress={() => openBooking(court)}
      favorite={favorites.includes(court.id)} onFavorite={() => toggleFavorite(court.id)} />
  )) : <EmptyState icon={<Search color={colors.muted} size={24} />} title="Nenhuma quadra encontrada" description="Tente mudar a busca ou remover alguns filtros." action="Limpar filtros" onAction={() => { setSearch(""); setSportFilter("Todas"); }} />;

  if (loading) return <SafeAreaView style={styles.loading}><StatusBar barStyle="dark-content" /><ActivityIndicator color={colors.success} size="large" /><AppText color={colors.muted}>Preparando sua experiência...</AppText></SafeAreaView>;

  return <SafeAreaView style={styles.safe}>
    <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
    <View style={styles.topBar}>
      <View style={styles.brandLockup}>
        <View style={styles.brandIcon}><Trophy size={20} color={colors.accent} strokeWidth={2.5} /></View>
        <View><AppText variant="subtitle" weight="800">CaririPlay</AppText><View style={styles.locationInline}><MapPin size={12} color={colors.muted} /><AppText variant="caption" color={colors.muted}>{role === "Cliente" ? "Esporte perto de você" : mockVenue.name + " · " + mockVenue.city}</AppText></View></View>
      </View>
      <View style={styles.roleSwitcher}>
        {(["Cliente", "Gestão"] as Role[]).map(item => <Pressable key={item} onPress={() => switchRole(item)} accessibilityRole="button" accessibilityState={{ selected: role === item }} style={[styles.roleOption, role === item && styles.roleOptionActive]}><AppText variant="caption" weight="700" color={role === item ? "#FFFFFF" : colors.muted}>{item}</AppText></Pressable>)}
      </View>
    </View>

    {screen === "booking" ? <View style={styles.bookingTop}><Pressable onPress={() => setScreen("Explorar")} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Voltar para explorar"><ArrowLeft size={20} color={colors.text} /></Pressable><View style={{ flex: 1 }}><AppText variant="subtitle">Reservar quadra</AppText><AppText variant="small" color={colors.muted}>Revise os detalhes antes de enviar</AppText></View></View> : null}

    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {role === "Cliente" && screen === "Início" ? <>
        <View style={styles.hero}>
          <View style={styles.heroTopline}><View style={styles.livePill}><View style={styles.availableDot} /><AppText variant="caption" color={colors.success} weight="800">CARIRI, VAMOS JOGAR?</AppText></View><Volleyball color="#B9F36B" size={25} /></View>
          <AppText variant="display" color="#FFFFFF" style={styles.heroTitle}>Seu próximo jogo começa aqui.</AppText>
          <AppText color="#D0DBD2">Encontre uma quadra, escolha o horário e combine o jogo com sua turma.</AppText>
          <Pressable style={styles.searchBox} onPress={() => setScreen("Explorar")} accessibilityRole="button" accessibilityLabel="Buscar quadras e horários"><Search size={19} color={colors.muted} /><AppText color={colors.muted} style={{ flex: 1 }}>Qual quadra você procura?</AppText><ChevronRight size={18} color={colors.muted} /></Pressable>
          <View style={styles.cityChip}><MapPin size={14} color="#FFFFFF" /><AppText variant="small" color="#FFFFFF">Crato · Juazeiro · Barbalha</AppText></View>
        </View>
        <View style={styles.sportSection}>
          <SectionHeading title="Qual é o jogo?" subtitle="Escolha sua modalidade" />
          <View style={styles.sportCards}>
            <Pressable style={styles.sportCard} onPress={() => { setSportFilter("Society"); setScreen("Explorar"); }}><View style={[styles.sportIcon, { backgroundColor: "#E7F5EB" }]}><Trophy size={22} color={colors.success} /></View><AppText weight="700">Society</AppText><AppText variant="caption" color={colors.muted}>Futebol</AppText></Pressable>
            <Pressable style={styles.sportCard} onPress={() => { setSportFilter("Vôlei"); setScreen("Explorar"); }}><View style={[styles.sportIcon, { backgroundColor: "#FFF3D8" }]}><Volleyball size={22} color={colors.warning} /></View><AppText weight="700">Vôlei</AppText><AppText variant="caption" color={colors.muted}>Quadras</AppText></Pressable>
            <Pressable style={styles.sportCard} onPress={() => { setSportFilter("Todas"); setScreen("Explorar"); }}><View style={[styles.sportIcon, { backgroundColor: "#EAF0FA" }]}><Compass size={22} color="#3D62A6" /></View><AppText weight="700">Ver tudo</AppText><AppText variant="caption" color={colors.muted}>Explorar</AppText></Pressable>
          </View>
        </View>
        <SectionHeading title="Quadras para conhecer" subtitle="Confira preços e consulte horários" action="Ver todas" />
        {renderCourtList(activeCourts.slice(0, 3))}
        <View style={styles.trustStrip}><ShieldCheck size={19} color={colors.success} /><View style={{ flex: 1, gap: 2 }}><AppText weight="700">Sem surpresas na reserva</AppText><AppText variant="small" color={colors.muted}>Você vê o preço antes de enviar a solicitação. O pagamento é feito direto ao estabelecimento.</AppText></View></View>
      </> : null}

      {role === "Cliente" && screen === "Explorar" ? <>
        <ScreenTitle eyebrow="Marketplace esportivo" title="Encontre sua quadra" subtitle="Compare espaços e escolha o melhor horário para jogar." />
        <View style={styles.searchInputWrap}><Search size={19} color={colors.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Quadra, estabelecimento ou cidade" placeholderTextColor={colors.muted} style={styles.searchInput} returnKeyType="search" accessibilityLabel="Buscar quadras" /><Pressable onPress={() => { setSearch(""); setSportFilter("Todas"); }} accessibilityRole="button" accessibilityLabel="Limpar busca"><SlidersHorizontal size={18} color={colors.success} /></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(["Todas", "Society", "Vôlei"] as SportFilter[]).map(filter => <Pressable key={filter} onPress={() => setSportFilter(filter)} style={[styles.filterChip, sportFilter === filter && styles.filterChipActive]}><AppText variant="small" weight="700" color={sportFilter === filter ? "#FFFFFF" : colors.muted}>{filter}</AppText></Pressable>)}
        </ScrollView>
        <AppText variant="small" color={colors.muted}>{filteredCourts.length} {filteredCourts.length === 1 ? "quadra encontrada" : "quadras encontradas"}</AppText>
        {renderCourtList(filteredCourts)}
      </> : null}

      {role === "Cliente" && screen === "booking" ? <>
        {selectedCourt ? <>
          <View style={styles.bookingCourtSummary}><View style={styles.bookingSportIcon}><Trophy size={22} color={colors.success} /></View><View style={{ flex: 1, gap: 3 }}><AppText variant="subtitle">{selectedCourt.name}</AppText><AppText variant="small" color={colors.muted}>{mockVenue.name} · {mockVenue.city} · {selectedCourt.sport}</AppText></View><View style={{ alignItems: "flex-end" }}><AppText variant="subtitle" weight="800">{currency(selectedCourt.pricePerHour)}</AppText><AppText variant="caption" color={colors.muted}>por hora</AppText></View></View>
          <SectionHeading title="1. Escolha o dia" subtitle="Selecione uma data para consultar horários." />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateOptions}>
            {Array.from({ length: 7 }, (_, i) => dateOffset(i)).map((date, i) => <Pressable key={date} onPress={() => { setSelectedDate(date); setSelectedTime(null); }} style={[styles.dateOption, selectedDate === date && styles.dateOptionActive]}><AppText variant="caption" color={selectedDate === date ? colors.accent : colors.muted} weight="700">{i === 0 ? "HOJE" : i === 1 ? "AMANHÃ" : dateLabel(date).split(" de ")[0].toUpperCase()}</AppText><AppText variant="subtitle" color={selectedDate === date ? "#FFFFFF" : colors.text}>{date.slice(8, 10)}</AppText><AppText variant="caption" color={selectedDate === date ? "#D0DBD2" : colors.muted}>{dateLabel(date).split(" de ")[1]?.slice(0, 3) ?? ""}</AppText></Pressable>)}
          </ScrollView>
          <SectionHeading title="2. Escolha o horário" subtitle={`Disponibilidade para ${dateLabel(selectedDate)}`} />
          {availableSlots.length ? <View style={styles.timeGrid}>{timeSlots.map(time => <TimeSlot key={time} time={time} selected={selectedTime === time} unavailable={isSlotTaken(selectedCourt.id, selectedDate, time)} onPress={() => setSelectedTime(time)} />)}</View> : <EmptyState title="Sem horários livres" description="Escolha outro dia para ver novas opções." />}
          <SectionHeading title="3. Seus dados" subtitle="O estabelecimento usará essas informações para confirmar a solicitação." />
          <AppCard style={{ gap: 13 }}>
            <View style={styles.formField}><AppText variant="small" weight="700">Nome completo</AppText><TextInput value={customerName} onChangeText={setCustomerName} placeholder="Como podemos te chamar?" placeholderTextColor={colors.muted} style={styles.input} autoCapitalize="words" accessibilityLabel="Nome completo" /></View>
            <View style={styles.formField}><AppText variant="small" weight="700">Telefone / WhatsApp</AppText><TextInput value={customerPhone} onChangeText={setCustomerPhone} placeholder="(88) 99999-9999" placeholderTextColor={colors.muted} style={styles.input} keyboardType="phone-pad" accessibilityLabel="Telefone ou WhatsApp" /></View>
            <View style={styles.formField}><AppText variant="small" weight="700">Observação (opcional)</AppText><TextInput value={bookingNote} onChangeText={setBookingNote} placeholder="Ex.: vamos levar coletes" placeholderTextColor={colors.muted} style={[styles.input, styles.noteInput]} multiline accessibilityLabel="Observação da reserva" /></View>
          </AppCard>
          <View style={styles.bookingTotal}><View style={{ flex: 1, gap: 3 }}><AppText variant="small" color={colors.muted}>Total estimado · 1 hora</AppText><AppText variant="heading">{currency(selectedCourt.pricePerHour)}</AppText></View><AppText variant="caption" color={colors.muted}>Pagamento direto ao local</AppText></View>
          <AppButton label="Solicitar reserva" onPress={() => void submitBooking()} disabled={!selectedTime || !customerName.trim() || customerPhone.replace(/\D/g, "").length < 10} icon={<ChevronRight size={18} color={colors.primary} />} />
          <AppText variant="caption" color={colors.muted} style={styles.centerText}>Sua solicitação ficará pendente até o estabelecimento confirmar. Nenhum pagamento é processado pelo CaririPlay.</AppText>
        </> : <EmptyState title="Quadra não encontrada" description="Volte para explorar e selecione uma quadra." action="Explorar quadras" onAction={() => setScreen("Explorar")} />}
      </> : null}

      {role === "Cliente" && screen === "Reservas" ? <>
        <ScreenTitle eyebrow="Seus jogos" title="Minhas reservas" subtitle="Acompanhe suas solicitações e os próximos jogos." />
        <AppCard style={{ gap: 10 }}><AppText weight="700">Consultar por telefone</AppText><TextInput value={customerPhone} onChangeText={setCustomerPhone} placeholder="Digite o telefone usado na reserva" placeholderTextColor={colors.muted} style={styles.input} keyboardType="phone-pad" /><AppText variant="caption" color={colors.muted}>Nesta demonstração, informe também o nome utilizado ao reservar para localizar os registros.</AppText><TextInput value={customerName} onChangeText={setCustomerName} placeholder="Nome utilizado na reserva" placeholderTextColor={colors.muted} style={styles.input} /></AppCard>
        {customerReservations.length ? customerReservations.map(item => <ReservationCard key={item.id} reservation={item} court={courts.find(c => c.id === item.courtId)} ownerMode={false} onStatus={changeStatus} />) : <EmptyState icon={<CalendarDays size={24} color={colors.muted} />} title="Suas reservas aparecerão aqui" description="Informe o mesmo nome utilizado ao solicitar a reserva. Na versão com conta, você verá seu histórico automaticamente." action="Encontrar quadra" onAction={() => setScreen("Explorar")} />}
      </> : null}

      {role === "Cliente" && screen === "Favoritos" ? <>
        <ScreenTitle eyebrow="Salvos para depois" title="Seus favoritos" subtitle="Acesse rapidamente as quadras que você gostou." />
        {renderCourtList(activeCourts.filter(court => favorites.includes(court.id)))}
      </> : null}

      {role === "Gestão" && screen === "Painel" ? <>
        <View style={styles.ownerHero}><AppText variant="caption" color={colors.accent} weight="800">ÁREA DO ESTABELECIMENTO</AppText><AppText variant="display" color="#FFFFFF">Bom dia, Arena Cariri.</AppText><AppText color="#D0DBD2">Aqui está o resumo da sua operação.</AppText><View style={styles.ownerHeroFooter}><View style={styles.ownerHeroMeta}><MapPin size={14} color="#D0DBD2" /><AppText variant="small" color="#D0DBD2">{mockVenue.city}</AppText></View><View style={styles.ownerHeroMeta}><Clock3 size={14} color="#D0DBD2" /><AppText variant="small" color="#D0DBD2">{mockVenue.openingTime}–{mockVenue.closingTime}</AppText></View></View></View>
        <View style={styles.statsGrid}>
          <AppCard style={styles.statCard}><View style={styles.statIcon}><CalendarDays color={colors.success} size={18} /></View><AppText variant="heading">{todayReservations.length}</AppText><AppText variant="small" color={colors.muted}>Reservas hoje</AppText></AppCard>
          <AppCard style={styles.statCard}><View style={styles.statIcon}><Clock3 color={colors.warning} size={18} /></View><AppText variant="heading">{pendingCount}</AppText><AppText variant="small" color={colors.muted}>Aguardando</AppText></AppCard>
          <AppCard style={styles.statCard}><View style={styles.statIcon}><ShieldCheck color={colors.success} size={18} /></View><AppText variant="heading">{todayReservations.filter(r => r.status === "Confirmada").length}</AppText><AppText variant="small" color={colors.muted}>Confirmadas hoje</AppText></AppCard>
          <AppCard style={styles.statCard}><View style={styles.statIcon}><Wallet color={colors.success} size={18} /></View><AppText variant="heading" style={{ fontSize: 20 }}>{currency(reservedValue)}</AppText><AppText variant="small" color={colors.muted}>Valor reservado*</AppText></AppCard>
        </View>
        <SectionHeading title="Precisa da sua atenção" subtitle="Solicitações esperando resposta" action={pendingCount ? `${pendingCount} pendente(s)` : undefined} />
        {reservations.filter(r => r.status === "Pendente").length ? reservations.filter(r => r.status === "Pendente").map(item => <ReservationCard key={item.id} reservation={item} court={courts.find(c => c.id === item.courtId)} ownerMode onStatus={changeStatus} />) : <EmptyState title="Tudo em dia!" description="Você não tem solicitações pendentes." />}
        <AppText variant="caption" color={colors.muted}>*Valor estimado de reservas confirmadas ou concluídas, não representa pagamento recebido.</AppText>
        <AppButton label="Abrir agenda" onPress={() => setScreen("Agenda")} icon={<CalendarDays size={17} color={colors.primary} />} />
      </> : null}

      {role === "Gestão" && screen === "Agenda" ? <>
        <ScreenTitle eyebrow="Operação" title="Agenda" subtitle={`Reservas do dia · ${dateLabel(todayKey())}`} />
        <View style={styles.dateCard}><CalendarDays size={20} color={colors.success} /><View style={{ flex: 1 }}><AppText weight="700">Hoje</AppText><AppText variant="small" color={colors.muted}>{mockVenue.openingTime}–{mockVenue.closingTime}</AppText></View><AppText variant="small" color={colors.success} weight="700">{todayReservations.length} reserva(s)</AppText></View>
        {activeCourts.map(court => {
          const items = todayReservations.filter(item => item.courtId === court.id).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return <AppCard key={court.id} style={{ gap: 12 }}><View style={styles.courtScheduleHeader}><View style={{ flex: 1, gap: 2 }}><AppText weight="700">{court.name}</AppText><AppText variant="small" color={colors.muted}>{court.sport}</AppText></View><AppText variant="small" weight="700">{currency(court.pricePerHour)}/h</AppText></View>{items.length ? items.map(item => <View key={item.id} style={styles.agendaRow}><View style={styles.agendaTime}><AppText weight="800">{item.startTime}</AppText><AppText variant="caption" color={colors.muted}>{item.endTime}</AppText></View><View style={styles.agendaBar}><AppText weight="700">{item.customerName}</AppText><AppText variant="caption" color={colors.muted}>{item.status}</AppText></View></View>) : <AppText variant="small" color={colors.muted}>Nenhuma reserva para hoje.</AppText>}</AppCard>;
        })}
      </> : null}

      {role === "Gestão" && screen === "Quadras" ? <>
        <ScreenTitle eyebrow="Seu espaço" title="Quadras" subtitle="Gerencie modalidades, preços e disponibilidade." />
        <AppButton label={showCourtForm ? "Fechar formulário" : "Adicionar quadra"} onPress={() => setShowCourtForm(value => !value)} icon={showCourtForm ? <X size={17} color={colors.primary} /> : <Plus size={17} color={colors.primary} />} />
        {showCourtForm ? <AppCard style={{ gap: 14 }}><AppText variant="subtitle">Nova quadra</AppText><View style={styles.formField}><AppText variant="small" weight="700">Nome da quadra</AppText><TextInput value={courtName} onChangeText={setCourtName} placeholder="Ex.: Society 3" placeholderTextColor={colors.muted} style={styles.input} /></View><View style={styles.formField}><AppText variant="small" weight="700">Modalidade</AppText><View style={styles.sportToggle}>{(["Society", "Vôlei"] as const).map(sport => <Pressable key={sport} onPress={() => setCourtSport(sport)} style={[styles.sportToggleItem, courtSport === sport && styles.sportToggleActive]}><AppText weight="700" color={courtSport === sport ? "#FFFFFF" : colors.muted}>{sport}</AppText></Pressable>)}</View></View><View style={styles.formField}><AppText variant="small" weight="700">Preço por hora (R$)</AppText><TextInput value={courtPrice} onChangeText={setCourtPrice} placeholder="Ex.: 120" placeholderTextColor={colors.muted} style={styles.input} keyboardType="decimal-pad" /></View><AppButton label="Salvar quadra" onPress={() => void addCourt()} /></AppCard> : null}
        {courts.map(court => <AppCard key={court.id} style={styles.manageCourtCard}><View style={styles.bookingSportIcon}><Trophy size={22} color={colors.success} /></View><View style={{ flex: 1, gap: 5 }}><AppText variant="subtitle">{court.name}</AppText><AppText variant="small" color={colors.muted}>{court.sport} · {currency(court.pricePerHour)}/hora</AppText><View style={[styles.activePill, { backgroundColor: court.active ? colors.successSoft : colors.surfaceMuted }]}><AppText variant="caption" color={court.active ? colors.success : colors.muted} weight="700">{court.active ? "Ativa no catálogo" : "Oculta do catálogo"}</AppText></View>{editingCourtId === court.id ? <View style={{ gap: 7, marginTop: 5 }}><TextInput value={editingCourtPrice} onChangeText={setEditingCourtPrice} placeholder="Novo preço por hora" placeholderTextColor={colors.muted} keyboardType="decimal-pad" style={styles.input} accessibilityLabel="Novo preço por hora" /><View style={styles.inlineActions}><View style={{ flex: 1 }}><AppButton label="Salvar preço" onPress={() => void updateCourtPrice(court)} compact /></View><View style={{ flex: 1 }}><AppButton label="Cancelar" onPress={() => setEditingCourtId(null)} variant="secondary" compact /></View></View></View> : <Pressable accessibilityRole="button" onPress={() => { setEditingCourtId(court.id); setEditingCourtPrice(String(court.pricePerHour)); }} style={styles.editPriceLink}><AppText variant="caption" color={colors.success} weight="800">Editar preço</AppText></Pressable>}</View><AppButton label={court.active ? "Desativar" : "Ativar"} onPress={() => void toggleCourt(court)} variant="secondary" compact /></AppCard>)}
      </> : null}

      {role === "Gestão" && screen === "Reservas" ? <>
        <ScreenTitle eyebrow="Todos os agendamentos" title="Reservas" subtitle="Confirme solicitações e acompanhe o status de cada jogo." />
        <View style={styles.filterSummary}><AppText variant="small" color={colors.muted}>{reservations.length} registros</AppText><AppText variant="small" color={colors.warning} weight="700">{pendingCount} pendentes</AppText></View>
        {reservations.length ? reservations.slice().sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)).map(item => <ReservationCard key={item.id} reservation={item} court={courts.find(c => c.id === item.courtId)} ownerMode onStatus={changeStatus} />) : <EmptyState title="Nenhuma reserva ainda" description="Quando os clientes solicitarem horários, eles aparecerão aqui." />}
      </> : null}
    </ScrollView>

    {screen !== "booking" ? <View style={styles.bottomNav}>
      {navItems.map(({ label, icon: Icon }) => <Pressable key={label} onPress={() => setScreen(label)} accessibilityRole="button" accessibilityState={{ selected: screen === label }} style={styles.bottomNavItem}>
        <View style={[styles.bottomIconWrap, screen === label && styles.bottomIconActive]}><Icon size={19} color={screen === label ? colors.primary : colors.muted} /></View>
        <AppText variant="caption" weight={screen === label ? "800" : "500"} color={screen === label ? colors.primary : colors.muted}>{label}</AppText>
      </Pressable>)}
    </View> : null}
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, backgroundColor: colors.background },
  topBar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  brandLockup: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  brandIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  locationInline: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 1 },
  roleSwitcher: { flexDirection: "row", padding: 3, backgroundColor: colors.surfaceMuted, borderRadius: radius.md },
  roleOption: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9 },
  roleOptionActive: { backgroundColor: colors.primary },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: 28, gap: spacing.lg },
  screenTitleWrap: { gap: spacing.xs, marginTop: spacing.sm, marginBottom: spacing.xs },
  hero: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md, overflow: "hidden" },
  heroTopline: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#E7F5EB", paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill },
  heroTitle: { lineHeight: 35, letterSpacing: -0.8 },
  searchBox: { backgroundColor: colors.surface, minHeight: 52, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs },
  cityChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  sportSection: { gap: spacing.sm },
  sportCards: { flexDirection: "row", gap: spacing.sm },
  sportCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 4 },
  sportIcon: { width: 42, height: 42, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  venueCard: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, overflow: "hidden", marginBottom: spacing.xs },
  pressed: { opacity: 0.82 },
  courtArtwork: { height: 154, backgroundColor: "#1C5B3B", padding: spacing.md, justifyContent: "space-between", overflow: "hidden" },
  artworkBadge: { zIndex: 1, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.accent, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill },
  artworkBadgeText: { color: colors.primary, fontSize: 11, fontWeight: "800" },
  fieldLines: { position: "absolute", top: 18, left: 20, right: 20, bottom: 18, borderWidth: 1.5, borderColor: "#FFFFFF55", borderRadius: 8, justifyContent: "center", alignItems: "center" },
  fieldCircle: { width: 74, height: 74, borderRadius: 37, borderWidth: 1.5, borderColor: "#FFFFFF55" },
  fieldMidline: { position: "absolute", left: 0, right: 0, height: 1.5, backgroundColor: "#FFFFFF55" },
  favoriteButton: { position: "absolute", right: 14, top: 14, width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", zIndex: 2 },
  artworkCaption: { zIndex: 1, gap: 3 },
  artworkVenue: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  artworkLocation: { flexDirection: "row", alignItems: "center", gap: 4 },
  artworkLocationText: { color: "#FFFFFF", fontSize: 11 },
  venueCardBody: { padding: spacing.lg, gap: spacing.md },
  venueTitleRow: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  priceBlock: { alignItems: "flex-end" },
  venueFooter: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  availableTag: { flexDirection: "row", alignItems: "center", gap: 6 },
  availableDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.success },
  trustStrip: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.successSoft, padding: spacing.lg, borderRadius: radius.lg, alignItems: "flex-start" },
  searchInputWrap: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 52 },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: spacing.sm },
  filters: { gap: spacing.sm, paddingVertical: 2 },
  filterChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  emptyState: { alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xxl },
  emptyIcon: { width: 50, height: 50, backgroundColor: colors.surfaceMuted, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  centerText: { textAlign: "center" },
  bookingTop: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  backButton: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  bookingCourtSummary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.md },
  bookingSportIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" },
  dateOptions: { gap: spacing.sm, paddingVertical: 2 },
  dateOption: { width: 76, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: "center", paddingVertical: spacing.md, gap: 3 },
  dateOptionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  formField: { gap: spacing.sm },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, backgroundColor: colors.surface, fontSize: 14 },
  noteInput: { minHeight: 78, textAlignVertical: "top" },
  bookingTotal: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surfaceMuted, borderRadius: radius.lg, padding: spacing.lg },
  reservationHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  reservationAvatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  reservationDetails: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, gap: spacing.sm },
  metaLine: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  inlineActions: { flexDirection: "row", gap: spacing.sm },
  ownerHero: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md },
  ownerHeroFooter: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg, marginTop: spacing.sm },
  ownerHeroMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCard: { width: "48%", flexGrow: 1, flexBasis: "45%", padding: spacing.md, gap: spacing.sm },
  statIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.surfaceMuted, alignItems: "center", justifyContent: "center" },
  dateCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, borderRadius: radius.lg },
  courtScheduleHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.md },
  agendaRow: { flexDirection: "row", gap: spacing.md, alignItems: "stretch" },
  agendaTime: { width: 48, justifyContent: "center", gap: 2 },
  agendaBar: { flex: 1, backgroundColor: colors.surfaceMuted, borderLeftWidth: 3, borderLeftColor: colors.accentPressed, borderRadius: radius.sm, padding: spacing.md, gap: 3 },
  filterSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sportToggle: { flexDirection: "row", gap: spacing.sm },
  sportToggleItem: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, alignItems: "center", padding: spacing.md, backgroundColor: colors.surface },
  sportToggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  manageCourtCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  activePill: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, marginTop: 3 },
  bottomNav: { flexDirection: "row", paddingTop: spacing.sm, paddingBottom: Platform.OS === "ios" ? spacing.lg : spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  bottomNavItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: spacing.xs },
  bottomIconWrap: { width: 54, height: 30, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  bottomIconActive: { backgroundColor: colors.accent },
});
