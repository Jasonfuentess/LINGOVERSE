import { useEffect, useState, type PropsWithChildren } from 'react';
import { AccessibilityInfo, Animated, Image, StyleSheet, Text, View } from 'react-native';

const travelPortraits = ['Maya', 'Nora', 'Ben', 'Ollie', 'Asha', 'Leo', 'Juliette', 'Inès', 'Adrien', 'Nadia', 'Margot', 'Émile', 'Zoé'];
const portraits = ['Lucie', 'Samir', 'Camille', 'Alex', 'Noémie', 'Hugo'];
export function CharacterPortrait({ name, size = 64 }: { name: string; size?: number }) {
  const coachIndex = ['Luz', 'Toño', 'Vale', 'Romi'].indexOf(name);
  const index = coachIndex >= 0 ? coachIndex : portraits.indexOf(name);
  const columns = coachIndex >= 0 ? 2 : 3;
  const travelIndex = travelPortraits.indexOf(name);
  if (index < 0 && travelIndex >= 0) return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: size * 0.24, overflow: 'hidden', backgroundColor: '#EFE3CC' }}>
    <Image source={require('../../assets/adventure/characters-ui01.jpg')} resizeMode="stretch" style={{ position: 'absolute', width: size * 4, height: size * 4, left: -(travelIndex % 4) * size, top: -Math.floor(travelIndex / 4) * size }} />
  </View>;
  if (index < 0) return null;
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: size * 0.24, overflow: 'hidden', backgroundColor: '#EFE3CC' }}>
    <Image source={coachIndex >= 0 ? require('../../assets/adventure/coaches.jpg') : require('../../assets/adventure/portraits.jpg')} resizeMode="stretch" style={{ position: 'absolute', width: size * columns, height: size * 2, left: -(index % columns) * size, top: -Math.floor(index / columns) * size }} />
  </View>;
}
export function SceneArtwork({ language = 'fr', adventure = 'cafe', variantId, expanded = false, compact = false, height: preferredHeight }: { language?: 'fr' | 'en'; adventure?: 'cafe' | 'rendezvous'; variantId?: string; expanded?: boolean; compact?: boolean; height?: number }) {
  const [width, setWidth] = useState(320);
  const tile = language === 'en' ? 1 : adventure === 'rendezvous' ? variantId === 'quai-des-cartes' ? 3 : 2 : 0;
  const height = preferredHeight ?? (compact ? 120 : expanded ? 260 : 180);
  const tileWidth = Math.max(width, height * 3 / 2);
  const tileHeight = tileWidth * 2 / 3;
  return <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" onLayout={event => setWidth(event.nativeEvent.layout.width)} style={{ height, width: '100%', overflow: 'hidden', backgroundColor: '#183443' }}>
    <Image source={require('../../assets/adventure/atlas-ui01.jpg')} resizeMode="stretch" style={{ position: 'absolute', width: tileWidth * 2, height: tileHeight * 2, left: -(tile % 2) * tileWidth - (tileWidth - width) / 2, top: -Math.floor(tile / 2) * tileHeight - (tileHeight - height) / 2 }} />
  </View>;
}
/** Original lightweight scenery built from RN primitives: no stock art, licenses or new dependencies. */
export function RendezvousArtwork({ riverside }: { riverside: boolean }) {
  return <View accessible={false} style={[art.parisSky, riverside && art.riverSky]}>
    <View style={art.parisMoon} />
    <View style={[art.parisRoof, { left: '4%', width: 75, height: 38 }]} />
    <View style={[art.parisRoof, { left: '27%', width: 45, height: 48 }]} />
    <View style={[art.parisRoof, { right: '5%', width: 80, height: 52 }]} />
    <View style={art.parisGround} />
    {riverside ? <>
      <View style={art.parisRiver} /><View style={art.parisBridge}><View style={art.bridgeArch} /></View>
      <View style={art.parisKiosk}><View style={art.kioskRoof} /><View style={art.kioskWindow} /></View>
      <Text style={art.parisLabel}>PARIS  /  LE QUAI</Text>
    </> : <>
      <View style={art.parisTreeLeft}><View style={art.parisLeaf} /></View>
      <View style={[art.parisTreeLeft, { left: '77%', bottom: 18, height: 43 }]}><View style={[art.parisLeaf, { backgroundColor: '#63755A' }]} /></View>
      <View style={art.parisFountain}><View style={art.parisWater} /></View>
      <Text style={art.parisLabel}>PARIS  /  LE JARDIN</Text>
    </>}
  </View>;
}
// No delay, movement, or blocked input. Start fully visible until the preference is known.
export function TurnEntrance({ children }: PropsWithChildren) {
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    let active = true;
    let animation: Animated.CompositeAnimation | undefined;
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', reduced => {
      if (reduced) { animation?.stop(); opacity.setValue(1); }
    });
    void AccessibilityInfo.isReduceMotionEnabled().then(reduced => {
      if (!active || reduced) return;
      opacity.setValue(0.65);
      animation = Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true });
      animation.start();
    }).catch(() => { /* Fully visible if preference cannot be read. */ });
    return () => { active = false; animation?.stop(); subscription.remove(); };
  }, [opacity]);
  return <Animated.View style={{ opacity }}>{children}</Animated.View>;
}

