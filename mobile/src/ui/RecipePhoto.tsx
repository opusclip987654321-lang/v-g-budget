import { memo, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '@/api';
import type { Recipe } from '@/domain';
import { t } from '@/i18n';
import { colors } from './theme';

// Photo de la recette, gardée sur le téléphone (expo-image) : rapide et visible hors connexion.
// Certaines viennent d'une planche de 9 photos (imageTile) : on n'en montre qu'une case.
export const RecipePhoto = memo(function RecipePhoto({ recipe, height = 150, style }: { recipe: Pick<Recipe, 'image' | 'imageTile' | 'title'>; height?: number; style?: StyleProp<ViewStyle> }) {
  const [width, setWidth] = useState(0);
  if (!recipe.image) return <View style={[styles.photo, styles.placeholder, { height }, style]}><Ionicons name="restaurant-outline" size={34} color={colors.green} /></View>;
  const uri = recipe.image.startsWith('http') ? recipe.image : `${API_URL}${recipe.image}`;
  const tile = recipe.imageTile;
  return <View style={[styles.photo, { height }, style]} onLayout={tile ? e => setWidth(e.nativeEvent.layout.width) : undefined} accessibilityRole="image" accessibilityLabel={t.recipes.photo(recipe.title)}>
    {tile ? width > 0 && <Image source={uri} cachePolicy="memory-disk" style={{ position: 'absolute', width: width * tile.columns, height: height * tile.rows, left: -tile.column * width, top: -tile.row * height }} />
      : <Image source={uri} cachePolicy="memory-disk" contentFit="cover" transition={150} style={StyleSheet.absoluteFill} />}
  </View>;
});

const styles = StyleSheet.create({
  photo: { borderRadius: 12, overflow: 'hidden', backgroundColor: colors.soft },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
});
