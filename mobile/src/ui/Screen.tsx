import type { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { s } from './styles';

// En-tête de page : surtitre, titre, introduction. Sert aussi d'en-tête aux longues listes (FlashList).
export function PageHeader({ eyebrow, title, intro, banner }: { eyebrow?: string; title: string; intro?: string; banner?: ReactNode }) {
  return <View style={s.header}>
    {eyebrow ? <Text style={s.eyebrow}>{eyebrow.toUpperCase()}</Text> : null}
    <Text style={s.title} accessibilityRole="header">{title}</Text>
    {intro ? <Text style={s.intro}>{intro}</Text> : null}
    {banner}
  </View>;
}

// Page standard : l'en-tête puis le contenu (défilant par défaut).
export function Screen({ children, eyebrow, title, intro, banner, scroll = true, safeTop = true }: { children?: ReactNode; eyebrow?: string; title: string; intro?: string; banner?: ReactNode; scroll?: boolean; safeTop?: boolean }) {
  const body = <><PageHeader eyebrow={eyebrow} title={title} intro={intro} banner={banner} />{children}</>;
  return <SafeAreaView style={s.screen} edges={safeTop ? ['top'] : []}>
    {scroll ? <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">{body}</ScrollView> : <View style={[s.content, { flex: 1 }]}>{body}</View>}
  </SafeAreaView>;
}
