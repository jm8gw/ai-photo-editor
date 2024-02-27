"use client"; // This is because the download button has an onClick listener. Whenever you have an onClick listener/handler, the component must be client-side.

import { dataUrl, debounce, download, getImageSize } from '@/lib/utils'
import { CldImage, getCldImageUrl } from 'next-cloudinary'
import { PlaceholderValue } from 'next/dist/shared/lib/get-img-props'
import Image from 'next/image'
import React from 'react'

const TransformedImage = ({ image, type, title, transformationConfig, isTransforming, setIsTransforming, hasDownload = false }: TransformedImageProps) => { // Again, type is defined in the types folder (index.d.ts)

    const downloadHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault(); // Prevent default behavior of the browser, which is to reload the page

        download(getCldImageUrl({ // This comes from utils.ts. It is a helper function that downloads the image.
            width: image?.width,
            height: image?.height,
            src: image?.publicId,
            ...transformationConfig
        }), title); 
    }

  return (
    <div className='flex flex-col gap-4'>
        <div className='flex-between'>
            <h3 className='h3-bold text-dark-600'>
                Transformed
            </h3>

            {/* Once the transformed image is visible, we will enable a button for downloading it*/}
            {hasDownload && (
                <button
                    className='download-btn'
                    onClick={downloadHandler}
                >
                    <Image
                        src='/assets/icons/download.svg'
                        alt='Download'
                        width={24}
                        height={24}
                        className="pb-[6px]"
                    />
                </button> 
            )}
        </div>
        
        {/* If we have the image (we uploaded an image and clicked apply), render the transformed image. Otherwise, render the placeholder. */}
        {image?.publicId && transformationConfig ? (
            <div /* className='relative' */>
                <CldImage 
                    width={getImageSize(type, image, "width")} // getImageSize is a helper function in utils.ts. It takes the aspect ratio, and returns the dimensions based off of that aspect ratio.
                    height={getImageSize(type, image, "height")}
                    src={image?.publicId} // publicId is already stored within the image state before we deal with the transformation.
                    alt={image.title} // We would also have a title for the image, which is also stored in the image state.
                    sizes={"(max-width: 767px) 100vw, 50vw"}
                    placeholder={dataUrl as PlaceholderValue} // dataUrl also comes from utils.ts. It basically gets the url of our "shimmering" effect, which allows for a "slowly loading up" effect.
                    className="transformed-image"
                    onLoad={() => {
                        setIsTransforming && setIsTransforming(false);
                    }} // Once the image is loaded, we will set the isTransforming state to false.
                    onError={() => {
                        debounce(() => {
                            setIsTransforming && setIsTransforming(false);
                        }, 8000) // If nothing happens after 8 seconds, we can surely say that it has failed.
                    }}
                    /* VERY IMPORTANT: Spread the entire tranformation config. It will contain all of the image transformations that we want to apply for an image. */
                    {...transformationConfig}
                />

                {/* While the image is tranforming we want to show a loader */}
                {isTransforming && (
                    <div className='transforming-loader'>
                        <Image 
                            src='/assets/icons/spinner.svg'
                            alt='Transforming...'
                            width={50}
                            height={50}
                        />
                        <p className="text-white/80">Please wait, transforming in progress...</p>
                    </div>
                )}
            </div>
        ) : (
            <div className='transformed-placeholder'>
                Transformed Image Will Appear Here
            </div>
        )}


    </div>
  )
}

export default TransformedImage