"use client"

import { Copy, Edit, MoreHorizontal, Shield, ShieldCheck } from "lucide-react"
import { toast } from "react-hot-toast"
import { useParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CustomerColumn } from "./columns"

interface CellActionProps {
  data: CustomerColumn
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter()
  const params = useParams()

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success("Customer ID copied to clipboard.")
  }

  const onToggleBlock = async () => {
    try {
      const response = await fetch(`/api/${params.storeId}/customers/${data.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isBlocked: !data.isBlocked
        })
      })
      
      if (response.ok) {
        toast.success(`Customer ${data.isBlocked ? 'unblocked' : 'blocked'} successfully`)
        router.refresh()
      } else {
        toast.error("Something went wrong")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="h-8 w-8 p-0" variant="ghost">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.userId)}>
            <Copy className="mr-2 h-4 w-4" /> Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onToggleBlock}>
            {data.isBlocked ? (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" /> Unblock User
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" /> Block User
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
