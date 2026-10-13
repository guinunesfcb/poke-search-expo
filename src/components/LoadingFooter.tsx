import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface LoadingFooterProps {
  isLoadingMore: boolean;
  hasReachedEnd: boolean;
  loadMoreError: string | null;
  onRetry: () => void;
}

export const LoadingFooter: React.FC<LoadingFooterProps> = ({
  isLoadingMore,
  hasReachedEnd,
  loadMoreError,
  onRetry,
}) => {
  if (isLoadingMore) {
    return (
      <View
        style={styles.container}
        accessibilityRole="progressbar"
        accessibilityLabel="Carregando mais Pokémon"
      >
        <ActivityIndicator size="small" color="#E3350D" />
        <Text style={styles.loadingText}>Carregando mais Pokémon...</Text>
      </View>
    );
  }

  if (loadMoreError) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{loadMoreError}</Text>
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Tentar carregar próxima página novamente"
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  if (hasReachedEnd) {
    return (
      <View style={styles.container}>
        <Text style={styles.endText}>
          Todos os Pokémon disponíveis foram carregados.
        </Text>
      </View>
    );
  }

  return <View style={styles.spacer} />;
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  spacer: {
    height: 24,
  },
  loadingText: {
    fontSize: 13,
    color: '#8E8E93',
  },
  errorText: {
    fontSize: 13,
    color: '#D32F2F',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFE5E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E3350D',
  },
  retryButtonPressed: {
    opacity: 0.7,
  },
  retryButtonText: {
    color: '#E3350D',
    fontSize: 13,
    fontWeight: '700',
  },
  endText: {
    fontSize: 13,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});
