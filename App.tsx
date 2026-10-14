import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ActivityIndicator, Alert, Platform, Pressable, SafeAreaView, ScrollView, Share,
  StatusBar, StyleSheet, Text, TextInput, View, type StyleProp, type ViewStyle,
} from "react-native";
import {
  ArrowLeft, CalendarDays, Check, ChevronRight, Clock3, Compass, Heart,
  Home, MapPin, Plus, Search, ShieldCheck, SlidersHorizontal,
  Trophy, Wallet, X, Volleyball, CircleDollarSign, ClipboardList, Bell, Star, Share2, BadgePercent, Users, Trash2,
} from "lucide-react-native";
import { mockVenue } from "./src/data/mockData";
import { loadBlockedSlots, loadCourts, loadFavorites, loadNotifications, loadPromotions, loadReservations, loadReviews, loadStaff, saveBlockedSlots, saveCourts, saveFavorites, saveNotifications, savePromotions, saveReservations, saveReviews, saveStaff } from "./src/services/localStore";
import type { AppNotification, BlockedSlot, Court, Promotion, Reservation, ReservationStatus, Review, StaffMember } from "./src/types";
import { colors, radius, spacing } from "./src/design-system/tokens";
import { AppButton } from "./src/components/atoms/AppButton";
import { AppText } from "./src/components/atoms/AppText";
import { StatusBadge } from "./src/components/atoms/StatusBadge";
import { SectionHeading } from "./src/components/molecules/SectionHeading";
import { TimeSlot } from "./src/components/molecules/TimeSlot";

type Role = "Cliente" | "Gestão";
type Screen = "Início" | "Explorar" | "Reservas" | "Favoritos" | "Painel" | "Agenda" | "Quadras" | "Detalhes" | "Notificações" | "Avaliações" | "Promoções" | "Equipe" | "booking";
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
      <View style={styles.artworkCaption}><Text style={styles.artworkVenue}>{venueName}</Text><View style={styles.artworkLocation}><MapPin size={12} color="#FFFFFF" /><Text style={styles.artworkLocationText}>{court.city ?? "Crato, CE"}</Text></View></View>
    </View>
    <View style={styles.venueCardBody}>
      <View style={styles.venueTitleRow}>
        <View style={{ flex: 1, gap: 3 }}><AppText variant="subtitle">{court.name}</AppText><AppText variant="small" color={colors.muted}>{court.neighborhood ? court.neighborhood + " · " : ""}Reserva por hora</AppText></View>
        <View style={styles.priceBlock}><AppText variant="subtitle" weight="800">{currency(court.pricePerHour)}</AppText><AppText variant="caption" color={colors.muted}>/ hora</AppText></View>
      </View>
      <View style={styles.venueFooter}><View style={styles.availableTag}><View style={styles.availableDot} /><AppText variant="caption" color={colors.success} weight="700">Ver detalhes e horários</AppText></View><View style={styles.ratingInline}><Star size={14} color={colors.warning} fill={colors.warning} /><AppText variant="small" weight="800">{(court.rating ?? 0).toFixed(1)}</AppText><AppText variant="caption" color={colors.muted}>({court.reviewCount ?? 0})</AppText><ChevronRight color={colors.muted} size={19} /></View></View>
    </View>
  </Pressable>;
}

