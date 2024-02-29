// Page for viewing the user profile, including number of credits remaining, total number of transformations, and the same collection of transformations as displayed by the home page (Collection.tsx).

// Basic template was provided by the example project. Nothing here should be new or complicated.
// Only thing worth noting is the use of a newly created server action: getUserImages, which will return the images for a specific user.

// TODO: Make this page look better, it's pretty basic right now.

import { auth } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Collection } from "@/components/shared/Collection";
import Header from "@/components/shared/Header";
import { getUserById } from "@/lib/actions/user.actions";
import { getUserImages } from "@/lib/actions/image.actions";

const Profile = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);
  const images = await getUserImages({ page, userId: user._id }); // Get the user's images, as opposed to all images.

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="p-14-medium md:p-16-medium">Credits Remaining:</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins-colorful.png"
              alt="coins"
              width={50}
              height={50}
              className="size-13 md:size-16"
            />
            <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="p-14-medium md:p-16-medium">Image Transformations Completed:</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/logoiconcamera.png"
              alt="Camera Icon"
              width={50}
              height={50}
              className="size-13 md:size-16"
            />
            <h2 className="h2-bold text-dark-600">{images?.totalImages}</h2>
          </div>
        </div>
      </section>

      <section className="mt-8 md:mt-14">
        <Collection // Similar to the home page, but this time the images are taken from the user's collection.
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Profile;