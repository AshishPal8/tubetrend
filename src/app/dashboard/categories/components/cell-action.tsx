"use client";

import { useRouter } from "next/navigation";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { CategoryColumn } from "./columns";
import { useState } from "react";
import axios from "axios";
import AlertModal from "@/modals/alert-modal";

interface CellActionProps {
  data: CategoryColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onCopy = (id: number) => {
    navigator.clipboard.writeText(id.toString());
    toast.success("Category Id is copied to clipboard");
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/categories/${data.id}`);
      router.refresh();
      toast.success("Category deleted.");
    } catch (error) {
      toast.error(
        "Make sure you removed all the blogs using this category first"
      );
      console.log("Error while deleting category", error);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Action</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/categories/${data.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
