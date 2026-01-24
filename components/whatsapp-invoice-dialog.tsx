'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'

interface WhatsAppInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string
  customerPhone: string
  amount?: number
}

export function WhatsAppInvoiceDialog({
  open,
  onOpenChange,
  customerName,
  customerPhone,
  amount = 5000,
}: WhatsAppInvoiceDialogProps) {
  const [phone, setPhone] = useState(customerPhone)
  const [message, setMessage] = useState(
    `Dear ${customerName},
Your invoice for Jan 2024 is Rs ${amount.toLocaleString()}.

Please confirm receipt.

Best regards,
Desi Eatry`
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!phone) {
      toast.error('Please enter a phone number')
      return
    }

    setIsLoading(true)
    try {
      // Simulate sending
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('Invoice sent via WhatsApp')
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Invoice via WhatsApp</DialogTitle>
          <DialogDescription>
            Send the invoice to {customerName} via WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input
              id="phone"
              placeholder="+92 300 1234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message Preview</Label>
            <Textarea
              id="message"
              placeholder="Message content..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isLoading}>
              <MessageCircle size={16} className="mr-2" />
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
