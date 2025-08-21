// =====================================================
// SECTION 80G COMPLIANT RECEIPT GENERATION
// Xainik Platform - Professional Receipt System
// =====================================================

import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export interface ReceiptData {
  receiptNumber: string
  donorName: string
  donorEmail: string
  amount: number
  transactionId: string
  donationDate: string
  financialYear: string
}

export function generateSection80GReceipt(data: ReceiptData): jsPDF {
  const doc = new jsPDF()
  
  // Set document properties
  doc.setProperties({
    title: `Section 80G Receipt - ${data.receiptNumber}`,
    subject: 'Donation Receipt for Tax Exemption',
    author: 'Xainik',
    creator: 'Xainik Receipt System'
  })

  // Header
  doc.setFontSize(24)
  doc.setTextColor(31, 41, 55)
  doc.text('XAINIK', 105, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setTextColor(107, 114, 128)
  doc.text('Section 8 Non-Profit Company', 105, 30, { align: 'center' })
  doc.text('Registration No: U85300MH2024NPL000000', 105, 37, { align: 'center' })
  
  // Receipt Title
  doc.setFontSize(18)
  doc.setTextColor(31, 41, 55)
  doc.text('DONATION RECEIPT', 105, 55, { align: 'center' })
  
  doc.setFontSize(12)
  doc.setTextColor(107, 114, 128)
  doc.text('(Under Section 80G of Income Tax Act, 1961)', 105, 62, { align: 'center' })
  
  // Receipt Details Table
  const receiptDetails = [
    ['Receipt No:', data.receiptNumber],
    ['Date:', data.donationDate],
    ['Financial Year:', data.financialYear],
    ['Transaction ID:', data.transactionId]
  ]
  
  doc.autoTable({
    startY: 75,
    head: [],
    body: receiptDetails,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [107, 114, 128] },
      1: { textColor: [31, 41, 55] }
    }
  })
  
  // Donor Details
  doc.setFontSize(14)
  doc.setTextColor(31, 41, 55)
  doc.text('Donor Details:', 20, 120)
  
  const donorDetails = [
    ['Name:', data.donorName],
    ['Email:', data.donorEmail]
  ]
  
  doc.autoTable({
    startY: 125,
    head: [],
    body: donorDetails,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [107, 114, 128] },
      1: { textColor: [31, 41, 55] }
    }
  })
  
  // Donation Details
  doc.setFontSize(14)
  doc.setTextColor(31, 41, 55)
  doc.text('Donation Details:', 20, 155)
  
  const donationDetails = [
    ['Amount:', `₹${data.amount.toLocaleString('en-IN')}`],
    ['Currency:', 'Indian Rupees (INR)'],
    ['Payment Method:', 'Online Payment (Razorpay)']
  ]
  
  doc.autoTable({
    startY: 160,
    head: [],
    body: donationDetails,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [107, 114, 128] },
      1: { textColor: [31, 41, 55] }
    }
  })
  
  // Section 80G Details
  doc.setFontSize(14)
  doc.setTextColor(31, 41, 55)
  doc.text('Section 80G Tax Exemption:', 20, 190)
  
  const taxDetails = [
    ['Organization:', 'Xainik (Section 8 Non-Profit)'],
    ['80G Registration:', 'Applied for Section 80G approval'],
    ['Tax Benefit:', '50% of donation amount is tax deductible'],
    ['Deduction Limit:', 'Up to 10% of gross total income']
  ]
  
  doc.autoTable({
    startY: 195,
    head: [],
    body: taxDetails,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [107, 114, 128] },
      1: { textColor: [31, 41, 55] }
    }
  })
  
  // Organization Details
  doc.setFontSize(14)
  doc.setTextColor(31, 41, 55)
  doc.text('Organization Details:', 20, 240)
  
  const orgDetails = [
    ['Name:', 'Xainik'],
    ['Legal Status:', 'Section 8 Non-Profit Company'],
    ['Registration No:', 'U85300MH2024NPL000000'],
    ['Registered Office:', 'Mumbai, Maharashtra, India'],
    ['Email:', 'ceo@faujnet.com'],
    ['Website:', 'https://xainik.com']
  ]
  
  doc.autoTable({
    startY: 245,
    head: [],
    body: orgDetails,
    theme: 'plain',
    styles: {
      fontSize: 11,
      cellPadding: 5
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [107, 114, 128] },
      1: { textColor: [31, 41, 55] }
    }
  })
  
  // Mission Statement
  doc.setFontSize(14)
  doc.setTextColor(31, 41, 55)
  doc.text('Our Mission:', 20, 290)
  
  doc.setFontSize(11)
  doc.setTextColor(31, 41, 55)
  const missionText = 'To connect military veterans with meaningful civilian career opportunities through our AI-first, community-supported hiring platform. Your donation helps us provide free resources and support to veterans during their career transition.'
  
  doc.text(missionText, 20, 300, {
    maxWidth: 170,
    lineHeightFactor: 1.5
  })
  
  // Thank You Message
  doc.setFontSize(16)
  doc.setTextColor(146, 64, 14)
  doc.text('Thank You for Your Generosity!', 105, 330, { align: 'center' })
  
  doc.setFontSize(11)
  doc.setTextColor(146, 64, 14)
  const thankYouText = `Your contribution of ₹${data.amount.toLocaleString('en-IN')} will directly support our mission to help veterans find meaningful careers. Every rupee makes a difference in a veteran's life.`
  
  doc.text(thankYouText, 105, 340, {
    maxWidth: 170,
    lineHeightFactor: 1.5,
    align: 'center'
  })
  
  // Footer
  doc.setFontSize(10)
  doc.setTextColor(107, 114, 128)
  doc.text('For any queries regarding this receipt, please contact:', 105, 370, { align: 'center' })
  doc.text('Email: ceo@faujnet.com | Phone: +91-XXXXXXXXXX', 105, 377, { align: 'center' })
  doc.text('This is a computer-generated receipt and does not require a physical signature.', 105, 384, { align: 'center' })
  
  doc.setFontSize(9)
  doc.text('© 2024 Xainik. All rights reserved. | Section 8 Non-Profit Company', 105, 395, { align: 'center' })
  
  return doc
}

export function downloadReceipt(data: ReceiptData, filename?: string): void {
  const doc = generateSection80GReceipt(data)
  const receiptFilename = filename || `Section80G_Receipt_${data.receiptNumber}.pdf`
  doc.save(receiptFilename)
}

export function getReceiptAsBlob(data: ReceiptData): Blob {
  const doc = generateSection80GReceipt(data)
  return doc.output('blob')
}