function ReservationCard({ reservation, court, ownerMode, onStatus, onReview }: {
  reservation: Reservation; court?: Court; ownerMode: boolean; onStatus: (reservation: Reservation, status: ReservationStatus) => void; onReview?: (reservation: Reservation) => void;
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
      <View style={styles.metaLine}><CircleDollarSign size={15} color={colors.success} /><AppText variant="small" weight="700">{currency(reservation.estimatedPrice ?? court?.pricePerHour ?? 0)}</AppText></View>
    </View>
    {ownerMode && reservation.status === "Pendente" ? <View style={styles.inlineActions}>
      <View style={{ flex: 1 }}><AppButton label="Confirmar" onPress={() => onStatus(reservation, "Confirmada")} compact icon={<Check size={15} color={colors.primary} />} /></View>
      <View style={{ flex: 1 }}><AppButton label="Recusar" onPress={() => onStatus(reservation, "Cancelada")} compact variant="danger" icon={<X size={15} color={colors.danger} />} /></View>
    </View> : null}
    {!ownerMode && (reservation.status === "Pendente" || reservation.status === "Confirmada") ? <AppButton label="Cancelar reserva" onPress={() => onStatus(reservation, "Cancelada")} compact variant="danger" icon={<X size={15} color={colors.danger} />} /> : null}
    {!ownerMode && reservation.status === "Concluída" && onReview ? <AppButton label="Avaliar esta quadra" onPress={() => onReview(reservation)} compact variant="secondary" icon={<Star size={15} color={colors.warning} />} /> : null}
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [priceFilter, setPriceFilter] = useState(0);
  const [litOnly, setLitOnly] = useState(false);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [selectedAgendaDate, setSelectedAgendaDate] = useState(todayKey());
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockCourtId, setBlockCourtId] = useState("");
  const [blockTime, setBlockTime] = useState("07:00");
  const [blockReason, setBlockReason] = useState("Manutenção");
  const [promotionTitle, setPromotionTitle] = useState("");
  const [promotionDescription, setPromotionDescription] = useState("");
  const [promotionDiscount, setPromotionDiscount] = useState("10");
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState<StaffMember["role"]>("Atendente");
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
      const [loadedCourts, loadedReservations, loadedFavorites, loadedReviews, loadedBlocks, loadedNotifications, loadedPromotions, loadedStaff] = await Promise.all([loadCourts(), loadReservations(), loadFavorites(), loadReviews(), loadBlockedSlots(), loadNotifications(), loadPromotions(), loadStaff()]);
      setCourts(loadedCourts); setReservations(loadedReservations); setFavorites(loadedFavorites); setReviews(loadedReviews); setBlockedSlots(loadedBlocks); setNotifications(loadedNotifications); setPromotions(loadedPromotions); setStaff(loadedStaff);
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
    const haystack = [court.name, court.venueName ?? mockVenue.name, court.city ?? mockVenue.city, court.neighborhood ?? "", court.description ?? "", ...(court.amenities ?? [])].join(" ").toLocaleLowerCase("pt-BR");
    const matchesQuery = !query || haystack.includes(query);
    return matchesQuery && (priceFilter === 0 || court.pricePerHour <= priceFilter) && (!litOnly || (court.amenities ?? []).some(item => item.toLocaleLowerCase("pt-BR").includes("iluminação"))) && (sportFilter === "Todas" || court.sport === sportFilter);
  }), [activeCourts, search, sportFilter, priceFilter, litOnly]);
  const customerReservations = reservations.filter(item =>
    item.customerName.toLocaleLowerCase("pt-BR") === customerName.trim().toLocaleLowerCase("pt-BR")
    && customerName.trim().length > 0
    && (!customerPhone.replace(/\\D/g, "") || item.phone.replace(/\\D/g, "") === customerPhone.replace(/\\D/g, ""))
  );
  const todayReservations = reservations.filter(item => item.date === todayKey() && item.status !== "Cancelada");
  const pendingCount = reservations.filter(item => item.status === "Pendente").length;
  const reservedValue = todayReservations.filter(item => item.status === "Confirmada" || item.status === "Concluída").reduce((sum, item) => sum + (item.estimatedPrice ?? courts.find(c => c.id === item.courtId)?.pricePerHour ?? 0), 0);
  const timeSlots = Array.from({ length: 16 }, (_, index) => `${String(index + 7).padStart(2, "0")}:00`);
  const isSlotTaken = (courtId: string, date: string, startTime: string) => reservations.some(item => item.courtId === courtId && item.date === date && item.startTime === startTime && item.status !== "Cancelada") || blockedSlots.some(item => item.courtId === courtId && item.date === date && item.startTime === startTime);
  const availableSlots = timeSlots.filter(time => !selectedCourt || !isSlotTaken(selectedCourt.id, selectedDate, time));
  const getDiscount = (courtId: string, date: string, time: string) => { const weekday = new Date(`${date}T12:00:00`).getDay(); return promotions.find(p => p.active && (!p.courtId || p.courtId === courtId) && p.daysOfWeek.includes(weekday) && (!p.startTime || time >= p.startTime) && (!p.endTime || time < p.endTime))?.discountPercent ?? 0; };
  const unreadCount = notifications.filter(item => !item.read).length;
  const selectedReviewReservation = reservations.find(item => item.id === selectedReservationId);
  const selectedReviewCourt = selectedReviewReservation ? courts.find(item => item.id === selectedReviewReservation.courtId) : undefined;

  const changeStatus = (reservation: Reservation, status: ReservationStatus) => {
    Alert.alert(status === "Cancelada" ? "Cancelar esta reserva?" : `${status} reserva?`, `${reservation.customerName} · ${reservation.date} · ${reservation.startTime}`, [
      { text: "Voltar", style: "cancel" },
      { text: "Confirmar", style: status === "Cancelada" ? "destructive" : "default", onPress: () => {
        const updated = reservations.map(item => item.id === reservation.id ? { ...item, status } : item);
        const notification: AppNotification = { id: `notification-${Date.now()}`, title: status === "Confirmada" ? "Reserva confirmada" : status === "Cancelada" ? "Reserva cancelada" : "Reserva concluída", message: `${reservation.customerName} · ${dateLabel(reservation.date)} às ${reservation.startTime}`, createdAt: new Date().toISOString(), read: false, kind: "reserva", reservationId: reservation.id };
        const nextNotifications = [notification, ...notifications]; setReservations(updated); setNotifications(nextNotifications);
        void Promise.all([saveReservations(updated), saveNotifications(nextNotifications)]).catch(() => Alert.alert("Erro ao salvar", "A alteração pode não ter sido salva neste dispositivo."));
      } },
    ]);
  };

  const openCourtDetails = (court: Court) => { setSelectedCourtId(court.id); setScreen("Detalhes"); };

  const openBooking = (court: Court) => {
    setSelectedCourtId(court.id);
    setSelectedDate(todayKey());
    setSelectedTime(null);
    setBookingNote("");
    setScreen("booking");
  };

  const submitBooking = async () => {
    if (!selectedCourt || !customerName.trim() || customerPhone.replace(/\D/g, "").length < 10 || !selectedTime) {
      Alert.alert("Confira seus dados", "Informe nome, telefone válido, data e horário para continuar."); return;
    }
    const dates = repeatWeekly ? Array.from({ length: 4 }, (_, index) => { const d = new Date(`${selectedDate}T12:00:00`); d.setDate(d.getDate() + index * 7); return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-"); }) : [selectedDate];
    const openDates = dates.filter(date => !isSlotTaken(selectedCourt.id, date, selectedTime));
    if (!openDates.length) { Alert.alert("Horário indisponível", "Esse horário já está ocupado ou bloqueado nas datas escolhidas."); setSelectedTime(null); return; }
    const hour = Number(selectedTime.slice(0, 2)); const discount = getDiscount(selectedCourt.id, selectedDate, selectedTime); const price = selectedCourt.pricePerHour * (1 - discount / 100);
    const recurrenceId = repeatWeekly ? `rec-${Date.now()}` : undefined;
    const created: Reservation[] = openDates.map((date, index) => ({ id: `res-${Date.now()}-${index}`, customerName: customerName.trim(), phone: customerPhone.trim(), courtId: selectedCourt.id, date, startTime: selectedTime, endTime: `${String(hour + 1).padStart(2, "0")}:00`, status: "Pendente", notes: bookingNote.trim() || undefined, estimatedPrice: price, recurrenceId, createdAt: new Date().toISOString() }));
    const updated = [...created, ...reservations];
    const note: AppNotification = { id: `notification-${Date.now()}`, title: repeatWeekly ? "Solicitações recorrentes criadas" : "Solicitação enviada", message: `${created.length} horário(s) enviado(s) para ${selectedCourt.name}.`, createdAt: new Date().toISOString(), read: false, kind: "reserva", reservationId: created[0].id };
    const nextNotifications = [note, ...notifications];
    try { await Promise.all([saveReservations(updated), saveNotifications(nextNotifications)]); setReservations(updated); setNotifications(nextNotifications); setSelectedTime(null); setRepeatWeekly(false); setScreen("Reservas"); Alert.alert("Solicitação enviada", `${created.length} reserva(s) aguardando confirmação. O pagamento é feito diretamente ao estabelecimento.${openDates.length < dates.length ? " Algumas semanas foram ignoradas por indisponibilidade." : ""}`); }
    catch { Alert.alert("Não foi possível reservar", "Seus dados continuam na tela. Tente novamente."); }
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

  const toggleFavorite = (courtId: string) => { const updated = favorites.includes(courtId) ? favorites.filter(id => id !== courtId) : [...favorites, courtId]; setFavorites(updated); void saveFavorites(updated).catch(() => Alert.alert("Erro ao salvar", "Não foi possível salvar os favoritos.")); };

  const createBlockedSlot = async () => { if (!blockCourtId) { Alert.alert("Selecione uma quadra", "Escolha qual quadra ficará indisponível."); return; } const hour = Number(blockTime.slice(0, 2)); if (isSlotTaken(blockCourtId, selectedAgendaDate, blockTime)) { Alert.alert("Horário ocupado", "Já existe reserva ou bloqueio neste horário."); return; } const item: BlockedSlot = { id: `block-${Date.now()}`, courtId: blockCourtId, date: selectedAgendaDate, startTime: blockTime, endTime: `${String(hour + 1).padStart(2, "0")}:00`, reason: blockReason.trim() || "Bloqueio manual" }; const updated = [item, ...blockedSlots]; try { await saveBlockedSlots(updated); setBlockedSlots(updated); setShowBlockForm(false); Alert.alert("Horário bloqueado", "O horário não aparecerá como disponível para novas solicitações."); } catch { Alert.alert("Erro ao salvar", "Não foi possível salvar o bloqueio."); } };
  const removeBlockedSlot = (id: string) => { const updated = blockedSlots.filter(item => item.id !== id); setBlockedSlots(updated); void saveBlockedSlots(updated).catch(() => Alert.alert("Erro ao salvar", "Não foi possível remover o bloqueio.")); };
  const submitReview = async () => { if (!selectedReviewReservation || !selectedReviewCourt) return; if (reviews.some(item => item.reservationId === selectedReviewReservation.id)) { Alert.alert("Avaliação já enviada", "Cada reserva concluída pode receber uma avaliação."); return; } const review: Review = { id: `review-${Date.now()}`, reservationId: selectedReviewReservation.id, courtId: selectedReviewCourt.id, customerName: selectedReviewReservation.customerName, rating: reviewRating, comment: reviewComment.trim(), createdAt: new Date().toISOString(), verified: true }; const nextReviews = [review, ...reviews]; const courtReviews = nextReviews.filter(item => item.courtId === selectedReviewCourt.id); const updatedCourts = courts.map(item => item.id === selectedReviewCourt.id ? { ...item, rating: courtReviews.reduce((sum, item) => sum + item.rating, 0) / courtReviews.length, reviewCount: courtReviews.length } : item); try { await Promise.all([saveReviews(nextReviews), saveCourts(updatedCourts)]); setReviews(nextReviews); setCourts(updatedCourts); setReviewComment(""); setScreen("Detalhes"); Alert.alert("Obrigado pela avaliação", "Sua opinião foi registrada nesta demonstração."); } catch { Alert.alert("Erro ao salvar", "Não foi possível salvar a avaliação."); } };
  const addPromotion = async () => { const discount = Number(promotionDiscount); if (!promotionTitle.trim() || !Number.isFinite(discount) || discount < 1 || discount > 80) { Alert.alert("Confira a promoção", "Informe um título e desconto entre 1% e 80%."); return; } const item: Promotion = { id: `promo-${Date.now()}`, title: promotionTitle.trim(), description: promotionDescription.trim() || `${discount}% de desconto em horários selecionados.`, discountPercent: discount, active: true, daysOfWeek: [0,1,2,3,4,5,6] }; const updated = [item, ...promotions]; try { await savePromotions(updated); setPromotions(updated); setPromotionTitle(""); setPromotionDescription(""); setPromotionDiscount("10"); Alert.alert("Promoção criada", "A oferta será aplicada às novas reservas elegíveis nesta demonstração."); } catch { Alert.alert("Erro ao salvar", "Não foi possível salvar a promoção."); } };
  const togglePromotion = (promotion: Promotion) => { const updated = promotions.map(item => item.id === promotion.id ? { ...item, active: !item.active } : item); setPromotions(updated); void savePromotions(updated).catch(() => Alert.alert("Erro ao salvar", "Não foi possível atualizar a promoção.")); };
  const addStaffMember = async () => { if (!staffName.trim() || !/^\S+@\S+\.\S+$/.test(staffEmail.trim())) { Alert.alert("Confira os dados", "Informe nome e e-mail válido."); return; } const updated = [...staff, { id: `staff-${Date.now()}`, name: staffName.trim(), email: staffEmail.trim(), role: staffRole, active: true }]; try { await saveStaff(updated); setStaff(updated); setStaffName(""); setStaffEmail(""); Alert.alert("Membro adicionado", "Os papéis ficam registrados localmente e ainda não controlam acesso real."); } catch { Alert.alert("Erro ao salvar", "Não foi possível salvar o membro."); } };
  const updateStaff = (member: StaffMember, changes: Partial<StaffMember>) => { const updated = staff.map(item => item.id === member.id ? { ...item, ...changes } : item); setStaff(updated); void saveStaff(updated).catch(() => Alert.alert("Erro ao salvar", "Não foi possível atualizar a equipe.")); };
  const markNotificationsRead = () => { const updated = notifications.map(item => ({ ...item, read: true })); setNotifications(updated); void saveNotifications(updated).catch(() => Alert.alert("Erro ao salvar", "Não foi possível atualizar notificações.")); };
  const createLocalReminders = () => { const tomorrow = dateOffset(1); const upcoming = reservations.filter(item => item.date === tomorrow && item.status === "Confirmada"); const reminders: AppNotification[] = upcoming.map(item => ({ id: `reminder-${item.id}`, title: "Lembrete de jogo", message: `${item.startTime} · ${courts.find(c => c.id === item.courtId)?.name ?? "Quadra"} · ${dateLabel(item.date)}`, createdAt: new Date().toISOString(), read: false, kind: "lembrete", reservationId: item.id })); if (!reminders.length) reminders.push({ id: `reminder-${Date.now()}`, title: "Lembrete de demonstração", message: "Reservas confirmadas para amanhã aparecerão aqui.", createdAt: new Date().toISOString(), read: false, kind: "lembrete" }); const updated = [...reminders, ...notifications]; setNotifications(updated); void saveNotifications(updated).then(() => Alert.alert("Lembretes criados", "Estes avisos ficam dentro do app; ainda não são notificações do sistema.")); };

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
    <CourtCard key={court.id} court={court} venueName={mockVenue.name} onPress={() => openCourtDetails(court)}
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
      <View style={styles.headerActions}><Pressable accessibilityRole="button" accessibilityLabel="Abrir notificações" onPress={() => setScreen("Notificações")} style={styles.notificationButton}><Bell size={19} color={colors.primary} />{unreadCount > 0 ? <View style={styles.notificationDot} /> : null}</Pressable><View style={styles.roleSwitcher}>
        {(["Cliente", "Gestão"] as Role[]).map(item => <Pressable key={item} onPress={() => switchRole(item)} accessibilityRole="button" accessibilityState={{ selected: role === item }} style={[styles.roleOption, role === item && styles.roleOptionActive]}><AppText variant="caption" weight="700" color={role === item ? "#FFFFFF" : colors.muted}>{item}</AppText></Pressable>)}
      </View></View>
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
        <View style={styles.searchInputWrap}><Search size={19} color={colors.muted} /><TextInput value={search} onChangeText={setSearch} placeholder="Quadra, bairro, comodidade ou cidade" placeholderTextColor={colors.muted} style={styles.searchInput} returnKeyType="search" accessibilityLabel="Buscar quadras por nome, bairro ou comodidade" /><Pressable onPress={() => { setSearch(""); setSportFilter("Todas"); setPriceFilter(0); setLitOnly(false); }} accessibilityRole="button" accessibilityLabel="Limpar filtros"><SlidersHorizontal size={18} color={colors.success} /></Pressable></View>
        <View style={styles.filterPanel}><AppText variant="small" weight="800">Preço máximo por hora</AppText><View style={styles.filters}>{[{label:"Qualquer",value:0},{label:"R$ 90",value:90},{label:"R$ 110",value:110},{label:"R$ 130",value:130}].map(item => <Pressable key={item.value} onPress={() => setPriceFilter(item.value)} style={[styles.filterChip, priceFilter === item.value && styles.filterChipActive]}><AppText variant="caption" weight="700" color={priceFilter === item.value ? "#FFFFFF" : colors.muted}>{item.label}</AppText></Pressable>)}</View><Pressable onPress={() => setLitOnly(value => !value)} style={styles.checkFilter} accessibilityRole="checkbox" accessibilityState={{ checked: litOnly }}><View style={[styles.checkboxMark, litOnly && styles.checkboxMarkActive]}>{litOnly ? <Check size={12} color={colors.primary} /> : null}</View><AppText variant="small">Somente quadras com iluminação</AppText></Pressable></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(["Todas", "Society", "Vôlei"] as SportFilter[]).map(filter => <Pressable key={filter} onPress={() => setSportFilter(filter)} style={[styles.filterChip, sportFilter === filter && styles.filterChipActive]}><AppText variant="small" weight="700" color={sportFilter === filter ? "#FFFFFF" : colors.muted}>{filter}</AppText></Pressable>)}
        </ScrollView>
        <AppText variant="small" color={colors.muted}>{filteredCourts.length} {filteredCourts.length === 1 ? "quadra encontrada" : "quadras encontradas"}</AppText>
        {renderCourtList(filteredCourts)}
      </> : null}

      {role === "Cliente" && screen === "Detalhes" ? <>
        {selectedCourt ? <>
          <Pressable onPress={() => setScreen("Explorar")} style={styles.backInline} accessibilityRole="button"><ArrowLeft size={17} color={colors.primary} /><AppText weight="700">Voltar para explorar</AppText></Pressable>
          <View style={styles.detailArtwork}><View style={styles.detailFieldLines}><View style={styles.fieldCircle} /><View style={styles.fieldMidline} /></View><View style={styles.detailBadges}><View style={styles.artworkBadge}><Trophy size={14} color={colors.primary} /><Text style={styles.artworkBadgeText}>{selectedCourt.sport}</Text></View><View style={styles.demoPill}><AppText variant="caption" color={colors.muted} weight="700">{selectedCourt.verified ? "Estabelecimento verificado" : "Perfil demonstrativo"}</AppText></View></View></View>
          <View style={styles.detailTitleRow}><View style={{ flex: 1, gap: 5 }}><AppText variant="display">{selectedCourt.name}</AppText><AppText color={colors.muted}>{selectedCourt.venueName ?? mockVenue.name} · {selectedCourt.neighborhood ?? "Cariri"} · {selectedCourt.city ?? mockVenue.city}</AppText><View style={styles.ratingInline}><Star size={17} color={colors.warning} fill={colors.warning} /><AppText weight="800">{(selectedCourt.rating ?? 0).toFixed(1)}</AppText><AppText variant="small" color={colors.muted}>({selectedCourt.reviewCount ?? 0} avaliações demonstrativas)</AppText></View></View><View style={{ alignItems: "flex-end" }}><AppText variant="heading">{currency(selectedCourt.pricePerHour)}</AppText><AppText variant="caption" color={colors.muted}>por hora</AppText></View></View>
          <AppText>{selectedCourt.description ?? "Espaço esportivo para sua próxima partida."}</AppText>
          {promotions.some(p => p.active && (!p.courtId || p.courtId === selectedCourt.id)) ? <View style={styles.promotionBanner}><BadgePercent size={20} color={colors.success} /><View style={{ flex: 1, gap: 2 }}><AppText weight="800">Promoção disponível</AppText><AppText variant="small" color={colors.muted}>Confira as condições e horários ao selecionar sua reserva.</AppText></View></View> : null}
          <AppCard style={{ gap: 12 }}><AppText variant="subtitle">Comodidades</AppText><View style={styles.amenitiesWrap}>{(selectedCourt.amenities ?? []).map(item => <View key={item} style={styles.amenityPill}><Check size={13} color={colors.success} /><AppText variant="small">{item}</AppText></View>)}</View><AppText variant="subtitle">Regras do espaço</AppText>{(selectedCourt.rules ?? mockVenue.rules ?? []).map(item => <View key={item} style={styles.metaLine}><Check size={14} color={colors.muted} /><AppText variant="small" color={colors.muted}>{item}</AppText></View>)}<View style={styles.metaLine}><MapPin size={15} color={colors.success} /><AppText variant="small">{mockVenue.address}</AppText></View><View style={styles.metaLine}><Clock3 size={15} color={colors.success} /><AppText variant="small">{mockVenue.openingTime}–{mockVenue.closingTime}</AppText></View></AppCard>
          <View style={styles.inlineActions}><View style={{ flex: 1 }}><AppButton label="Compartilhar" variant="secondary" onPress={() => void Share.share({ message: `Confira ${selectedCourt.name} na ${selectedCourt.venueName ?? mockVenue.name}: ${currency(selectedCourt.pricePerHour)}/hora em ${selectedCourt.city ?? mockVenue.city}. Disponibilidade demonstrativa do CaririPlay.` })} icon={<Share2 size={16} color={colors.success} />} compact /></View><View style={{ flex: 1 }}><AppButton label={favorites.includes(selectedCourt.id) ? "Salvo" : "Favoritar"} variant="secondary" onPress={() => toggleFavorite(selectedCourt.id)} icon={<Heart size={16} color={favorites.includes(selectedCourt.id) ? colors.danger : colors.success} fill={favorites.includes(selectedCourt.id) ? colors.danger : "transparent"} />} compact /></View></View>
          <AppButton label="Ver horários e solicitar reserva" onPress={() => openBooking(selectedCourt)} icon={<CalendarDays size={17} color={colors.primary} />} />
          <SectionHeading title="Avaliações" subtitle="Avaliações publicadas após uma reserva concluída." />
          {reviews.filter(item => item.courtId === selectedCourt.id).length ? reviews.filter(item => item.courtId === selectedCourt.id).map(item => <AppCard key={item.id} style={{ gap: 8 }}><View style={styles.reviewHeader}><AppText weight="800">{item.customerName}</AppText><View style={styles.ratingInline}><Star size={14} color={colors.warning} fill={colors.warning} /><AppText weight="800">{item.rating}/5</AppText></View></View><AppText variant="small" color={colors.muted}>Reserva concluída · avaliação local</AppText>{item.comment ? <AppText>{item.comment}</AppText> : null}</AppCard>) : <EmptyState icon={<Star size={22} color={colors.muted} />} title="Ainda sem avaliações publicadas" description="Após concluir uma reserva, o cliente poderá avaliar a experiência." />}
        </> : <EmptyState title="Quadra não encontrada" description="Volte ao catálogo e selecione outra quadra." action="Explorar" onAction={() => setScreen("Explorar")} />}
      </> : null}

      {screen === "Notificações" ? <>
        <ScreenTitle eyebrow="Central de avisos" title="Notificações" subtitle="Atualizações e lembretes armazenados neste dispositivo." />
        <View style={styles.inlineActions}><View style={{ flex: 1 }}><AppButton label="Marcar como lidas" variant="secondary" onPress={markNotificationsRead} disabled={!unreadCount} compact /></View><View style={{ flex: 1 }}><AppButton label="Lembretes de amanhã" variant="secondary" onPress={createLocalReminders} compact /></View></View>
        {notifications.length ? notifications.map(item => <Pressable key={item.id} onPress={() => { const updated = notifications.map(n => n.id === item.id ? { ...n, read: true } : n); setNotifications(updated); void saveNotifications(updated); }} style={[styles.notificationCard, !item.read && styles.notificationUnread]}><View style={styles.notificationIcon}>{item.kind === "lembrete" ? <Clock3 size={18} color={colors.success} /> : <Bell size={18} color={colors.success} />}</View><View style={{ flex: 1, gap: 4 }}><AppText weight="800">{item.title}</AppText><AppText variant="small" color={colors.muted}>{item.message}</AppText><AppText variant="caption" color={colors.muted}>{new Date(item.createdAt).toLocaleString("pt-BR")}</AppText></View>{!item.read ? <View style={styles.notificationDotInline} /> : null}</Pressable>) : <EmptyState icon={<Bell size={23} color={colors.muted} />} title="Tudo tranquilo por aqui" description="Atualizações de reserva e lembretes locais aparecerão nesta central." />}
        <AppText variant="caption" color={colors.muted}>Os avisos ficam dentro do app e ainda não são notificações push do Android/iOS.</AppText>
      </> : null}

      {screen === "Avaliações" ? <>
        <Pressable onPress={() => setScreen("Reservas")} style={styles.backInline} accessibilityRole="button"><ArrowLeft size={17} color={colors.primary} /><AppText weight="700">Voltar às reservas</AppText></Pressable>
        <ScreenTitle eyebrow="Comunidade" title="Avalie sua experiência" subtitle="Somente reservas concluídas podem receber avaliação." />
        {selectedReviewReservation && selectedReviewCourt ? <AppCard style={{ gap: 14 }}><AppText variant="subtitle">{selectedReviewCourt.name}</AppText><AppText variant="small" color={colors.muted}>{dateLabel(selectedReviewReservation.date)} · {selectedReviewReservation.startTime}</AppText><AppText weight="700">Qual nota você dá para essa experiência?</AppText><View style={styles.ratingPicker}>{[1,2,3,4,5].map(value => <Pressable key={value} onPress={() => setReviewRating(value)} accessibilityRole="button" accessibilityLabel={`${value} estrelas`}><Star size={31} color={value <= reviewRating ? colors.warning : colors.border} fill={value <= reviewRating ? colors.warning : "transparent"} /></Pressable>)}</View><TextInput value={reviewComment} onChangeText={setReviewComment} style={[styles.input, styles.noteInput]} placeholder="Conte como foi o espaço, atendimento e jogo (opcional)" placeholderTextColor={colors.muted} multiline accessibilityLabel="Comentário da avaliação" /><AppButton label="Publicar avaliação" onPress={() => void submitReview()} disabled={reviews.some(item => item.reservationId === selectedReviewReservation.id)} /></AppCard> : <EmptyState title="Selecione uma reserva concluída" description="Abra Minhas reservas e toque em Avaliar nesta demonstração." action="Minhas reservas" onAction={() => setScreen("Reservas")} />}
      </> : null}

      {role === "Gestão" && screen === "Promoções" ? <>
        <ScreenTitle eyebrow="Marketing do estabelecimento" title="Promoções" subtitle="Crie ofertas para incentivar horários com menor procura." />
        <AppCard style={{ gap: 12 }}><AppText variant="subtitle">Nova promoção</AppText><TextInput value={promotionTitle} onChangeText={setPromotionTitle} style={styles.input} placeholder="Ex.: Noite do society" placeholderTextColor={colors.muted} accessibilityLabel="Título da promoção" /><TextInput value={promotionDescription} onChangeText={setPromotionDescription} style={styles.input} placeholder="Descrição e condições" placeholderTextColor={colors.muted} accessibilityLabel="Descrição da promoção" /><View style={styles.formField}><AppText variant="small" weight="700">Desconto (%) · de 1 a 80</AppText><TextInput value={promotionDiscount} onChangeText={setPromotionDiscount} style={styles.input} keyboardType="number-pad" placeholder="10" placeholderTextColor={colors.muted} /></View><AppButton label="Criar promoção" onPress={() => void addPromotion()} /></AppCard>
        {promotions.map(promotion => <AppCard key={promotion.id} style={{ gap: 9 }}><View style={styles.reviewHeader}><View style={styles.promotionIcon}><BadgePercent size={20} color={colors.success} /></View><View style={{ flex: 1, gap: 3 }}><AppText variant="subtitle">{promotion.title}</AppText><AppText variant="small" color={colors.muted}>{promotion.description}</AppText></View><AppText variant="subtitle" color={colors.success}>{promotion.discountPercent}%</AppText></View><View style={styles.reviewHeader}><StatusBadge status={promotion.active ? "Confirmada" : "Cancelada"} /><AppButton label={promotion.active ? "Pausar" : "Ativar"} onPress={() => togglePromotion(promotion)} variant="secondary" compact /></View></AppCard>)}
        <AppText variant="caption" color={colors.muted}>As promoções ficam salvas localmente e são aplicadas às novas solicitações elegíveis.</AppText>
      </> : null}

      {role === "Gestão" && screen === "Equipe" ? <>
        <ScreenTitle eyebrow="Operação e acesso" title="Equipe" subtitle="Organize quem atende e quem consulta a agenda." />
        <AppCard style={{ gap: 12 }}><AppText variant="subtitle">Adicionar membro</AppText><TextInput value={staffName} onChangeText={setStaffName} style={styles.input} placeholder="Nome do membro" placeholderTextColor={colors.muted} accessibilityLabel="Nome do membro da equipe" /><TextInput value={staffEmail} onChangeText={setStaffEmail} style={styles.input} placeholder="email@estabelecimento.com" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" accessibilityLabel="E-mail do membro" /><AppText variant="small" weight="700">Permissão demonstrativa</AppText><View style={styles.filters}>{(["Administrador", "Atendente", "Leitura"] as StaffMember["role"][]).map(value => <Pressable key={value} onPress={() => setStaffRole(value)} style={[styles.filterChip, staffRole === value && styles.filterChipActive]}><AppText variant="caption" weight="700" color={staffRole === value ? "#FFFFFF" : colors.muted}>{value}</AppText></Pressable>)}</View><AppButton label="Adicionar à equipe" onPress={() => void addStaffMember()} /></AppCard>
        {staff.map(member => <AppCard key={member.id} style={styles.staffRow}><View style={styles.staffAvatar}><Users size={18} color={colors.success} /></View><View style={{ flex: 1, gap: 3 }}><AppText weight="800">{member.name}</AppText><AppText variant="small" color={colors.muted}>{member.email}</AppText><AppText variant="caption" color={colors.success} weight="800">{member.role}</AppText></View><AppButton label={member.active ? "Desativar" : "Ativar"} variant="secondary" compact onPress={() => updateStaff(member, { active: !member.active })} /></AppCard>)}
        <View style={styles.trustStrip}><ShieldCheck size={19} color={colors.success} /><View style={{ flex: 1, gap: 3 }}><AppText weight="800">Controle de acesso ainda simulado</AppText><AppText variant="small" color={colors.muted}>Os papéis ficam salvos localmente, mas não protegem telas nem dados. No backend aplicaremos autenticação e permissões reais por estabelecimento.</AppText></View></View>
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
          <Pressable onPress={() => setRepeatWeekly(value => !value)} style={styles.checkFilter} accessibilityRole="checkbox" accessibilityState={{ checked: repeatWeekly }}><View style={[styles.checkboxMark, repeatWeekly && styles.checkboxMarkActive]}>{repeatWeekly ? <Check size={12} color={colors.primary} /> : null}</View><View style={{ flex: 1, gap: 2 }}><AppText weight="700">Repetir semanalmente por 4 semanas</AppText><AppText variant="caption" color={colors.muted}>Cria solicitações nas semanas disponíveis; cada uma depende de confirmação do local.</AppText></View></Pressable><SectionHeading title="3. Seus dados" subtitle="O estabelecimento usará essas informações para confirmar a solicitação." />
          <AppCard style={{ gap: 13 }}>
            <View style={styles.formField}><AppText variant="small" weight="700">Nome completo</AppText><TextInput value={customerName} onChangeText={setCustomerName} placeholder="Como podemos te chamar?" placeholderTextColor={colors.muted} style={styles.input} autoCapitalize="words" accessibilityLabel="Nome completo" /></View>
            <View style={styles.formField}><AppText variant="small" weight="700">Telefone / WhatsApp</AppText><TextInput value={customerPhone} onChangeText={setCustomerPhone} placeholder="(88) 99999-9999" placeholderTextColor={colors.muted} style={styles.input} keyboardType="phone-pad" accessibilityLabel="Telefone ou WhatsApp" /></View>
            <View style={styles.formField}><AppText variant="small" weight="700">Observação (opcional)</AppText><TextInput value={bookingNote} onChangeText={setBookingNote} placeholder="Ex.: vamos levar coletes" placeholderTextColor={colors.muted} style={[styles.input, styles.noteInput]} multiline accessibilityLabel="Observação da reserva" /></View>
          </AppCard>
          <View style={styles.bookingTotal}><View style={{ flex: 1, gap: 3 }}><AppText variant="small" color={colors.muted}>Total estimado · 1 hora</AppText><AppText variant="heading">{currency(selectedCourt.pricePerHour * (1 - getDiscount(selectedCourt.id, selectedDate, selectedTime ?? "00:00") / 100))}</AppText>{getDiscount(selectedCourt.id, selectedDate, selectedTime ?? "00:00") > 0 ? <AppText variant="caption" color={colors.success} weight="800">{getDiscount(selectedCourt.id, selectedDate, selectedTime ?? "00:00")}% de desconto aplicado</AppText> : null}</View><AppText variant="caption" color={colors.muted}>Pagamento direto ao local</AppText></View>
          <AppButton label="Solicitar reserva" onPress={() => void submitBooking()} disabled={!selectedTime || !customerName.trim() || customerPhone.replace(/\D/g, "").length < 10} icon={<ChevronRight size={18} color={colors.primary} />} />
          <AppText variant="caption" color={colors.muted} style={styles.centerText}>Sua solicitação ficará pendente até o estabelecimento confirmar. Nenhum pagamento é processado pelo CaririPlay.</AppText>
        </> : <EmptyState title="Quadra não encontrada" description="Volte para explorar e selecione uma quadra." action="Explorar quadras" onAction={() => setScreen("Explorar")} />}
      </> : null}

      {role === "Cliente" && screen === "Reservas" ? <>
        <ScreenTitle eyebrow="Seus jogos" title="Minhas reservas" subtitle="Acompanhe suas solicitações e os próximos jogos." />
        <AppCard style={{ gap: 10 }}><AppText weight="700">Consultar por telefone</AppText><TextInput value={customerPhone} onChangeText={setCustomerPhone} placeholder="Digite o telefone usado na reserva" placeholderTextColor={colors.muted} style={styles.input} keyboardType="phone-pad" /><AppText variant="caption" color={colors.muted}>Nesta demonstração, informe também o nome utilizado ao reservar para localizar os registros.</AppText><TextInput value={customerName} onChangeText={setCustomerName} placeholder="Nome utilizado na reserva" placeholderTextColor={colors.muted} style={styles.input} /></AppCard>
        {customerReservations.length ? customerReservations.map(item => <ReservationCard key={item.id} reservation={item} court={courts.find(c => c.id === item.courtId)} ownerMode={false} onStatus={changeStatus} onReview={(reservation) => { setSelectedReservationId(reservation.id); setReviewRating(5); setReviewComment(""); setScreen("Avaliações"); }} />) : <EmptyState icon={<CalendarDays size={24} color={colors.muted} />} title="Suas reservas aparecerão aqui" description="Informe o mesmo nome utilizado ao solicitar a reserva. Na versão com conta, você verá seu histórico automaticamente." action="Encontrar quadra" onAction={() => setScreen("Explorar")} />}
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
        <View style={styles.ownerQuickActions}><AppButton label="Promoções" onPress={() => setScreen("Promoções")} variant="secondary" icon={<BadgePercent size={16} color={colors.success} />} compact /><AppButton label="Equipe" onPress={() => setScreen("Equipe")} variant="secondary" icon={<Users size={16} color={colors.success} />} compact /><AppButton label="Notificações" onPress={() => setScreen("Notificações")} variant="secondary" icon={<Bell size={16} color={colors.success} />} compact /></View><View style={styles.statsGrid}><AppCard style={styles.statCard}><AppText variant="small" color={colors.muted}>Ocupação de hoje</AppText><AppText variant="heading">{Math.min(100, Math.round((todayReservations.length / Math.max(1, activeCourts.length * 16)) * 100))}%</AppText><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, Math.round((todayReservations.length / Math.max(1, activeCourts.length * 16)) * 100))}%` }]} /></View></AppCard><AppCard style={styles.statCard}><AppText variant="small" color={colors.muted}>Cancelamentos</AppText><AppText variant="heading">{reservations.filter(r => r.status === "Cancelada").length}</AppText><AppText variant="caption" color={colors.muted}>No histórico local</AppText></AppCard></View><SectionHeading title="Precisa da sua atenção" subtitle="Solicitações esperando resposta" action={pendingCount ? `${pendingCount} pendente(s)` : undefined} />
        {reservations.filter(r => r.status === "Pendente").length ? reservations.filter(r => r.status === "Pendente").map(item => <ReservationCard key={item.id} reservation={item} court={courts.find(c => c.id === item.courtId)} ownerMode onStatus={changeStatus} />) : <EmptyState title="Tudo em dia!" description="Você não tem solicitações pendentes." />}
        <AppText variant="caption" color={colors.muted}>*Valor estimado de reservas confirmadas ou concluídas, não representa pagamento recebido.</AppText>
        <AppButton label="Abrir agenda" onPress={() => setScreen("Agenda")} icon={<CalendarDays size={17} color={colors.primary} />} />
      </> : null}

      {role === "Gestão" && screen === "Agenda" ? <>
        <ScreenTitle eyebrow="Operação" title="Agenda" subtitle="Gerencie reservas, manutenção e horários bloqueados." /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateOptions}>{Array.from({ length: 7 }, (_, i) => dateOffset(i)).map((date, i) => <Pressable key={date} onPress={() => setSelectedAgendaDate(date)} style={[styles.dateOption, selectedAgendaDate === date && styles.dateOptionActive]}><AppText variant="caption" color={selectedAgendaDate === date ? colors.accent : colors.muted} weight="700">{i === 0 ? "HOJE" : i === 1 ? "AMANHÃ" : dateLabel(date).split(" de ")[0].toUpperCase()}</AppText><AppText variant="subtitle" color={selectedAgendaDate === date ? "#FFFFFF" : colors.text}>{date.slice(8, 10)}</AppText><AppText variant="caption" color={selectedAgendaDate === date ? "#D0DBD2" : colors.muted}>{dateLabel(date).split(" de ")[1]?.slice(0, 3) ?? ""}</AppText></Pressable>)}</ScrollView><AppButton label={showBlockForm ? "Fechar bloqueio de horário" : "Bloquear horário / manutenção"} onPress={() => { setBlockCourtId(activeCourts[0]?.id ?? ""); setShowBlockForm(value => !value); }} variant="secondary" icon={<CalendarDays size={17} color={colors.success} />} /><AppText variant="small" color={colors.muted}>Agenda de {dateLabel(selectedAgendaDate)}</AppText>{showBlockForm ? <AppCard style={{ gap: 12 }}><AppText variant="subtitle">Indisponibilizar um horário</AppText><View style={styles.filters}>{activeCourts.map(court => <Pressable key={court.id} onPress={() => setBlockCourtId(court.id)} style={[styles.filterChip, blockCourtId === court.id && styles.filterChipActive]}><AppText variant="small" color={blockCourtId === court.id ? "#FFFFFF" : colors.muted}>{court.name}</AppText></Pressable>)}</View><AppText variant="small" weight="700">Horário</AppText><View style={styles.timeGrid}>{timeSlots.map(time => <TimeSlot key={time} time={time} selected={blockTime === time} unavailable={isSlotTaken(blockCourtId, selectedAgendaDate, time)} onPress={() => setBlockTime(time)} />)}</View><TextInput value={blockReason} onChangeText={setBlockReason} style={styles.input} placeholder="Motivo do bloqueio" placeholderTextColor={colors.muted} accessibilityLabel="Motivo do bloqueio" /><AppButton label="Salvar bloqueio" onPress={() => void createBlockedSlot()} /></AppCard> : null}
        <View style={styles.dateCard}><CalendarDays size={20} color={colors.success} /><View style={{ flex: 1 }}><AppText weight="700">{dateLabel(selectedAgendaDate)}</AppText><AppText variant="small" color={colors.muted}>{mockVenue.openingTime}–{mockVenue.closingTime}</AppText></View><AppText variant="small" color={colors.success} weight="700">{reservations.filter(item => item.date === selectedAgendaDate && item.status !== "Cancelada").length} reserva(s)</AppText></View>
        {activeCourts.map(court => {
          const items = reservations.filter(item => item.date === selectedAgendaDate && item.courtId === court.id && item.status !== "Cancelada").sort((a, b) => a.startTime.localeCompare(b.startTime));
          const blocks = blockedSlots.filter(item => item.date === selectedAgendaDate && item.courtId === court.id);
          return <AppCard key={court.id} style={{ gap: 12 }}><View style={styles.courtScheduleHeader}><View style={{ flex: 1, gap: 2 }}><AppText weight="700">{court.name}</AppText><AppText variant="small" color={colors.muted}>{court.sport}</AppText></View><AppText variant="small" weight="700">{currency(court.pricePerHour)}/h</AppText></View>{items.length ? items.map(item => <View key={item.id} style={styles.agendaRow}><View style={styles.agendaTime}><AppText weight="800">{item.startTime}</AppText><AppText variant="caption" color={colors.muted}>{item.endTime}</AppText></View><View style={styles.agendaBar}><AppText weight="700">{item.customerName}</AppText><AppText variant="caption" color={colors.muted}>{item.status}</AppText></View></View>) : <AppText variant="small" color={colors.muted}>Nenhuma reserva para esta data.</AppText>}{blocks.map(block => <View key={block.id} style={styles.agendaRow}><View style={styles.agendaTime}><AppText weight="800">{block.startTime}</AppText><AppText variant="caption" color={colors.muted}>{block.endTime}</AppText></View><View style={[styles.agendaBar, styles.blockedAgendaBar]}><AppText weight="700">Bloqueado · {block.reason}</AppText><Pressable onPress={() => removeBlockedSlot(block.id)} accessibilityRole="button" accessibilityLabel="Remover bloqueio" style={styles.removeBlock}><Trash2 size={15} color={colors.danger} /><AppText variant="caption" color={colors.danger}>Remover</AppText></Pressable></View></View>)}</AppCard>;
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
  backInline: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  detailArtwork: { height: 180, borderRadius: radius.xl, backgroundColor: "#1C5B3B", padding: spacing.md, justifyContent: "space-between", overflow: "hidden" },
  detailFieldLines: { position: "absolute", top: 15, left: 15, right: 15, bottom: 15, borderWidth: 1.5, borderColor: "#FFFFFF55", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  detailBadges: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", zIndex: 1 },
  demoPill: { backgroundColor: colors.surface, paddingHorizontal: 9, paddingVertical: 6, borderRadius: radius.pill },
  detailTitleRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  promotionBanner: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.successSoft, padding: spacing.lg, borderRadius: radius.lg },
  amenitiesWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  amenityPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill },
  reviewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  ratingPicker: { flexDirection: "row", justifyContent: "center", gap: spacing.md, paddingVertical: spacing.md },
  notificationCard: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg },
  notificationUnread: { borderColor: colors.accentPressed, backgroundColor: "#FBFFF5" },
  notificationIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" },
  notificationDotInline: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  promotionIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" },
  staffRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  staffAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.successSoft, alignItems: "center", justifyContent: "center" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  notificationButton: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  notificationDot: { position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1, borderColor: colors.surface },
  filterPanel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  checkFilter: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  checkboxMark: { width: 20, height: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 6, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  checkboxMarkActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  ratingInline: { flexDirection: "row", alignItems: "center", gap: 5 },
  ownerQuickActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  progressTrack: { height: 7, backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, overflow: "hidden" },
  progressFill: { height: 7, backgroundColor: colors.success, borderRadius: radius.pill },
  blockedAgendaBar: { borderLeftColor: colors.danger, backgroundColor: colors.dangerSoft },
  removeBlock: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", marginTop: 5 },
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
  editPriceLink: { alignSelf: "flex-start", paddingVertical: 3 },
  bottomNav: { flexDirection: "row", paddingTop: spacing.sm, paddingBottom: Platform.OS === "ios" ? spacing.lg : spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  bottomNavItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: spacing.xs },
  bottomIconWrap: { width: 54, height: 30, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  bottomIconActive: { backgroundColor: colors.accent },
});
