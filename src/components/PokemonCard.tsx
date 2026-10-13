import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Pokemon } from '../types/pokemon';
import {
  formatAbilityName,
  formatHeight,
  formatPokemonId,
  formatPokemonName,
  formatWeight,
} from '../utils/formatters';

interface PokemonCardProps {
  pokemon: Pokemon;
}

export const PokemonCard: React.FC<PokemonCardProps> = React.memo(({ pokemon }) => {
  const formattedName = formatPokemonName(pokemon.name);
  const formattedId = formatPokemonId(pokemon.id);
  const formattedHeight = formatHeight(pokemon.height);
  const formattedWeight = formatWeight(pokemon.weight);

  return (
    <View
      style={styles.card}
      accessibilityRole="text"
      accessibilityLabel={`Cartão do Pokémon ${formattedName}, identificador ${formattedId}, ordem ${pokemon.order}, altura ${formattedHeight}, peso ${formattedWeight}`}
    >
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{formattedName}</Text>
          <Text style={styles.order}>Ordem: #{pokemon.order}</Text>
        </View>
        <View style={styles.idBadge}>
          <Text style={styles.idBadgeText}>{formattedId}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          {pokemon.imageUrl ? (
            <Image
              source={{ uri: pokemon.imageUrl }}
              style={styles.image}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel={`Imagem do Pokémon ${formattedName}`}
            />
          ) : (
            <View
              style={styles.imagePlaceholder}
              accessibilityRole="image"
              accessibilityLabel={`Imagem indisponível para o Pokémon ${formattedName}`}
            >
              <Text style={styles.placeholderPokeball}>⚪</Text>
              <Text style={styles.imagePlaceholderText}>Sem Imagem</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Altura:</Text>
            <Text style={styles.statValue}>{formattedHeight}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Peso:</Text>
            <Text style={styles.statValue}>{formattedWeight}</Text>
          </View>
        </View>
      </View>

      <View style={styles.abilitiesSection}>
        <Text style={styles.abilitiesTitle}>Habilidades:</Text>
        <View style={styles.abilitiesList}>
          {pokemon.abilities.length > 0 ? (
            pokemon.abilities.map((ability, index) => (
              <View
                key={`${ability.name}-${index}`}
                style={[
                  styles.abilityBadge,
                  ability.isHidden && styles.abilityBadgeHidden,
                ]}
              >
                <Text
                  style={[
                    styles.abilityText,
                    ability.isHidden && styles.abilityTextHidden,
                  ]}
                >
                  {formatAbilityName(ability.name)}
                </Text>
                {ability.isHidden && (
                  <View style={styles.hiddenTag}>
                    <Text style={styles.hiddenTagText}>(Oculta)</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text style={styles.noAbilitiesText}>Nenhuma habilidade listada</Text>
          )}
        </View>
      </View>
    </View>
  );
});

PokemonCard.displayName = 'PokemonCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    // Android elevation
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    paddingBottom: 8,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  order: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  idBadge: {
    backgroundColor: '#FFE5E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  idBadgeText: {
    color: '#E3350D',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  imageContainer: {
    width: 110,
    height: 110,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  image: {
    width: 100,
    height: 100,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderPokeball: {
    fontSize: 26,
    marginBottom: 4,
  },
  imagePlaceholderText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
  },
  detailsContainer: {
    flex: 1,
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#636366',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  abilitiesSection: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  abilitiesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636366',
    marginBottom: 8,
  },
  abilitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FE',
    borderWidth: 1,
    borderColor: '#CCE0FC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  abilityBadgeHidden: {
    backgroundColor: '#F4EAFB',
    borderColor: '#E1C7F6',
  },
  abilityText: {
    fontSize: 13,
    color: '#1A56DB',
    fontWeight: '600',
  },
  abilityTextHidden: {
    color: '#6B21A8',
  },
  hiddenTag: {
    paddingLeft: 2,
  },
  hiddenTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9333EA',
  },
  noAbilitiesText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});
