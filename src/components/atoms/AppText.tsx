import type { ReactNode } from "react";
import { Text, type TextProps } from "react-native";
import { colors, typeScale } from "../../design-system/tokens";

type Props = TextProps & {
  children: ReactNode;
  variant?: "display" | "heading" | "subtitle" | "body" | "small" | "caption";
  color?: string;
  weight?: "400" | "500" | "600" | "700" | "800";
};

export function AppText({ children, variant = "body", color = colors.text, weight, style, ...props }: Props) {
  const size = typeScale[variant];
  const defaultWeight = variant === "display" || variant === "heading" ? "800" : variant === "subtitle" ? "700" : "400";
  return <Text {...props} style={[{ color, fontSize: size, lineHeight: Math.round(size * 1.4), fontWeight: weight ?? defaultWeight }, style]}>{children}</Text>;
}
