"use client";

import axios from "axios";
import { useState } from "react";
import { Copy, MoreHorizontal, Wallet, Trash, Pencil, Truck } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { OrderColumn } from "./columns";

interface CellActionProps {
  data: OrderColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();

  const onUpdatePaidStatus = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        isPaid: !data.isPaid
      });
      toast.success("Payment status updated");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onEditNotes = async () => {
    const newNote = window.prompt("اكتب الملاحظة الجديدة للأوردر ده:", data.notes);
    
    if (newNote === null) return; 

    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        notes: newNote
      });
      toast.success("Notes updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        status: newStatus
      });
      toast.success(`Order marked as ${newStatus}`);
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/orders/${data.id}`);
      toast.success("Order deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete order");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Order ID copied");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
        
        <DropdownMenuItem onClick={onEditNotes}>
          <Pencil className="mr-2 h-4 w-4" /> Edit Notes
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onUpdatePaidStatus}>
          <Wallet className="mr-2 h-4 w-4" />
          {data.isPaid ? "Mark as Unpaid" : "Mark as Paid"}
        </DropdownMenuItem>
        
        {data.status !== "PROCESSING" && (
            <DropdownMenuItem onClick={() => onUpdateStatus("PROCESSING")}>
              <Truck className="mr-2 h-4 w-4" /> Mark Processing
            </DropdownMenuItem>
        )}
        {data.status !== "SHIPPED" && (
            <DropdownMenuItem onClick={() => onUpdateStatus("SHIPPED")}>
              <Truck className="mr-2 h-4 w-4" /> Mark Shipped
            </DropdownMenuItem>
        )}
        {data.status !== "OUT_FOR_DELIVERY" && (
            <DropdownMenuItem onClick={() => onUpdateStatus("OUT_FOR_DELIVERY")}>
              <Truck className="mr-2 h-4 w-4" /> Mark Out Delivery
            </DropdownMenuItem>
        )}
        {data.status !== "DELIVERED" && (
            <DropdownMenuItem onClick={() => onUpdateStatus("DELIVERED")}>
              <Truck className="mr-2 h-4 w-4" /> Mark Delivered
            </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => onCopy(data.id)}>
          <Copy className="mr-2 h-4 w-4" /> Copy Order ID
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onDelete} className="text-red-600">
          <Trash className="mr-2 h-4 w-4" /> Delete Order
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};