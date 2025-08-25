'use client'

import { useState } from 'react'
import { Phone, Mail, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { micro } from '@/lib/microcopy/progress'
import type { ContactRow } from '@/lib/actions/progress'

interface ContactOutcomesProps {
  data: ContactRow[] | null
}

export default function ContactOutcomes({ data }: ContactOutcomesProps) {
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactRow | null>(null)

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Outcomes</h3>
        <div className="text-center py-8 text-gray-500">
          <Phone className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No recruiter contacts yet</p>
          <p className="text-sm">{micro.contacts.empty}</p>
        </div>
      </div>
    )
  }

  // Calculate contact type breakdown
  const contactTypes = {
    call: data.filter(c => c.type === 'call').length,
    email: data.filter(c => c.type === 'email').length,
    resume: data.filter(c => c.type === 'resume').length
  }

  const totalContacts = data.length
  const callPct = totalContacts > 0 ? (contactTypes.call / totalContacts) * 100 : 0
  const emailPct = totalContacts > 0 ? (contactTypes.email / totalContacts) * 100 : 0
  const resumePct = totalContacts > 0 ? (contactTypes.resume / totalContacts) * 100 : 0

  // Calculate status breakdown
  const statusCounts = {
    open: data.filter(c => c.status === 'open').length,
    responded: data.filter(c => c.status === 'responded').length,
    closed: data.filter(c => c.status === 'closed').length
  }

  const handleAction = (action: string, contact: ContactRow) => {
    setSelectedContact(contact)
    switch (action) {
      case 'followup':
        setShowFollowUpModal(true)
        break
      case 'resume':
        setShowResumeModal(true)
        break
      case 'status':
        setShowStatusModal(true)
        break
      case 'note':
        setShowNoteModal(true)
        break
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone
      case 'email': return Mail
      case 'resume': return FileText
      default: return Phone
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return AlertCircle
      case 'responded': return CheckCircle
      case 'closed': return XCircle
      default: return AlertCircle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-yellow-600 bg-yellow-100'
      case 'responded': return 'text-green-600 bg-green-100'
      case 'closed': return 'text-gray-600 bg-gray-100'
      default: return 'text-yellow-600 bg-yellow-100'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Outcomes</h3>
      <p className="text-sm text-gray-600 mb-6">Track recruiter responses and follow-up actions.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Contact Type Chips */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contact Types</h4>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <Phone className="w-4 h-4" />
              <span>{contactTypes.call} calls ({callPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <Mail className="w-4 h-4" />
              <span>{contactTypes.email} emails ({emailPct.toFixed(0)}%)</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
              <FileText className="w-4 h-4" />
              <span>{contactTypes.resume} resumes ({resumePct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>

        {/* Status Board */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contact Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">Open</span>
              </div>
              <span className="text-sm font-bold text-yellow-800">{statusCounts.open}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Responded</span>
              </div>
              <span className="text-sm font-bold text-green-800">{statusCounts.responded}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Closed</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{statusCounts.closed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attribution Table */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Recent Contacts</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-700">Type</th>
                <th className="text-left py-2 font-medium text-gray-700">Channel</th>
                <th className="text-left py-2 font-medium text-gray-700">Supporter</th>
                <th className="text-left py-2 font-medium text-gray-700">Time</th>
                <th className="text-left py-2 font-medium text-gray-700">Status</th>
                <th className="text-left py-2 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((contact) => {
                const TypeIcon = getTypeIcon(contact.type)
                const StatusIcon = getStatusIcon(contact.status)
                const statusColor = getStatusColor(contact.status)

                return (
                  <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <TypeIcon className="w-4 h-4 text-gray-500" />
                        <span className="capitalize">{contact.type}</span>
                      </div>
                    </td>
                    <td className="py-2 text-gray-600">{contact.channel}</td>
                    <td className="py-2 text-gray-600">
                      {contact.supporterName || 'Direct'}
                    </td>
                    <td className="py-2 text-gray-600">
                      {new Date(contact.ts).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusColor}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span className="capitalize">{contact.status}</span>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAction('followup', contact)}
                          className="text-blue-600 hover:text-blue-700 text-xs"
                          title="Follow up"
                        >
                          Follow-Up
                        </button>
                        <button
                          onClick={() => handleAction('resume', contact)}
                          className="text-green-600 hover:text-green-700 text-xs"
                          title="Send resume"
                        >
                          Resume
                        </button>
                        <button
                          onClick={() => handleAction('status', contact)}
                          className="text-purple-600 hover:text-purple-700 text-xs"
                          title="Update status"
                        >
                          Status
                        </button>
                        <button
                          onClick={() => handleAction('note', contact)}
                          className="text-gray-600 hover:text-gray-700 text-xs"
                          title="Add note"
                        >
                          Note
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showFollowUpModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Follow Up</h3>
            <p className="text-gray-600 mb-4">
              Send a follow-up message for this {selectedContact.type} contact.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFollowUpModal(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Follow-Up
              </button>
            </div>
          </div>
        </div>
      )}

      {showResumeModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Send Resume</h3>
            <p className="text-gray-600 mb-4">
              Upload and send your resume for this contact.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResumeModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowResumeModal(false)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {showStatusModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Status</h3>
            <p className="text-gray-600 mb-4">
              Update the status of this contact.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <p className="text-gray-600 mb-4">
              Add a note to this contact.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
