"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { createBill, updateBill } from "@/redux/slices/bill-slice";
import { fetchCustomerById } from "@/redux/slices/customer-slice";
import { AppDispatch, RootState } from "@/redux/store/store";
import { Spinner } from "./ui/spinner";

interface BillEntryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerFirstName: string;
  customerLastName: string;
  selectedBill?: any;
}

export function BillEntryDrawer({
  open,
  onOpenChange,
  customerId,
  customerFirstName,
  customerLastName,
  selectedBill,
}: BillEntryDrawerProps) {
  let menuItems = useSelector((state: RootState) => state.menu.items);
  menuItems = menuItems.filter((item) => item.status === "active");
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [selectedSize, setSelectedSize] = useState<"half" | "full">("full");
  const [quantity, setQuantity] = useState("");
  const [billDate, setBillDate] = useState<Date | undefined>(new Date());
  const [billItems, setBillItems] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentTranslate = useRef(0);

  // Initialize form with selected bill data when drawer opens or selectedBill changes
  useEffect(() => {
    if (open && selectedBill) {
      setIsEditMode(true);
      setBillDate(new Date(selectedBill.date));
      // Parse existing bill items
      const existingItems = (selectedBill.items || []).map((item: any) => ({
        id: item._id || Date.now().toString(),
        menuId: typeof item.menuId === "string" ? item.menuId : item.menuId._id,
        name: item.name,
        size: item.size || "full",
        unit: item.unit,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }));
      setBillItems(existingItems);
    } else if (open) {
      setIsEditMode(false);
      setBillDate(new Date());
      setBillItems([]);
      setSelectedMenuId("");
      setQuantity("");
      setSelectedSize("full");
    }
  }, [open, selectedBill]);

  // ---------------- Touch Swipe ----------------
  const handleTouchStart = (e: React.TouchEvent) =>
    (startY.current = e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!sheetRef.current) return;
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 0) {
      sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      currentTranslate.current = deltaY;
    }
  };
  const handleTouchEnd = () => {
    if (!sheetRef.current) return;
    if (currentTranslate.current > 120) {
      onOpenChange(false);
    }
    sheetRef.current.style.transform = "";
    currentTranslate.current = 0;
  };

  const handleAddItem = () => {
    if (!selectedMenuId) return toast.error("Please select a menu item");
    const menuItem = menuItems.find((m) => m._id === selectedMenuId);
    if (!menuItem) return;

    const qty = Math.max(1, parseInt(quantity) || 1); // ensures at least 1
    const price = selectedSize === "half" ? menuItem.half : menuItem.full;

    setBillItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        menuId: menuItem._id,
        name: menuItem.name,
        size: selectedSize,
        unit: menuItem.unit,
        quantity: qty,
        price,
        total: price * qty,
      },
    ]);
    setSelectedMenuId("");
    setQuantity(""); // reset input
    setSelectedSize("full");
  };


  const handleRemoveItem = (id: string) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed");
  };

  const handleSaveBill = async () => {
    if (!billItems.length) return toast.error("Please add items");

    try {
      setIsLoading(true);

      const billPayload = {
        date: (billDate || new Date()).toISOString(),
        customerId,
        items: billItems.map((item) => ({
          menuId: item.menuId,
          name: item.name,
          size: item.size,
          unit: item.unit,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      };

      if (isEditMode && selectedBill) {
        // Update existing bill
        await dispatch(
          updateBill({
            billId: selectedBill._id,
            customerId,
            items: billPayload.items,
            date: billPayload.date,
          })
        ).unwrap();
        toast.success("Bill updated successfully");
      } else {
        // Create new bill
        await dispatch(
          createBill(billPayload)
        ).unwrap();
        toast.success(
          `Bill for ${customerFirstName} ${customerLastName} saved`
        );
      }

      await dispatch(fetchCustomerById(customerId));
      setBillItems([]);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err || "Failed to save bill");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="max-h-[90vh] overflow-y-auto px-4 py-6 rounded-t-lg pb-[env(safe-area-inset-bottom)]"
      >
        {/* Handle Icon */}
        <div className="flex items-center justify-center mb-0">
          <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
        </div>

        <SheetHeader className="mb-4 flex items-center justify-between">
          <SheetTitle>{isEditMode ? "Edit Bill" : "Add New Bill"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? `Update bill details`
              : `Create a new bill for ${customerFirstName} ${customerLastName}`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Bill Date */}
          <div className="space-y-2">
            <Label>Bill Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {billDate ? billDate.toLocaleDateString() : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={billDate}
                  onSelect={setBillDate}
                  disabled={isLoading}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Menu, Size, Quantity, Add */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Menu Item</Label>
              <Select value={selectedMenuId} onValueChange={setSelectedMenuId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* this is condition */}
            {(() => {
              const menuItem = menuItems.find((m) => m._id === selectedMenuId);
              if (!menuItem || menuItem.half === undefined) return null;

              return (
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select
                    value={selectedSize}
                    onValueChange={(v) => setSelectedSize(v as "half" | "full")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuItem.half && <SelectItem value="half">Half</SelectItem>}
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })()}


            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="text" // Use text to allow typing freely on mobile
                value={quantity}
                onChange={(e) => {
                  // Remove non-digit characters
                  const cleaned = e.target.value.replace(/\D/g, '');
                  setQuantity(cleaned);
                }}
                placeholder="e.g., 1"
              />
            </div>


            <div className="space-y-2 flex items-end">
              <Button onClick={handleAddItem} className="w-full">
                <Plus size={16} className="mr-2" /> Add
              </Button>
            </div>
          </div>

          {/* Bill Items Table */}
          {billItems.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {billItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="capitalize">{item.size}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        Rs {item.total.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="bg-muted p-4 flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-lg font-bold">
                  Rs {billItems.reduce((sum, i) => sum + i.total, 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button onClick={handleSaveBill} disabled={billItems.length === 0}>
              {isLoading && <Spinner />} {isEditMode ? "Update Bill" : "Save Bill"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
