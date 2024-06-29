import { Textarea as T } from "@material-tailwind/react";
import { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  errorText?: string;
}

export default function Textarea({ label, errorText, ...rest }: TextareaProps) {
  return (
    <div className="mb-4">
      <p className="flex items-center gap-1 text-sm antialiased font-normal leading-normal text-red-600 pl-2 mb-2">
        {errorText}
      </p>
      <div className="relative">
        <T label={label} color="blue" error={!!errorText} {...rest} />
      </div>
    </div>
  );
}
