import { Input as I } from "@material-tailwind/react";
import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  decorator?: string;
  errorText?: string;
}

export default function Input({
  label,
  decorator,
  errorText,
  className = "",
  ...rest
}: InputProps) {
  return (
    <div className="mb-4">
      <p className="flex items-center gap-1 text-sm antialiased font-normal leading-normal text-red-600 pl-2 mb-2">
        {errorText}
      </p>
      <div className="relative">
        {decorator ? (
          <span className="absolute left-4 top-[52%] -translate-y-1/2 text-gray-700">
            {decorator}
          </span>
        ) : (
          ""
        )}
        <I
          label={label}
          color="blue"
          error={!!errorText}
          className={className + (decorator ? " text-right" : "")}
          {...rest}
        />
      </div>
    </div>
  );
}
