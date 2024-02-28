import { Collection } from '@/components/shared/Collection'
import { navLinks } from '@/constants'
import { getAllImages } from '@/lib/actions/image.actions'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

// This page ("Home") uses the layout defined in app/(root)/layout.tsx

const Home = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1; // Record the current page number based off of the search parameters found in the URL
  const searchQuery = (searchParams?.query as string) || ''; // Do the same for the search query found in the URL

  // Next, fetch all the images we have created so far, so that we can pass them into our Collection component.
  // To do this, we will implement a new server action like getImageById in image.actions.ts, but this time it gets all the images.
  const images = await getAllImages({ page, searchQuery }); 

  return (
    <>
      {/* TODO: Change this damn call to action. I don't like the banner background or the font. */}
      <section className='home'>
        <h1 className='home-heading'>
        Unlock Photo Perfection with PixelPerfect  
        {/*              
            <Image 
              src="/assets/images/pixelperfectlogoclean.png" 
              alt="logo" 
              width={239} 
              height={40}
            />
            */}
        </h1>
        <ul className='flex-center w-full gap-20'>
          {/* Utilize the navigation setup we have in constants. */}
          {navLinks.slice(1, 6).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className='flex-center flex-col gap-2'
            >
              <li className='flex-center w-fit rounded-full bg-white p-4'>
                <Image 
                  src={link.icon} 
                  alt='Nav Icon' 
                  width={24} 
                  height={24} 
                />
              </li>
              <p className='p-14-medium text-center text-white'>{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection 
          hasSearch={true} // In some other cases we won't have search
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  )
}

export default Home