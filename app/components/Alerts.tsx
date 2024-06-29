import { Alert as A } from "@material-tailwind/react";
import { useContext, useEffect, useState } from "react";

import { AlertContext, AlertMeta } from "~/contexts/AlertContext";

export default function Alerts() {
  const alerts = useContext(AlertContext);

  return (
    <div className="z-50 fixed top-28 left-1/2 -translate-x-1/2 w-2/3 mt-2">
      {alerts?.alerts.map((alert) => {
        return <Alert alert={alert} key={alert.id} />;
      })}
    </div>
  );
}

function Alert({ alert }: { alert: AlertMeta }) {
  const alerts = useContext(AlertContext);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setTimeout(clear, 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clear = () => {
    setOpen(false);
    setTimeout(() => {
      alerts?.clearAlert(alert.id);
    }, 200);
  };

  return (
    <A
      open={open}
      onClose={clear}
      animate={{
        initial: { x: -10000 },
        mount: { x: 0 },
        unmount: { x: 10000 },
      }}
      className="duration-200 ease-in-out transition"
      color={alert.color}
    >
      <div className="flex justify-between">
        {alert.message}
        {alert.link}
      </div>
    </A>
  );
}
