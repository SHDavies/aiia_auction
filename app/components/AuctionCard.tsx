import { AdvancedImage, placeholder } from "@cloudinary/react";
import { Card, CardBody } from "@material-tailwind/react";

import { AuctionWithPhotoUrl } from "~/models/auction.server";
import { formatMoney } from "~/utils/utils";

interface AuctionCardProps {
  item: AuctionWithPhotoUrl;
}

export default function AuctionCard({ item }: AuctionCardProps) {
  return (
    <Card className="image-container max-w-none mb-6 relative !p-0 min-h-28 inline-block">
      {item.photoUrl ? (
        <AdvancedImage
          cldImg={item.photoUrl}
          plugins={[placeholder()]}
        ></AdvancedImage>
      ) : (
        ""
      )}
      <CardBody className="md:absolute md:bottom-4 md:left-4 md:rounded-[7px] bg-white p-4">
        <div>{item.name}</div>
        <div>{formatMoney(item.current_bid || item.starting_bid)}</div>
      </CardBody>
    </Card>
  );
}
