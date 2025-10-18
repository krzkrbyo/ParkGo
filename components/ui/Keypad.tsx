import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface KeypadProps {
  onPress: (value: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onEnter?: () => void;
  showEnter?: boolean;
  style?: any;
}

export const Keypad: React.FC<KeypadProps> = ({
  onPress,
  onDelete,
  onClear,
  onEnter,
  showEnter = false,
  style,
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', '⌫'],
  ];

  const handleKeyPress = (key: string) => {
    switch (key) {
      case 'C':
        onClear();
        break;
      case '⌫':
        onDelete();
        break;
      default:
        onPress(key);
        break;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.key,
                key === 'C' && styles.clearKey,
                key === '⌫' && styles.deleteKey,
              ]}
              onPress={() => handleKeyPress(key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.keyText,
                key === 'C' && styles.clearKeyText,
                key === '⌫' && styles.deleteKeyText,
              ]}>
                {key}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      {showEnter && onEnter && (
        <View style={styles.enterRow}>
          <TouchableOpacity
            style={styles.enterKey}
            onPress={onEnter}
            activeOpacity={0.7}
          >
            <Text style={styles.enterKeyText}>ENTRAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  enterRow: {
    marginTop: 8,
  },
  key: {
    width: 60,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  clearKey: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  deleteKey: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  enterKey: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  clearKeyText: {
    color: '#DC2626',
  },
  deleteKeyText: {
    color: '#D97706',
  },
  enterKeyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
