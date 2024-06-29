import { color } from "@material-tailwind/react/types/components/alert";
import { PropsWithChildren, ReactNode, createContext, useState } from "react";

export interface AlertMeta {
  id: string;
  message: string;
  color: color;
  link?: ReactNode;
}

interface AlertInterface {
  alerts: AlertMeta[];
  addAlert(alert: Omit<AlertMeta, "id">): void;
  clearAlert(id: string): void;
}

export const AlertContext = createContext<AlertInterface | null>(null);

export const AlertContextProvider = ({ children }: PropsWithChildren) => {
  const [alerts, setAlerts] = useState<AlertMeta[]>([]);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        addAlert(alert) {
          const a = {
            ...alert,
            id: (Math.random() + 1).toString(36).substring(2),
          };
          setAlerts((as) => [a, ...as]);
        },
        clearAlert(id) {
          setAlerts((as) => as.filter((a) => a.id !== id));
        },
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
