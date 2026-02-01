export { PrintBillsDialog } from './PrintBillsDialog'
export { BillPreviewTable } from './BillPreviewTable'
export { generateBillPDF } from './PDFGenerator'

// Type definitions
export interface PrintBillsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    bills: any[]
    customerName: string
    customerPhone: string
}

export interface BillPreviewTableProps {
    bills: any[]
}

export interface GenerateBillPDFProps {
    bills: any[]
    customerName: string
    customerPhone: string
    startDate: Date
    endDate: Date
}
