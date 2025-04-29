import Sidebar from './Sidebar'
import { useState } from "react";
import {useAuth} from "../components/AuthContext"
import PurchaseList from "../components/InternalManager/Purchases/PurchaseList";
import SubscriptionList from "../components/InternalManager/SubscriptionList";
import AttendanceList from "../components/Trainer/AttendanceList";


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

        {currentTable === "Покупки" && user.role === "InternalManager" && (
          <PurchaseList />
        )}

        {currentTable === "Абонементи" && user.role === "InternalManager" && (
          <SubscriptionList />
        )}

        {currentTable === "Відвідування" && user.role === "Trainer" && (
          <AttendanceList />
        )}

        

        {currentTable !== "Purchases" && currentTable && (
          <div>Вміст таблиці: {currentTable}</div>
        )}
        </main>
      </div>
    </div>
  );
}