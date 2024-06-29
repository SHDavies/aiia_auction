import { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  buttonStyle?: "default" | "outline";
}

export default function Button({
  className = "",
  buttonStyle = "default",
  children,
  ...rest
}: PropsWithChildren<ButtonProps>) {
  let s: string;
  switch (buttonStyle) {
    case "outline":
      s = "bg-white hover:bg-gray-100 text-gray-800 border border-gray-400";
      break;

    default:
      s = "bg-blue-500 hover:bg-blue-700 text-white";
      break;
  }

  return (
    <button
      className={
        s +
        " font-bold py-2 px-4 rounded shadow transition-colors duration-200 " +
        className
      }
      {...rest}
    >
      {children}
    </button>
  );
}
