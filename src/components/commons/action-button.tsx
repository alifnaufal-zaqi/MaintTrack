import { EllipsisVertical, Eye, Pencil, Trash, RefreshCcw, QrCodeIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ActionButtonProps = {
  isUpdate?: boolean;
  isDelete?: boolean;
  isDetail?: boolean;
  isDownloadQr?: boolean;
  isResetPassword?: boolean;
  onUpdateClick?: () => void;
  onDeleteClick?: () => void;
  onDetailClick?: () => void;
  onDownloadQrClick?: () => void;
  onResetPasswordClick?: () => void;
};

export function ActionButton({
  isDelete = false,
  isDetail = false,
  isDownloadQr = false,
  isUpdate = false,
  isResetPassword = false,
  onDeleteClick,
  onDetailClick,
  onDownloadQrClick,
  onUpdateClick,
  onResetPasswordClick,
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
            <span className="flex items-center gap-2">
              <Eye />
              Detail
            </span>
          </DropdownMenuItem>
        )}
        {isDownloadQr && (
          <DropdownMenuItem onClick={onDownloadQrClick}>
            <span className="flex items-center gap-2">
              <QrCodeIcon />
              Unduh QR
            </span>
          </DropdownMenuItem>
        )}
        {isResetPassword && (
          <DropdownMenuItem onClick={onResetPasswordClick}>
            <span className="flex items-center gap-2">
              <RefreshCcw />
              Reset
            </span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
