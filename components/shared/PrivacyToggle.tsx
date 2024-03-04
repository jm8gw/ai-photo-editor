"use client";

import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { updateImage } from '@/lib/actions/image.actions'
import { useRouter } from 'next/navigation';
import { getCldImageUrl } from 'next-cloudinary';

const PrivacyToggle = ({ image, userId }: {image: any, userId: string}) => {

    const router = useRouter();

    const onPrivacyChange = async () => {
        const transformationURL = 
        getCldImageUrl({
            width: image?.width,
            height: image?.height,
            src: image?.publicId,
            ...image?.config
        })

        const imageData = {
            title: image?.title, // directly from the form
            publicId: image?.publicId, // from the image state
            transformationType: image?.transformationType, // recolor, gen fill, etc.
            width: image?.width,
            height: image?.height,
            config: image?.config,
            secureURL: image?.secureURL, // to where that image is stored
            transformationURL: transformationURL, // Change everything to have captital "URL". Too confusing otherwise.
            aspectRatio: image?.aspectRatio, // from the form
            prompt: image?.prompt,
            color: image?.color,
            from: image?.from,
            replacement: image?.replacement,
            private: image?.publicId,
        }


        try {
            console.log("button pressed")
            console.log(image.private)
            
            const updatedImage = await updateImage({ // from image.actions.ts, accepts image, userId, and path
                image: {   
                    ...image, // spread what the image currently has
                    private: !image.private, // flip the privacy status
                },
                userId,
                path: `/transformations/${image._id}` // We want to redirect to the specific image we are updating
            })
            console.log(updatedImage.private)
            console.log(image)
            console.log(updatedImage)
            if(updatedImage) {
                // Push to that existing tranformation
                router.push(`/transformations/${updatedImage._id}`)
            }
            console.log("did what I can")
            
        } catch (error) {
            console.log(error)
        }
      }

  return (
    <>
        <Button 
            type="button"
            variant="outline" 
            className="mt-5"
            disabled={userId !== image.author._id}
            onClick={onPrivacyChange}
        >
            <Image 
                src={image.private ? '/assets/icons/home.svg' : '/assets/icons/profile.svg'} 
                alt={image.private ? 'public icon' : 'private icon'} 
                width={24} 
                height={24} 
                className="mr-2 h-5 w-5"
            />
            {image.private ? 'Make Public' : 'Make Private'}
        </Button>
    </>
  )
}

export default PrivacyToggle