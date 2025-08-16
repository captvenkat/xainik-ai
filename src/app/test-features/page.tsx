'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabaseBrowser'
import { Lightbulb, Users, Share2, CheckCircle, XCircle } from 'lucide-react'

export default function TestFeaturesPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    runAllTests()
  }, [])

  async function runAllTests() {
    const results: any = {}
    
    // Test 1: Community Suggestions Table
    try {
      const { data, error } = await supabase
        .from('community_suggestions')
        .select('id')
        .limit(1)
      
      results.communitySuggestions = {
        success: !error,
        error: error?.message,
        data: data
      }
    } catch (error: any) {
      results.communitySuggestions = {
        success: false,
        error: error.message
      }
    }

    // Test 2: Mission Invitations Table
    try {
      const { data, error } = await supabase
        .from('mission_invitations')
        .select('id')
        .limit(1)
      
      results.missionInvitations = {
        success: !error,
        error: error?.message,
        data: data
      }
    } catch (error: any) {
      results.missionInvitations = {
        success: false,
        error: error.message
      }
    }

    // Test 3: Community Suggestions Summary View
    try {
      const { data, error } = await supabase
        .from('community_suggestions_summary')
        .select('*')
        .limit(1)
      
      results.communitySummary = {
        success: !error,
        error: error?.message,
        data: data
      }
    } catch (error: any) {
      results.communitySummary = {
        success: false,
        error: error.message
      }
    }

    // Test 4: Mission Invitation Analytics View
    try {
      const { data, error } = await supabase
        .from('mission_invitation_analytics')
        .select('*')
        .limit(1)
      
      results.missionAnalytics = {
        success: !error,
        error: error?.message,
        data: data
      }
    } catch (error: any) {
      results.missionAnalytics = {
        success: false,
        error: error.message
      }
    }

    setTestResults(results)
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Running Feature Tests...</h2>
          <p className="text-gray-600">Verifying all new features are working</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🚀 Feature Test Results</h1>
          <p className="text-gray-600">Testing Mission Invitations & Community Suggestions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Community Suggestions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Community Suggestions</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Table Access:</span>
                {testResults.communitySuggestions?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Summary View:</span>
                {testResults.communitySummary?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {testResults.communitySuggestions?.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Error: {testResults.communitySuggestions.error}
                </div>
              )}
            </div>
          </div>

          {/* Mission Invitations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Share2 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Mission Invitations</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Table Access:</span>
                {testResults.missionInvitations?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Analytics View:</span>
                {testResults.missionAnalytics?.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>

              {testResults.missionInvitations?.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Error: {testResults.missionInvitations.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(testResults).filter((r: any) => r?.success).length}
              </div>
              <div className="text-sm text-gray-600">Features Working</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {Object.values(testResults).filter((r: any) => !r?.success).length}
              </div>
              <div className="text-sm text-gray-600">Features Failed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(testResults).length}
              </div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((Object.values(testResults).filter((r: any) => r?.success).length / Object.keys(testResults).length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <a 
              href="/dashboard/supporter" 
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Users className="w-5 h-5" />
              Go to Supporter Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
