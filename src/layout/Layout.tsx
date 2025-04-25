import Sidebar from './Sidebar'
import { useState } from "react";
import {useAuth} from "../components/AuthContext"
import PurchaseList from "../components/InternalManager/PurchaseList";

export default function Layout()
{
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const {user} = useAuth();

  if (!user)
    return null;

  return (
    <div className="flex flex-col h-screen bg-gray-300">

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          role={user.role}
          currentUser={user.username}
          onSelect={setCurrentTable}
          currentTable={currentTable}
        />

        <main className="flex-1 p-6 overflow-auto">
        {!currentTable && <div>Виберіть таблицю</div>}

        {currentTable === "Purchases" && user.role === "InternalManager" && (
          <PurchaseList />
        )}

        {currentTable !== "Purchases" && currentTable && (
          <div>Вміст таблиці: {currentTable}</div>
        )}
        </main>
      </div>
    </div>
  );
}