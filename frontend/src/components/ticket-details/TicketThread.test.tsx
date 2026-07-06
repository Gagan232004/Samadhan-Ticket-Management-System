import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TicketThread from './TicketThread';
import type { Ticket } from '../../types';

describe('TicketThread Component', () => {
  const baseTicket: Ticket = {
    id: 't-123',
    subject: 'System Down',
    body: 'The server is completely unresponsive.',
    status: 'Open',
    category: 'Technical_Questions',
    customerEmail: 'customer@example.com',
    customerName: 'Alice Customer',
    assignedToId: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('renders nothing when there are no replies', () => {
    const { container } = render(<TicketThread ticket={{ ...baseTicket, replies: [] }} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a customer reply correctly', () => {
    const ticketWithCustomerReply = {
      ...baseTicket,
      replies: [
        {
          id: 'r-1',
          body: 'I am still waiting for a fix.',
          senderType: 'CUSTOMER',
          createdAt: '2026-01-02T10:00:00.000Z'
        }
      ]
    };
    
    render(<TicketThread ticket={ticketWithCustomerReply} />);
    
    // Should render the customer name and role
    expect(screen.getByText('Alice Customer')).toBeInTheDocument();
    expect(screen.getByText('CUSTOMER')).toBeInTheDocument();
    
    // Should render the message body
    expect(screen.getByText('I am still waiting for a fix.')).toBeInTheDocument();
    
    // Should render the initials (A for Alice)
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders an agent reply correctly', () => {
    const ticketWithAgentReply = {
      ...baseTicket,
      replies: [
        {
          id: 'r-2',
          body: 'We are working on it now.',
          senderType: 'AGENT',
          user: { name: 'Bob Agent' },
          createdAt: '2026-01-02T11:00:00.000Z'
        }
      ]
    };
    
    render(<TicketThread ticket={ticketWithAgentReply} />);
    
    // Should render the agent name and role
    expect(screen.getByText('Bob Agent')).toBeInTheDocument();
    expect(screen.getByText('AGENT')).toBeInTheDocument();
    
    // Should render the message body
    expect(screen.getByText('We are working on it now.')).toBeInTheDocument();
    
    // Should render the initials (B for Bob)
    expect(screen.getByText('B')).toBeInTheDocument();
  });
});
