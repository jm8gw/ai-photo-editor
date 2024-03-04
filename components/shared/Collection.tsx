// This is the collection of cards on the home page that display all recently transformed/saved images. This file consists of the collection component (complete with pagination logic using shadcn), as well as the card component it uses to display each image.

// Basic template was provided by the example project. Personally hate glossing over this part, but right now it's more important to explore Cloudinary's search API and Stripe functionalities anyway. 

// Will come back to this later to modify it to my liking.

"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CldImage } from "next-cloudinary";

import {
  Pagination,
  PaginationContent,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { transformationTypes } from "@/constants";
import { IImage } from "@/lib/database/models/image.model";
import { formUrlQuery, getPageName } from "@/lib/utils";

import { Button } from "../ui/button";

import { Search } from "./Search";

export const Collection = ({
  hasSearch = false,
  home,
  images,
  totalPages = 1,
  page,
}: {
  images: IImage[];
  home?: boolean;
  totalPages?: number;
  page: number;
  hasSearch?: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // PAGINATION HANDLER
  const onPageChange = (action: string) => {
    const pageValue = action === "next" ? Number(page) + 1 : Number(page) - 1;

    const newUrl = formUrlQuery({
      searchParams: searchParams.toString(),
      key: "page",
      value: pageValue,
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <>
      <div className="collection-heading">
        <h2 className="h2-bold text-dark-600">Recent Edits</h2>
        {hasSearch && <Search />}
      </div>

      {images.length > 0 ? (
        <ul className="collection-list">
          {images.map((image) => (
            //(home ? image.private === false : true) && (
              <Card image={image} key={image._id} />
            //)
          ))}
        </ul>
      ) : (
        <div className="collection-empty">
          <p className="p-20-semibold">Empty List</p>
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-10">
          <PaginationContent className="flex w-full">
            <Button
              disabled={Number(page) <= 1}
              className="collection-btn"
              onClick={() => onPageChange("prev")}
            >
              <PaginationPrevious className="hover:bg-transparent hover:text-white" />
            </Button>

            <p className="flex-center p-16-medium w-fit flex-1">
              {page} / {totalPages}
            </p>

            <Button
              className="button w-32 bg-purple-gradient bg-cover text-white"
              onClick={() => onPageChange("next")}
              disabled={Number(page) >= totalPages}
            >
              <PaginationNext className="hover:bg-transparent hover:text-white" />
            </Button>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

const Card = ({ image }: { image: IImage }) => {
  const pathname = usePathname()

  return (
    <li>
      <Link href={`/transformations/${image._id}`} className="collection-card">
        <CldImage
          src={image.publicId}
          alt={image.title}
          width={image.width}
          height={image.height}
          {...image.config}
          loading="lazy"
          className="h-52 w-full rounded-[10px] object-cover"
          sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
        />
        <div className="flex-between">
          <div className="flex mr-2">
          <p className="p-20-semibold mr-3 line-clamp-1 text-dark-600">
            {image.title}
          </p>
          {image.private && (
            <Image
              src='/assets/icons/lock.svg'
              alt="Private"
              width={16}
              height={16}
            />
          )}
          </div>
          <Image
            src={`/assets/icons/${
              transformationTypes[
                image.transformationType as TransformationTypeKey
              ].icon
            }`}
            alt={image.title}
            width={24}
            height={24}
          />
        </div>
        {pathname === '/' && (
          <div>
            <p className="text-xs text-gray-400 -mt-4 -mb-2">
              Created by {image.author?.username}
            </p>
           </div>
        )}
      </Link>
    </li>
  );
};