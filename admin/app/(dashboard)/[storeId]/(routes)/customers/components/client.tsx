"use client"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { DataTable } from "@/components/ui/data-table"

import { columns, CustomerColumn } from "./columns"

interface CustomerClientProps {
    data: CustomerColumn[]
}

export const CustomerClient: React.FC<CustomerClientProps> = ({
    data
}) => {
    return (
        <>
            <Heading
                title={`Customers (${data?.length})`}
                description="Manage customers for your store"
            />
            <Separator />
            <DataTable 
                columns={columns} 
                data={data} 
                searchKey="email" 
            />
        </>
    )
}
