import { useNavigation } from "@remix-run/react";
import { useContext } from "react";

import { LoaderContext } from "~/contexts/LoaderContext";

export default function ProgressBar() {
  const navigation = useNavigation();
  const loaderContext = useContext(LoaderContext);

  return navigation.state !== "idle" || loaderContext?.isLoading ? (
    <div className="w-full overflow-hidden h-1 bg-gray-100">
      <div className="h-full w-full bg-red-600 origin-[0%_50%] animate-indeterminate-progress" />
    </div>
  ) : (
    <></>
  );
}
