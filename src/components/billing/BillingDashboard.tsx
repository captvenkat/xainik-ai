'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { 
  CreditCard, FileText, Receipt, Download, 
  Calendar, DollarSign, TrendingUp, AlertCircle,
  CheckCircle, Clock, Eye, Mail
} from 'lucide-react'

interface BillingData {
  donations: any[]
  invoices: any[]
  receipts: any[]
  totalDonations: number
  totalInvoices: number
  totalReceipts: number
}

export default function BillingDashboard({ userId }: { userId: string }) {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBillingData()
  }, [userId])

  async function loadBillingData() {
    try {
      setLoading(true)
      const supabase = createSupabaseBrowser()

      // Fetch user's billing data
      const [donationsResult, invoicesResult, receiptsResult] = await Promise.all([
        supabase.from('donations').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('receipts').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ])

      if (donationsResult.error) throw donationsResult.error
      if (invoicesResult.error) throw invoicesResult.error
      if (receiptsResult.error) throw receiptsResult.error

      const donations = donationsResult.data || []
      const invoices = invoicesResult.data || []
      const receipts = receiptsResult.data || []

      setBillingData({
        donations,
        invoices,
        receipts,
        totalDonations: donations.reduce((sum, d) => sum + (d.amount || 0), 0),
        totalInvoices: invoices.reduce((sum, i) => sum + (i.amount || 0), 0),
        totalReceipts: receipts.reduce((sum, r) => sum + (r.amount || 0), 0)
      })

    } catch (error) {
      console.error('Error loading billing data:', error)
      setError('Failed to load billing information')
    } finally {
      setLoading(false)
    }
  }

  const downloadDocument = async (type: 'invoice' | 'receipt', id: string) => {
    try {
      const response = await fetch(`/api/docs/${type}/${id}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-${id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error(`Error downloading ${type}:`, error)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!billingData) return null

  return (
    <div className="space-y-6">
      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Donations</h3>
              <p className="text-2xl font-bold text-blue-600">
                ₹{(billingData.totalDonations / 100).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {billingData.donations.length} donation{billingData.donations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-50 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Invoices</h3>
              <p className="text-2xl font-bold text-green-600">
                ₹{(billingData.totalInvoices / 100).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {billingData.invoices.length} invoice{billingData.invoices.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Receipt className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Receipts</h3>
              <p className="text-2xl font-bold text-purple-600">
                ₹{(billingData.totalReceipts / 100).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {billingData.receipts.length} receipt{billingData.receipts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
        </div>
        
        <div className="divide-y divide-gray-100">
          {[...billingData.donations, ...billingData.invoices, ...billingData.receipts]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10)
            .map((transaction, index) => (
              <div key={`${transaction.id}-${index}`} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      'donation' in transaction ? 'bg-blue-50' : 
                      'invoice_number' in transaction ? 'bg-green-50' : 'bg-purple-50'
                    }`}>
                      {('donation' in transaction) ? (
                        <DollarSign className="h-5 w-5 text-blue-600" />
                      ) : ('invoice_number' in transaction) ? (
                        <FileText className="h-5 w-5 text-green-600" />
                      ) : (
                        <Receipt className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {('donation' in transaction) ? 'Donation' : 
                         ('invoice_number' in transaction) ? 'Service Invoice' : 'Receipt'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{(transaction.amount / 100).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {transaction.status || 'completed'}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {('invoice_number' in transaction) && (
                        <button
                          onClick={() => downloadDocument('invoice', transaction.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                      
                      {('receipt_number' in transaction) && (
                        <button
                          onClick={() => downloadDocument('receipt', transaction.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {billingData.donations.length === 0 && billingData.invoices.length === 0 && billingData.receipts.length === 0 && (
          <div className="p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-600">Your payment history will appear here once you make transactions.</p>
          </div>
        )}
      </div>
    </div>
  )
}
