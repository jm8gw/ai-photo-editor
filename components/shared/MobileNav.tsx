"use client"; // Since we use the usePathname hook (for browser funtionalities), we need to render client-side

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "../ui/button"
import { navLinks } from "@/constants"
import { usePathname } from "next/navigation"

const MobileNav = () => {
    const pathname = usePathname();

  return (
    <header className="header">
        <Link href="/" className="flex items-center gap-2 md:py-2">
            <Image
                src="/assets/images/PixelPerfectFinal.png"
                alt="logo"
                width={239} 
                height={40}
                layout="responsive"
            />
        </Link>

        <nav className="flex gap-2">
            <SignedIn>
                <UserButton afterSignOutUrl="/" />
                <Sheet>
                    {/* From shadcn, with obvious modifications */}
                    <SheetTrigger>
                        <Image 
                            src="/assets/icons/menu.svg"
                            alt="menu"
                            width={32}
                            height={32}
                            className="cursor-pointer"
                        />
                    </SheetTrigger>
                    <SheetContent className="sheet-content sm:w-64">
                        <>
                            <Image 
                                src="/assets/images/PixelPerfectFinal.png"
                                alt="logo"
                                width={239} 
                                height={40}
                                layout="responsive"
                            />
                            <ul className='header-nav_elements'>
                                {/* This map takes in pre-defined routes from contants */}
                                {navLinks.map((link) => {
                                    const isActive = link.route === pathname

                                    return(
                                        <li key={link.route} className={`${isActive && 'gradient-text'} p-18 flex whitespace-nowrap text-dark-700`}>
                                            <Link className='sidebar-link cursor-pointer' href={link.route}>
                                                <Image 
                                                    src={link.icon} 
                                                    alt="logo" 
                                                    width={24} 
                                                    height={24} 
                                                />
                                                {link.label}
                                            </Link>
                                        </li>
                                        
                                    )
                                })}
                            </ul>
                        </>
                    </SheetContent>
                </Sheet>
            </SignedIn>

            <SignedOut>
                <Button asChild className="button bg-purple-gradient bg-cover">
                    <Link href='/sign-in'>
                        Login
                    </Link>
                </Button>
            </SignedOut>
        </nav>
    </header>
  )
}

export default MobileNav