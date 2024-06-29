import { PropsWithChildren, createContext, useState } from "react";

export interface Loader {
  startLoading(): void;
  finishLoading(): void;
  isLoading: boolean;
}

export const LoaderContext = createContext<null | Loader>(null);

export default function LoaderProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoaderContext.Provider
      value={{
        startLoading() {
          setIsLoading(true);
        },
        finishLoading() {
          setIsLoading(false);
        },
        isLoading,
      }}
    >
      {children}
    </LoaderContext.Provider>
  );
}
