"use client"; // useToast is a hook, and the media uploader has to do something with the borwser when the user is uploading an image.

// In here, we are going to use shadcn's toast component. A Toast is a "succinct message that is displayed temprarily".
// To allow for image uploads, we are going to use the CldUploadWidget from the next-cloudinary package.

import { CldImage, CldOgImage, CldUploadWidget } from "next-cloudinary" // Very important components from the next-cloudinary package. They allow for image uploads and image rendering.
import { useToast } from "../ui/use-toast"
import Image from "next/image";
import { dataUrl, getImageSize } from "@/lib/utils";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import { on } from "events";

type MediaUploaderProps = {
    onValueChange: (value: string) => void;
    publicId: string;
    setImage: React.Dispatch<any>;
    image: any;
    type: string;
}


const MediaUploader = ({ 
    onValueChange,
    publicId,
    setImage,
    image,
    type
}: MediaUploaderProps ) => {
    const { toast } = useToast()

    const onUploadSuccessHandler = (result: any) => {
        {/* Set the image state to the result of the upload. We will utilize this data later within our form. */}
        setImage((prevState: any) => ({
            ...prevState,
            publicId: result?.info?.public_id,
            width: result?.info?.width,
            height: result?.info?.height,
            secureURL: result?.info?.secure_url,
        }))


        onValueChange(result?.info?.public_id)
        {/* This takes into account that the form changed, and updates the publicId within our form. It will let our app know the publicId has indeed changed, so we render the correct thing (the image). */}

        toast({
            title: 'Image upload successfully',
            description: `1 credit was deducted from your account. Happy editing!`,
            duration: 5000,
            className: 'success-toast',
        })
    }

    const onUploadErrorHandler = () => {
        toast({
            title: 'Something went wrong while uploading :(',
            description: `Please try again.`,
            className: 'error-toast',
            duration: 5000,
        })
    }

  return (
    <CldUploadWidget
        uploadPreset="pixel-perfect"
        options={{
            multiple: false, // Only allow one image to be uploaded
            resourceType: "image",
        }}
        onSuccess={onUploadSuccessHandler}
        onError={onUploadErrorHandler}
    >
        {({ open }) => (
            <div className="flex flex-col gap-4">
                <h3 className="h3-bold text-dark-600">
                    Original
                </h3>

                {/* Must check for a publicId to display the image. publicId does not exist until a image is uploaded. */}
                {publicId ? (
                    <>
                        <div className="cursor-pointer overflow-hidden rounded-[10px]">
                            <CldImage 
                                width={getImageSize(type, image, "width")} // getImageSize is a helper function in utils.ts. It takes the aspect ratio, and returns the dimensions based off of that aspect ratio.
                                height={getImageSize(type, image, "height")}
                                src={publicId}
                                alt="Image"
                                sizes={"(max-width: 767px) 100vw, 50vw"}
                                placeholder={dataUrl as PlaceholderValue} // dataUrl also comes from utils.ts. It basically gets the url of our "shimmering" effect, which allows for a "slowly loading up" effect.
                                className="media-uploader_cldImage"
                            />
                        </div>
                    </>  
                ): (
                    /* This is what we should show if there hasn't yet been an image uploaded (aka no publicId) */
                    <div className="media-uploader_cta" 
                        onClick={() => open()}>
                        <div className="media-uploader_cta-image">
                            <Image 
                                src="/assets/icons/add.svg"
                                alt="Add Image"
                                width={24}
                                height={24}
                            />
                        </div>
                        <p className="p-14-medium">
                            Click Here to Upload Image
                        </p>
                    </div>
                )}
            </div>
        )}
    </CldUploadWidget>
  )
}

export default MediaUploader