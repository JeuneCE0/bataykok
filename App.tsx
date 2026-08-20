import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/baloo-2';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import Backdrop from './src/components/Backdrop';
import DailyModal from './src/components/DailyModal';
import DefenseReport from './src/components/DefenseReport';
import Hud from './src/components/Hud';
import LevelUpOverlay from './src/components/LevelUpOverlay';
import Rooster from './src/components/Rooster';
import StepBanner from './src/components/StepBanner';
import TalentModal from './src/components/TalentModal';
import { BODY_COLORS, COMB_COLORS } from './src/game/cosmetics';
import ArenaScreen from './src/screens/ArenaScreen';
import CharacterScreen from './src/screens/CharacterScreen';
import CreationScreen from './src/screens/CreationScreen';
import DungeonScreen from './src/screens/DungeonScreen';
import GuildScreen from './src/screens/GuildScreen';
import QuestScreen from './src/screens/QuestScreen';
import ShopScreen from './src/screens/ShopScreen';
import { flushEvents, trackEvent } from './src/lib/analytics';
import { initSound, releaseSound } from './src/lib/sound';
import { useOnlineSync } from './src/lib/useOnlineSync';
import { useAlerts } from './src/store/alerts';
import { TransKey } from './src/i18n';
import { useT } from './src/i18n/useT';
import { useGame } from './src/store/gameStore';
import { C, F, G, R } from './src/theme';
import OfferModal from './src/components/OfferModal';

type Tab = 'kok' | 'quetes' | 'rond' | 'donjon' | 'ecurie' | 'bazar';

const TABS: { id: Tab; key: TransKey; icon: string }[] = [
  { id: 'kok', key: 'tab.kok', icon: '🐓' },
  { id: 'quetes', key: 'tab.quetes', icon: '🗺️' },
  { id: 'rond', key: 'tab.rond', icon: '⚔️' },
  { id: 'donjon', key: 'tab.donjon', icon: '🗝️' },
  { id: 'ecurie', key: 'tab.ecurie', icon: '🏠' },
  { id: 'bazar', key: 'tab.bazar', icon: '🛒' },
];

export default function App() {
  const player = useGame((s) => s.player);
  const combatActive = useGame((s) => s.combatActive);
  const ensureDaily = useGame((s) => s.ensureDaily);
  const regenTickets = useGame((s) => s.regenTickets);
  useOnlineSync();
  const [tab, setTab] = useState<Tab>('kok');
  const [fontsLoaded] = useFonts({
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
  });

  useEffect(() => {
    trackEvent('app_open', { hasPlayer: Boolean(player) });
    void initSound();
    return () => {
      flushEvents();
      releaseSound();
    };
    // au montage seulement : c'est l'ouverture de l'app
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    trackEvent('screen_view', { tab });
  }, [tab]);

  useEffect(() => {
    ensureDaily();
    const t = setInterval(ensureDaily, 60_000);
    // pas de setState ici : réveiller App toutes les deux secondes
    // re-rendait aussi l'écran affiché, combat compris
    const tick = setInterval(regenTickets, 2_000);
    return () => {
      clearInterval(t);
      clearInterval(tick);
    };
  }, [ensureDaily, regenTickets]);

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <Backdrop />
        <StatusBar style="light" />
        {!fontsLoaded ? (
          <Splash />
        ) : (
          <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {!player ? (
              <CreationScreen />
            ) : (
              <View style={{ flex: 1 }}>
                {!combatActive && <Hud />}
                {!combatActive && <OfferModal />}
                {/* Le fil rouge ne vit que sur l'écran d'accueil : partout
                    ailleurs il répétait une consigne pour un écran qu'on avait
                    déjà quitté, et mangeait de la hauteur. */}
                {!combatActive && tab === 'kok' && <StepBanner onGo={setTab} />}
                <View style={{ flex: 1 }}>
                  {tab === 'kok' && <CharacterScreen />}
                  {tab === 'quetes' && <QuestScreen />}
                  {tab === 'rond' && <ArenaScreen />}
                  {tab === 'donjon' && <DungeonScreen />}
                  {tab === 'ecurie' && <GuildScreen />}
                  {tab === 'bazar' && <ShopScreen />}
                </View>
                {!combatActive && <TabBar active={tab} onChange={setTab} />}
                <DailyModal />
                <DefenseReport />
                <LevelUpOverlay />
                <TalentModal />
              </View>
            )}
          </SafeAreaView>
        )}
      </View>
    </SafeAreaProvider>
  );
}

function TabBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  const alerts = useAlerts();
  const t = useT();
  return (
    <LinearGradient
      colors={['rgba(12,7,20,0.5)', 'rgba(12,7,20,0.97)']}
      style={styles.tabBar}
    >
      {TABS.map((item) => {
        const on = item.id === active;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            style={({ pressed }) => [
              styles.tab,
              pressed && !on ? { opacity: 0.6 } : null,
            ]}
          >
            {on ? (
              <LinearGradient
                colors={G.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.tabPill}
              >
                <Text style={styles.tabIcon}>{item.icon}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabPillOff}>
                <Text style={[styles.tabIcon, { opacity: 0.55 }]}>{item.icon}</Text>
              </View>
            )}
            {alerts[item.id] && !on && <View style={styles.tabDot} />}
            <Text
              style={[styles.tabLabel, on ? styles.tabLabelOn : null]}
              numberOfLines={1}
            >
              {t(item.key)}
            </Text>
          </Pressable>
        );
      })}
    </LinearGradient>
  );
}

function Splash() {
  return (
    <View style={styles.splash}>
      <Rooster
        appearance={{
          bodyColor: BODY_COLORS[0],
          combColor: COMB_COLORS[0],
          tailPalette: 0,
          accessory: 0,
        }}
        size={170}
      />
      <Text style={styles.splashTitle}>BATAY KOK</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.night },
  safe: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  splashTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: C.gold,
    letterSpacing: 3,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,246,232,0.10)',
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  tabPill: {
    width: 46,
    height: 30,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.gold,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  tabPillOff: {
    width: 46,
    height: 30,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: { fontSize: 17 },
  tabLabel: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    color: C.textDim,
    letterSpacing: 0.1,
  },
  tabLabelOn: { color: C.gold },
  tabDot: {
    position: 'absolute',
    top: 1,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 4,
    backgroundColor: C.ember,
    borderWidth: 1.5,
    borderColor: C.night,
  },
});
