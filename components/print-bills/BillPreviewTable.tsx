import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface BillPreviewTableProps {
    bills: any[]
}

export function BillPreviewTable({ bills }: BillPreviewTableProps) {
    const totalAmount = bills.reduce((sum, bill) => sum + (bill.total || 0), 0)

    return (
        <div className="border rounded-lg flex flex-col h-[60vh]"> 
            {/* flex-col to separate header, body, footer */}
            
            {/* Header */}
            <div className="flex-shrink-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-background sticky top-0 z-10">
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                </Table>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">
                <Table>
                    <TableBody>
                        {bills.map((bill) => (
                            <TableRow key={bill._id}>
                                <TableCell className="whitespace-nowrap">
                                    {new Date(bill.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    {bill.items && bill.items.length > 0 ? (
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {bill.items.map((item: any) => (
                                                <li key={item._id}>
                                                    {item.name} ({item.size}, {item.quantity} {item.unit}) - Rs {item.total.toLocaleString()}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-muted-foreground">No items</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-semibold whitespace-nowrap">
                                    Rs {(bill.total || 0).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Footer / Grand Total */}
            <div className="flex-shrink-0 bg-muted p-4 border-t text-right font-bold">
                Total: Rs {totalAmount.toLocaleString()}
            </div>
        </div>
    )
}
