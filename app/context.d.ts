import { Server } from "socket.io";

import { C2SEvents, S2CEvents, SocketData } from "./models/socket";

declare module "@remix-run/server-runtime" {
  export interface AppLoadContext {
    IO: Server<C2SEvents, S2CEvents, never, SocketData>;
  }
}
