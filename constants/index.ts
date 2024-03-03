// It is very smart to separate the constants from the rest of the code. This way, you can easily change the values of the constants without having to search through the entire codebase. This is a good practice to follow in any project.
// Within the components, only focus on the jsx. The logic and data should be placed in separate files.

export const navLinks = [
    {
      label: "Home",
      route: "/",
      icon: "/assets/icons/home.svg",
    },
    {
      label: "Image Restore",
      route: "/transformations/add/restore",
      icon: "/assets/icons/image.svg",
    },
    {
      label: "Generative Fill",
      route: "/transformations/add/fill",
      icon: "/assets/icons/stars.svg",
    },
    {
      label: "Generative Replace",
      route: "/transformations/add/replace",
      icon: "/assets/icons/filter.svg",
    },
    {
      label: "Object Remove",
      route: "/transformations/add/remove",
      icon: "/assets/icons/scan.svg",
    },
    {
      label: "Object Recolor",
      route: "/transformations/add/recolor",
      icon: "/assets/icons/paint.svg",
    },
    {
      label: "Background Remove",
      route: "/transformations/add/removeBackground",
      icon: "/assets/icons/camera.svg",
    },
    {
      label: "Profile",
      route: "/profile",
      icon: "/assets/icons/profile.svg",
    },
    {
      label: "Buy Credits",
      route: "/credits",
      icon: "/assets/icons/bag.svg",
    },
    /*
        {
        label: "A lil goofy guy",
        route: "/transformations/add/sillywilly",
        icon: "/assets/icons/stars.svg",
        },
    */
  ];
  
  export const plans = [
    {
      _id: 1,
      name: "Free",
      icon: "/assets/icons/profile.svg",
      price: 0,
      credits: 20,
      inclusions: [
        {
          label: "20 Free Credits",
          isIncluded: true,
        },
        {
          label: "Basic Access to Services",
          isIncluded: true,
        },
        {
          label: "Priority Customer Support",
          isIncluded: false,
        },
        {
          label: "Priority Updates",
          isIncluded: false,
        },
      ],
    },
    {
      _id: 2,
      name: "Pro Package",
      icon: "/assets/icons/image.svg",
      price: 10,
      credits: 150,
      inclusions: [
        {
          label: "150 Credits",
          isIncluded: true,
        },
        {
          label: "Full Access to Services",
          isIncluded: true,
        },
        {
          label: "Priority Customer Support",
          isIncluded: true,
        },
        {
          label: "Priority Updates",
          isIncluded: false,
        },
      ],
    },
    {
      _id: 3,
      name: "Premium Package",
      icon: "/assets/icons/stars.svg",
      price: 40,
      credits: 2000,
      inclusions: [
        {
          label: "2000 Credits",
          isIncluded: true,
        },
        {
          label: "Full Access to Services",
          isIncluded: true,
        },
        {
          label: "Priority Customer Support",
          isIncluded: true,
        },
        {
          label: "Priority Updates",
          isIncluded: true,
        },
      ],
    },
  ];
  
  export const transformationTypes = {
    restore: {
      type: "restore",
      title: "Restore Image",
      subtitle: "Refine images by removing noise and imperfections",
      config: { restore: true },
      icon: "image.svg",
    },
    removeBackground: {
      type: "removeBackground",
      title: "Background Remove",
      subtitle: "Removes the background of the image using AI",
      config: { removeBackground: true },
      icon: "camera.svg",
    },
    fill: {
      type: "fill",
      title: "Generative Fill",
      subtitle: "Enhance an image's dimensions using AI outpainting",
      config: { fillBackground: true },
      icon: "stars.svg",
    },
    replace: {
      type: "replace",
      title: "Generative Replace",
      subtitle: "Replace parts of an image with AI-generated content",
      config: {
        replace: { from: "", to: "" },
      },
      icon: "filter.svg",
    },
    remove: {
      type: "remove",
      title: "Object Remove",
      subtitle: "Identify and eliminate objects from images",
      config: {
        remove: { prompt: "", removeShadow: true, multiple: true },
      },
      icon: "scan.svg",
    },
    recolor: {
      type: "recolor",
      title: "Object Recolor",
      subtitle: "Identify and recolor objects from the image",
      config: {
        recolor: { prompt: "", to: "", multiple: true },
      },
      icon: "paint.svg",
    },
  };
  
  export const aspectRatioOptions = {
    "1:1": {
      aspectRatio: "1:1",
      label: "Square (1:1)",
      width: 1000,
      height: 1000,
    },
    "3:4": {
      aspectRatio: "3:4",
      label: "Standard Portrait (3:4)",
      width: 1000,
      height: 1334,
    },
    "9:16": {
      aspectRatio: "9:16",
      label: "Phone Portrait (9:16)",
      width: 1000,
      height: 1778,
    },
    "4:3": {
      aspectRatio: "4:3",
      label: "Standard Landscape (4:3)",
      width: 1334,
      height: 1000,
    },
    "16:9": {
      aspectRatio: "16:9",
      label: "Widescreen (16:9)",
      width: 1778,
      height: 1000,
    },
  };
  
  export const defaultValues = {
    title: "",
    aspectRatio: "",
    color: "",
    prompt: "",
    from: "",
    replacement: "",
    publicId: "",
  };
  
  export const creditFee = -1;