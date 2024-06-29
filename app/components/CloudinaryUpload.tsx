import { AdvancedImage, placeholder, responsive } from "@cloudinary/react";
import { Cloudinary } from "@cloudinary/url-gen";
import { useState } from "react";

import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

export default function CloudinaryUpload() {
  const [publicId, setPublicId] = useState('')
  const [cloudName] = useState(process.env.CLOUDINARY_CLOUD_NAME)
  const [uploadPreset] = useState(process.env.CLOUDINARY_UPLOAD_PRESET)
  const [uwConfig] = useState({ cloudName, uploadPreset })

  const cld = new Cloudinary({
    cloud: {
      cloudName
    }
  });

  const uploadedImg = cld.image(publicId);

  return <div>
    <CloudinaryUploadWidget uwConfig={uwConfig} setPublicId={setPublicId} />
    <div className="w-[400px]">
      <AdvancedImage 
        style={{ maxWidth: '100%' }}
        cldImg={uploadedImg}
        plugins={[responsive(), placeholder()]}
      />
    </div>
  </div>
}