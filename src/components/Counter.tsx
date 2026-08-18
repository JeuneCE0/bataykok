import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleProp, Text, TextStyle } from 'react-native';

import { fmt } from '../game/formulas';

/** Compteur qui roule vers sa nouvelle valeur — les gains se voient. */
export default function Counter({
  value,
  style,
}: {
  value: number;
  style?: StyleProp<TextStyle>;
}) {
  const anim = useRef(new Animated.Value(value)).current;
  const [shown, setShown] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    const sub = anim.addListener(({ value: v }) => setShown(v));
    Animated.timing(anim, {
      toValue: value,
      duration: 550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(() => {
      anim.removeListener(sub);
      setShown(value);
    });
    return () => anim.removeListener(sub);
  }, [value, anim]);

  return <Text style={style}>{fmt(Math.round(shown))}</Text>;
}
