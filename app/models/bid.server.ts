import { db } from "~/db.server";

export interface NewBid {
  user_id: string;
  auction_item_id: string;
  amount: number;
}

export function createBid(bid: NewBid) {
  return db.transaction().execute(async (tx) => {
    const amount = await tx
      .selectFrom("bids")
      .select(({ eb }) => [eb.fn.max("amount").as("amount")])
      .where("bids.auction_item_id", "=", bid.auction_item_id)
      .executeTakeFirst();

    if (!amount) {
      const starting_bid = await tx
        .selectFrom("auction_items")
        .select("auction_items.starting_bid")
        .where("id", "=", bid.auction_item_id)
        .executeTakeFirstOrThrow();

      if (Number(starting_bid.starting_bid) >= bid.amount) {
        throw new Error("Bid is not greater than highest bid");
      }
    } else if (Number(amount.amount) >= bid.amount) {
      throw new Error("Bid is not greater than highest bid");
    }

    const w = await tx
      .insertInto("watches")
      .values({
        user_id: bid.user_id,
        auction_item_id: bid.auction_item_id,
      })
      .onConflict((oc) =>
        oc.constraint("watches_un").doUpdateSet({ user_id: bid.user_id }),
      )
      .returning("active")
      .executeTakeFirstOrThrow();

    const b = await tx
      .insertInto("bids")
      .values(bid)
      .returning((eb) =>
        eb
          .selectFrom("auction_items")
          .select("name")
          .where("auction_items.id", "=", bid.auction_item_id)
          .as("name"),
      )
      .executeTakeFirst();

    return { watching: w.active, ...b };
  });
}
