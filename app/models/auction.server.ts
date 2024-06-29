import { CloudinaryImage } from "@cloudinary/url-gen";

import { db } from "~/db.server";

export interface AuctionItem {
  id: string;
  name: string;
  description?: string;
  estimated_value: number;
  starting_bid: number;
  photo_id?: string;
}

export interface AuctionItemSimple {
  id: string;
  name: string;
  photo_id: string | null;
  starting_bid: number;
  current_bid?: number;
}

export interface AuctionItemDetail extends AuctionItemSimple {
  description?: string;
  estimated_value: string;
}

export interface AuctionWithPhotoUrl extends AuctionItemSimple {
  photoUrl: CloudinaryImage | null;
}

export async function getAuctionItem(id: string) {
  return db
    .selectFrom("auction_items")
    .leftJoin("bids", "auction_items.id", "bids.auction_item_id")
    .where("auction_items.id", "=", id)
    .select(({ eb }) => [
      eb.fn.max("bids.amount").as("max_bid"),
      "auction_items.starting_bid",
      "auction_items.id",
      "auction_items.name",
      "auction_items.description",
      "auction_items.photo_id",
      "auction_items.estimated_value",
    ])
    .groupBy("auction_items.id")
    .executeTakeFirstOrThrow();
  // .with("most_recent_bid", (db) =>
  //   db
  //     .selectFrom("bids")
  //     .distinctOn("auction_item_id")
  //     .select(["amount", "auction_item_id"])
  //     .where("auction_item_id", "=", id)
  //     .orderBy(["bids.created_at desc"])
  //     .limit(1),
  // )
  // .selectFrom("most_recent_bid")
  // .rightJoin("auction_items", "auction_item_id", "auction_items.id")
  // .selectAll()
  // .where("id", "=", id)
  // .executeTakeFirstOrThrow();
}

export async function getMostRecentActiveAuctions(
  count: number,
): Promise<AuctionItemSimple[]> {
  const rows = await db
    .with("most_recent_bids", (db) =>
      db
        .selectFrom("bids")
        .distinctOn("auction_item_id")
        .select(["amount", "auction_item_id", "created_at"])
        .orderBy(["auction_item_id", "bids.created_at desc"])
        .limit(count),
    )
    .selectFrom("most_recent_bids")
    .innerJoin("auction_items", "auction_item_id", "auction_items.id")
    .select([
      "auction_items.id as id",
      "name",
      "photo_id",
      "starting_bid",
      "most_recent_bids.amount as current_bid",
    ])
    .execute();

  return rows.map((r) => ({
    ...r,
    current_bid: Number(r.current_bid),
    starting_bid: Number(r.starting_bid),
  }));
}

export async function getMostRecentUpdatedAuctions(
  count: number,
): Promise<AuctionItemSimple[]> {
  const rows = await db
    .with("most_recent_bids", (db) =>
      db
        .selectFrom("bids")
        .distinctOn("auction_item_id")
        .select(["amount", "auction_item_id", "created_at"])
        .orderBy(["auction_item_id", "bids.created_at desc"]),
    )
    .selectFrom("auction_items")
    .leftJoin(
      "most_recent_bids",
      "most_recent_bids.auction_item_id",
      "auction_items.id",
    )
    .select([
      "auction_items.id as id",
      "name",
      "photo_id",
      "starting_bid",
      "most_recent_bids.amount as current_bid",
    ])
    .orderBy("auction_items.updated_at desc")
    .limit(count)
    .execute();

  return rows.map((r) => ({
    ...r,
    current_bid: Number(r.current_bid),
    starting_bid: Number(r.starting_bid),
  }));
}

export async function createAuctionItem(item: Omit<AuctionItem, "id">) {
  return db
    .insertInto("auction_items")
    .values(item)
    .returning("id")
    .executeTakeFirstOrThrow();
}
