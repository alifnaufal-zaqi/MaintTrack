import { EllipsisVertical, Eye, Pencil, Trash } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";

type ActionButtonProps = {
  isUpdate?: boolean;
  isDelete?: boolean;
  isDetail?: boolean;
  onUpdateClick?: () => void;
  onDeleteClick?: () => void;
  onDetailClick?: () => void;
};

export function ActionButton({
  isDelete = false,
  isDetail = false,
  isUpdate = false,
  onDeleteClick,
  onDetailClick,
  onUpdateClick,
}: ActionButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={"icon"}
          variant={"ghost"}
          className="size-8 text-muted-foreground"
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-32">
        {isUpdate && (
          <DropdownMenuItem onClick={onUpdateClick}>
            <span className="flex items-center gap-2">
              <Pencil />
              Edit
            </span>
          </DropdownMenuItem>
        )}
        {isDelete && (
          <DropdownMenuItem variant="destructive" onClick={onDeleteClick}>
            <span className="flex items-center gap-2">
              <Trash />
              Hapus
            </span>
          </DropdownMenuItem>
        )}
        {isDetail && (
          <DropdownMenuItem onClick={onDetailClick}>
            <Link href={"/"}>
              <span className="flex items-center gap-2">
                <Eye />
                Detail
              </span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
