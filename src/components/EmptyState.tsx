import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface EmptyStateProps {
  message: string;
  subMessage?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  subMessage,
}) => {
  return (
    <View
      style={styles.container}
      accessibilityRole="text"
      accessibilityLabel={`${message}${subMessage ? `. ${subMessage}` : ''}`}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>🔍</Text>
      </View>
      <Text style={styles.title}>{message}</Text>
      {subMessage && <Text style={styles.subTitle}>{subMessage}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    marginHorizontal: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3A3A3C',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
