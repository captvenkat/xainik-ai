import { Suspense } from 'react'
import { createSupabaseServerOnly } from '@/lib/supabaseServerOnly'
import Filters from '@/components/Filters'
import PitchCard from '@/components/PitchCard'
import { buildSearchQuery, searchPitches } from '@/lib/search'
import { toPitchCardData } from '@/lib/mappers/pitches'
import { Shield, Search, Loader2 } from 'lucide-react'
import { Metadata } from 'next'

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string
    skills?: string
    city?: string
    availability?: string
    jobType?: string
    branch?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: BrowsePageProps): Promise<Metadata> {
  const params = await searchParams
  const hasFilters = params && typeof params === 'object' && Object.keys(params || {}).some(key => 
    key !== 'page' && params[key as keyof typeof params]
  )
  
  const title = hasFilters 
    ? `Browse Veterans - ${params.q || params.skills || params.city || 'Filtered Results'} | Xainik`
    : 'Browse Veterans | Xainik'
  
  const description = hasFilters
    ? `Find military veterans with ${params.skills || 'various skills'} in ${params.city || 'multiple locations'}. Browse verified veteran pitches and connect directly.`
    : 'Discover talented military veterans ready for civilian opportunities. Browse verified veteran pitches with direct contact details.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: '/browse',
    },
    alternates: {
      canonical: '/browse',
    },
  }
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams
  const supabase = createSupabaseServerOnly()
  const page = parseInt(params.page || '1')
  const pageSize = 12
  const offset = (page - 1) * pageSize

  // Build query from search params
  const searchQuery = buildSearchQuery({
    skills: params.skills ? [params.skills] : undefined,
    experience_years: params.branch ? parseInt(params.branch) : undefined,
    location: params.city,
    job_type: params.jobType
  })

  // Fetch pitches and total count
  const pitchesResult = await searchPitches(params.q || '', {
    skills: params.skills ? [params.skills] : undefined,
    experience_years: params.branch ? parseInt(params.branch) : undefined,
    location: params.city,
    job_type: params.jobType
  }, pageSize)
  const totalResult = { count: pitchesResult.length }

  const pitches = (pitchesResult || []).map((pitch: any) => toPitchCardData(pitch))
  const totalCount = totalResult.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Browse Veterans</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover talented military veterans ready for civilian opportunities. 
            Filter by skills, location, and availability to find the perfect match.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <Filters searchParams={params} />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            <span className="text-gray-700">
              {totalCount} veteran{totalCount !== 1 ? 's' : ''} found
            </span>
          </div>
          {params.q && (
            <div className="text-sm text-gray-500">
              Search: "{params.q}"
            </div>
          )}
        </div>

        {/* Results Grid */}
        <Suspense fallback={<PitchesLoadingSkeleton />}>
          {pitches.length === 0 ? (
            <EmptyState searchParams={params} />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {pitches.map((pitch: any) => (
                  <PitchCard key={pitch.id} data={pitch} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  searchParams={params} 
                />
              )}
            </>
          )}
        </Suspense>
      </div>
    </div>
  )
}

function PitchesLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded mb-3"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5 mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-14"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ searchParams }: { searchParams: any }) {
  const hasFilters = searchParams && typeof searchParams === 'object' && Object.keys(searchParams || {}).some(key => 
    key !== 'page' && searchParams[key]
  )

  return (
    <div className="text-center py-12">
      <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasFilters ? 'No veterans found' : 'No veterans available'}
      </h3>
      <p className="text-gray-600 mb-6">
        {hasFilters 
          ? 'Try adjusting your filters or search terms to find more veterans.'
          : 'Check back soon for new veteran pitches.'
        }
      </p>
      {hasFilters && (
        <a
          href="/browse"
          className="inline-flex items-center px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Clear Filters
        </a>
      )}
    </div>
  )
}

function Pagination({ 
  currentPage, 
  totalPages, 
  searchParams 
}: { 
  currentPage: number
  totalPages: number
  searchParams: any 
}) {
  const createPageUrl = (page: number) => {
    const urlParams = new URLSearchParams(searchParams)
    urlParams.set('page', page.toString())
    return `/browse?${urlParams.toString()}`
  }

  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <a
          href={createPageUrl(currentPage - 1)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </a>
      )}

      {start > 1 && (
        <>
          <a
            href={createPageUrl(1)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            1
          </a>
          {start > 2 && (
            <span className="px-3 py-2 text-gray-500">...</span>
          )}
        </>
      )}

      {pages.map(page => (
        <a
          key={page}
          href={createPageUrl(page)}
          className={`px-3 py-2 border rounded-lg transition-colors ${
            page === currentPage
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {page}
        </a>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-3 py-2 text-gray-500">...</span>
          )}
          <a
            href={createPageUrl(totalPages)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {totalPages}
          </a>
        </>
      )}

      {currentPage < totalPages && (
        <a
          href={createPageUrl(currentPage + 1)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Next
        </a>
      )}
    </div>
  )
}
