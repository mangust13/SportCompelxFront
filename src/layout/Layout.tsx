import Sidebar from './Sidebar'
import { useState } from "react";
import {useAuth} from "../components/AuthContext"
import PurchaseList from "../components/InternalManager/Purchases/PurchaseList";
import SubscriptionList from "../components/InternalManager/Subscriptions/SubscriptionList";
import TrainerList from "../components/InternalManager/Trainers/TrainerList";
import AttendanceList from "../components/Trainer/AttendanceList";
import OrderList from '../components/PurchaseManager/Orders/OrderList';
import TrainerProfile from '../components/Trainer/TrainerProfile';
import ProductList from '../components/PurchaseManager/Products/ProductList';
import InventoryList from '../components/PurchaseManager/Inventory/InventoryList';

export default function Layout()
{
    const {user} = useAuth();
    const [currentTable, setCurrentTable] = useState<string>(() => {
      if (user?.role === "InternalManager") return "Покупки";
      if (user?.role === "Trainer") return "Відвідування";
      if (user?.role === "PurchaseManager") return "Поставки";
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

          {/* InternalManager */}
          {currentTable === "Покупки" && user.role === "InternalManager" && (
            <PurchaseList />
          )}

          {currentTable === "Абонементи" && user.role === "InternalManager" && (
            <SubscriptionList />
          )}

          {currentTable === "Тренери" && user.role === "InternalManager" && (
            <TrainerList />
          )}

          {/* Trainer */}
          {currentTable === "Відвідування" && user.role === "Trainer" && (
            <AttendanceList />
          )}

          {currentTable === "Мій розклад" && user.role === "Trainer" && (
            <TrainerProfile />
          )}

          {/* PurchaseManager */}
          {currentTable === "Поставки" && user.role === "PurchaseManager" && (
            <OrderList />
          )}
          {currentTable === "Типи продуктів" && user.role === "PurchaseManager" && (
            <ProductList />
          )}
          {currentTable === "Інвентар у залі" && user.role === "PurchaseManager" && (
            <InventoryList />
          )}

          </main>
        </div>
      </div>
    );
}