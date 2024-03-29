"use client"; // Since we use the usePathname hook (for browser funtionalities), we need to render client-side

import { navLinks } from '@/constants'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { Button } from '../ui/button';

const Sidebar = () => {
    const pathname = usePathname();

  return (
    <aside className='sidebar'>
        <div className='flex size-full flex-col gap-4'>
            <Link href='/' className="sidebar-logo">
                <Image 
                    src="/assets/images/PixelPerfectFinal.png" 
                    alt="logo" 
                    width={239} 
                    height={40}
                    layout="responsive"
                />
            </Link>

            <nav className='sidebar-nav'>
                <SignedIn>
                    {/* Code in here will only show if the user is signed in */}
                    <ul className='sidebar-nav_elements'>
                        {/* This map takes in pre-defined routes from contants */}
                        {navLinks.slice(0, 7).map((link) => {
                            const isActive = link.route === pathname

                            return(
                                <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'}`}>
                                    <Link className='sidebar-link' href={link.route}>
                                        <Image 
                                            src={link.icon} 
                                            alt="logo" 
                                            width={24} 
                                            height={24} 
                                            className={`${isActive && 'brightness-200'}`}
                                        />
                                        {link.label}
                                    </Link>
                                </li>
                                
                            )
                        })}
                    </ul>


                    <ul className='sidebar-nav_elements'>
                        {navLinks.slice(7).map((link) => {
                            const isActive = link.route === pathname

                            return(
                                <li key={link.route} className={`sidebar-nav_element group ${isActive ? 'bg-purple-gradient text-white' : 'text-gray-700'}`}>
                                    <Link className='sidebar-link' href={link.route}>
                                        <Image 
                                            src={link.icon} 
                                            alt="logo" 
                                            width={24} 
                                            height={24} 
                                            className={`${isActive && 'brightness-200'}`}
                                        />
                                        {link.label}
                                    </Link>
                                </li>
                                
                            )
                        })}
                        {/* This option allows us to sign out */}
                        <li className="flex-center cursor-pointer gap-2 p-4">
                            <UserButton afterSignOutUrl='/' showName/>
                            {/* This is the user button from Clerk, it will show the user's name and profile picture */}
                        </li>
                    </ul>
                </SignedIn>

                <SignedOut>
                    <Button asChild className="button bg-purple-gradient bg-cover">
                        <Link href='/sign-in'>
                            Login
                        </Link>
                    </Button>
                </SignedOut>
            </nav>
            {/* Copyright information */}
            <p className="text-xs text-gray-400 -mt-4 -mb-2">&copy; 2024 Jeffrey Mouritzen. All rights reserved.</p>
        </div>
    </aside>
  )
}

export default Sidebar