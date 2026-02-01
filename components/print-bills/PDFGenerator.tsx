import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface GenerateBillPDFProps {
    bills: any[]
    customerName: string
    customerPhone: string
    startDate: Date
    endDate: Date
}

// ======================
// IMAGE TO BASE64
// ======================
const toBase64 = async (url: string): Promise<string> => {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(blob)
    })
}

// ======================
// DATE FORMAT
// ======================
const getDateString = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

// ======================
// COLORS
// ======================
const colors = {
    primary: [220, 38, 38],
    secondary: [249, 115, 22],
    dark: [31, 41, 55],
    medium: [75, 85, 99],
    light: [243, 244, 246],
    lightRed: [253, 242, 242],
}

// ======================
// FOOTER
// ======================
function addFooter(doc: jsPDF, pageWidth: number, pageHeight: number, margin: number) {
    const y = pageHeight - 15

    doc.setDrawColor(...colors.primary)
    doc.setLineWidth(0.8)
    doc.line(margin, y - 5, pageWidth - margin, y - 5)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...colors.dark)
    doc.text('Thank you for choosing Desi Eatry!', pageWidth / 2, y, { align: 'center' })

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...colors.medium)
    doc.text('We appreciate your business', pageWidth / 2, y + 4, { align: 'center' })
}

// ======================
// WATERMARK
// ======================
function addWatermark(
    doc: jsPDF,
    imageBase64: string,
    pageWidth: number,
    pageHeight: number
) {
    const GState = (doc as any).GState
    if (!GState) return

    const gState = new GState({ opacity: 0.08 })
    doc.setGState(gState)

    const size = 90
    const x = (pageWidth - size) / 2
    const y = (pageHeight - size) / 2

    doc.addImage(imageBase64, 'PNG', x, y, size, size)

    doc.setGState(new GState({ opacity: 1 }))
}

// ======================
// MAIN FUNCTION
// ======================
export async function generateBillPDF({
    bills,
    customerName,
    customerPhone,
    startDate,
    endDate,
}: GenerateBillPDFProps) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let yPosition = 15

    const logoBase64 = await toBase64('/logo.png')
    // ======================
    // HEADER (FIXED)
    // ======================
    const HEADER_HEIGHT = 65

    // Red header background
    doc.setFillColor(...colors.primary)
    doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F')

    // Orange strip
    doc.setFillColor(...colors.secondary)
    doc.rect(0, HEADER_HEIGHT - 5, pageWidth, 5, 'F')

    // Logo (top-left, centered vertically)
    const logoSize = 40
    const logoY = (HEADER_HEIGHT - logoSize) / 2
    doc.addImage(logoBase64, 'PNG', margin, logoY, logoSize, logoSize)

    // Brand name
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(24)
    doc.setTextColor(255, 255, 255)
    doc.text('Desi Eatry', pageWidth / 2, 30, { align: 'center' })

    // Subtitle (clean, NOT on orange strip)
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.text(
        '"Delicious food delivered to your doorstep!"',
        pageWidth / 2,
        38,
        { align: 'center' }
    )

    // Start content immediately after header
    yPosition = HEADER_HEIGHT + 5

    // ======================
    // CUSTOMER INFO
    // ======================
    doc.setFillColor(...colors.light)
    doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 22, 2, 2, 'F')

    yPosition += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...colors.primary)
    doc.text('Bill Statement', margin + 3, yPosition)

    yPosition += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(...colors.dark)
    doc.text(`Customer: ${customerName}`, margin + 3, yPosition)

    yPosition += 5
    doc.text(`Phone: ${customerPhone}`, margin + 3, yPosition)

    yPosition += 5
    doc.text(
        `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        margin + 3,
        yPosition
    )

    yPosition += 10

    // ======================
    // WATERMARK BEFORE TABLE
    // ======================
    addWatermark(doc, logoBase64, pageWidth, pageHeight)

    // ======================
    // TABLE
    // ======================
    autoTable(doc, {
        head: [['Date', 'Items', 'Amount']],
        body: bills.map((bill) => [
            new Date(bill.date).toLocaleDateString(),
            bill.items?.length
                ? bill.items
                    .map(
                        (i: any) =>
                            `${i.name} (${i.size}, ${i.quantity} ${i.unit}) - Rs ${i.total}`
                    )
                    .join('\n')
                : 'No items',
            `Rs ${(bill.total || 0).toLocaleString()}`,
        ]),
        startY: yPosition,
        margin: { left: margin, right: margin, bottom: 60 },
        theme: 'grid',
        headStyles: {
            fillColor: colors.primary,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
        },
        bodyStyles: {
            fontSize: 8.5,
            textColor: colors.dark,
        },
        alternateRowStyles: {
            fillColor: colors.lightRed,
        },
        didDrawPage: () => {
            addWatermark(doc, logoBase64, pageWidth, pageHeight)
            addFooter(doc, pageWidth, pageHeight, margin)
        },
    })

    // ======================
    // TOTAL
    // ======================
    const total = bills.reduce((s, b) => s + (b.total || 0), 0)
    const finalY = (doc as any).lastAutoTable.finalY + 10

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(...colors.primary)
    doc.text(`Grand Total: Rs ${total.toLocaleString()}`, pageWidth - margin, finalY, {
        align: 'right',
    })

    // ======================
    // SAVE
    // ======================
    const safeName = (customerName || 'Customer').replace(/\s+/g, '_')
    doc.save(`${safeName}_Bills_${getDateString(startDate)}_to_${getDateString(endDate)}.pdf`)
}
