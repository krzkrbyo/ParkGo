import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusPillProps {
  status: 'open' | 'closed' | 'active' | 'inactive' | 'success' | 'error' | 'warning';
  text: string;
  size?: 'small' | 'medium' | 'large';
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  text,
  size = 'medium',
}) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'open':
        return styles.open;
      case 'closed':
        return styles.closed;
      case 'active':
        return styles.active;
      case 'inactive':
        return styles.inactive;
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'warning':
        return styles.warning;
      default:
        return styles.open;
    }
  };

  const getTextStyle = () => {
    switch (status) {
      case 'open':
        return styles.openText;
      case 'closed':
        return styles.closedText;
      case 'active':
        return styles.activeText;
      case 'inactive':
        return styles.inactiveText;
      case 'success':
        return styles.successText;
      case 'error':
        return styles.errorText;
      case 'warning':
        return styles.warningText;
      default:
        return styles.openText;
    }
  };

  return (
    <View style={[styles.pill, styles[size], getStatusStyle()]}>
      <Text style={[styles.text, styles[`${size}Text`], getTextStyle()]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  open: {
    backgroundColor: '#FEF3C7',
  },
  closed: {
    backgroundColor: '#D1FAE5',
  },
  active: {
    backgroundColor: '#D1FAE5',
  },
  inactive: {
    backgroundColor: '#F3F4F6',
  },
  success: {
    backgroundColor: '#D1FAE5',
  },
  error: {
    backgroundColor: '#FEE2E2',
  },
  warning: {
    backgroundColor: '#FEF3C7',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  openText: {
    color: '#D97706',
  },
  closedText: {
    color: '#059669',
  },
  activeText: {
    color: '#059669',
  },
  inactiveText: {
    color: '#6B7280',
  },
  successText: {
    color: '#059669',
  },
  errorText: {
    color: '#DC2626',
  },
  warningText: {
    color: '#D97706',
  },
});
