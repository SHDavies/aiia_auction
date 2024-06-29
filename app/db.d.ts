import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Numeric = ColumnType<string, number | string, number | string>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface AuctionItems {
  created_at: Generated<Timestamp>;
  description: string | null;
  estimated_value: Numeric;
  id: Generated<string>;
  name: string;
  starting_bid: Numeric;
  photo_id: string | null;
  updated_at: Generated<Timestamp>;
}

export interface Bids {
  amount: Numeric;
  auction_item_id: string;
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  user_id: string;
}

export interface Users {
  created_at: Generated<Timestamp>;
  email: string;
  hash: string;
  id: Generated<string>;
  is_admin: Generated<boolean>;
  updated_at: Generated<Timestamp>;
}

export interface Watches {
  id: Generated<string>;
  user_id: string;
  auction_item_id: string;
  active: Generated<boolean>;
}

export interface DB {
  auction_items: AuctionItems;
  bids: Bids;
  users: Users;
  watches: Watches;
}
