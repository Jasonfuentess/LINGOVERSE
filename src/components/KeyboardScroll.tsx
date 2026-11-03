import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import type { StyleProp, ViewStyle, TextInputProps } from 'react-native';
import { revealDelta, viewportObstruction } from './keyboardGeometry';

const FocusedGroup = createContext<(view: View | null) => void>(() => {});
export function KeyboardScroll({ children, contentContainerStyle }: PropsWithChildren<{ contentContainerStyle: StyleProp<ViewStyle> }>) {
  const scroll = useRef<ScrollView>(null);
  const viewport = useRef<View>(null);
  const active = useRef<View | null>(null);
  const offset = useRef(0);
  const frame = useRef<number | null>(null);
  const [obstruction, setObstruction] = useState(0);
  const reveal = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const target = active.current;
      if (!target) return;
      viewport.current?.measureInWindow((_x, top, _width, height) => {
        target.measureInWindow((_gx, groupTop, _gw, groupHeight) => {
          if (active.current !== target) return;
          const visual = Platform.OS === 'web' ? window.visualViewport : null;
          const bottom = visual && visual.scale === 1 ? Math.min(top + height, visual.offsetTop + visual.height) : top + height;
          const visibleTop = visual && visual.scale === 1 ? Math.max(top, visual.offsetTop) : top;
          const delta = revealDelta(groupTop, groupHeight, visibleTop + 12, bottom - 12);
          const node = Platform.OS === 'web' ? scroll.current?.getScrollableNode() as HTMLElement | undefined : undefined;
          const currentOffset = node?.scrollTop ?? offset.current;
          if (Math.abs(delta) > 1) scroll.current?.scrollTo({ y: Math.max(0, currentOffset + delta), animated: false });
        });
      });
    });
  }, []);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', reveal);
    const visual = Platform.OS === 'web' ? window.visualViewport : null;
    const resize = () => {
      setObstruction(visual ? viewportObstruction(window.innerHeight, visual.height, visual.offsetTop, visual.scale) : 0);
      reveal();
    };
    visual?.addEventListener('resize', resize);
    resize();
    return () => { show.remove(); visual?.removeEventListener('resize', resize); if (frame.current !== null) cancelAnimationFrame(frame.current); };
  }, [reveal]);
  const focus = useCallback((view: View | null) => { active.current = view; if (view) reveal(); }, [reveal]);
  return <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <View ref={viewport} style={{ flex: 1 }} onLayout={reveal}>
      <FocusedGroup.Provider value={focus}><ScrollView ref={scroll} style={{ flex: 1 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="none" automaticallyAdjustKeyboardInsets={false} onContentSizeChange={reveal} scrollEventThrottle={16} onScroll={event => { offset.current = event.nativeEvent.contentOffset.y; }} contentContainerStyle={[contentContainerStyle, obstruction > 0 && { paddingBottom: obstruction + 40 }]}>{children}</ScrollView></FocusedGroup.Provider>
    </View>
  </KeyboardAvoidingView>;
}
export function KeyboardAnswerGroup({ children, compact = false }: PropsWithChildren<{ compact?: boolean }>) {
  const ref = useRef<View>(null);
  const focus = useContext(FocusedGroup);
  useEffect(() => () => focus(null), [focus]);
  return <View ref={ref} style={{ gap: compact ? 12 : 20 }}>
    <AnswerFocus.Provider value={() => focus(ref.current)}>{children}</AnswerFocus.Provider>
  </View>;
}
const AnswerFocus = createContext<() => void>(() => {});
export function AnswerTextInput(props: TextInputProps) {
  const focus = useContext(AnswerFocus);
  const clear = useContext(FocusedGroup);
  return <TextInput {...props} onFocus={event => { focus(); props.onFocus?.(event); }} onBlur={event => { clear(null); props.onBlur?.(event); }} />;
}
