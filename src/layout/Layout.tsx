import Sidebar from './Sidebar'
import { useState } from "react";
import {useAuth} from "../components/AuthContext"
import PurchaseList from "../components/InternalManager/Purchases/PurchaseList";
import SubscriptionList from "../components/InternalManager/Subscriptions/SubscriptionList";
import TrainerList from "../components/InternalManager/Trainers/TrainerList";
import AttendanceList from "../components/Trainer/AttendanceList";

export default function Layout()
{
    const {user} = useAuth();
    const [currentTable, setCurrentTable] = useState<string>(() => {
      if (user?.role === "InternalManager") return "Покупки";
      if (user?.role === "Trainer") return "Відвідування";
      return "";
    });

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

          {currentTable === "Тренери" && user.role === "InternalManager" && (
            <TrainerList />
          )}

          {currentTable === "Відвідування" && user.role === "Trainer" && (
            <AttendanceList />
          )}

          </main>
        </div>
      </div>
    );
}