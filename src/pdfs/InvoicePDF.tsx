'use server'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
})

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '2px solid #667eea',
    paddingBottom: 20
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea'
  },
  invoiceInfo: {
    alignItems: 'flex-end'
  },
  invoiceNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  date: {
    fontSize: 12,
    color: '#666'
  },
  section: {
    marginBottom: 30
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottom: '1px solid #eee',
    paddingBottom: 5
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10
  },
  label: {
    width: '30%',
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold'
  },
  value: {
    width: '70%',
    fontSize: 12,
    color: '#333'
  },
  table: {
    marginTop: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderBottom: '1px solid #ddd'
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1px solid #eee'
  },
  tableCell: {
    flex: 1,
    fontSize: 12
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333'
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    paddingTop: 20,
    borderTop: '2px solid #667eea'
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 20
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
    borderTop: '1px solid #eee',
    paddingTop: 20
  }
})

interface InvoicePDFProps {
  invoiceNumber: string
  date: string
  buyerName: string
  buyerEmail: string
  buyerPhone?: string
  amount: number
  planTier: string
  planMeta?: any
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({
  invoiceNumber,
  date,
  buyerName,
  buyerEmail,
  buyerPhone,
  amount,
  planTier,
  planMeta
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Xainik</Text>
          <Text style={{ fontSize: 10, color: '#666', marginTop: 5 }}>
            Connecting Veterans with Opportunities
          </Text>
        </View>
        <View style={styles.invoiceInfo}>
          <Text style={styles.invoiceNumber}>INVOICE</Text>
          <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
          <Text style={styles.date}>Date: {date}</Text>
        </View>
      </View>

      {/* Bill To */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bill To</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{buyerName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{buyerEmail}</Text>
        </View>
        {buyerPhone && (
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{buyerPhone}</Text>
          </View>
        )}
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Description</Text>
            <Text style={styles.tableHeaderCell}>Plan</Text>
            <Text style={styles.tableHeaderCell}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Veteran Profile Enhancement Service
            </Text>
            <Text style={styles.tableCell}>{planTier}</Text>
            <Text style={styles.tableCell}>₹{(amount / 100).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Total */}
      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalAmount}>₹{(amount / 100).toFixed(2)}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for choosing Xainik</Text>
        <Text style={{ marginTop: 5 }}>
          This is a computer-generated invoice. No signature required.
        </Text>
      </View>
    </Page>
  </Document>
)

export default InvoicePDF
