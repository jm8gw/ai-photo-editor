import React from 'react'

/*
A layout is UI that is shared between multiple routes. On navigation, layouts preserve state, remain interactive, and do not re-render. Layouts can also be nested (as it is in this case, with the auth route group).

You can define a layout by default exporting a React component from a layout.js file. The component should accept a children prop that will be populated with a child layout (if it exists) or a page during rendering.
*/

const Layout = ({ children }: { children: React.ReactNode }) => { // layouts always have to export some children within them (see more in NEXT.js documentation)
  return (
    /* Typical layouts will allow you to put shared UI (using children) for different routes, such as header and footer. Of course, in "auth" routes we don't want to put footer and navbar, but for home page routes they would be included. It would prevent you from needing to duplicate those components for *every* route. */
    <main className='auth'>{children}</main>
  )
}

export default Layout