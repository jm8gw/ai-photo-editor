import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({   
  // Routes that can be accessed while signed out
  // publicRoutes: ['/'],
  publicRoutes: ['/api/webhooks/clerk'], // We are allowing public access to the Clerk webhooks, so Clerk can send us events
});
 
export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};