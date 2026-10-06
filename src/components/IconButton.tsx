import { Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors, radius } from '../theme';
import { Ionicons } from '@expo/vector-icons';
interface Props { iconName: keyof typeof Ionicons.glyphMap; label?: string; onPress: () => void; disabled?: boolean; style?: StyleProp<ViewStyle>; accessibilityLabel?: string; }
export function IconButton({ iconName, label, onPress, disabled, style, accessibilityLabel }: Props) {
  return (
    <PressableScale accessibilityLabel={accessibilityLabel ?? label} onPress={onPress} disabled={disabled} style={[styles.button, style]}>
      <Ionicons name={iconName} size={22} color={disabled?colors.textTertiary:colors.textSecondary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </PressableScale>
  );
}
const styles = StyleSheet.create({ button:{alignItems:'center',justifyContent:'center',borderRadius:radius.pill,padding:10,minHeight:44,minWidth:44}, label:{fontSize:13,fontWeight:'500',color:colors.textSecondary,marginTop:4} });