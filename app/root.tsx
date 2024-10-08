import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node";
import { ReactNode, useEffect, useState } from "react";
import { Cloudinary } from "@cloudinary/url-gen";

import stylesheet from "~/tailwind.css?url";
import { getUserFromSession } from "./session.server";
import { Socket, io } from "socket.io-client";
import { C2SEvents, S2CEvents } from "./models/socket";
import LoaderProvider from "./contexts/LoaderContext";
import { AlertContextProvider } from "./contexts/AlertContext";
import { SocketProvider } from "./contexts/SocketContext";
import { CloudinaryContext } from "./contexts/CloudinaryContext";
import Alerts from "./components/Alerts";
import Header from "./components/Header";
import ButtonLink from "./components/ButtonLink";
import { getAuctionEnd } from "./models/config.server";
import { AuctionEndContext } from "./contexts/AuctionEndContext";
import Countdown, { CountdownRenderProps } from "react-countdown";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap",
  },
];

export const meta: MetaFunction = () => [{ title: "AIIA Silent Auction" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const auctionEnd = await getAuctionEnd();

  return json({
    user: await getUserFromSession(request),
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    auctionEnd,
  });
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-[100vh] bg-gray-100">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { user, cloudName, auctionEnd } = useLoaderData<typeof loader>();

  const [cloudinary] = useState(
    new Cloudinary({
      cloud: {
        cloudName,
      },
    }),
  );

  const [socket, setSocket] = useState<Socket>();
  useEffect(() => {
    const socket: Socket<S2CEvents, C2SEvents> = io({
      reconnectionAttempts: 10,
      autoConnect: true,
    });
    setSocket(socket);
    return () => {
      socket.close();
    };
  }, []);

  return (
    <LoaderProvider>
      <AlertContextProvider>
        <SocketProvider socket={socket}>
          <CloudinaryContext.Provider value={cloudinary}>
            <AuctionEndContext.Provider value={new Date(auctionEnd)}>
              <Alerts />
              <Header loggedIn={!!user} />
              <Outlet />
              <div className="fixed w-full md:w-auto bottom-0 right-0">
                {!!auctionEnd && (
                  <Countdown date={auctionEnd} renderer={AuctionEndTimer} />
                )}
              </div>
            </AuctionEndContext.Provider>
          </CloudinaryContext.Provider>
        </SocketProvider>
      </AlertContextProvider>
    </LoaderProvider>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();
  console.error("ERROR:", error);

  let content: ReactNode;
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      content = (
        <div className="mt-32">
          <h1 className="text-center text-3xl">We couldnt find that page!</h1>
          <div className="justify-center flex mt-8">
            <ButtonLink to="/">Go Home</ButtonLink>
          </div>
        </div>
      );
    } else {
      content = (
        <div className="mt-32">
          <h1 className="text-center text-3xl">Something went wrong!</h1>
          <div className="justify-center flex mt-8">
            <ButtonLink to="/">Go Home</ButtonLink>
          </div>
        </div>
      );
    }
  } else {
    content = (
      <div className="mt-32">
        <h1 className="text-center text-3xl">Something went wrong!</h1>
        <div className="justify-center flex mt-8">
          <ButtonLink to="/">Go Home</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      {content}
      <Scripts />
    </>
  );
};

function AuctionEndTimer({
  days,
  hours,
  minutes,
  seconds,
  completed,
}: CountdownRenderProps) {
  if (completed) {
    return (
      <div className="py-2 px-6 md:rounded-tl-xl bg-blue-600 text-lg text-white text-center">
        Auction has ended
      </div>
    );
  }
  if (days === 0 && hours === 0 && minutes < 10) {
    return (
      <div className="py-2 px-6 md:rounded-tl-xl bg-orange-900 text-lg text-white text-center">
        Only {minutes} minutes and {seconds} seconds left!
      </div>
    );
  }
  return (
    <div className="py-2 px-6 md:rounded-tl-xl bg-blue-600 text-lg text-white text-center">
      Auction ends in {days} days, {hours} hours, {minutes} minutes, and{" "}
      {seconds} seconds
    </div>
  );
}
