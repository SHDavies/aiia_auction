import { Link, LinkProps } from "@remix-run/react";
import { PropsWithChildren } from "react";

interface ButtonLinkProps extends LinkProps {
  to: string;
  className?: string;
  buttonStyle?: "default" | "outline";
}

export default function ButtonLink({
  to,
  className = "",
  buttonStyle = "default",
  children,
  ...rest
}: PropsWithChildren<ButtonLinkProps>) {
  let s: string;
  switch (buttonStyle) {
    case "outline":
      s =
        "bg-transparent hover:bg-blue-500 text-white hover:text-white border border-white hover:border-transparent";
      break;

    default:
      s = "bg-blue-500 hover:bg-blue-700 text-white";
      break;
  }

  return (
    <Link
      to={to}
      className={
        s +
        " font-bold py-2 px-4 transition-colors duration-200 rounded shadow " +
        className
      }
      {...rest}
    >
      {children}
    </Link>
  );
}
