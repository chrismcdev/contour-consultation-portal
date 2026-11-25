import {
  Anchor,
  Button,
  Combobox,
  createTheme,
  Menu,
  Modal,
  MultiSelect,
  Pagination,
  Paper,
  Select,
  Title,
  type CSSVariablesResolver
} from "@mantine/core";

const DROPDOWN_SURFACE = { radius: "md", shadow: "sm", offset: 4 } as const;
const CHOICE_INPUT = { checkIconPosition: "right", searchable: true, openOnFocus: false } as const;
const FILLED_BLUE = "#0072EE";
const TEXT_COLORS = {
  "--mantine-color-anchor": "var(--mantine-color-text)",
  "--mantine-color-blue-light-color": "var(--mantine-color-text)",
  "--mantine-color-dimmed": "var(--mantine-color-text)"
};

export const PORTAL_CSS_VARIABLES: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    ...TEXT_COLORS,
    "--portal-background": "var(--mantine-color-gray-0)",
    "--portal-detail-icon": "var(--mantine-color-gray-5)",
    "--mantine-color-error": "var(--mantine-color-red-9)"
  },
  dark: {
    ...TEXT_COLORS,
    "--portal-background": "var(--mantine-color-dark-6)",
    "--portal-detail-icon": "var(--mantine-color-dark-2)",
    "--mantine-color-text": "var(--mantine-color-white)",
    "--mantine-color-error": "var(--mantine-color-red-4)"
  }
});

export const PORTAL_THEME = createTheme({
  fontFamily: "'DM Sans Variable', sans-serif",
  black: "#212121",
  colors: {
    blue: ["#edf6ff", "#daecff", "#bcdcff", "#99caff", "#73b7ff", "#52a5ff", "#3294ff", "#1686ff", "#007AFF", "#005bbf"]
  },
  primaryShade: 8,
  respectReducedMotion: true,
  components: {
    Anchor: Anchor.extend({
      defaultProps: { underline: "always" },
      styles: { root: { textDecorationColor: "var(--mantine-primary-color-filled)", textUnderlineOffset: "0.15em" } }
    }),
    Button: Button.extend({
      vars: (theme, { color = theme.primaryColor, variant = "filled" }) => ({
        root: variant === "filled" && color === "blue" ? { "--button-bg": FILLED_BLUE } : {}
      })
    }),
    Combobox: Combobox.extend({ defaultProps: DROPDOWN_SURFACE }),
    Menu: Menu.extend({ defaultProps: { ...DROPDOWN_SURFACE, transitionProps: { transition: "pop" } } }),
    Modal: Modal.extend({ defaultProps: { centered: true } }),
    MultiSelect: MultiSelect.extend({ defaultProps: CHOICE_INPUT }),
    Pagination: Pagination.extend({ defaultProps: { color: FILLED_BLUE } }),
    Paper: Paper.extend({ defaultProps: { radius: "lg" } }),
    Select: Select.extend({ defaultProps: { ...CHOICE_INPUT, allowDeselect: false } }),
    Title: Title.extend({ styles: { root: { letterSpacing: "-0.035em" } } })
  }
});
