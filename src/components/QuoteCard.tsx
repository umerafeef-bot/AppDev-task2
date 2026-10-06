import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography, shadows } from '../theme';
interface Props { text: string; author: string; }
export function QuoteCard({ text, author }: Props) {
  return (
    <View style={styles.card} accessible accessibilityLabel={`Quote: ${text}. By ${author}`}>
      <Text style={styles.quote} accessible accessibilityRole="text">
        {`"${text}"`}
      </Text>
      <Text style={styles.author}>— {author}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.xl, padding: spacing.xl, minHeight: 240, alignItems:'center', justifyContent:'center', ...shadows.lg },
  quote: { ...typography.quote, color: colors.textPrimary, textAlign:'center' },
  author: { ...typography.author, color: colors.textSecondary, textAlign:'right', marginTop: spacing.md },
});