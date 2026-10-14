import { StyleSheet, Text, View } from "react-native";
import type { ReservationStatus } from "../../types";
import { colors, radius } from "../../design-system/tokens";

const palette: Record<ReservationStatus, { bg: string; text: string }> = {
  Pendente: { bg: colors.warningSoft, text: colors.warning },
  Confirmada: { bg: colors.successSoft, text: colors.success },
  Cancelada: { bg: colors.dangerSoft, text: colors.danger },
  Concluída: { bg: colors.surfaceMuted, text: colors.muted },
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const tone = palette[status];
  return <View style={[styles.badge, { backgroundColor: tone.bg }]}><Text style={[styles.text, { color: tone.text }]}>{status}</Text></View>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  text: { fontSize: 11, fontWeight: "700" },
});
