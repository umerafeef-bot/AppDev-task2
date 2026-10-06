const fs = require('fs');
const base = 'C:/Users/UmerAfeef/Downloads/InternShip/AppDev/Task2';
const file = (rel) => base + '/' + rel;

function patch(rel, replacements) {
  const p = file(rel);
  let s = fs.readFileSync(p, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (s.indexOf(from) === -1) { console.log('  MISSING in ' + rel + ': ' + from.slice(0, 45)); continue; }
    s = s.split(from).join(to);
    changed = true;
    console.log('  patched in ' + rel + ': ' + from.slice(0, 45));
  }
  if (changed) fs.writeFileSync(p, s, 'utf8');
  return changed;
}

patch('src/components/PressableScale.tsx', [
  ["import { Animated, Pressable, PressableProps, StyleProp, ViewStyle, useAnimatedValue } from 'react-native';",
   "import { Animated, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';"],
  ["import { useCallback } from 'react';",
   "import { useCallback, useMemo } from 'react';"],
  ["  const anim = useAnimatedValue(1);",
   "  const anim = useMemo(() => new Animated.Value(1), []);"]
]);

patch('app/index.tsx', [
  ["import { View, Text, SafeAreaView, StyleSheet, Animated, Easing, Platform, useAnimatedValue } from 'react-native';",
   "import { View, Text, SafeAreaView, StyleSheet, Animated, Easing, Platform } from 'react-native';"],
  ["  const fade = useAnimatedValue(0);",
   "  const fade = useMemo(() => new Animated.Value(0), []);"],
  ["  const scale = useAnimatedValue(0.92);",
   "  const scale = useMemo(() => new Animated.Value(0.92), []);"]
]);

console.log('PATCH_DONE');