import { create } from 'zustand';
import { db } from '../db/client';
import { calculateTotal } from '../services/pricing';
import { Payment, PaymentForm, Ticket, TicketForm } from '../types/models';

interface TicketsState {
  tickets: Ticket[];
  openTickets: Ticket[];
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
}

interface TicketsActions {
  setTickets: (tickets: Ticket[]) => void;
  setPayments: (payments: Payment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadTickets: () => Promise<void>;
  loadOpenTickets: () => Promise<void>;
  createTicket: (form: TicketForm) => Promise<string>;
  closeTicket: (ticketId: string, exitTime: string) => Promise<void>;
  processPayment: (form: PaymentForm) => Promise<void>;
  getTicketById: (id: string) => Ticket | null;
  getPaymentsForTicket: (ticketId: string) => Payment[];
  searchTickets: (query: string) => Ticket[];
  getTicketsByDateRange: (startDate: string, endDate: string) => Ticket[];
  clearError: () => void;
}

type TicketsStore = TicketsState & TicketsActions;

export const useTicketsStore = create<TicketsStore>((set, get) => ({
  // State
  tickets: [],
  openTickets: [],
  payments: [],
  isLoading: false,
  error: null,

  // Actions
  setTickets: (tickets) => set({ tickets, error: null }),

  setPayments: (payments) => set({ payments, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  loadTickets: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Ensure database is initialized
      if (!db.isInitialized()) {
        await db.init();
      }
      
      const [tickets, payments] = await Promise.all([
        db.findAll<Ticket>('tickets', 'status = ?', ['closed']),
        db.findAll<Payment>('payments')
      ]);
      
      set({ tickets, payments, isLoading: false });
    } catch (error) {
      console.error('Error loading tickets:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tickets',
        isLoading: false 
      });
    }
  },

  loadOpenTickets: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Ensure database is initialized
      if (!db.isInitialized()) {
        await db.init();
      }
      
      const openTickets = await db.findAll<Ticket>('tickets', 'status = ?', ['open']);
      set({ openTickets, isLoading: false });
    } catch (error) {
      console.error('Error loading open tickets:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load open tickets',
        isLoading: false 
      });
    }
  },

  createTicket: async (form) => {
    set({ isLoading: true, error: null });
    
    try {
      // Get active rate plan
      const ratePlans = await db.findAll('rate_plans', 'active = 1');
      if (ratePlans.length === 0) {
        throw new Error('No hay un plan de tarifas activo');
      }
      
      const activeRatePlan = ratePlans[0];
      
      const ticketData: Omit<Ticket, keyof any> = {
        status: 'open',
        vehicle_type_id: form.vehicle_type_id,
        plate: form.plate.toUpperCase(),
        barcode: form.barcode || null,
        entry_time: new Date().toISOString(),
        exit_time: null,
        duration_minutes: null,
        rate_plan_id: activeRatePlan.id,
        total: null,
        created_by: 'system', // This should come from auth
      };

      const ticketId = await db.insert<Ticket>('tickets', ticketData);
      
      // Reload open tickets
      await get().loadOpenTickets();
      
      set({ isLoading: false });
      return ticketId;
    } catch (error) {
      console.error('Error creating ticket:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create ticket',
        isLoading: false 
      });
      throw error;
    }
  },

  closeTicket: async (ticketId, exitTime) => {
    set({ isLoading: true, error: null });
    
    try {
      const ticket = await db.findById<Ticket>('tickets', ticketId);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      if (ticket.status === 'closed') {
        throw new Error('El ticket ya está cerrado');
      }

      // Calculate total
      const [vehicleType, ratePlan, rateItem] = await Promise.all([
        db.findById('vehicle_types', ticket.vehicle_type_id),
        db.findById('rate_plans', ticket.rate_plan_id),
        db.findOne('rate_items', 'rate_plan_id = ? AND vehicle_type_id = ?', [ticket.rate_plan_id, ticket.vehicle_type_id])
      ]);

      if (!vehicleType || !ratePlan || !rateItem) {
        throw new Error('Datos de tarifas no encontrados');
      }

      const pricing = calculateTotal({
        entry: ticket.entry_time,
        exit: exitTime,
        vehicleTypeId: ticket.vehicle_type_id,
        plan: ratePlan,
        rulesForType: rateItem
      });

      // Update ticket
      await db.update('tickets', ticketId, {
        status: 'closed',
        exit_time: exitTime,
        duration_minutes: pricing.durationMinutes,
        total: pricing.total
      });

      // Reload tickets
      await Promise.all([get().loadTickets(), get().loadOpenTickets()]);
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error closing ticket:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to close ticket',
        isLoading: false 
      });
      throw error;
    }
  },

  processPayment: async (form) => {
    set({ isLoading: true, error: null });
    
    try {
      const ticket = await db.findById<Ticket>('tickets', form.ticket_id);
      if (!ticket) {
        throw new Error('Ticket no encontrado');
      }

      if (ticket.status !== 'closed') {
        throw new Error('El ticket debe estar cerrado para procesar el pago');
      }

      if (!ticket.total) {
        throw new Error('El ticket no tiene un total calculado');
      }

      if (form.amount < ticket.total) {
        throw new Error('El monto pagado es menor al total del ticket');
      }

      const paymentData: Omit<Payment, keyof any> = {
        ticket_id: form.ticket_id,
        method: form.method,
        amount: form.amount,
        change: form.change
      };

      await db.insert<Payment>('payments', paymentData);
      
      // Reload payments
      await get().loadTickets();
      
      set({ isLoading: false });
    } catch (error) {
      console.error('Error processing payment:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to process payment',
        isLoading: false 
      });
      throw error;
    }
  },

  getTicketById: (id) => {
    const { tickets, openTickets } = get();
    return [...tickets, ...openTickets].find(ticket => ticket.id === id) || null;
  },

  getPaymentsForTicket: (ticketId) => {
    const { payments } = get();
    return payments.filter(payment => payment.ticket_id === ticketId);
  },

  searchTickets: (query) => {
    const { tickets } = get();
    const searchQuery = query.toLowerCase();
    return tickets.filter(ticket => 
      ticket.plate.toLowerCase().includes(searchQuery) ||
      ticket.id.toLowerCase().includes(searchQuery) ||
      (ticket.barcode && ticket.barcode.toLowerCase().includes(searchQuery))
    );
  },

  getTicketsByDateRange: (startDate, endDate) => {
    const { tickets } = get();
    return tickets.filter(ticket => 
      ticket.entry_time >= startDate && ticket.entry_time <= endDate
    );
  },

  clearError: () => set({ error: null }),
}));
