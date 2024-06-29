import { Outlet } from "@remix-run/react";

export default function Auctions() {
  return (
    <div className="lg:pt-32 lg:h-auto h-full">
      <Outlet />
    </div>
  );
}
