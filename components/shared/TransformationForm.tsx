// "Forms are tricky. They are one of the most common things you'll build in a web application, but also one of the most complex." - shadcn/ui

// Shadcn is great. This library in particular not only allows for easy form creation, but also easy form validation using zod. Here are some of the features they boast on their site:
// Composable components for building forms.
// A <FormField /> component for building controlled form fields.
// Form validation using zod.
// Handles accessibility and error messages.
// Uses React.useId() for generating unique IDs.
// Applies the correct aria attributes to form fields based on states.
// Built to work with all Radix UI components.
// Bring your own schema library. We use zod but you can use anything you want.
// You have full control over the markup and styling.

"use client"; // Because it has to manage keyboard, key press, and submit events


import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants";
import { CustomField } from "./CustomField";
import { use, useEffect, useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { updateCredits } from "@/lib/actions/user.actions";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/lib/actions/image.actions";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";

// Validation, where we define what kind of fields or inputs we want to have in our form
export const formSchema = z.object({
  title: z.string(),
  publicId: z.string(),

  // These are transformation option specific
  aspectRatio: z.string().optional(), 
  color: z.string().optional(), 
  prompt: z.string().optional(),
})


const TransformationForm = ({ action, data = null, userId, type, creditBalance, config = null }: TransformationFormProps) => { // Once again, prop types are defined in the index.d.ts file in the types folder (taken from example).

    // Get access to the current transformation type we are doing (and the relevant information for that type provided in constants file)
    const transformationType = transformationTypes[type];

    // Needed for image upload
    const [image, setImage] = useState(data);
    // Keep track of what we do with that image
    const [newTransformation, setNewTransformation] = useState<Transformations | null>(null); // Specify type to satisfy typescript
    // Need to know if we are currently submitting
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Need to know if we are currently doing something with that image
    const [isTransforming, setIsTransforming] = useState(false);
    // Need to know current transformation configuration
    const [transformationConfig, setTransformationConfig] = useState(config);

    // Use a useTransition hook for the onTransformHandler function
    // It allows us to update the state without blocking the UI
    const [isPending, startTransition] = useTransition()

    // Routing functionality from next/navigation
    const router = useRouter();

    // Need to define default values. In the case of editing, we might have data from before that we should use.
    const initialValues = data && action === 'Update' ? {
        title: data?.title,
        aspectRatio: data?.aspectRatio,
        color: data?.color,
        prompt: data?.prompt,
        publicId: data?.publicId,
    } : defaultValues // If we are not updating, we are creating, so we use the default values (taken from constants file)

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialValues,
    })
    // Using defaultValues from the constants file, we can set the default values for the form fields. If we already have data, we can populate that instead!
    
    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true); // We are currently submitting

        if(data || image) { // If we have data or a new image, proceed with the action
            // Get back the tranformation url provided by cloudinary
            const transformationUrl = getCldImageUrl({
                width: image?.width,
                height: image?.height,
                src: image?.publicId,
                ...transformationConfig
            })

            const imageData = {
                title: values.title, // directly from the form
                publicId: image?.publicId, // from the image state
                transformationType: type, // recolor, gen fill, etc.
                width: image?.width,
                height: image?.height,
                config: transformationConfig,
                secureURL: image?.secureURL, // to where that image is stored
                transformationURL: transformationUrl, // Change everything to have captital "URL". Too confusing otherwise.
                aspectRatio: values.aspectRatio, // from the form
                prompt: values.prompt,
                color: values.color,
            }

            if(action === "Add"){ // We want to add the image for the first time
                try {
                    const newImage = await addImage({ // from image.actions.ts, accepts image, userId, and path
                        image: imageData,
                        userId,
                        path: '/'
                    })

                    if(newImage) {
                        form.reset(); // Reset the form (clean up)
                        setImage(data);

                        // Enable routing functionalities
                        router.push(`/transformations/${newImage._id}`) // Push to that specific url
                    }
                } catch (error) {
                    console.log(error)
                }
            }

            if(action === "Update"){ // We want to update the image
                try {
                    const updatedImage = await updateImage({ // from image.actions.ts, accepts image, userId, and path
                        image: { 
                            ...imageData, // spread what the image currently has
                            _id: data._id, // pass the id of the image we are updating
                        },
                        userId,
                        path: `/transformations/${data._id}` // We want to redirect to the specific image we are updating
                    })

                    if(updatedImage) {
                        // Push to that existing tranformation
                        router.push(`/transformations/${updatedImage._id}`)
                    }
                } catch (error) {
                    console.log(error)
                }
            }
        }

        setIsSubmitting(false); // We are done submitting
        // console.log(values)
    }

    // Function to handle our select (aspect ratio) field
    const onSelectFieldHandler = (value: string, onChangeField: (value:string) => void) => {
        const imageSize = aspectRatioOptions[value as AspectRatioKey] // Get the image size from the aspect ratio options

        setImage((prevState: any) => ({
            ...prevState,
            aspectRatio: imageSize.aspectRatio,
            width: imageSize.width,
            height: imageSize.height,
        }))
        
        // Now we know the configuration of the transformation we are doing
        setNewTransformation(transformationType.config);

        return onChangeField(value);
    }

    // Function to handle input changes (color for recoloring, and prompt for removing objects)
    const onInputChangeHandler = (
        fieldName: string, 
        value: string, 
        type: string, 
        onChangeField: (value:string) => void) => {
            // We wait to wait a little bit (1 second) before we submit any entries. The full prompt should be written before we send it to the AI to process, otherwise we are wasting requests and resources by sending in words one letter at a time. We achieve this by using a debounce function.
            debounce(() => {
                setNewTransformation((prevState: any) => ({
                    ...prevState, // "Spead" the previous state
                    [type]: { // "Tap into" a specific property of the previous state
                        ...prevState?.[type], // Spread all the properties that IT has
                        [fieldName === 'prompt' ? 'prompt' : 'to' ]: value // Either we are changing the prompt or the color
                    }    
                }))

                return onChangeField(value);
            }, 1000) 

        }
    
    // The actual function that handles the logic of doing something to the image
    // TODO: Update creditFee to something else if needed
    const onTransformHandler = async () => {
        setIsTransforming(true); // We are currently transforming

        setTransformationConfig(
            deepMergeObjects(newTransformation, transformationConfig) // deepMergeObjects is a ChatGPT generated function in utils.ts that merges all of the keys of both objects fed to it, to ensure that all of them end up in a newly created object, which we can then set to the transformationConfig state.
        )

        setNewTransformation(null); // We are done with the transformation

        startTransition(async () => {
            await updateCredits(userId, creditFee); // Coming from user actions, as this is a server action done with the database. We need to update the user's credit balance after they have used some of it to transform an image.
            // creditFee is a constant from the constants file (-1). 
        })
    }

    // In the case of using image restore or remove background, we need to set the new transformation to the config immediately after the image is uploaded using useEffect, as we won't be using fields (like aspect ratio) that would normally set the transformation upon selection. This way, the button won't stay disabled after the image is uploaded for those two options :).
    useEffect(() => {
        if(image && (type === 'restore' || type === 'removeBackground')){
            setNewTransformation(transformationType.config);
        }
    }, [image, transformationType.config, type])


    // 3. Render the form.
  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Check credit balance before doing anything else. If it is lower than what we are charging, bring up the alert modal. */}
            {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal /> }

            {/* All options will have a title and a publicId */}
            <CustomField 
                control={form.control}
                name="title"
                formLabel="Image Title"
                className="w-full"
                render={({ field }) => 
                    <Input {...field} className="input-field" />}
            />

            {/* Only the generative fill option will have aspect ratio field */}
            {type === 'fill' && (
                <CustomField 
                    control={form.control}
                    name="aspectRatio"
                    formLabel="Aspect Ratio"
                    className="w-full"
                    render={({ field }) => (
                    <Select
                        onValueChange={(value: string) => onSelectFieldHandler(value, field.onChange)}
                    >
                        <SelectTrigger className="select-field">
                          <SelectValue placeholder="Select Size" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Dynamically imported from constants */}
                            {Object.keys(aspectRatioOptions).map((key) => (
                                <SelectItem key={key} value={key} className="select-item">
                                    {aspectRatioOptions[key as AspectRatioKey].label}
                                    {/* Get the image size from the aspect ratio options */}
                                </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>  
                    )}
                />
            )}

            {/* Only object remove and object recolor options will need a prompt field (so users can say what to remove or recolor) */}
            {((type === 'remove') || (type === 'recolor')) && (
                <div className="prompt-field">
                    <CustomField 
                        control={form.control}
                        name="prompt"
                        formLabel={
                            type === 'remove' ? "Object to Remove" : "Object to Recolor"
                        }
                        className="w-full"
                        render={(({ field }) => (
                            <Input 
                                value= {field.value}
                                className="input-field" 
                                onChange={(e) => onInputChangeHandler(
                                    'prompt', // Pass string of field we are changing
                                    e.target.value, // So it knows the data we are trying to type
                                    type, // Are we removing or recoloring?
                                    field.onChange
                                )}
                            />
                        ))}
                    />
                    
                    {/* Only object recolor will need a replacement color field */}
                    {type === 'recolor' && (
                        <CustomField 
                            control={form.control}
                            name="color"
                            formLabel="Replacement Color"
                            className="w-full"
                            render={({ field }) => (
                                <Input 
                                    value= {field.value}
                                    className="input-field" 
                                    onChange={(e) => onInputChangeHandler(
                                        'color', // Pass string of field we are changing
                                        e.target.value, // So it knows the data we are trying to type
                                        'recolor',
                                        field.onChange
                                    )}
                                />    
                            )}
                        
                        />    
                    )}
                </div>
            )}
  
            <div className="media-uploader-field">
                {/* Mask Cloudinary's uploader widget within a custom field so we immediatly get it's data within our form */}
                <CustomField 
                    control={form.control}
                    name="publicId"
                    className="flex size-full flex-col"
                    render={({ field }) => (
                        <MediaUploader 
                            onValueChange={field.onChange}
                            setImage={setImage}
                            publicId={field.value}
                            image={image}
                            type={type}
                        />
                    )}
                />

                <TransformedImage 
                    image={image}
                    type={type}
                    title={form.getValues().title}
                    isTransforming={isTransforming}
                    setIsTransforming={setIsTransforming}
                    transformationConfig={transformationConfig}
                />

            </div>

            <div className="flex flex-col gap-4">
                {/* A button to apply the desired transformation */}
                <Button 
                    type="button" 
                    className="submit-button capitalize" 
                    disabled={isTransforming || newTransformation === null} // Make it disabled if we are currently transforming or if we don't have a transformation
                    onClick={onTransformHandler} 
                >
                    {isTransforming ? "Transforming..." : "Apply Transformation"}
                </Button>
                
                {/* Finally, a save/submit button */}
                <Button 
                    type="submit" 
                    className="submit-button capitalize" 
                    disabled={isSubmitting} // Make it disabled if we are currently submitting (so uses don't submit multiple times)
                >
                    {isSubmitting ? "Submitting..." : "Save Image"}
                </Button>
            </div>

        </form>
    </Form>
  )
}

