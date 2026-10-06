export const colors = {
  background: '#F6F8FA',
  card: '#FFFFFF',
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  borderDark: '#D1D5DB',
  danger: '#DC2626',
  success: '#16A34A',
  shadow: 'rgba(16, 24, 40, 0.06)',
  shadowCard: 'rgba(16, 24, 40, 0.08)',
  overlay: 'rgba(16, 24, 40, 0.4)',
} as const;

export type ColorName = keyof typeof colors;
