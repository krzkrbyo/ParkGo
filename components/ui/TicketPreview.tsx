import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatCurrency, formatDateTime, formatDuration } from '../../services/pricing';
import { RatePlan, Ticket, VehicleType } from '../types/models';

interface TicketPreviewProps {
  ticket: Ticket;
  vehicleType: VehicleType;
  ratePlan: RatePlan;
  isExit?: boolean;
  style?: any;
}

export const TicketPreview: React.FC<TicketPreviewProps> = ({
  ticket,
  vehicleType,
  ratePlan,
  isExit = false,
  style,
}) => {
  const currentTime = isExit ? ticket.exit_time! : ticket.entry_time;
  const ticketType = isExit ? 'SALIDA' : 'ENTRADA';

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.businessName}>PARKGO</Text>
        <Text style={styles.location}>Estacionamiento</Text>
      </View>
      
      <View style={styles.ticketType}>
        <Text style={styles.ticketTypeText}>TICKET DE {ticketType}</Text>
      </View>
      
      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ticket #:</Text>
          <Text style={styles.value}>{ticket.id.substring(0, 8)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{formatDateTime(currentTime)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>{vehicleType.name}</Text>
        </View>
        {isExit && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Duración:</Text>
            <Text style={styles.value}>{formatDuration(ticket.duration_minutes || 0)}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.plate}>
        <Text style={styles.plateText}>{ticket.plate}</Text>
      </View>
      
      {ticket.barcode && (
        <View style={styles.barcode}>
          <Text style={styles.barcodeText}>Barcode: {ticket.barcode}</Text>
        </View>
      )}
      
      {isExit && ticket.total && (
        <View style={styles.total}>
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>Total a Pagar:</Text>
            <Text style={styles.totalValue}>{formatCurrency(ticket.total, ratePlan.currency)}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Gracias por usar PARKGO</Text>
        <Text style={styles.footerText}>Conserve este ticket</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxWidth: 300,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 8,
  },
  businessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  location: {
    fontSize: 10,
    color: '#6B7280',
  },
  ticketType: {
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
    alignItems: 'center',
  },
  ticketTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  info: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  label: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    color: Colors.light.text,
  },
  plate: {
    borderWidth: 2,
    borderColor: Colors.light.text,
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  plateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  barcode: {
    alignItems: 'center',
    marginVertical: 8,
  },
  barcodeText: {
    fontSize: 10,
    color: Colors.light.text,
  },
  total: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
});
