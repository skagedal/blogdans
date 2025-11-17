"use client";

import { Avatar, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, UserCircle } from "lucide-react";
import { BlogdansUser } from "@/lib/user-types";
import { handleLogout } from "@/lib/login";

type UserMenuProps = {
  user: BlogdansUser;
};

export function UserMenu({ user }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-ring">
          <Avatar className="h-8 w-8 cursor-pointer">
            {user.photo ? (
              <AvatarImage src={user.photo} alt={user.name} />
            ) : (
              <UserCircle className="h-8 w-8" />
            )}
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar className="h-8 w-8">
            {user.photo ? (
              <AvatarImage src={user.photo} alt={user.name} />
            ) : (
              <UserCircle className="h-8 w-8" />
            )}
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => await handleLogout()}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
