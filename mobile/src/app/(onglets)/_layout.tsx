import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChecked, useItems } from '@/store';
import { colors } from '@/ui';
import { t } from '@/i18n';

const icon = (name: keyof typeof Ionicons.glyphMap) => {
  const TabIcon = ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} size={size} color={color} />;
  return TabIcon;
};

// Onglets du bas, comme la barre mobile du site.
export default function TabsLayout() {
  const items = useItems(), checked = useChecked();
  const toBuy = items.filter(i => i.missing > 0 && !checked.includes(i.id)).length;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.green, tabBarInactiveTintColor: '#8a9a85', tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.border }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
    <Tabs.Screen name="index" options={{ title: t.tabs.week, tabBarIcon: icon('grid-outline') }} />
    <Tabs.Screen name="menus" options={{ title: t.tabs.menus, tabBarIcon: icon('calendar-outline') }} />
    <Tabs.Screen name="courses" options={{ title: t.tabs.shopping, tabBarIcon: icon('basket-outline'), tabBarBadge: toBuy || undefined, tabBarBadgeStyle: { backgroundColor: colors.lime, color: colors.green } }} />
    <Tabs.Screen name="recettes" options={{ title: t.tabs.recipes, tabBarIcon: icon('book-outline') }} />
    <Tabs.Screen name="compte" options={{ title: t.tabs.account, tabBarIcon: icon('person-outline') }} />
  </Tabs>;
}
