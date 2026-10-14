import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../design-system/tokens";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  compact?: boolean;
  accessibilityHint?: string;
};

export function AppButton({ label, onPress, variant = "primary", disabled = false, loading = false, icon, compact = false, accessibilityHint }: Props) {
  const isPrimary = variant === "primary";
  const isDanger = variant === "danger";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        isPrimary && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        isDanger && styles.danger,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator color={isPrimary ? colors.primary : colors.text} /> : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, isPrimary && styles.primaryLabel, isDanger && styles.dangerLabel, variant === "ghost" && styles.ghostLabel]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "transparent" },
  compact: { minHeight: 38, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.surface, borderColor: colors.border },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.dangerSoft, borderColor: "#F6C9C5" },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm },
  label: { color: colors.text, fontSize: 14, fontWeight: "700" },
  primaryLabel: { color: colors.primary },
  dangerLabel: { color: colors.danger },
  ghostLabel: { color: colors.muted },
});
