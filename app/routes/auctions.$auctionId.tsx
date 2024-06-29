/* eslint-disable react-hooks/exhaustive-deps */
import { AdvancedImage, placeholder, responsive } from "@cloudinary/react";
import { CloudinaryImage } from "@cloudinary/url-gen";
import {
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
} from "@material-tailwind/react";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { memo, useContext, useEffect, useState } from "react";

import BidModal from "~/components/BidModal";
import Card from "~/components/Card";
import CopyIcon from "~/components/icons/CopyIcon";
import ExpandIcon from "~/components/icons/ExpandIcon";
import EyeDisabledIcon from "~/components/icons/EyeDisabledIcon";
import EyeIcon from "~/components/icons/EyeIcon";
import { AlertContext } from "~/contexts/AlertContext";
import { CloudinaryContext } from "~/contexts/CloudinaryContext";
import { LoaderContext } from "~/contexts/LoaderContext";
import { useSocket } from "~/contexts/SocketContext";
import { getAuctionItem } from "~/models/auction.server";
import { createBid } from "~/models/bid.server";
import { checkForUserWatch, setWatch, unwatch } from "~/models/watches.server";
import { getUserFromSession, requireUser } from "~/session.server";
import { formatMoney, useOptionalUser } from "~/utils/utils";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await getUserFromSession(request);
  const id = params["auctionId"];
  if (id) {
    const [auctionItem, isUserWatching] = await Promise.all([
      getAuctionItem(id),
      user ? checkForUserWatch(user.id, id) : Promise.resolve(false),
    ]);
    return json({
      auctionItem,
      isUserWatching,
      showDebug: process.env.NODE_ENV === "development",
    });
  }
  throw new Response("not found", { status: 404 });
};

export const action = async ({
  params,
  request,
  context,
}: LoaderFunctionArgs): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> => {
  const user = await requireUser(request);

  const auction_item_id = params["auctionId"];
  if (auction_item_id) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    switch (intent) {
      case "newBid": {
        const amount = Number(formData.get("amount"));
        if (isNaN(amount)) {
          throw new Response("invalid bid", { status: 400 });
        }

        let name;
        let isWatching;
        try {
          const res = await createBid({
            user_id: user.id,
            auction_item_id,
            amount,
          });
          name = res?.name;
          isWatching = res?.watching;
        } catch (e) {
          return { success: false, message: String(e) };
        }

        context.IO.to(auction_item_id).emit("newBid", {
          auctionItemId: auction_item_id,
          amount,
          itemName: name || undefined,
          userId: user.id,
        });

        context.IO.to(`${auction_item_id}-page`).emit(
          "updateAmount",
          auction_item_id,
          amount,
        );

        return { success: true, message: "ok", data: { isWatching } };
      }
      case "toggleWatch": {
        const isWatching = formData.get("isWatching") === "true";
        const w = { user_id: user.id, auction_item_id };
        if (isWatching) {
          await setWatch(w);
        } else {
          await unwatch(w);
        }
        return { success: true, message: "ok" };
      }
    }
  }
  throw new Response("not found", { status: 404 });
};

