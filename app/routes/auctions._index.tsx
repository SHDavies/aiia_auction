import { json, useLoaderData } from "@remix-run/react";
import { useContext } from "react";

import AuctionCards from "~/components/AuctionCards";
import { CloudinaryContext } from "~/contexts/CloudinaryContext";
import {
  AuctionWithPhotoUrl,
  getMostRecentActiveAuctions,
  getMostRecentUpdatedAuctions,
} from "~/models/auction.server";

export const loader = async () => {
  const items = await getMostRecentActiveAuctions(20);

  if (items.length < 20) {
    items.push(...(await getMostRecentUpdatedAuctions(20 - items.length)));
  }

  return json(
    items.filter((r, i) => items.findIndex((a) => a.id === r.id) === i),
  );
};

export default function AuctionsIndex() {
  const items = useLoaderData<typeof loader>();
  const cloudinary = useContext(CloudinaryContext);

  const auction_items: AuctionWithPhotoUrl[] = items.map((item) => {
    return {
      ...item,
      photoUrl: item.photo_id ? cloudinary.image(item.photo_id) : null,
    };
  });

  return (
    <div className="pt-8 lg:pt-0">
      <AuctionCards items={auction_items} />
    </div>
  );
}
