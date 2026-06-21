"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ChevronDown, ChevronUp, LogOut, Settings, Star, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { getItemTypeIcon } from "@/lib/item-type-icons";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

export type SidebarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export type SidebarData = {
  itemTypes: SidebarItemType[];
  favorites: SidebarCollection[];
  recent: SidebarCollection[];
};

type SidebarProps = {
  data: SidebarData;
  user: SidebarUser | null;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({
  data,
  user,
  collapsed = false,
  onNavigate,
}: SidebarProps) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div
      data-collapsed={collapsed}
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground",
        collapsed ? "w-14" : "w-60"
      )}
    >
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <SidebarSection title="Types" collapsed={collapsed}>
          {data.itemTypes.map((type) => {
            const Icon = getItemTypeIcon(type.icon);
            const label = pluralize(type.name);
            const href = `/items/${label}`;
            const isPro = type.name === "file" || type.name === "image";
            return (
              <SidebarLink
                key={type.id}
                href={href}
                active={pathname === href}
                collapsed={collapsed}
                onNavigate={onNavigate}
                tooltip={capitalize(label)}
                leading={
                  <Icon
                    className="size-4 shrink-0"
                    style={{ color: type.color }}
                  />
                }
                trailing={
                  !collapsed ? (
                    <span className="flex items-center gap-1.5">
                      {isPro && (
                        <Badge
                          variant="outline"
                          className="h-4 px-1 py-0 text-[9px] font-semibold tracking-wide text-muted-foreground"
                        >
                          PRO
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {type.count}
                      </span>
                    </span>
                  ) : null
                }
              >
                {capitalize(label)}
              </SidebarLink>
            );
          })}
        </SidebarSection>

        <div className="mb-4">
          {!collapsed ? (
            <button
              onClick={() => setCollectionsOpen((v) => !v)}
              className="flex w-full items-center justify-between px-2 pb-1.5 text-sm font-medium text-sidebar-foreground hover:text-sidebar-accent-foreground"
            >
              Collections
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-200",
                  !collectionsOpen && "-rotate-90"
                )}
              />
            </button>
          ) : (
            <div className="mx-2 mb-1 h-px bg-sidebar-border" aria-hidden />
          )}

          {(collapsed || collectionsOpen) && (
            <div className="flex flex-col gap-0.5">
              <SidebarSubsection title="Favorites" collapsed={collapsed}>
                {data.favorites.map((collection) => (
                  <SidebarLink
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    active={pathname === `/collections/${collection.id}`}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    tooltip={collection.name}
                    leading={
                      <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
                    }
                  >
                    {collection.name}
                  </SidebarLink>
                ))}
              </SidebarSubsection>

              <SidebarSubsection title="Recent" collapsed={collapsed}>
                {data.recent.map((collection) => (
                  <SidebarLink
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    active={pathname === `/collections/${collection.id}`}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    tooltip={collection.name}
                    leading={
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor:
                            collection.accentColor ?? "var(--muted-foreground)",
                        }}
                        aria-hidden
                      />
                    }
                  >
                    {collection.name}
                  </SidebarLink>
                ))}
              </SidebarSubsection>

              {!collapsed && (
                <Link
                  href="/collections"
                  className="mt-1 flex h-8 items-center rounded-md px-2 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  View all collections
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      <UserFooter user={user} collapsed={collapsed} />
    </div>
  );
}

function SidebarSection({
  title,
  collapsed,
  children,
}: {
  title: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      {!collapsed ? (
        <h3 className="px-2 pb-1.5 text-sm font-medium text-sidebar-foreground">
          {title}
        </h3>
      ) : (
        <div className="mx-2 mb-1 h-px bg-sidebar-border" aria-hidden />
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SidebarSubsection({
  title,
  collapsed,
  children,
}: {
  title: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2">
      {!collapsed && (
        <h4 className="px-2 pt-1 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {title}
        </h4>
      )}
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({
  href,
  active,
  collapsed,
  tooltip,
  leading,
  trailing,
  children,
  onNavigate,
}: {
  href: string;
  active?: boolean;
  collapsed: boolean;
  tooltip: string;
  leading: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex h-8 items-center gap-2 rounded-md px-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
        active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
      )}
    >
      {leading}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{children}</span>
          {trailing}
        </>
      )}
    </Link>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function UserFooter({
  user,
  collapsed,
}: {
  user: SidebarUser | null;
  collapsed: boolean;
}) {
  const router = useRouter();
  const displayName = user?.name ?? "User";
  const email = user?.email ?? "";

  return (
    <div className="border-t border-sidebar-border p-2">
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-md p-1.5 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center"
          )}
        >
          <UserAvatar name={user?.name} image={user?.image} size="sm" />
          {!collapsed && (
            <>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium">
                  {displayName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              </div>
              <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start">
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function pluralize(name: string) {
  return name.endsWith("s") ? name : `${name}s`;
}

function capitalize(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}
