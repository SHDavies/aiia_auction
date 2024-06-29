import { Link } from "@remix-run/react";

import { AuctionWithPhotoUrl } from "~/models/auction.server";

import AuctionCard from "./AuctionCard";

interface AuctionCardsProps {
  items: AuctionWithPhotoUrl[];
}

export default function AuctionCards({ items }: AuctionCardsProps) {
  return (
    <div className="columns-1 gap-6 w-5/6 md:w-3/4 m-auto md:columns-2 lg:columns-3">
      {items.map((item) => (
        <Link
          prefetch="intent"
          to={`/auctions/${item.id}`}
          key={item.id}
          className="w-full"
        >
          <AuctionCard item={item} />
        </Link>
      ))}
    </div>
  );
}
