'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Building2, MapPin, Star, CheckCircle, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { cn, STATUS_COLORS } from '@/lib/utils'

export default function OrganisationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['organisations'],
    queryFn: () => api.get('/vendors').then(r => r.data),
  })

  const orgs = data?.data ?? []
  const total = data?.pagination?.total ?? 0

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} registered service organisations</p>
        </div>
        <Link href="/onboarding?type=ORGANISATION"
          className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors">
          <Plus className="w-4 h-4" /> Register Organisation
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-7 h-7 border-2 border-blue-700 border-t-transparent rounded-full" />
        </div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <p className="font-medium text-gray-700 mb-1">No organisations yet</p>
          <p className="text-sm text-gray-400 mb-6">Share the organisation registration link to invite service companies.</p>
          <Link href="/onboarding"
            className="inline-flex items-center gap-2 bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800">
            <Plus className="w-4 h-4" /> Go to Applications
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {orgs.map((org: any) => (
            <div key={org.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{org.companyName}</p>
                    <p className="text-xs text-gray-400">{org.serviceCategories?.join(', ') ?? 'General Services'}</p>
                  </div>
                </div>
                {org.isPreferred && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">★ Preferred</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                {org.averageRating && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {org.averageRating.toFixed(1)}
                  </span>
                )}
                <span>{org.totalContracts} contracts</span>
                <span className={cn('px-2 py-0.5 rounded-full', STATUS_COLORS[org.verificationStatus] ?? 'bg-gray-100 text-gray-500')}>
                  {org.verificationStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
