import {
  ActionFunction,
  LoaderFunction,
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
  redirect,
} from "@remix-run/node";
import { Form } from "@remix-run/react";
import invariant from "tiny-invariant";

import Button from "~/components/Button";
import ImageUpload from "~/components/ImageUpload";
import Input from "~/components/Input";
import Textarea from "~/components/Textarea";
import { createAuctionItem } from "~/models/auction.server";
import { getUserFromSession } from "~/session.server";
import { uploadImage } from "~/utils/cloudinary.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserFromSession(request);
  if (!user || !user.is_admin) {
    throw new Response(null, { status: 404 });
  }
  return new Response(null, { status: 200 });
};

export const action: ActionFunction = async ({ request }) => {
  const uploadHandler = composeUploadHandlers(
    async ({ name, data, filename }) => {
      if (name !== "image") {
        return undefined;
      }
      if (!filename) {
        return "";
      }
      const uploadedImage: any = await uploadImage(
        data,
        filename.split(".")[0],
      );
      return uploadedImage.public_id;
    },
    createMemoryUploadHandler(),
  );

  let newItem: { id: string };
  try {
    const formData = await parseMultipartFormData(request, uploadHandler);
    const name = formData.get("name");
    invariant(typeof name === "string", "invalid value for name");
    const description = formData.get("description") || undefined;
    if (description) {
      invariant(
        typeof description === "string",
        "invalid value for description",
      );
    }
    const photo_id = formData.get("image") || undefined;
    if (photo_id) {
      invariant(typeof photo_id === "string", "invalid value for photo_id");
    }
    const estimated_value = Number(formData.get("estimated_value"));
    invariant(!isNaN(estimated_value), "invalid value for estimated_value");
    const starting_bid = Number(formData.get("starting_bid"));
    invariant(!isNaN(starting_bid), "invalid value for starting_bid");

    newItem = await createAuctionItem({
      name,
      description,
      photo_id,
      estimated_value,
      starting_bid,
    });
  } catch (e) {
    console.error(e);
    return json({ error: e });
  }

  return redirect(`/auctions/${newItem.id}`);
};

export default function AddAuction() {
  function moneyOnChange(e: React.FocusEvent<HTMLInputElement, Element>) {
    const val = Number(e.target.value);
    if (isNaN(val) || !val || val < 1) {
      e.target.value = "1.00";
    }
  }

  return (
    <div>
      <div className="bg-white p-8 rounded shadow-md max-w-[60%] w-full mx-auto min-h-72 min-w-[760px]">
        <Form
          className="flex w-full justify-between"
          method="post"
          encType="multipart/form-data"
        >
          <div className="w-7/12">
            <Input label="Name" name="name" autoFocus />
            <Textarea label="Description" name="description" />
            <Input
              decorator="$"
              label="Estimated Value"
              name="estimated_value"
              type="number"
              step="any"
              min="1.00"
              defaultValue="1.00"
              onBlur={moneyOnChange}
            />
            <Input
              decorator="$"
              label="Starting Bid"
              name="starting_bid"
              type="number"
              step="any"
              min="1.00"
              defaultValue="1.00"
              onBlur={moneyOnChange}
            />
          </div>
          <div className="w-1/3 relative">
            <h2 className="mb-4">Item Image</h2>
            <ImageUpload name="image" />
            <Button type="submit" className="absolute bottom-0 right-0">
              Save
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
