import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Users from './Users';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

// Mock axios
vi.mock('axios');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Turn off retries for testing
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Users Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading skeletons initially', () => {
    // We mock a pending promise so it stays in loading state
    vi.mocked(axios.get).mockImplementation(() => new Promise(() => {}));
    
    const { container } = renderWithClient(<Users />);
    
    // Check if skeletons are rendered (we have 5 rows by default with animate-pulse)
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(5);
  });

  it('renders a list of users successfully', async () => {
    const mockUsers = [
      {
        id: '1',
        name: 'Alice Admin',
        email: 'alice@ticketly.com',
        role: 'admin',
        emailVerified: true,
        createdAt: '2023-01-01T12:00:00Z',
      },
      {
        id: '2',
        name: 'Bob Agent',
        email: 'bob@ticketly.com',
        role: 'agent',
        emailVerified: false,
        createdAt: '2023-01-02T12:00:00Z',
      }
    ];

    vi.mocked(axios.get).mockResolvedValueOnce({ data: mockUsers });

    renderWithClient(<Users />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Alice Admin')).toBeInTheDocument();
    });

    expect(screen.getByText('alice@ticketly.com')).toBeInTheDocument();
    expect(screen.getByText('Bob Agent')).toBeInTheDocument();
    expect(screen.getByText('bob@ticketly.com')).toBeInTheDocument();
    
    // Check statuses
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByText('Unverified')).toBeInTheDocument();
  });

  it('displays an error message when the API call fails', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce({
      response: {
        status: 500,
        data: { error: 'Database connection failed' }
      }
    });

    renderWithClient(<Users />);

    await waitFor(() => {
      expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    });
  });

  it('displays a forbidden message on 403', async () => {
    vi.mocked(axios.get).mockRejectedValueOnce({
      response: {
        status: 403,
      }
    });

    renderWithClient(<Users />);

    await waitFor(() => {
      expect(screen.getByText('Forbidden: You do not have permission to view this.')).toBeInTheDocument();
    });
  });
});
