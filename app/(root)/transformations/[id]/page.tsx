import React from 'react'

const TransformationsPage = () => {
  return (
    <div>TransformationsPage</div>
  )
}

export default TransformationsPage

// All transformations are unique, so instead of localhost:3000/transformations
// we will have localhost:3000/transformations/[id]
// To acomplish this, we need to use a concept called dynamic routing (Dynamic Routes in Next.js)
// What this looks like is wrapping the folder name in square brackets as opposed to parentheses. We can get access to a specific ID using params.