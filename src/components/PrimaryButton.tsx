import { Text, ViewStyle, StyleProp } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors, radius, spacing, typography } from '../theme';
import { useCallback } from 'react';
import { impact } from '../utils/haptics';
interface Props { label: string; onPress: () => void; disabled?: boolean; variant?: 'primary'|'secondary'; style?: StyleProp<ViewStyle>; }
export function PrimaryButton({ label, onPress, disabled, variant='primary', style }: Props) {
  const bg = disabled ? colors.primary : (variant==='secondary' ? colors.card : colors.primaryHover);
  const textColor = variant==='secondary' ? colors.textPrimary : '#fff';
  const borderColor = variant==='secondary' ? colors.border : 'transparent';
  const handlePress = useCallback(() => { if(disabled) return; impact(); onPress(); }, [disabled, onPress]);
  return <PressableScale onPress={handlePress} disabled={disabled} style={[{backgroundColor:bg,borderRadius:radius.md,paddingVertical:spacing.md,alignItems:'center',justifyContent:'center',minHeight:48,borderWidth:1,borderColor,opacity:disabled?0.5:1}, style]}><Text style={[typography.button,{color:textColor}]}>{label}</Text></PressableScale>;
}