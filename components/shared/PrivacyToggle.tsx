"use client";

import React from 'react'
import { Button } from '../ui/button'
import Image from 'next/image'
import { updateImage } from '@/lib/actions/image.actions'

const PrivacyToggle = ({ image, userId }: {image: any, userId: string}) => {
    const onPrivacyChange = async () => {
        try {
            const updatedImage = await updateImage({ // from image.actions.ts, accepts image, userId, and path
                image: { 
                    ...image, // spread what the image currently has
                    private: !(image.private), // pass the id of the image we are updating
                },
                userId,
                path: `/transformations/${image._id}` // We want to redirect to the specific image we are updating
            })
    
            if(updatedImage) {
                // Push to that existing tranformation
                //router.push(`/transformations/${updatedImage._id}`)
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
            disabled={userId !== image.author.clerkId}
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