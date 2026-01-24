'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('Desi Eatry')
  const [businessPhone, setBusinessPhone] = useState('+92 300 1234567')
  const [businessEmail, setBusinessEmail] = useState('admin@desieatry.com')
  const [businessAddress, setBusinessAddress] = useState('Lahore, Pakistan')
  const [isSaving, setIsSaving] = useState(false)

  const [invoiceTemplate, setInvoiceTemplate] = useState(
    `Invoice for {{from}} - {{to}}
Amount: Rs {{amount}}
Customer: {{customer}}

Terms & Conditions: Payment due within 7 days`
  )

  const [whatsappTemplate, setWhatsappTemplate] = useState(
    `Dear {{customer}},
Your invoice for {{from}} - {{to}} is Rs {{amount}}.
Please confirm receipt.
Thank you for your business!`
  )

  const handleSaveBusinessInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success('Business information updated')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveTemplate = async (template: string, name: string) => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast.success(`${name} template updated`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="business" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Template</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp Template</TabsTrigger>
          <TabsTrigger value="ui">UI Preferences</TabsTrigger>
        </TabsList>

        {/* Business Info */}
        <TabsContent value="business" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveBusinessInfo} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Phone Number</Label>
                  <Input
                    id="businessPhone"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email Address</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Address</Label>
                  <Textarea
                    id="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    disabled={isSaving}
                    rows={4}
                  />
                </div>

                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoice Template */}
        <TabsContent value="invoice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Template</CardTitle>
              <CardDescription>
                Customize the invoice template. Use variables like{' '}
                {'{{customer}}'}, {'{{amount}}'}, {'{{from}}'}, {'{{to}}'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="invoiceTemplate">Template</Label>
                <Textarea
                  id="invoiceTemplate"
                  value={invoiceTemplate}
                  onChange={(e) => setInvoiceTemplate(e.target.value)}
                  disabled={isSaving}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Available Variables
                </Label>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {'{{customer}}'} – Customer name</li>
                  <li>• {'{{amount}}'} – Invoice amount</li>
                  <li>• {'{{from}}'} – Period from date</li>
                  <li>• {'{{to}}'} – Period to date</li>
                </ul>
              </div>

              <Button
                onClick={() =>
                  handleSaveTemplate(invoiceTemplate, 'Invoice')
                }
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Template */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Message Template</CardTitle>
              <CardDescription>
                Customize the WhatsApp message template. Use variables like{' '}
                {'{{customer}}'}, {'{{amount}}'}, {'{{from}}'}, {'{{to}}'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="whatsappTemplate">Template</Label>
                <Textarea
                  id="whatsappTemplate"
                  value={whatsappTemplate}
                  onChange={(e) =>
                    setWhatsappTemplate(e.target.value)
                  }
                  disabled={isSaving}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  Available Variables
                </Label>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {'{{customer}}'} – Customer name</li>
                  <li>• {'{{amount}}'} – Invoice amount</li>
                  <li>• {'{{from}}'} – Period from date</li>
                  <li>• {'{{to}}'} – Period to date</li>
                </ul>
              </div>

              <Button
                onClick={() =>
                  handleSaveTemplate(whatsappTemplate, 'WhatsApp')
                }
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Template'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* UI Preferences */}
        <TabsContent value="ui" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>UI Preferences</CardTitle>
              <CardDescription>
                Customize your interface preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground italic">
                Most UI preferences are managed through the sidebar and
                navbar controls
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
