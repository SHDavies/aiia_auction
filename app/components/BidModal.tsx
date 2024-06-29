import {
  Button,
  Card,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogProps,
} from "@material-tailwind/react";
import { FetcherWithComponents } from "@remix-run/react";

import Input from "./Input";

interface BidModalProps extends DialogProps {
  defaultValue?: number;
  fetcher: FetcherWithComponents<{
    success: boolean;
    message: string;
  }>;
  errorMessage?: string;
}

export default function BidModal({
  defaultValue,
  fetcher,
  handler,
  ref: _,
  ...rest
}: BidModalProps) {
  return (
    <Dialog
      size="xs"
      {...rest}
      dismiss={{ enabled: true, escapeKey: true, outsidePress: true }}
      handler={handler}
    >
      <Card className="p-4">
        <DialogHeader>
          <h1>Bid on this item</h1>
        </DialogHeader>
        <DialogBody>
          <p>
            By bidding on this item you agree to pay Addict II Athlete the
            submitted amount if it is the winning bid
          </p>
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="newBid" />
            <p className="font-bold mt-4">Your bid:</p>
            <Input
              decorator="$"
              name="amount"
              label="Bid"
              defaultValue={defaultValue}
              autoFocus
              disabled={fetcher.state === "submitting"}
              type="number"
              step="any"
            />
            <Button
              color="red"
              variant="gradient"
              type="submit"
              className="w-full"
              disabled={fetcher.state === "submitting"}
            >
              Submit
            </Button>
          </fetcher.Form>
        </DialogBody>
      </Card>
    </Dialog>
  );
}
