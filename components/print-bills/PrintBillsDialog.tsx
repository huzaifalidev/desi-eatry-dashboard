'use client'

import { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { CalendarIcon, FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { BillPreviewTable } from './BillPreviewTable'
import { generateBillPDF } from './PDFGenerator'

interface PrintBillsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bills: any[]
    customerName: string
    customerPhone: string
}

export function PrintBillsDialog({
    open,
    onOpenChange,
    bills,
    customerName,
    customerPhone,
}: PrintBillsDialogProps) {
    const [startDate, setStartDate] = useState<Date | undefined>(undefined)
    const [endDate, setEndDate] = useState<Date | undefined>(undefined)
    const [isGenerating, setIsGenerating] = useState(false)
    const [filteredBills, setFilteredBills] = useState<any[]>([])
    const [showPreview, setShowPreview] = useState(false)

    // Helper to get date string in YYYY-MM-DD format (local timezone)
    const getDateString = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Get all available bill dates
    const availableBillDates = useMemo(() => {
        const dates = new Set<string>()
        bills.forEach((bill) => {
            const billDate = new Date(bill.date)
            const dateString = getDateString(billDate)
            dates.add(dateString)
        })
        return dates
    }, [bills])

    // Check if a date has bills
    const isDateAvailable = (date: Date) => {
        const dateString = getDateString(date)
        return availableBillDates.has(dateString)
    }

    const handleGeneratePreview = () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates')
            return
        }

        if (startDate > endDate) {
            toast.error('Start date must be before end date')
            return
        }

        const filtered = bills.filter((bill) => {
            const billDate = new Date(bill.date)
            const billDateString = getDateString(billDate)
            const startDateString = getDateString(startDate)
            const endDateString = getDateString(endDate)

            return billDateString >= startDateString && billDateString <= endDateString
        })

        if (filtered.length === 0) {
            toast.error('No bills found for the selected date range')
            return
        }

        setFilteredBills(filtered)
        setShowPreview(true)
    }

    const handleGeneratePDF = async () => {
        if (filteredBills.length === 0) {
            toast.error('No bills to generate')
            return
        }

        try {
            setIsGenerating(true)
            await generateBillPDF({
                bills: filteredBills,
                customerName,
                customerPhone,
                startDate: startDate!,
                endDate: endDate!,
            })
        } catch (error) {
            console.error('PDF generation error:', error)
            toast.error('Failed to generate PDF.')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleReset = () => {
        setStartDate(undefined)
        setEndDate(undefined)
        setFilteredBills([])
        setShowPreview(false)
    }

    const setQuickRange = (type: 'thisMonth' | 'lastMonth' | 'lastYear' | 'all') => {
        const today = new Date()

        switch (type) {
            case 'thisMonth':
                setStartDate(new Date(today.getFullYear(), today.getMonth(), 1))
                setEndDate(today)
                break

            case 'lastMonth':
                setStartDate(new Date(today.getFullYear(), today.getMonth() - 1, 1))
                setEndDate(new Date(today.getFullYear(), today.getMonth(), 0))
                break

            case 'lastYear':
                setStartDate(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()))
                setEndDate(today)
                break

            case 'all':
                if (bills.length > 0) {
                    const sortedBills = [...bills].sort(
                        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                    )

                    setStartDate(new Date(sortedBills[0].date))
                    setEndDate(new Date(sortedBills[sortedBills.length - 1].date))
                }
                break
        }
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Print Bills</DialogTitle>
                    <DialogDescription>
                        Select a date range to filter and print bills for {customerName}
                    </DialogDescription>
                </DialogHeader>

                {!showPreview ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate
                                                ? startDate.toLocaleDateString()
                                                : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            disabled={(date) => !isDateAvailable(date)}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? endDate.toLocaleDateString() : 'Pick a date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            disabled={(date) => !isDateAvailable(date)}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">
                                Or select a quick range
                            </Label>
                            <div className="grid grid-cols-4 gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQuickRange('thisMonth')}
                                >
                                    This Month
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQuickRange('lastMonth')}
                                >
                                    Last Month
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQuickRange('lastYear')}
                                >
                                    Last Year
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setQuickRange('all')}
                                >
                                    All Bills
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <BillPreviewTable bills={filteredBills} />
                )}

                <DialogFooter className="gap-2">
                    {showPreview ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowPreview(false)}
                                disabled={isGenerating}
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleGeneratePDF}
                                disabled={isGenerating}
                                className="gap-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileDown size={16} />
                                        Download PDF
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    handleReset()
                                    onOpenChange(false)
                                }}
                                disabled={isGenerating}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleGeneratePreview}
                                disabled={isGenerating}
                            >
                                View Bills
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}