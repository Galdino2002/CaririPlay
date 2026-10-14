import { Pressable, StyleSheet, Text } from "react-native";
import { colors, radius } from "../../design-system/tokens";

type Props = { time: string; selected: boolean; unavailable?: boolean; onPress: () => void };

export function TimeSlot({ time, selected, unavailable = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={unavailable ? time + ", indisponível" : "Selecionar " + time}
      accessibilityState={{ selected, disabled: unavailable }}
      disabled={unavailable}
      onPress={onPress}
      style={[styles.slot, selected && styles.selected, unavailable && styles.unavailable]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel, unavailable && styles.unavailableLabel]}>{time}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: { minWidth: 76, minHeight: 44, paddingHorizontal: 12, paddingVertical: 11, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  unavailable: { backgroundColor: colors.surfaceMuted, borderColor: colors.surfaceMuted, opacity: 0.7 },
  label: { color: colors.text, fontSize: 13, fontWeight: "700" },
  selectedLabel: { color: "#FFFFFF" },
  unavailableLabel: { color: colors.muted, textDecorationLine: "line-through" },
});
