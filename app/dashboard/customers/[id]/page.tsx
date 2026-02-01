"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Plus,
  User,
  FileText,
  Trash2,
  MessageCircle,
  Printer,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PrintBillsDialog } from "@/components/print-bills";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

import { BillEntryDrawer } from "@/components/bill-entry-drawer";
import { PaymentEntryDrawer } from "@/components/payment-entry-drawer";
import { WhatsAppInvoiceDialog } from "@/components/whatsapp-invoice-dialog";
import { toast } from "sonner";

import { fetchCustomerById } from "@/redux/slices/customer-slice";
import { deleteBill } from "@/redux/slices/bill-slice";
import { deletePayment } from "@/redux/slices/payment-slice";
import type { Customer, Payment, Bill, BillItem } from "@/lib/types";
import type { AppDispatch, RootState } from "@/redux/store/store";
import { fetchMenuItems } from "@/redux/slices/menu-slice";

interface SelectedItem {
  type: "bill" | "payment";
  id: string;
  data: Bill | Payment | null;
}

export default function SingleCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const customerData = useSelector(
    (state: RootState) => state.customer.selectedCustomer
  );
  const { loading: customerLoading, error: customerError } = useSelector(
    (state: RootState) => state.customer
  );

  const customer: Customer | null = customerData?.user ?? null;
  console.log(customer);
  const bills: any[] = customerData?.bills ?? [];
  const payments: any[] = customerData?.payments ?? [];

  const [openBillDrawer, setOpenBillDrawer] = useState(false);
  const [openPaymentDrawer, setOpenPaymentDrawer] = useState(false);
  const [openWhatsApp, setOpenWhatsApp] = useState(false);
  const [openPrintBills, setOpenPrintBills] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [billsLoading, setBillsLoading] = useState(false);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    dispatch(fetchCustomerById(id));
    dispatch(fetchMenuItems()).catch(() =>
      toast.error("Failed to fetch menu items")
    );
  }, [id, dispatch]);

  // ────────── Handlers ──────────
  const handleEditBill = (bill: any) => {
    setSelectedItem({ type: "bill", id: bill._id, data: bill });
    setOpenBillDrawer(true);
  };

  const handleEditPayment = (payment: any) => {
    setSelectedItem({ type: "payment", id: payment._id, data: payment });
    setOpenPaymentDrawer(true);
  };

  const confirmDeleteBill = async () => {
    if (!deleteItem) return;
    try {
      setIsDeleting(true);
      await dispatch(
        deleteBill({ billId: deleteItem._id, customerId: customer?._id || "" })
      ).unwrap();
      toast.success("Bill deleted");
      if (id) {
        dispatch(fetchCustomerById(id));
      }
      setDeleteItem(null);
    } catch (err: any) {
      toast.error(err || "Failed to delete bill");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDeletePayment = async () => {
    if (!deleteItem) return;
    try {
      setIsDeleting(true);
      await dispatch(
        deletePayment({ paymentId: deleteItem._id, customerId: customer?._id || "" })
      ).unwrap();
      toast.success("Payment deleted");
      if (id) {
        dispatch(fetchCustomerById(id));
      }
      setDeleteItem(null);
    } catch (err: any) {
      toast.error(err || "Failed to delete payment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDrawerOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedItem(null);
    }
  };

  // ────────── Loading State ──────────
  if (customerLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-8 w-28 mb-4" />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
          <div className="flex gap-2 mt-2 sm:mt-0">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Array(3)
            .fill(0)
            .map((_, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  }

  // ────────── Error / Empty Customer State ──────────
  if (customerError || !customer) {
    return (
      <div className="p-4 sm:p-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <Empty className="mt-12">
          <EmptyMedia variant="icon">
            <User size={32} />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Customer Not Found</EmptyTitle>
            <EmptyDescription>
              The customer you are looking for does not exist or has been
              deleted.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  // ────────── Page Content ──────────
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Button onClick={() => router.back()} variant="outline">
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>

      {/* Customer Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold truncate">
            {customer.firstName} {customer.lastName}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground truncate">
            {customer.phone}
          </p>
          <p className="text-sm text-muted-foreground">{customer.address}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpenPrintBills(true)}
            disabled={!bills || bills.length === 0}
          >
            <Printer size={16} className="mr-2" /> Print Bills
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedItem(null);
              setOpenBillDrawer(true);
            }}
          >
            <Plus size={16} className="mr-2" /> Add Bill
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedItem(null);
              setOpenPaymentDrawer(true);
            }}
          >
            <Plus size={16} className="mr-2" /> Add Payment
          </Button>
        </div>

      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Billed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              Rs {customer?.summary?.totalBilled?.toLocaleString() ?? "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              Rs {customer?.summary?.totalPaid?.toLocaleString() ?? "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-destructive">
              Rs {customer?.summary?.balance?.toLocaleString() ?? "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {billsLoading ? (
            <div className="space-y-2">
              {Array(3)
                .fill(0)
                .map((_, idx) => (
                  <Skeleton key={idx} className="h-12 w-full" />
                ))}
            </div>
          ) : !bills || bills.length === 0 ? (
            <Empty className="mt-4">
              <EmptyMedia variant="icon">
                <FileText size={32} />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No bills found</EmptyTitle>
                <EmptyDescription>
                  You have not added any bills for {customer?.firstName ?? ""}{" "}
                  yet.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
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
                  {bills.map((bill: Bill) => (
                    <TableRow
                      key={bill._id}
                      onClick={() => handleEditBill(bill)}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell>
                        {new Date(bill.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {bill.items && bill.items.length > 0 ? (
                            bill.items.length === 1 ? (
                              bill.items[0].name
                            ) : (
                              <>
                                {bill.items[0].name}
                                <span className="text-muted-foreground">
                                  {" "}
                                  ... +{bill.items.length - 1}
                                </span>
                              </>
                            )
                          ) : (
                            "No items"
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        Rs {(bill.total || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteItem({ ...bill, type: "bill" });
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

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle size={20} />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Delete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment: Payment) => (
                    <TableRow
                      key={payment._id}
                      onClick={() => handleEditPayment(payment)}
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
                            setDeleteItem({ ...payment, type: "payment" });
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

      {/* Drawers / Dialogs */}
      <BillEntryDrawer
        open={openBillDrawer}
        onOpenChange={(open) => {
          setOpenBillDrawer(open);
          if (!open) handleDrawerOpenChange(false);
        }}
        customerId={customer._id}
        customerFirstName={customer.firstName}
        customerLastName={customer.lastName}
        selectedBill={
          selectedItem?.type === "bill" ? (selectedItem.data as any) : undefined
        }
      />

      <PaymentEntryDrawer
        open={openPaymentDrawer}
        onOpenChange={(open) => {
          setOpenPaymentDrawer(open);
          if (!open) handleDrawerOpenChange(false);
        }}
        customerId={customer._id}
        selectedPayment={
          selectedItem?.type === "payment" ? (selectedItem.data as any) : undefined
        }
      />

      <WhatsAppInvoiceDialog
        open={openWhatsApp}
        onOpenChange={setOpenWhatsApp}
        customerName={customer.firstName + " " + customer.lastName}
        customerPhone={customer.phone}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteItem?.type === "bill" ? "Delete Bill" : "Delete Payment"}
            </DialogTitle>
            <DialogDescription>
              {deleteItem?.type === "bill"
                ? `Are you sure you want to delete this bill for Rs ${deleteItem?.total?.toLocaleString()}? This action cannot be undone.`
                : `Are you sure you want to delete this payment of Rs ${deleteItem?.amount?.toLocaleString()}? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteItem(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={
                deleteItem?.type === "bill"
                  ? confirmDeleteBill
                  : confirmDeletePayment
              }
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Bills Dialog */}
      <PrintBillsDialog
        open={openPrintBills}
        onOpenChange={setOpenPrintBills}
        bills={bills}
        customerName={`${customer?.firstName} ${customer?.lastName}`}
        customerPhone={customer?.phone}
      />
    </div>
  );
}