export default function AuctionPage() {
  const { auctionItem, isUserWatching, showDebug } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const alerts = useContext(AlertContext);
  const cloudinary = useContext(CloudinaryContext);
  const user = useOptionalUser();
  const socket = useSocket();
  const loading = useContext(LoaderContext);

  const [currentBid, setCurrentBid] = useState(
    Number(auctionItem.max_bid || auctionItem.starting_bid),
  );
  const [highlight, setHighlight] = useState(false);
  const [copyText, setCopyText] = useState("Copy URL");
  const [photoUrl, setPhotoUrl] = useState<CloudinaryImage | null>(null);

  const handleUpdateAmount = (auctionItemId: string, amount: number) => {
    if (auctionItemId === auctionItem.id) {
      setCurrentBid(amount);
      setHighlight(true);
      setTimeout(() => {
        setHighlight(false);
      }, 1200);
    }
  };

  useEffect(() => {
    const url = auctionItem.photo_id
      ? cloudinary.image(auctionItem.photo_id)
      : null;

    setPhotoUrl(url);
  }, [auctionItem]);

  useEffect(() => {
    if (
      Number(auctionItem.max_bid || auctionItem.starting_bid) !== currentBid
    ) {
      setCurrentBid(Number(auctionItem.max_bid || auctionItem.starting_bid));
      setTimeout(() => {
        setHighlight(true);
      }, 500);
      setTimeout(() => {
        setHighlight(false);
      }, 1200);
    }
  }, [auctionItem]);

  useEffect(() => {
    if (socket) {
      socket?.on("updateAmount", handleUpdateAmount);
      socket.emit("joinPageRoom", auctionItem.id);
      return () => {
        socket?.off("updateAmount", handleUpdateAmount);
        socket.emit("leavePageRoom", auctionItem.id);
      };
    }
  }, [socket]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (fetcher.data?.success && fetcher.formData?.get("intent") === "newBid") {
      setOpen(false);
      alerts?.addAlert({
        message: "Your bid was successful!",
        color: "green",
      });
      if (fetcher.data.data.isWatching) {
        socket?.emit("joinRoom", auctionItem.id);
      }
    } else if (fetcher.data && !fetcher.data.success && fetcher.data.message) {
      setOpen(false);
      alerts?.addAlert({
        message: `An error occurred while sending your bid: ${fetcher.data.message}`,
        color: "red",
      });
    }
  }, [fetcher.data]);

  useEffect(() => {
    if (fetcher.state !== "idle") {
      loading?.startLoading();
    } else {
      loading?.finishLoading();
    }
  }, [fetcher.state]);

  const bid = Number(auctionItem.max_bid || auctionItem.starting_bid);
  const defaultIncrease = bid + (bid <= 10 ? 1 : 10);
  const [defaultVal, setDefaultVal] = useState(defaultIncrease);

  const toggleModalFunc = (increase?: number) => {
    return () => {
      setDefaultVal(increase ? bid + increase : defaultIncrease);
      toggleModal();
    };
  };

  const toggleModal = () => {
    setOpen(!open);
  };

  const sendTestEvent = () => {
    socket?.emit("testEvent", auctionItem.id);
  };

  const toggleWatch = () => {
    const isWatching = !isUserWatching;
    fetcher.submit({ intent: "toggleWatch", isWatching }, { method: "put" });
    if (isWatching) {
      socket?.emit("joinRoom", auctionItem.id);
    } else {
      socket?.emit("leaveRoom", auctionItem.id);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(location.href);
    setCopyText("Copied!");
    setTimeout(() => {
      setCopyText("Copy URL");
    }, 3000);
  };

  return (
    <div className="h-full">
      <BidModal
        fetcher={fetcher}
        open={open}
        defaultValue={defaultVal}
        handler={toggleModal}
      >
        {""}
      </BidModal>
      <Link
        className="absolute top-24 lg:top-32 lg:left-4 text-gray-500 border-gray-500 rounded-[7px] hover:bg-gray-400 hover:text-white py-2 px-4 transition-colors duration-200"
        to="/auctions"
        prefetch="intent"
      >
        <span className="hidden lg:inline">Back to Auctions</span>
        <IconButton
          className="lg:hidden rotate-90 bg-white rounded-full z-10 shadow"
          variant="filled"
        >
          <ExpandIcon />
        </IconButton>
      </Link>
      {showDebug ? (
        <Button
          type="button"
          onClick={sendTestEvent}
          className="!absolute !bottom-4 !left-4"
        >
          Test Event
        </Button>
      ) : null}
      <Card className="!p-0 lg:!p-8 min-h-full lg:min-h-0 lg:flex flex-col md:flex-row md:!w-[60vw] max-w-none relative">
        <div className="image-container lg:w-5/12 max-h-[60vh] lg:min-h-80">
          {photoUrl ? <ItemImage image={photoUrl} /> : null}
        </div>
        <div className="mt-4 lg:mt-0 grow flex-col flex items-center lg:items-end lg:ml-3">
          <h1 className="text-3xl font-bold text-gray-800">
            {auctionItem.name}
          </h1>
          <div>
            <Tooltip
              content={copyText}
              className="border border-blue-gray-50 bg-gray-50 px-4 py-3 shadow-xl shadow-black/10 text-gray-800"
            >
              <IconButton type="button" variant="text" onClick={copyLink}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip
              content={isUserWatching ? "Unfollow" : "Follow"}
              className="border border-blue-gray-50 bg-gray-50 px-4 py-3 shadow-xl shadow-black/10 text-gray-800"
            >
              <IconButton type="button" variant="text" onClick={toggleWatch}>
                {isUserWatching ? <EyeDisabledIcon /> : <EyeIcon />}
              </IconButton>
            </Tooltip>
          </div>
          <p className="italic text-sm text-gray-500 mb-8">
            {auctionItem.description}
          </p>
          <p className="text-lg text-gray-700 flex justify-between w-2/3">
            <span className="font-bold mr-4">Estimated Value: </span>
            {formatMoney(auctionItem.estimated_value)}
          </p>
          <p className="text-lg text-gray-700 flex justify-between w-2/3">
            <span className="font-bold mr-4">Current Bid: </span>
            <span
              className={
                "transition-colors duration-200 " +
                (highlight
                  ? "text-white bg-green-400 px-2 py-1 relative -top-1 -right-2 rounded-[7px]"
                  : "")
              }
            >
              {formatMoney(currentBid)}
            </span>
          </p>
        </div>
        {user ? (
          <div>
            <div className="mt-4 mx-4 lg:mx-0 lg:mt-20 lg:absolute bottom-8 right-8 flex flex-col items-center lg:block">
              <h3 className="text-xl text-gray-600 mr-4 my-4">
                Increase Bid By:
              </h3>
              <ButtonGroup variant="gradient" color="red">
                <Button type="button" onClick={toggleModalFunc(1)}>
                  $1
                </Button>
                <Button type="button" onClick={toggleModalFunc(5)}>
                  $5
                </Button>
                <Button type="button" onClick={toggleModalFunc(10)}>
                  $10
                </Button>
                <Button type="button" onClick={toggleModalFunc()}>
                  Other
                </Button>
              </ButtonGroup>
            </div>
          </div>
        ) : (
          <h3 className="text-xl text-gray-600 font-bold absolute bottom-8 right-8">
            Please{" "}
            <Link to="/login" prefetch="intent" className="text-blue-500">
              sign in
            </Link>{" "}
            to bid on this item
          </h3>
        )}
      </Card>
    </div>
  );
}

const ItemImage = memo(function ItemImage({
  image,
}: {
  image: CloudinaryImage;
}) {
  return (
    <AdvancedImage cldImg={image} plugins={[responsive(), placeholder()]} />
  );
});
