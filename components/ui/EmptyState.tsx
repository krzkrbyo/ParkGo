import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';

interface EmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    title: string;
    onPress: () => void;
  } | React.ReactNode;
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  style,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      return (
        <Ionicons 
          name={icon as any} 
          size={64} 
          color={Colors.light.primary} 
        />
      );
    }
    
    return icon;
  };

  const renderAction = () => {
    if (!action) return null;
    
    if (typeof action === 'object' && 'title' in action && 'onPress' in action) {
      return (
        <AppButton
          title={action.title}
          onPress={action.onPress}
          style={styles.actionButton}
        />
      );
    }
    
    return action;
  };

  return (
    <View style={[styles.container, style]}>
      {icon && (
        <View style={styles.iconContainer}>
          {renderIcon()}
        </View>
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
      
      {action && (
        <View style={styles.actionContainer}>
          {renderAction()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    marginBottom: 16,
    opacity: 0.6,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  actionContainer: {
    marginTop: 16,
  },
  actionButton: {
    minWidth: 160,
  },
});
