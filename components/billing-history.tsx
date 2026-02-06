'use client';

import { useEffect, useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
} from "@/components/ui/empty";
import type { Bill, Customer } from "@/lib/types";

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
} from "@/components/ui/pagination";

interface BillingHistoryProps {
    bills: Bill[];
    customer: Customer;
    billsLoading?: boolean;
    isDeleting?: boolean;
    onEditBill: (bill: Bill) => void;
    onDeleteBill: (bill: Bill) => void;
}

export function BillingHistory({
    bills,
    customer,
    billsLoading,
    isDeleting,
    onEditBill,
    onDeleteBill,
}: BillingHistoryProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter and sort bills
    useEffect(() => {
        const sorted = [...(bills || [])].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        if (!searchTerm) {
            setFilteredBills(sorted);
            setCurrentPage(1);
            return;
        }

        const term = searchTerm.toLowerCase();

        const filtered = sorted.filter((bill) => {
            const dateStr = new Date(bill.date).toLocaleDateString();
            const totalStr = (bill.total || 0).toString();
            const itemsStr =
                bill.items?.map((i) => i.name.toLowerCase()).join(" ") ?? "";

            return (
                dateStr.includes(term) ||
                totalStr.includes(term) ||
                itemsStr.includes(term)
            );
        });

        setFilteredBills(filtered);
        setCurrentPage(1);
    }, [searchTerm, bills]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentBills = filteredBills.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    Billing History
                </CardTitle>
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by date, items, or total..."
                    className="sm:w-64"
                />
            </CardHeader>

            <CardContent>
                {billsLoading ? (
                    <div className="space-y-2">
                        {Array(3).fill(0).map((_, idx) => (
                            <Skeleton key={idx} className="h-12 w-full" />
                        ))}
                    </div>
                ) : !bills || bills.length === 0 ? (
                    <Empty className="mt-4">
                        <EmptyMedia variant="icon"><FileText size={32} /></EmptyMedia>
                        <EmptyHeader>
                            <EmptyTitle>No bills found</EmptyTitle>
                            <EmptyDescription>You have not added any bills for {customer?.firstName} yet.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Delete</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentBills.map((bill) => (
                                        <TableRow
                                            key={bill._id}
                                            onClick={() => onEditBill(bill)}
                                            className="cursor-pointer hover:bg-muted/50"
                                        >
                                            <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {bill.items && bill.items.length > 0
                                                    ? bill.items.length === 1
                                                        ? bill.items[0].name
                                                        : <>
                                                            {bill.items[0].name}
                                                            <span className="text-muted-foreground"> +{bill.items.length - 1}</span>
                                                          </>
                                                    : "No items"}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                Rs {(bill.total || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={(e) => { e.stopPropagation(); onDeleteBill(bill); }}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {currentBills.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                                                No bills match your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <Pagination className="mt-4">
                                <PaginationContent>
                                    <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} />
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <PaginationItem key={i}>
                                            <PaginationLink
                                                isActive={currentPage === i + 1}
                                                onClick={() => handlePageChange(i + 1)}
                                            >
                                                {i + 1}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
                                </PaginationContent>
                            </Pagination>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
