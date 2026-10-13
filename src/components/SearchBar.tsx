import React from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  onClear: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  isLoading,
  disabled = false,
}) => {
  const handleSearchPress = () => {
    Keyboard.dismiss();
    onSearch();
  };

  const handleClearPress = () => {
    onClear();
  };

  const isActionDisabled = isLoading || disabled;

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Nome (ex: pikachu) ou ID (ex: 25)"
          placeholderTextColor="#8E8E93"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={handleSearchPress}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isActionDisabled}
          accessibilityRole="search"
          accessibilityLabel="Campo para pesquisar Pokémon por nome ou número"
          accessibilityHint="Digite o nome como pikachu ou o número da Pokédex como 25"
        />

        {value.length > 0 && !isLoading && (
          <Pressable
            onPress={handleClearPress}
            style={({ pressed }) => [
              styles.clearButton,
              pressed && styles.clearButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Limpar texto da pesquisa"
            accessibilityHint="Limpa o termo digitado no campo de busca"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={handleSearchPress}
        disabled={isActionDisabled}
        accessibilityRole="button"
        accessibilityLabel="Buscar Pokémon"
        accessibilityHint="Executa a consulta do Pokémon na PokéAPI"
        accessibilityState={{ disabled: isActionDisabled }}
        style={({ pressed }) => [
          styles.searchButton,
          isActionDisabled && styles.searchButtonDisabled,
          pressed && !isActionDisabled && styles.searchButtonPressed,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.searchButtonText}>Buscar</Text>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D1D1D6',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    paddingVertical: 10,
  },
  clearButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonPressed: {
    opacity: 0.6,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#E3350D',
    borderRadius: 10,
    paddingHorizontal: 18,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchButtonDisabled: {
    backgroundColor: '#E0A89C',
    elevation: 0,
    shadowOpacity: 0,
  },
  searchButtonPressed: {
    backgroundColor: '#B82806',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
