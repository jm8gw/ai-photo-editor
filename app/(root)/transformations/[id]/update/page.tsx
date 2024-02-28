// This file is a page that allows users to update a transformation. It is basically the same as a page containing the TransformationForm component, but differs in the sense that it renders all previous information already filled in as placeholder(s). 
// This is useful for users who want to make changes (expecially minimial ones) to their transformations.

// Won't include many comments, as this is mostly straightforward.

import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import { getImageById } from "@/lib/actions/image.actions";

const Page = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = auth(); // Authenticate user

  if (!userId) redirect("/sign-in"); // Redirect if not authenticated

  const user = await getUserById(userId); // Need user, so TranformationForm can confirm that the image has permission to be updated.
  const image = await getImageById(id); // Collect the desired previous transformation for the user to update.

  const transformation =
    transformationTypes[image.transformationType as TransformationTypeKey];

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subtitle} />

      <section className="mt-10">
        <TransformationForm
          action="Update"
          userId={user._id}
          type={image.transformationType as TransformationTypeKey}
          creditBalance={user.creditBalance}
          config={image.config}
          data={image}
        />
      </section>
    </>
  );
};

export default Page;