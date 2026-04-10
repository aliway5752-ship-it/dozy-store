"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type OrderColumn = {
  id: string;
  orderNumber: number;
  customerName: string;
  phone: string;
  address: string; 
  email: string;
  backupPhone: string;
  notes: string;
  landmark: string;
  isPaid: boolean;
  totalPrice: string;
  products: string; 
  status: string;
  createdAt: string;
  customerId?: string;
  storeId?: string;
}

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order Number",
    cell: ({ row }) => <span className="font-bold text-sky-600 dark:text-sky-400">#{row.original.orderNumber}</span>
  },
  {
    accessorKey: "products",
    header: "Products",
    cell: ({ row }) => (
      <div className="max-w-[250px] break-words text-xs">
        {row.original.products}
      </div>
    )
  },
  {
    header: "Customer Info",
    cell: ({ row }) => {
      const customerId = row.original.customerId;
      return (
        <div className="flex flex-col text-xs gap-1">
          {customerId ? (
            <button
              onClick={() => window.open(`/admin/${row.original.storeId}/users/${customerId}`, '_blank')}
              className="font-bold text-foreground text-sm hover:text-sky-600 transition-colors cursor-pointer"
            >
            {row.original.customerName}
          </button>
          ) : (
            <span className="font-bold text-foreground text-sm">{row.original.customerName || "Guest"}</span>
          )}
          <span className="text-muted-foreground">Ph: {row.original.phone}</span>
        </div>
      )
    }
  },
  {
    header: "Notes",
    accessorKey: "notes",
    cell: ({ row }) => {
      const notes = row.original.notes;
      const hasNotes = notes && notes !== "-";

      return (
        <div className="max-w-[200px] flex flex-col gap-1">
          {hasNotes && (
            <div className="px-2 py-1 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold shadow-sm">
              Notes: {notes}
            </div>
          )}
          {row.original.landmark && row.original.landmark !== "-" && (
            <div className="px-2 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-100 text-[11px]">
              Landmark: {row.original.landmark}
            </div>
          )}
          {!hasNotes && (!row.original.landmark || row.original.landmark === "-") && (
            <span className="text-gray-400 text-xs">-</span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "isPaid",
    header: "Payment",
    cell: ({ row }) => (
      <div className={`font-bold text-[11px] ${row.original.isPaid ? "text-green-600" : "text-red-600"}`}>
        {row.original.isPaid ? "✓ Paid" : "✗ Unpaid"}
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status;
      return (
        <span className={`px-2 py-1 object-fit min-w-[90px] text-center inline-block rounded-md text-[10px] font-bold uppercase tracking-wider ${
          s === 'PENDING' ? 'bg-orange-100 text-orange-700' : 
          s === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
          s === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
          s === 'OUT_FOR_DELIVERY' ? 'bg-indigo-100 text-indigo-700' :
          s === 'DELIVERED' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {s}
        </span>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
];