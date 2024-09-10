import tw from "@material-tailwind/react";
import { Link } from "@remix-run/react";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import { C2SEvents, S2CEvents } from "~/models/socket";
import { formatMoney, useOptionalUser } from "~/utils/utils";

import { AlertContext } from "./AlertContext";

interface ProviderProps {
  socket: Socket<S2CEvents, C2SEvents> | undefined;
  children: ReactNode;
}

const context = createContext<Socket<S2CEvents, C2SEvents> | undefined>(
  undefined,
);

export function useSocket() {
  return useContext(context);
}

export function SocketProvider({ socket, children }: ProviderProps) {
  const user = useOptionalUser();
  const alerts = useContext(AlertContext);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user && socket) {
      setConnected(true);
      socket.emit("init", user.id);

      socket.on("newBid", handleBid);

      return () => {
        socket?.off("newBid", handleBid);
      };
    }

    if (socket?.disconnected && connected) {
      // Give the socket 3 seconds to reconnect
      setTimeout(() => {
        if (socket.disconnected) {
          setConnected(false);
          alerts?.addAlert({
            message:
              "Auction updates are not currently working. Please refresh the page to reconnect.",
            color: "red",
          });
        }
      }, 3000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user]);

  const handleBid = ({
    auctionItemId,
    amount,
    itemName,
    userId,
  }: {
    auctionItemId: string;
    amount: number;
    itemName?: string;
    userId?: string;
  }) => {
    if (alerts && user?.id !== userId) {
      alerts.addAlert({
        message: `Someone has bid ${formatMoney(amount)} on ${
          itemName ?? "an item you're following"
        }`,
        color: "blue",
        link: !window.location.pathname.includes(auctionItemId) && (
          <Link to={`/auctions/${auctionItemId}`} prefetch="render">
            <tw.Button variant="outlined">View Item</tw.Button>
          </Link>
        ),
      });
    }
  };

  return <context.Provider value={socket}>{children}</context.Provider>;
}
