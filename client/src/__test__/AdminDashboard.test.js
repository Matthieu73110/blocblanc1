import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '../AdminDashboard';

// Mock fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ count: 5 }),
  })
);

describe('AdminDashboard', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('should display client count', async () => {
    render(<AdminDashboard />);

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/clients/count', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    await waitFor(() => {
      expect(screen.getByText(/Nombre de clients inscrits : 5/i)).toBeInTheDocument();
    });
  });

  it('should handle adding a new vehicle', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    render(<AdminDashboard />);

    fireEvent.change(screen.getByPlaceholderText(/Marque/i), { target: { value: 'Toyota' } });
    fireEvent.change(screen.getByPlaceholderText(/Modèle/i), { target: { value: 'Corolla' } });
    fireEvent.change(screen.getByPlaceholderText(/Année/i), { target: { value: '2020' } });
    
    fireEvent.click(screen.getByText(/Ajouter/i));

    await waitFor(() => {
      expect(screen.getByText(/Véhicule ajouté/i)).toBeInTheDocument();
    });
  });

  it('should handle editing a vehicle', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    render(<AdminDashboard />);

    // Simulate editing a vehicle
    fireEvent.change(screen.getByPlaceholderText(/Marque/i), { target: { value: 'Honda' } });
    fireEvent.click(screen.getByText(/Mettre à jour/i));

    await waitFor(() => {
      expect(screen.getByText(/Véhicule mis à jour/i)).toBeInTheDocument();
    });
  });

  it('should handle deleting a vehicle', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
      })
    );

    render(<AdminDashboard />);

    fireEvent.click(screen.getByText(/Supprimer/i));

    await waitFor(() => {
      expect(screen.getByText(/Véhicule supprimé/i)).toBeInTheDocument();
    });
  });
});
