import { Server } from "socket.io";

import { C2SEvents, S2CEvents, SocketData } from "./models/socket";
import { getUserWatches } from "./models/watches.server";

export const IO = new Server<C2SEvents, S2CEvents, never, SocketData>();

export type IO = Server<C2SEvents, S2CEvents, never, SocketData>;

export interface LoaderContext {
  IO: IO;
}

IO.on("connection", async (socket) => {
  console.log(socket.id, "connected");

  socket.emit("confirmation");

  socket.onAny((e, ...args) => {
    console.log(e, args);
  });
  socket.onAnyOutgoing((e, ...args) => {
    console.log(e, args);
  });

  socket.on("init", async (userId) => {
    console.log("user init:", userId);
    socket.data.userId = userId;
    const userWatches = await getUserWatches(userId);
    console.log("watches:", userId, userWatches);
    for (const w of userWatches) {
      console.log(w);
      await socket.join(w.auction_item_id);
      console.log("joined", w.auction_item_id);
      console.log(IO.sockets.adapter.rooms);
    }
  });

  socket.on("joinRoom", (auctionItemId) => {
    socket.join(auctionItemId);
  });

  socket.on("leaveRoom", (auctionItemId) => {
    socket.leave(auctionItemId);
  });

  socket.on("joinPageRoom", (auctionItemId) => {
    socket.join(`${auctionItemId}-page`);
  });

  socket.on("leavePageRoom", (auctionItemId) => {
    socket.leave(`${auctionItemId}-page`);
  });

  socket.on("testEvent", (auctionItemId) => {
    IO.to(auctionItemId).emit("newBid", { auctionItemId, amount: 50 });

    IO.to(`${auctionItemId}-page`).emit("updateAmount", auctionItemId, 50);
  });
});
