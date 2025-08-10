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
    borderBottom: '2px solid #28a745',
    paddingBottom: 20
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745'
  },
  receiptInfo: {
    alignItems: 'flex-end'
  },
  receiptNumber: {
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
    borderTop: '2px solid #28a745'
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
    color: '#28a745'
  },
  taxInfo: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    marginTop: 20,
    borderRadius: 5,
    borderLeft: '4px solid #28a745'
  },
  taxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#155724',
    marginBottom: 8
  },
  taxText: {
    fontSize: 11,
    color: '#155724',
    lineHeight: 1.4
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
  },
  orgInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5
  },
  orgTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10
  },
  orgText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5
  }
})

interface DonationReceiptPDFProps {
  receiptNumber: string
  date: string
  donorName?: string
  donorEmail?: string
  donorPhone?: string
  amount: number
  isAnonymous: boolean
  has80G: boolean
  orgName: string
  orgAddress: string
  orgPAN: string
  org80GNumber?: string
}

const DonationReceiptPDF: React.FC<DonationReceiptPDFProps> = ({
  receiptNumber,
  date,
  donorName,
  donorEmail,
  donorPhone,
  amount,
  isAnonymous,
  has80G,
  orgName,
  orgAddress,
  orgPAN,
  org80GNumber
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>Xainik</Text>
          <Text style={{ fontSize: 10, color: '#666', marginTop: 5 }}>
            Empowering Veterans Through Technology
          </Text>
        </View>
        <View style={styles.receiptInfo}>
          <Text style={styles.receiptNumber}>DONATION RECEIPT</Text>
          <Text style={styles.receiptNumber}>{receiptNumber}</Text>
          <Text style={styles.date}>Date: {date}</Text>
        </View>
      </View>

      {/* Donor Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Donor Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {isAnonymous ? 'Anonymous Donor' : (donorName || 'Not Provided')}
          </Text>
        </View>
        {!isAnonymous && donorEmail && (
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{donorEmail}</Text>
          </View>
        )}
        {!isAnonymous && donorPhone && (
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{donorPhone}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>
            {isAnonymous ? 'Anonymous Donation' : 'Named Donation'}
          </Text>
        </View>
      </View>

      {/* Donation Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Donation Details</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Description</Text>
            <Text style={styles.tableHeaderCell}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>
              Donation to support veteran employment initiatives
            </Text>
            <Text style={styles.tableCell}>₹{(amount / 100).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Total */}
      <View style={styles.total}>
        <Text style={styles.totalLabel}>Total Donation:</Text>
        <Text style={styles.totalAmount}>₹{(amount / 100).toFixed(2)}</Text>
      </View>

      {/* Tax Information */}
      {has80G && (
        <View style={styles.taxInfo}>
          <Text style={styles.taxTitle}>Tax Benefits</Text>
          <Text style={styles.taxText}>
            This donation is eligible for tax deduction under Section 80G of the Income Tax Act, 1961. 
            Our organization is registered under Section 80G with registration number: {org80GNumber || 'Pending'}
          </Text>
        </View>
      )}

      {/* Organization Information */}
      <View style={styles.orgInfo}>
        <Text style={styles.orgTitle}>Organization Details</Text>
        <Text style={styles.orgText}>Name: {orgName}</Text>
        <Text style={styles.orgText}>Address: {orgAddress}</Text>
        <Text style={styles.orgText}>PAN: {orgPAN}</Text>
        {has80G && org80GNumber && (
          <Text style={styles.orgText}>80G Registration: {org80GNumber}</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>Thank you for your generous support</Text>
        <Text style={{ marginTop: 5 }}>
          This is a computer-generated receipt. Please keep for your tax records.
        </Text>
      </View>
    </Page>
  </Document>
)

export default DonationReceiptPDF
