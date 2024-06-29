/* eslint-disable react-hooks/exhaustive-deps */
import { ChangeEvent, useEffect, useRef, useState } from "react";

import Button from "./Button";

interface ImageUploadProps {
  className?: string;
  name: string;
}

const VALID_MIME_TYPES = ["image/webp", "image/png", "image/jpeg", "image/svg"];

export default function ImageUpload({
  className: c = "",
  name,
}: ImageUploadProps) {
  const dropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [invalidReason, setInvalidReason] = useState<string | null>(null);

  useEffect(() => {
    // const elem = dropRef.current;
    dropRef.current?.addEventListener("dragover", handleDragOver);
    dropRef.current?.addEventListener("dragenter", handleDragEnter);
    dropRef.current?.addEventListener("dragleave", handleDragLeave);
    dropRef.current?.addEventListener("drop", handleDrop);

    return () => {
      dropRef.current?.removeEventListener("dragover", handleDragOver);
      dropRef.current?.removeEventListener("dragenter", handleDragEnter);
      dropRef.current?.removeEventListener("dragleave", handleDragLeave);
      dropRef.current?.removeEventListener("drop", handleDrop);
    };
  }, []);

  const validateUpload = (files: File[]) => {
    if (files.length > 1) {
      return "Multiple files are not allowed";
    }
    if (!VALID_MIME_TYPES.includes(files[0].type)) {
      return "Invalid file type";
    }
    if (files[0].size > 8000000) {
      return "File too large (Max 8MB)";
    }
    return null;
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setHovered(false);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setHovered(true);
    setInvalidReason(null);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setHovered(false);

    if (e.dataTransfer?.files) {
      const { files: fList } = e.dataTransfer;
      const files = [...fList];

      if (files.length && inputRef?.current) {
        const validateError = validateUpload(files);
        if (validateError) {
          setInvalidReason(validateError);
          setTimeout(() => setInvalidReason(null), 3000);
          return;
        }

        inputRef.current.files = fList;
        setFile(URL.createObjectURL(files[0]));
      }
    }
  };

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      setFile(URL.createObjectURL(e.target.files[0]));
    }
  }

  function clearFile() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setFile(null);
  }

  function clickInput() {
    inputRef.current?.click();
  }

  return (
    <>
      <div
        className={[
          "flex items-center justify-center w-full",
          file ? "invisible absolute" : "relative",
          c,
        ]
          .filter((i) => i)
          .join(" ")}
      >
        <div
          className="h-full w-full z-50 absolute bg-transparent cursor-pointer peer"
          onClick={clickInput}
          ref={dropRef}
        ></div>
        <label
          htmlFor="dropzone-file"
          className={[
            "flex flex-col items-center justify-center w-full h-56 max-w-80 border-2 border-gray-400 border-dashed rounded-lg cursor-pointer bg-gray-200 peer-hover:bg-gray-100 transition-colors duration-300",
            hovered ? "!bg-white" : "",
            invalidReason ? "!bg-red-400" : "",
          ]
            .filter((i) => i)
            .join(" ")}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className={
                "w-10 h-10 mb-3 " +
                (invalidReason ? "text-white" : "text-gray-400")
              }
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            {invalidReason ? (
              <p className="mb-2 text-lg text-white">{invalidReason}</p>
            ) : (
              <>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-gray-500">
                  .svg, .png, .jpg/jpeg or .webp
                </p>
              </>
            )}
          </div>
          <input
            id="dropzone-file"
            className="hidden"
            type="file"
            onChange={handleChange}
            accept="image/*"
            ref={inputRef}
            name={name}
          />
        </label>
      </div>
      {file ? (
        <div className="h-56 relative group w-full max-w-80 border-2 border-gray-400 border-dashed rounded-lg bg-gray-100 flex content-center justify-center">
          <Button
            buttonStyle="default"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-2 left-1/2 -translate-x-1/2"
            onClick={clearFile}
            type="button"
          >
            Clear
          </Button>
          <img className="max-h-full m-auto" src={file} alt="preview" />
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
