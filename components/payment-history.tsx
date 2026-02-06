//components/payment-history.tsx'use client';

'use client';

import { MessageCircle, Trash2 } from "lucide-react";
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
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

import type { Payment, Customer } from "@/lib/types";

interface PaymentHistoryProps {
  payments: Payment[];
  customer: Customer;
  loading?: boolean;
  isDeleting?: boolean;
  onEditPayment: (payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
}

export function PaymentHistory({
  payments,
  customer,
  loading,
  isDeleting,
  onEditPayment,
  onDeletePayment,
}: PaymentHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle size={20} />
          Payment History
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {Array(3)
              .fill(0)
              .map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full" />
              ))}
          </div>
        ) : !payments || payments.length === 0 ? (
          <Empty className="mt-4">
            <EmptyMedia variant="icon">
              <MessageCircle size={32} />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No payments found</EmptyTitle>
              <EmptyDescription>
                You have not recorded any payments for {customer.firstName}{" "}
                {customer.lastName} yet.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto rounded-md border">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Delete</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment._id}
                    onClick={() => onEditPayment(payment)}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    <TableCell>
                      {new Date(payment.date).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right font-semibold text-green-600">
                      Rs {(payment.amount || 0).toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm capitalize">
                        {payment.method || "N/A"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePayment(payment);
                        }}
                        disabled={isDeleting}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
