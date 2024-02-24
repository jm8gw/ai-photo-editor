import Header from '@/components/shared/Header'
import React from 'react'
import { transformationTypes } from '@/constants' // This constants file includes simple objects that define "types" taken from the URL. Based off the type, we are provided with other information like title, subtitle, config, icon, etc. Change any necessary page information directly in the constants file if necessary.
import TransformationForm from '@/components/shared/TransformationForm';
import { auth } from '@clerk/nextjs';
import { getUserById } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

const AddTransformationTypePage =  async ({ params: { type } }: SearchParamProps) => { // Read type from the URL. Information regarding URL query params is available in the index.d.ts file in types folder (taken from example).

    // Get access to the currently logged in user with Clerk
    const { userId } = auth();
    if (!userId) redirect('/sign-in'); // If the user is not logged in, redirect them to the sign-in page. 

    const transformation = transformationTypes[type]; // Get the transformation type information from the constants file.

    // Since the Clerk user ID is different from the user ID in our database, we need to use our find function (server action) to translate it.
    const user = await getUserById(userId); 

  return (
    <>
        <Header title={transformation.title} subtitle={transformation.subtitle} />

        <section className="mt-10">
          <TransformationForm 
              action="Add" // Because we are for the first time adding/creating an image, not editing it. We are in the "add" page after all.
              userId={user._id} // The real ID of the user in our database
              type={transformation.type as TransformationTypeKey} // The type of transformation
              creditBalance={user.creditBalance} // The user's credit balance
          />
        </section>
    </>
  )
}

export default AddTransformationTypePage