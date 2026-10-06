import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme';
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown:false, animation:'slide_from_right', contentStyle:{backgroundColor:colors.background} }}>
        <Stack.Screen name="index" />
      </Stack>
    </>
  );
}