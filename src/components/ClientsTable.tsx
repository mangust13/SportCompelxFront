import { useEffect, useState } from 'react';
import axios from 'axios';

type Client = {
  clientId: number;
  clientFullName: string;
  gender: string;
  clientPhoneNumber: string;
};

const ClientsTable = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get<Client[]>('https://localhost:7270/api/clients')
      .then(response => {
        setClients(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Помилка при отриманні клієнтів:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center text-primary">Завантаження...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-primary">Клієнти</h2>
      <div className="overflow-x-auto shadow rounded-2xl">
        <table className="min-w-full bg-white text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">ПІБ</th>
              <th className="px-4 py-3">Стать</th>
              <th className="px-4 py-3">Телефон</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.clientId} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{client.clientId}</td>
                <td className="px-4 py-2">{client.clientFullName}</td>
                <td className="px-4 py-2">{client.gender}</td>
                <td className="px-4 py-2">{client.clientPhoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTable;