export default TransformationForm

// And now, a message from our sponsor:
// Shadcn is great at building forms. He's built a lot of them. He's built forms for user registration, login, and even for creating new images. He's also built forms for updating user data, and for creating new posts. He's built forms for creating new comments, and for creating new categories. He's built forms for creating new tags, and for creating new pages. He's built forms for creating new products, and for creating new orders. He's built forms for creating new subscriptions, and for creating new invoices. He's built forms for creating new events, and for creating new venues. He's built forms for creating new tickets, and for creating new coupons. He's built forms for creating new messages, and for creating new notifications. He's built forms for creating new settings, and for creating new themes. He's built forms for creating new templates, and for creating new widgets. He's built forms for creating new menus, and for creating new footers. He's built forms for creating new headers, and for creating new sidebars. He's built forms for creating new modals, and for creating new popups. He's built forms for creating new sliders, and for creating new carousels. He's built forms for creating new accordions, and for creating new tabs. He's built forms for creating new breadcrumbs, and for creating new pagination. He's built forms for creating new search bars, and for creating new filters. He's built forms for creating new sorters, and for creating new tables. He's built forms for creating new lists, and for creating new grids. He's built forms for creating new cards, and for creating new badges. He's built forms for creating new avatars, and for creating new icons. He's built forms for creating new buttons, and for creating new links. He's built forms for creating new inputs, and for creating new textareas. He's built forms for creating new selects, and for creating new radios. He's built forms for creating new checkboxes, and for creating new switches. He's built forms for creating new sliders, and for creating new ranges. He's built forms for creating new dates, and for creating new times. He's built forms for creating new date times, and for creating new files. He's built forms for creating new images, and for creating new videos. He's built forms for creating new audios, and for creating new embeds. He's built forms for creating new iframes, and for creating new objects. He's built forms for creating new params, and for creating new maps. He's built forms for creating new areas, and for creating new canvases. He's built forms for creating new svgs, and for creating new paths. He's built forms for creating new polygons, and for creating new polylines. He's built forms for creating new circles, and for creating new ellipses. He's built forms for creating new rectangles, and for creating new lines. He's built forms for creating new texts, and for creating new tspan. He's built forms for creating new tref, and for creating new textpath. He's built forms for creating new altglyph, and for creating new altglyphdef. He's built forms for creating new altglyphitem, and for creating new animate. He's built forms for creating new animatecolor, and for creating new animatemotion. He's built forms for creating new animatetransform, and for creating new circle. He's built forms for creating new clippath, and for creating new colorprofile. He's built forms for creating new cursor, and for creating new defs. He's built forms for creating new desc, and for creating new discard. He's built forms for creating new ellipse, and for creating new feblend. He's built forms for creating new fecolormatrix, and for creating new fecomponenttransfer. He's built forms for creating new fecomposite, and for creating new feconvolvematrix. He's built forms for creating new fediffuselighting, and for creating new fedisplacementmap. He's built forms for creating new fedistantlight, and for creating new fedropshadow. He's built forms for creating new feflood, and for creating new fefunca. He's built forms for creating new fefuncb, and for creating new fefuncg. He's built forms for creating new fefuncr, and for creating new fegaussianblur. He's built forms for creating new feimage, and for creating new femerge. He's built forms for creating new femergenode, and for creating new femorphology. He's built forms for creating new feoffset, and for creating new fepointlight. He's built forms for creating new fespecularlighting, and for creating new fespotlight. He's built forms for creating new fetile, and for creating new feturbulence. He's built forms for creating new filter, and for creating new font. He's built forms for creating new fontface, and for creating new fontfaceformat. He's built forms for creating new fontfacename, and for creating new fontfacesrc. He's built forms for creating new fontfaceuri, and for creating new foreignobject. He's built forms for creating new g, and for creating new glyph. He's built forms for creating new glyphref, and for creating new hatch. He's built forms for creating new hatchpath, and for creating new hkern. He's built forms for creating new iframe, and for creating new image. He's built forms for creating new line, and for creating new lineargradient. He's built forms for creating new marker, and for creating new mask. He's built forms for creating new mesh, and for creating new meshgradient. He's built forms for creating new meshpatch, and for creating new meshrow. He's built forms for creating new metadata, and for creating new missingglyph. He's built forms for creating new mpath, and for creating new path. He's built forms for creating new pattern, and for creating new polygon. He's built forms for creating new polyline, and for creating new radialgradient. He's built forms for creating new rect, and for creating new script. He's built forms for creating new set, and for creating new solidcolor. He's built forms for creating new stop, and for creating new style. He's built forms for creating new svg, and for creating new switch. He's built forms for creating new symbol, and for creating new text. He's built forms for creating new textpath, and for creating new title. He's built forms for creating new tref, and for creating new tspan. He's built forms for creating new unknown, and for creating new use. He's built forms for creating new view, and for creating new vkern. He's built forms for creating new animate, and for creating new animatecolor. He's built forms for creating new animatemotion, and for creating new animatetransform. He's built forms for creating new mpath, and for creating new path. He's built forms for creating new pattern, and for creating new polygon. He's built forms for creating new polyline, and for creating new radialgradient. He's built forms for creating new rect, and for creating new script. He's built forms for creating new set, and for creating new solidcolor. He's built forms for creating new stop, and for creating new style. He's built forms for creating new svg, and for creating new switch. He's built forms for creating new symbol, and for creating new text. He's built forms for creating new textpath, and for creating new title. He's built forms for creating new tref, and for creating new tspan. He's built forms for creating new unknown, and for creating new use. He's built forms for creating new view, and for creating new vkern. He's built forms for creating new animate, and for creating new animatecolor. He's built forms for creating new animatemotion, and for creating new animatetransform. He's built forms for creating new circle, and for creating new clippath. He's built forms for creating new colorprofile, and for creating new cursor. He's built forms for creating new defs, and for creating new desc. He's built forms for creating new discard, and for creating new ellipse. He's built forms for creating new feblend, and for creating new fecolormatrix. He's built forms for creating new fecomponenttransfer, and for creating new fecomposite. He's built forms for creating new feconvolvematrix, and for creating new fediffuselighting. He's built forms for creating new fedisplacementmap, and for creating new fedistantlight. He's built forms for creating new fedropshadow, and for creating new feflood. He's built forms for creating new fefunca, and for creating new fefuncb. He's built forms for creating new fefuncg, and for creating new fefuncr. He's built forms for creating new fegaussianblur, and for creating new feimage. He's built forms for creating new femerge, and for creating new femergenode. He's built forms for creating new femorphology, and for creating new feoffset. He's built forms for creating new fepointlight, and for creating new fespecularlighting. He's built forms for creating new fespotlight, and for creating new fetile. He's built forms for creating new feturbulence, and for creating new filter 