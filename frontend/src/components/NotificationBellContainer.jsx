import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell/NotificationBell";

export default function NotificationBellContainer() {
  const isLoggedIn = useAuth();

  if (!isLoggedIn) {
    return null;
  }

  return <NotificationBell />;
}
