export interface SocketResponse {
  success: boolean;
  message: string;
}

export interface S2CEvents {
  confirmation: () => void;
  newBid: (data: {
    auctionItemId: string;
    amount: number;
    itemName?: string;
    userId?: string;
  }) => void;
  updateAmount: (auctionItemId: string, amount: number) => void;
}

export interface C2SEvents {
  init: (userId: string) => void;
  joinRoom: (auctionItemId: string) => void;
  leaveRoom: (auctionItemId: string) => void;
  joinPageRoom: (auctionItemId: string) => void;
  leavePageRoom: (auctionItemId: string) => void;
  testEvent: (auctionItemId: string) => void;
}

export interface SocketData {
  userId?: string;
}
