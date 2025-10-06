import React from &apos;react&apos;;
import { Button } from &apos;../ui/button&apos;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &apos;../ui/dropdown-menu&apos;;
import { MoreVertical, LucideIcon } from &apos;lucide-react&apos;;

export interface TableAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  isDestructive?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}

interface TableActionMenuProps {
  actions: TableAction[];
  label?: string;
}

export function TableActionMenu({
  actions,
  label = &apos;Actions&apos;,
}: TableActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant=&apos;ghost&apos; size=&apos;icon&apos; className=&apos;h-8 w-8 p-0&apos;>
          <MoreVertical className=&apos;h-4 w-4&apos; />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align=&apos;end&apos;>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={action.isDestructive ? &apos;text-destructive&apos; : &apos;&apos;}
            >
              {action.icon && <action.icon className=&apos;h-4 w-4 mr-2&apos; />}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
