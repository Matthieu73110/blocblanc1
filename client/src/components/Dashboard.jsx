import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import './AdminDashboard.css';

const baseURI = import.meta.env.VITE_API_BASE_URL;

const AdminDashboard = () => {
  const [clientCount, setClientCount] = useState(0);
  const [vehicules, setVehicules] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [newVehicule, setNewVehicule] = useState({ marque: '', modele: '', annee: '', client_id: '' });
  const [editVehicule, setEditVehicule] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  // Fetch all vehicles
  const fetchAllVehicules = async () => {
    try {
      const response = await fetch(baseURI + 'api/vehicules/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setVehicules(data);
      } else {
        alert('Erreur lors de la récupération des véhicules');
        navigate('/');
      }
    } catch (error) {
      alert('Erreur réseau');
      navigate('/');
    }
  };

  // Fetch clients
  const fetchClients = async () => {
    try {
      const response = await fetch(baseURI + 'api/clients/', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      } else {
        alert('Erreur lors de la récupération des clients');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  useEffect(() => {
    const fetchClientCount = async () => {
      try {
        const response = await fetch(baseURI + 'api/clients/count', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setClientCount(data.count);
        } else {
          alert('Erreur lors de la récupération du nombre de clients');
          navigate('/');
        }
      } catch (error) {
        alert('Erreur réseau');
        navigate('/');
      }
    };

    fetchClientCount();
    fetchAllVehicules();
    fetchClients();
  }, []);

  const columns = [
    { name: 'Marque', selector: row => row.marque, sortable: true },
    { name: 'Modèle', selector: row => row.modele, sortable: true },
    { name: 'Année', selector: row => row.annee, sortable: true },
    { name: 'Client ID', selector: row => row.client_id, sortable: true },
    {
      name: 'Actions',
      cell: row => (
        <div>
          <button onClick={() => handleEdit(row)}>Modifier</button>
          <button onClick={() => handleDelete(row.id)}>Supprimer</button>
        </div>
      ),
    },
  ];

  // Handle creation of a new vehicle
  const handleCreate = async () => {
    try {
      const response = await fetch(baseURI + 'api/vehicules/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newVehicule),
      });
      if (response.ok) {
        alert('Véhicule ajouté');
        setNewVehicule({ marque: '', modele: '', annee: '', client_id: '' });
        fetchAllVehicules();
      } else {
        alert('Erreur lors de l\'ajout du véhicule');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  // Handle update of an existing vehicle
  const handleUpdate = async () => {
    try {
      const response = await fetch(`${baseURI}api/vehicules/${editVehicule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editVehicule),
      });
      if (response.ok) {
        alert('Véhicule mis à jour');
        setIsEditing(false);
        setEditVehicule(null);
        fetchAllVehicules();
      } else {
        alert('Erreur lors de la mise à jour du véhicule');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  // Handle deletion of a vehicle
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${baseURI}api/vehicules/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        alert('Véhicule supprimé');
        fetchAllVehicules();
      } else {
        alert('Erreur lors de la suppression du véhicule');
      }
    } catch (error) {
      alert('Erreur réseau');
    }
  };

  // Handle edit action
  const handleEdit = (vehicule) => {
    setEditVehicule(vehicule);
    setIsEditing(true);
  };

  // Handle client selection
  const handleClientChange = (e) => {
    const selectedClientId = e.target.value;
    if (isEditing) {
      setEditVehicule({ ...editVehicule, client_id: selectedClientId });
    } else {
      setNewVehicule({ ...newVehicule, client_id: selectedClientId });
    }
  };

  // Filter vehicles based on search query
  const filteredData = vehicules.filter(vehicule =>
    Object.values(vehicule).some(value =>
      value && value.toString().toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div className="admin-dashboard">
      <h2>Tableau de bord admin</h2>
      <p>Nombre de clients inscrits : {clientCount}</p>

      <div className="search-container">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="form-container">
        <h3>{isEditing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}</h3>
        <input
          type="text"
          placeholder="Marque"
          value={isEditing ? editVehicule.marque : newVehicule.marque}
          onChange={(e) => isEditing ? setEditVehicule({ ...editVehicule, marque: e.target.value }) : setNewVehicule({ ...newVehicule, marque: e.target.value })}
        />
        <input
          type="text"
          placeholder="Modèle"
          value={isEditing ? editVehicule.modele : newVehicule.modele}
          onChange={(e) => isEditing ? setEditVehicule({ ...editVehicule, modele: e.target.value }) : setNewVehicule({ ...newVehicule, modele: e.target.value })}
        />
        <input
          type="number"
          placeholder="Année"
          value={isEditing ? editVehicule.annee : newVehicule.annee}
          onChange={(e) => isEditing ? setEditVehicule({ ...editVehicule, annee: e.target.value }) : setNewVehicule({ ...newVehicule, annee: e.target.value })}
        />
        <select
          value={isEditing ? editVehicule.client_id : newVehicule.client_id}
          onChange={handleClientChange}
        >
          <option value="">Sélectionnez un client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
        <button onClick={isEditing ? handleUpdate : handleCreate}>
          {isEditing ? 'Mettre à jour' : 'Ajouter'}
        </button>
      </div>

      <DataTable
        title="Véhicules"
        columns={columns}
        data={filteredData}
        pagination
      />
    </div>
  );
};

export default AdminDashboard;
