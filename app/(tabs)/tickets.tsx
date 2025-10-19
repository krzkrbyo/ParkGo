import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField } from '@/components/ui/FormField';
import { StatusPill } from '@/components/ui/StatusPill';
import { Colors } from '@/constants/theme';
import { useDatabase } from '@/hooks/useDatabase';
import { formatDateTime, formatDuration } from '@/services/pricing';
import { useTicketsStore } from '@/store/ticketsSlice';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function TicketsScreen() {
  const { 
    tickets, 
    openTickets, 
    isLoading, 
    error, 
    loadTickets, 
    loadOpenTickets, 
    clearError,
    searchTickets,
    getTicketById,
    selectedTickets,
    isSelectionMode,
    toggleSelectionMode,
    toggleTicketSelection,
    selectAllTickets,
    clearSelection,
    deleteSelectedTickets,
    deleteTicket
  } = useTicketsStore();

  const { isInitialized, isInitializing, error: dbError } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTickets, setFilteredTickets] = useState<any[]>([]);

  useEffect(() => {
    if (isInitialized) {
      loadTickets();
      loadOpenTickets();
    }
  }, [isInitialized]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchTickets(searchQuery);
      setFilteredTickets(results);
    } else {
      setFilteredTickets([]);
    }
  }, [searchQuery, tickets, openTickets]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const results = searchTickets(searchQuery);
    if (results.length === 0) {
      // Try to find by exact ID
      const exactTicket = getTicketById(searchQuery.trim());
      if (exactTicket) {
        setFilteredTickets([exactTicket]);
      } else {
        setFilteredTickets([]);
      }
    } else {
      setFilteredTickets(results);
    }
  };

  const handleRefresh = () => {
    loadTickets();
    loadOpenTickets();
  };

  const handleTicketPress = (ticketId: string) => {
    if (isSelectionMode) {
      toggleTicketSelection(ticketId);
    } else {
      router.push(`/tickets/${ticketId}`);
    }
  };

  const handleToggleSelection = () => {
    toggleSelectionMode();
  };

  const handleSelectAll = () => {
    selectAllTickets();
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  const handleDeleteSelected = async () => {
    if (selectedTickets.length === 0) return;
    
    try {
      await deleteSelectedTickets();
    } catch (error) {
      console.error('Error deleting tickets:', error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket(ticketId);
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const handleNewTicket = () => {
    router.push('/entry/new');
  };

  const renderTicket = ({ item }: { item: any }) => {
    const isSelected = selectedTickets.includes(item.id);
    
    return (
      <AppCard 
        style={[
          styles.ticketCard,
          isSelectionMode && styles.ticketCardSelectable,
          isSelected && styles.ticketCardSelected
        ]}
        onPress={() => handleTicketPress(item.id)}
      >
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            <View style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected
            ]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </View>
        )}
        
        <View style={styles.ticketContent}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketPlate}>{item.plate}</Text>
            <StatusPill status={item.status} />
          </View>
          
          <Text style={styles.ticketTime}>
            {formatDateTime(item.entry_time)}
          </Text>
          
          {item.status === 'closed' && (
            <View style={styles.ticketFooter}>
              <Text style={styles.ticketDuration}>
                {formatDuration(item.duration_minutes)}
              </Text>
              <Text style={styles.ticketTotal}>
                ${item.total?.toFixed(2) || '0.00'}
              </Text>
            </View>
          )}
        </View>
      </AppCard>
    );
  };

  if (isInitializing || (isLoading && tickets.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>
          {isInitializing ? 'Inicializando base de datos...' : 'Cargando tickets...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <AppButton
          title="Reintentar"
          onPress={handleRefresh}
          style={styles.retryButton}
        />
      </View>
    );
  }

  const allTickets = [...openTickets, ...tickets];
  const sortedTickets = allTickets.sort((a, b) => 
    new Date(b.entry_time).getTime() - new Date(a.entry_time).getTime()
  );

  const displayTickets = filteredTickets.length > 0 ? filteredTickets : sortedTickets;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tickets</Text>
        <View style={styles.headerActions}>
          {isSelectionMode ? (
            <>
              <AppButton
                title="Cancelar"
                onPress={handleToggleSelection}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
              <AppButton
                title="Eliminar"
                onPress={handleDeleteSelected}
                variant="danger"
                size="small"
                style={styles.actionButton}
                disabled={selectedTickets.length === 0}
              />
            </>
          ) : (
            <>
              <AppButton
                title="Seleccionar"
                onPress={handleToggleSelection}
                variant="outline"
                size="small"
                style={styles.actionButton}
              />
              <AppButton
                title="Nueva Entrada"
                onPress={handleNewTicket}
                size="small"
                style={styles.actionButton}
              />
            </>
          )}
        </View>
      </View>

      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <Text style={styles.selectionText}>
            {selectedTickets.length} ticket{selectedTickets.length !== 1 ? 's' : ''} seleccionado{selectedTickets.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.selectionActions}>
            <AppButton
              title="Seleccionar Todo"
              onPress={handleSelectAll}
              variant="outline"
              size="small"
              style={styles.selectionButton}
            />
            <AppButton
              title="Limpiar"
              onPress={handleClearSelection}
              variant="outline"
              size="small"
              style={styles.selectionButton}
            />
          </View>
        </View>
      )}

      <View style={styles.searchSection}>
        <AppCard style={styles.searchCard}>
          <FormField
            label="Buscar Ticket"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="ID del ticket, placa o barcode"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            rightIcon={
              <Text style={styles.searchIcon}>🔍</Text>
            }
            onRightIconPress={handleSearch}
          />
          {searchQuery.trim() && (
            <AppButton
              title="Limpiar"
              onPress={() => setSearchQuery('')}
              variant="outline"
              size="small"
              style={styles.clearButton}
            />
          )}
        </AppCard>
      </View>

      {displayTickets.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title={searchQuery.trim() ? "No se encontraron tickets" : "No hay tickets"}
          description={searchQuery.trim() ? "Intenta con otro término de búsqueda" : "Crea tu primer ticket de estacionamiento"}
          action={searchQuery.trim() ? undefined : {
            title: "Nueva Entrada",
            onPress: handleNewTicket,
          }}
        />
      ) : (
        <FlatList
          data={displayTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[Colors.light.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchCard: {
    padding: 16,
  },
  searchIcon: {
    fontSize: 16,
    color: Colors.light.primary,
  },
  clearButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  newButton: {
    minWidth: 120,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    marginLeft: 4,
  },
  selectionHeader: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  ticketCard: {
    marginBottom: 12,
  },
  ticketCardSelectable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketCardSelected: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
    backgroundColor: Colors.light.primary + '10',
  },
  selectionIndicator: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.light.text,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ticketContent: {
    flex: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketPlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  ticketTime: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.text,
  },
  ticketDuration: {
    fontSize: 14,
    color: Colors.light.text,
  },
  ticketTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
});
