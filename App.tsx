import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Hud from './src/components/Hud';
import { COLORS } from './src/components/ui';
import { useGame } from './src/store/gameStore';
import ArenaScreen from './src/screens/ArenaScreen';
import CharacterScreen from './src/screens/CharacterScreen';
import CreationScreen from './src/screens/CreationScreen';
import GuildScreen from './src/screens/GuildScreen';
import QuestScreen from './src/screens/QuestScreen';
import RankingScreen from './src/screens/RankingScreen';
import ShopScreen from './src/screens/ShopScreen';

type Tab = 'kok' | 'quetes' | 'rond' | 'palmares' | 'ecurie' | 'bazar';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'kok', label: 'Mon Kok', icon: '🐓' },
  { id: 'quetes', label: 'Quêtes', icon: '🗺️' },
  { id: 'rond', label: 'Le Rond', icon: '⚔️' },
  { id: 'palmares', label: 'Palmarès', icon: '🏆' },
  { id: 'ecurie', label: 'Écurie', icon: '🏠' },
  { id: 'bazar', label: 'Bazar', icon: '🛒' },
];

export default function App() {
  const player = useGame((s) => s.player);
  const ensureDaily = useGame((s) => s.ensureDaily);
  const [tab, setTab] = useState<Tab>('kok');

  useEffect(() => {
    ensureDaily();
    const t = setInterval(ensureDaily, 60_000);
    return () => clearInterval(t);
  }, [ensureDaily]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      {!player ? (
        <CreationScreen />
      ) : (
        <View style={{ flex: 1 }}>
          <Hud />
          <View style={{ flex: 1 }}>
            {tab === 'kok' && <CharacterScreen />}
            {tab === 'quetes' && <QuestScreen />}
            {tab === 'rond' && <ArenaScreen />}
            {tab === 'palmares' && <RankingScreen />}
            {tab === 'ecurie' && <GuildScreen />}
            {tab === 'bazar' && <ShopScreen />}
          </View>
          <View style={styles.tabBar}>
            {TABS.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[styles.tab, tab === t.id && styles.tabActive]}
                onPress={() => setTab(t.id)}
              >
                <Text style={styles.tabIcon}>{t.icon}</Text>
                <Text
                  style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}
                  numberOfLines={1}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgLight,
    borderTopWidth: 2,
    borderTopColor: COLORS.panelBorder,
    paddingBottom: 4,
    paddingTop: 6,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4, borderRadius: 8 },
  tabActive: { backgroundColor: 'rgba(244,196,48,0.15)' },
  tabIcon: { fontSize: 20 },
  tabLabel: { color: COLORS.textDim, fontSize: 9, fontWeight: '700', marginTop: 2 },
  tabLabelActive: { color: COLORS.gold },
});
