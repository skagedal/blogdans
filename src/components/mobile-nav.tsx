"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type MobileNavProps = {
  pages: { slug: string; navTitle: string }[];
};

export function MobileNav({ pages }: MobileNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Menu"
          className="sm:hidden rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring"
        >
          <Menu className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {pages.map((page) => (
          <DropdownMenuItem key={page.slug} asChild className="cursor-pointer">
            <Link href={`/${page.slug}`}>{page.navTitle}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
