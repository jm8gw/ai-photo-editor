import { UserButton } from '@clerk/nextjs'
import React from 'react'

// This page ("Home") uses the layout defined in app/(root)/layout.tsx

const Home = () => {
  return (
    <div>
      <p>Home</p>

      <UserButton afterSignOutUrl='/' />
    </div>
  )
}

export default Home