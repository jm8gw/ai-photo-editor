// Details Page: This page is where users are brought to after they click one of their recent edits on the home page, with the intent on revisiting that particular transformation. It displays the (available) details of the image, including the transformation type, prompt, color, aspect ratio, and the original and transformed images side by side. It also includes a button to update the image and a button to delete the image.

// Because this file uses much of the same techniques, components, and concepts as previous pages, I will not go into much detail about it. It is mostly just a rendering.

// Basic template was provided by the example project.

// Worth noting that all transformations are unique, so instead of localhost:3000/transformations we will have localhost:3000/transformations/[id] (base url my vary obviously).
// To acomplish this, we need to use a concept called dynamic routing (Dynamic Routes in Next.js)
// What this looks like is wrapping the folder name in square brackets as opposed to parentheses. We can get access to a specific ID using params.

import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/shared/Header";
import TransformedImage from "@/components/shared/TransformedImage";
import { Button } from "@/components/ui/button";
import { getImageById, updateImage } from "@/lib/actions/image.actions";
import { getImageSize } from "@/lib/utils";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { getUserById } from "@/lib/actions/user.actions";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PrivacyToggle from "@/components/shared/PrivacyToggle";
// import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";

const ImageDetails = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in"); // Redirect if not authenticated

  const user = await getUserById(userId as string);

  const image = await getImageById(id); // From our image server actions file

  return (
    <>
      <Header title={image.title} />
      {/*console.log(image)*/}
      <div className="justify-between flex items-center">
      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-dark-600">Transformation:</p>
          <p className=" capitalize text-purple-400">
            {image.transformationType}
          </p>
        </div>

        {image.prompt && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2 ">
              <p className="text-dark-600">Prompt:</p>
              <p className=" capitalize text-purple-400">{image.prompt}</p>
            </div>
          </>
        )}

        {image.color && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Color:</p>
              <p className=" capitalize text-purple-400">{image.color}</p>
            </div>
          </>
        )}

        {image.aspectRatio && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Aspect Ratio:</p>
              <p className=" capitalize text-purple-400">{image.aspectRatio}</p>
            </div>
          </>
        )}

        {image.config.replace?.from && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Object Replaced:</p>
              <p className=" capitalize text-purple-400">{image.config.replace.from}</p>
            </div>
          </>
        )}
        
        {image.config.replace?.to && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Replacement:</p>
              <p className=" capitalize text-purple-400">{image.config.replace.to}</p>
            </div>
          </>
        )}
      </section>
      
      {/* PRIVACY BUTTON */}
      <PrivacyToggle 
        image={image} 
        userId={userId as string} 
      />

      </div>

      <section className="mt-10 border-t border-dark-400/15">
        <div className="transformation-grid">
          {/* MEDIA UPLOADER */}
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>

            <Image
              width={getImageSize(image.transformationType, image, "width")}
              height={getImageSize(image.transformationType, image, "height")}
              src={image.secureURL}
              alt="image"
              className="transformation-original_image"
            />
          </div>

          {/* TRANSFORMED IMAGE */}
          <TransformedImage
            image={image}
            type={image.transformationType}
            title={image.title}
            isTransforming={false}
            transformationConfig={image.config}
            hasDownload={true}
          />
        </div>

        {userId === image.author.clerkId && ( // If the user is the author of the image, they can update or delete it.
          <div className="mt-4 space-y-4">
            <Button asChild type="button" className="submit-button capitalize">
              <Link href={`/transformations/${image._id}/update`}>
                Update Image
              </Link>
            </Button>

            <DeleteConfirmation imageId={image._id} />
          </div>
        )}
      </section>
    </>
  );
};

export default ImageDetails;