const art = StyleSheet.create({
  parisSky: { height: 138, overflow: 'hidden', backgroundColor: '#4E6270', position: 'relative' },
  riverSky: { backgroundColor: '#344D68' },
  parisMoon: { position: 'absolute', right: 95, top: 13, width: 23, height: 23, borderRadius: 12, backgroundColor: '#F5D89A' },
  parisRoof: { position: 'absolute', bottom: 36, backgroundColor: '#8A8E86', borderTopLeftRadius: 12, borderTopRightRadius: 8 },
  parisGround: { position: 'absolute', bottom: 0, height: 37, width: '100%', backgroundColor: '#C4B18F' },
  parisRiver: { position: 'absolute', bottom: 0, width: '100%', height: 40, backgroundColor: '#65899A' },
  parisBridge: { position: 'absolute', bottom: 32, left: '31%', width: '42%', height: 17, backgroundColor: '#CDBFA5', borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center' },
  bridgeArch: { position: 'absolute', bottom: -1, height: 9, width: '75%', borderTopLeftRadius: 70, borderTopRightRadius: 70, backgroundColor: '#65899A' },
  parisKiosk: { position: 'absolute', bottom: 35, right: 23, height: 39, width: 38, backgroundColor: '#668472', borderWidth: 2, borderColor: '#D6E2D3' },
  kioskRoof: { position: 'absolute', top: -9, left: -5, width: 45, height: 11, borderTopLeftRadius: 9, borderTopRightRadius: 9, backgroundColor: '#375849' },
  kioskWindow: { margin: 6, height: 14, backgroundColor: '#E4D6AE' },
  parisTreeLeft: { position: 'absolute', bottom: 18, left: '13%', width: 9, height: 46, backgroundColor: '#6E5143', alignItems: 'center' },
  parisLeaf: { position: 'absolute', bottom: 23, width: 58, height: 44, borderRadius: 25, backgroundColor: '#76886B' },
  parisFountain: { position: 'absolute', bottom: 24, left: '47%', width: 58, height: 14, borderRadius: 10, backgroundColor: '#E3DDD1', borderWidth: 3, borderColor: '#A1BBC2' },
  parisWater: { position: 'absolute', bottom: 7, left: 23, width: 4, height: 33, backgroundColor: '#A3D7DE', borderRadius: 3 },
  parisLabel: { position: 'absolute', left: 13, top: 10, fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#FFF1D8' },
  sky: { height: 112, overflow: 'hidden', backgroundColor: '#233649', justifyContent: 'flex-end' },
  skyLabel: { position: 'absolute', left: 14, top: 10, color: '#F9DBA5', fontSize: 10, letterSpacing: 2.6, fontWeight: '800' },
  block: { position: 'absolute', bottom: 0, backgroundColor: '#40586C', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  tower: { position: 'absolute', bottom: 0, left: '42%', width: 23, height: 88, backgroundColor: '#D9AD76', borderTopLeftRadius: 2, borderTopRightRadius: 2, alignItems: 'center' },
  clock: { marginTop: 18, width: 17, height: 17, borderRadius: 9, borderWidth: 2, borderColor: '#233649', backgroundColor: '#F8EFD5' },
  spire: { position: 'absolute', bottom: 88, width: 5, height: 13, backgroundColor: '#E7C68C' },
  bus: { position: 'absolute', bottom: 4, right: 12, width: 78, height: 35, borderRadius: 5, backgroundColor: '#C64943', borderBottomWidth: 5, borderBottomColor: '#9B3738' },
  busWindows: { marginTop: 7, marginHorizontal: 7, height: 11, borderRadius: 2, backgroundColor: '#F9DDAB' },
  wheelLeft: { position: 'absolute', bottom: -4, left: 12, width: 14, height: 14, backgroundColor: '#182B38', borderRadius: 8 },
  wheelRight: { position: 'absolute', bottom: -4, right: 12, width: 14, height: 14, backgroundColor: '#182B38', borderRadius: 8 },
});
