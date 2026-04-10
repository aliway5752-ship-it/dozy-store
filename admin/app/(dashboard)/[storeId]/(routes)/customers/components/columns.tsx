"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type CustomerColumn = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  isBlocked: boolean;
  createdAt: string;
}

export const columns: ColumnDef<CustomerColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-bold">{row.original.name}</span>
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-sm">{row.original.email}</span>
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <span className="text-sm">{row.original.phone}</span>
  },
  {
    accessorKey: "isBlocked",
    header: "Status",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-md text-xs font-bold ${
        row.original.isBlocked 
          ? 'bg-red-100 text-red-700' 
          : 'bg-green-100 text-green-700'
      }`}>
        {row.original.isBlocked ? 'Blocked' : 'Active'}
      </span>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => <span className="text-sm">{new Date(row.original.createdAt).toLocaleDateString()}</span>
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
