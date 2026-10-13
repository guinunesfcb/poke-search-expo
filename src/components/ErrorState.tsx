import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <View
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={`Alerta: ${message}`}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>⚠️</Text>
      </View>
      <Text style={styles.message}>{message}</Text>

      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          accessibilityHint="Executa novamente a requisição que falhou"
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 22,
  },
  message: {
    fontSize: 15,
    color: '#C62828',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#E3350D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonPressed: {
    backgroundColor: '#B82806',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
