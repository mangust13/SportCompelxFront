import { useAuth } from "../components/AuthContext";

type Props = {
    username: string
    role: string
  }

  const getAvatarByRole = (role: string): string => {
    switch (role) {
      case 'Trainer':
        return './assets/Roles/Trainer.png';
      case 'InternalManager':
        return '/assets/Roles/InternalManager.png';
      case 'PurchaseManager':
        return '/assets/Roles/PurchaseManager.png';
      default:
        return '/assets/default.png';
    }
  };
  
  export default function UserProfile({ username, role }: Props) {
    const {logout} = useAuth();

     const avatarPath = getAvatarByRole(role);
  
    return (
      <div className="flex items-center gap-3 mt-4 pt-4 border-t">
        <img
            src={avatarPath}
            alt={username}
            className="w-9 h-9 rounded-full object-cover"
        />
        <div className="text-sm leading-tight">
          <div className="font-semibold">{username}</div>
          <div className="text-gray-500">{role}</div>
        </div>
        <button
            onClick={logout}
            className="text-xs text-red-500 hover:underline ml-auto cursor-pointer"
            >
      Вийти
    </button>
      </div>
    );
  }