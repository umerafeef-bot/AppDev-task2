import { View, Text, SafeAreaView, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { useLayoutEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { IconButton } from '../src/components/IconButton';
import { QuoteCard } from '../src/components/QuoteCard';
import { quotes, Quote } from '../src/data/quotes';
import { colors, spacing, radius, typography, shadows } from '../src/theme';
import { impact, success } from '../src/utils/haptics';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

const pickRandom = (total:number) => Math.floor(Math.random()*total);
const pickRandomExcluding = (total:number, exclude:number) => {
  if (total <= 1) return 0;
  let n = Math.floor(Math.random()*total);
  let guard = 0;
  while (n === exclude && guard < 20) { n = Math.floor(Math.random()*total); guard++; }
  return n === exclude ? (n + 1) % total : n;
};

export default function QuoteScreen() {
  const [idx, setIdx] = useState(() => pickRandom(quotes.length));
  const [toast, setToast] = useState('');
  const fade = useMemo(() => new Animated.Value(0), []);
  const scale = useMemo(() => new Animated.Value(0.92), []);

  useLayoutEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue:1, duration:340, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
      Animated.spring(scale, { toValue:1, useNativeDriver:true, speed:16, bounciness:6 }),
    ]).start();
  }, [fade, scale]);

  const current: Quote = useMemo(() => quotes[idx], [idx]);

  const showToast = (msg:string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1400);
  };

  const handleNewQuote = () => {
    impact();
    const next = pickRandomExcluding(quotes.length, idx);
    Animated.parallel([
      Animated.timing(fade, { toValue:0, duration:120, easing:Easing.in(Easing.cubic), useNativeDriver:true }),
      Animated.timing(scale, { toValue:0.94, duration:120, useNativeDriver:true }),
    ]).start(() => {
      setIdx(next);
      Animated.parallel([
        Animated.timing(fade, { toValue:1, duration:240, easing:Easing.out(Easing.cubic), useNativeDriver:true }),
        Animated.spring(scale, { toValue:1, useNativeDriver:true, speed:16, bounciness:6 }),
      ]).start();
    });
  };

  const formatted = `"${current.text}"\n— ${current.author}`;

  const handleCopy = async () => {
    impact();
    try {
      await Clipboard.setStringAsync(formatted);
      success();
      showToast('Copied to clipboard');
    } catch {
      showToast('Copy failed');
    }
  };

  const handleShare = async () => {
    impact();
    try {
      if (Platform.OS === 'web') {
        const nav: any = navigator as any;
        if (nav && nav.share) {
          await nav.share({ title:'Quote', text: formatted });
          success(); showToast('Shared');
          return;
        }
        throw new Error('no web share');
      }
      const uri = (FileSystem.cacheDirectory || '') + 'share-quote.txt';
      await FileSystem.writeAsStringAsync(uri, formatted);
      await Sharing.shareAsync(uri, { dialogTitle: 'Share quote' });
      success();
    } catch {
      // fallback to copy
      try { await Clipboard.setStringAsync(formatted); showToast('Copied to clipboard'); }
      catch { showToast('Share unavailable'); }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>Quotes</Text>
          <Text style={styles.tagline}>Tap below for inspiration</Text>
        </View>

        <View style={styles.cardShell}>
          <Animated.View style={[styles.animatedWrap, { opacity: fade, transform: [{ scale }] }]}>
            <QuoteCard text={current.text} author={current.author} />
          </Animated.View>
        </View>

        <View style={styles.actions}>
          <View style={styles.iconRow}>
            <IconButton iconName="copy-outline" label="Copy" onPress={handleCopy} accessibilityLabel="Copy quote" />
            <IconButton iconName="share-outline" label="Share" onPress={handleShare} accessibilityLabel="Share quote" />
          </View>
        </View>

        <View style={styles.footer}>
          <PrimaryButton label="New Quote" onPress={handleNewQuote} />
        </View>
      </View>

      <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toast ? 1 : 0 }]}>
        <Text style={styles.toastText}>{toast}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex:1, backgroundColor: colors.background },
  container: { flex:1, alignItems:'center', justifyContent:'center', paddingHorizontal: spacing.md, paddingTop: spacing.xl },
  header: { alignItems:'center', marginBottom: spacing.md },
  appTitle: { ...typography.display, color: colors.textPrimary, fontSize: 26 },
  tagline: { fontSize:14, color: colors.textSecondary, marginTop: 4 },
  cardShell: { flex:1, width:'100%', maxWidth: 480, alignItems:'center', justifyContent:'center' },
  animatedWrap: { width:'100%' },
  actions: { marginVertical: spacing.md, alignItems:'center' },
  iconRow: { flexDirection:'row', gap: spacing.md },
  footer: { width:'100%', maxWidth:480, paddingBottom: spacing.sm, borderTopWidth:1, borderTopColor: colors.border, backgroundColor: colors.card },
  toast: { position:'absolute', bottom: 80, left:0, right:0, alignItems:'center', backgroundColor: colors.textPrimary, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignSelf:'center', ...shadows.md },
  toastText: { color:'#fff', fontSize:13, fontWeight:'600' },
});

QuoteScreen.displayName = 'Quote';