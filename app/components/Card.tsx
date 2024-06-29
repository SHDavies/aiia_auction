import { PropsWithChildren } from "react";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={[
        "bg-white p-8 rounded-[7px] shadow-md max-w-lg w-full mx-auto",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
