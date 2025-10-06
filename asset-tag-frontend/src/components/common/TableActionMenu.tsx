import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { MoreVertical, LucideIcon } from 'lucide-react';

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
  label = 'Actions',
}: TableActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8 p-0'>
          <MoreVertical className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            {action.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={action.isDestructive ? 'text-destructive' : ''}
            >
              {action.icon && <action.icon className='h-4 w-4 mr-2' />}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
