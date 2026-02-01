import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

interface GenerateBillPDFProps {
    bills: any[]
    customerName: string
    customerPhone: string
    startDate: Date
    endDate: Date
}

// Helper to convert image URL to base64
const toBase64 = async (url: string): Promise<string> => {
    try {
        const res = await fetch(url)
        const blob = await res.blob()
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch (error) {
        console.warn(`Failed to load image: ${url}`, error)
        throw error
    }
}

// Helper to get date string
const getDateString = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

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
    let yPosition = 20

    // ======================
    // HEADER SECTION
    // ======================

    // Logo (centered)
    try {
        const logoBase64 = await toBase64('/logo.png')
        const logoSize = 35
        const logoX = (pageWidth - logoSize) / 2
        doc.addImage(logoBase64, 'PNG', logoX, yPosition, logoSize, logoSize)
        yPosition += logoSize + 8
    } catch (e) {
        console.warn('Logo not found, skipping')
        yPosition += 5
    }

    // Brand Name (centered)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(31, 41, 55) // Dark gray
    doc.text('Desi Eatry', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 8

    // Tagline
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128) // Medium gray
    doc.text('"Delicious food delivered to your doorstep!"', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // ======================
    // CONTACT SECTION (with icons)
    // ======================

    const iconSize = 5
    const contactStartY = yPosition
    
    // WhatsApp
    try {
        const whatsappBase64 = await toBase64('/icons/whatsapp.png')
        const whatsappX = pageWidth / 2 - 30
        doc.addImage(whatsappBase64, 'PNG', whatsappX, yPosition - 3, iconSize, iconSize)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.text('0345-3562228', whatsappX + iconSize + 2, yPosition)
    } catch (e) {
        console.warn('WhatsApp icon not found')
    }

    // Instagram
    try {
        const instagramBase64 = await toBase64('/icons/instagram.png')
        const instagramX = pageWidth / 2 + 10
        doc.addImage(instagramBase64, 'PNG', instagramX, yPosition - 3, iconSize, iconSize)
        
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(0, 0, 0)
        doc.text('@eatry.desi', instagramX + iconSize + 2, yPosition)
    } catch (e) {
        console.warn('Instagram icon not found')
    }

    yPosition += 10

    // Horizontal line separator
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 8

    // ======================
    // CUSTOMER & DATE INFO
    // ======================

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(31, 41, 55)
    doc.text('Bill Statement', margin, yPosition)
    yPosition += 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(75, 85, 99)
    doc.text(`Customer: ${customerName}`, margin, yPosition)
    yPosition += 5
    doc.text(`Phone: ${customerPhone}`, margin, yPosition)
    yPosition += 5
    doc.text(`Duration: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, margin, yPosition)
    yPosition += 10

    // ======================
    // BILLS TABLE
    // ======================

    const tableData = bills.map((bill) => [
        new Date(bill.date).toLocaleDateString(),
        bill.items && bill.items.length > 0
            ? bill.items
                  .map(
                      (item: any) =>
                          `${item.name} (${item.size}, ${item.quantity} ${item.unit}) - Rs ${item.total.toLocaleString()}`
                  )
                  .join('\n')
            : 'No items',
        `Rs ${(bill.total || 0).toLocaleString()}`,
    ])

    autoTable(doc, {
        head: [['Date', 'Items', 'Amount']],
        body: tableData,
        startY: yPosition,
        margin: { left: margin, right: margin },
        headStyles: {
            fillColor: [59, 130, 246], // Blue
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'left',
        },
        bodyStyles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [31, 41, 55],
        },
        columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 35, halign: 'right' },
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // Light gray
        },
        styles: {
            cellWidth: 'wrap',
            lineColor: [229, 231, 235],
            lineWidth: 0.1,
        },
    })

    // ======================
    // TOTAL AMOUNT
    // ======================

    const totalAmount = bills.reduce((sum, bill) => sum + (bill.total || 0), 0)
    const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 50

    // Total box
    doc.setFillColor(239, 246, 255) // Light blue background
    doc.rect(pageWidth - margin - 60, finalY + 5, 60, 12, 'F')
    
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Grand Total:', pageWidth - margin - 58, finalY + 12)
    doc.setTextColor(59, 130, 246) // Blue
    doc.text(`Rs ${totalAmount.toLocaleString()}`, pageWidth - margin - 2, finalY + 12, { align: 'right' })

    // ======================
    // TERMS & CONDITIONS
    // ======================

    let termsY = finalY + 25

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(31, 41, 55)
    doc.text('Terms & Conditions:', margin, termsY)
    termsY += 6

    const terms = [
        '• Orders will be delivered within 45 minutes of confirmation.',
        '• Please check your order upon receipt.',
        '• Contact us on WhatsApp for any order changes or cancellations.',
        // '• We are not responsible for delays due to traffic or weather conditions.',
        // '• All prices are in PKR and include applicable taxes.',
    ]

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(75, 85, 99)

    terms.forEach((line) => {
        doc.text(line, margin, termsY)
        termsY += 4
    })

    // ======================
    // FOOTER
    // ======================

    const footerY = pageHeight - 20

    // Decorative line
    doc.setDrawColor(59, 130, 246)
    doc.setLineWidth(1)
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

    // Thank you message
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(31, 41, 55)
    doc.text('Thank you for choosing Desi Eatry!', pageWidth / 2, footerY, { align: 'center' })

    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    // doc.text('We appreciate your business and look forward to serving you again.', pageWidth / 2, footerY + 5, {
    //     align: 'center',
    // })

    // ======================
    // SAVE PDF
    // ======================

    const safeName = (customerName || 'Customer').replace(/\s+/g, '_')
    const fileName = `${safeName}_Bills_${getDateString(startDate)}_to_${getDateString(endDate)}.pdf`
    doc.save(fileName)
}