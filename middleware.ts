import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({   
  // Routes that can be accessed while signed out
  // publicRoutes: ['/'],
  publicRoutes: ['/', '/api/webhooks/clerk', '/api/webhooks/stripe'], // We are allowing public access to the Clerk and Stripe webhooks, so Clerk and Stripe can send us events. We are also allowing public access to the home page, so that non-authenticated users can still see community-created transformations.
});
 
export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};