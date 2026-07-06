import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('Create User Dialog Interactions', () => {
    it('opens the dialog when "Add User" is clicked', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
      renderWithClient(<Users />);
      
      const addButton = await screen.findByText('Create User');
      await userEvent.click(addButton);
      
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });

    it('closes the dialog when ESC is pressed', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
      renderWithClient(<Users />);
      
      const addButton = await screen.findByText('Create User');
      await userEvent.click(addButton);
      
      expect(screen.getByText('Create New User')).toBeInTheDocument();
      
      // Press escape
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      
      expect(screen.queryByText('Create New User')).not.toBeInTheDocument();
    });

    it('closes the dialog when clicking outside (on the backdrop)', async () => {
      vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
      renderWithClient(<Users />);
      
      const addButton = await screen.findByText('Create User');
      await userEvent.click(addButton);
      
      expect(screen.getByText('Create New User')).toBeInTheDocument();
      
      // Click the backdrop (we added data-testid="modal-backdrop" to it)
      const backdrop = screen.getByTestId('modal-backdrop');
      await userEvent.click(backdrop);
      
      expect(screen.queryByText('Create New User')).not.toBeInTheDocument();
    });
  });

  describe('Edit User Dialog Interactions', () => {
    it('opens the edit dialog with populated data when edit button is clicked', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'admin',
          emailVerified: true,
          createdAt: '2023-01-01T12:00:00Z',
        }
      ];

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockUsers });
      renderWithClient(<Users />);
      
      // Wait for table to load
      await waitFor(() => {
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
      
      // Find and click the edit button
      const editButton = await screen.findByTitle('Edit User');
      await userEvent.click(editButton);
      
      // Verify modal opens
      expect(screen.getByText('Edit User')).toBeInTheDocument();
      
      // Verify form is populated
      const nameInput = screen.getByDisplayValue('Jane Smith');
      expect(nameInput).toBeInTheDocument();
      
      const emailInput = screen.getByDisplayValue('jane@example.com');
      expect(emailInput).toBeInTheDocument();
      
      const roleSelect = screen.getByDisplayValue('Admin'); // Wait, the select option is 'Admin', 'User', 'Agent'
      expect(roleSelect).toBeInTheDocument();
    });
  });

  describe('Delete User Dialog Interactions', () => {
    it('opens the delete dialog with confirmation when delete button is clicked', async () => {
      const mockUsers = [
        {
          id: '2',
          name: 'Delete Me',
          email: 'delete@example.com',
          role: 'user', // Admins can't be deleted, so we use 'user'
          emailVerified: true,
          createdAt: '2023-01-01T12:00:00Z',
        }
      ];

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockUsers });
      renderWithClient(<Users />);
      
      await waitFor(() => {
        expect(screen.getByText('Delete Me')).toBeInTheDocument();
      });
      
      const deleteButton = await screen.findByTitle('Delete User');
      await userEvent.click(deleteButton);
      
      // Verify modal opens
      expect(screen.getByText('Delete User')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      
      // Verify user info is shown in confirmation
      expect(screen.getAllByText('Delete Me').length).toBeGreaterThan(0);
    });
  });
});
