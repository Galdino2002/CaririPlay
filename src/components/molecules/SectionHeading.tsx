import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typeScale } from "../../design-system/tokens";

export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: string }) {
  return <View style={styles.wrap}>
    <View style={styles.copy}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {action ? <Text style={styles.action}>{action}</Text> : null}
  </View>;
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, marginTop: spacing.sm },
  copy: { flex: 1, gap: 2 },
  title: { color: colors.text, fontSize: typeScale.subtitle, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { color: colors.muted, fontSize: typeScale.small, lineHeight: 17 },
  action: { color: colors.success, fontSize: typeScale.small, fontWeight: "700" },
});
