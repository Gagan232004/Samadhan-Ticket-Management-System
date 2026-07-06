import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TicketDetail from './TicketDetail';
import type { Ticket } from '../../types';

// Mock child components
vi.mock('./TicketHeader', () => ({
  default: ({ ticket }: { ticket: Ticket }) => <div data-testid="ticket-header">{ticket.subject}</div>
}));
vi.mock('./TicketDropdowns', () => ({
  default: () => <div data-testid="ticket-dropdowns">Dropdowns</div>
}));

describe('TicketDetail Component', () => {
  const mockTicket: Ticket = {
    id: 't-123',
    subject: 'System Down',
    body: 'The server is completely unresponsive.',
    status: 'Open',
    category: 'Technical_Questions',
    customerEmail: 'john@example.com',
    customerName: 'John Doe',
    assignedToId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockAgents = [
    { id: 'a1', name: 'Agent Smith', email: 'smith@example.com' }
  ];

  it('renders TicketHeader, TicketDropdowns, and Description', () => {
    render(
      <TicketDetail 
        ticket={mockTicket} 
        agents={mockAgents} 
        handleUpdate={vi.fn()} 
        isAssigning={false} 
      />
    );

    // Should render the mocked children
    expect(screen.getByTestId('ticket-header')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-header')).toHaveTextContent('System Down');
    expect(screen.getByTestId('ticket-dropdowns')).toBeInTheDocument();

    // Should render the description section
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('The server is completely unresponsive.')).toBeInTheDocument();
  });
});
