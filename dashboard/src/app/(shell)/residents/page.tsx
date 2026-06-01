'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Home, Wrench, Star, CheckCircle, Clock } from 'lucide-react'
import { cn, STATUS_COLORS, timeAgo } from '@/lib/utils'

const SERVICE_TYPES = ['Electrician','Plumber','Cleaner','Security Guard','Generator Tech','Plumber','AC Repair','General Labour']

export default function ResidentsPage() {
  const qc = useQueryClient()
  const [showRequest, setShowRequest] = useState(false)
  const [form, setForm] = useState({ title:'', categoryId:'cat_electrical', description:'', locationAddress:'', workersNeeded:1 })
  const [reviewOpen, setReviewOpen] = useState<string | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const { data } = useQuery({
    queryKey: ['resident-requests'],
    queryFn: () => api.get('/service-requests').then(r => r.data),
  })

  const createRequest = useMutation({
    mutationFn: (data: any) => api.post('/service-requests', data).then(r => r.data),
    onSuccess: async (res) => {
      await api.post(`/service-requests/${res.id}/submit`)
      qc.invalidateQueries({ queryKey: ['resident-requests'] })
      setShowRequest(false)
    },
  })

  const submitReview = useMutation({
    mutationFn: ({ requestId, rating, comment }: any) =>
      api.post('/performance-reviews', { serviceRequestId: requestId, overallRating: rating, comment }),
    onSuccess: () => { setReviewOpen(null); qc.invalidateQueries({ queryKey: ['resident-requests'] }) },
  })

  const requests = data?.data ?? []

  return (
    <div className="max-w-3xl mx-auto p-6 pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Home className="w-6 h-6 text-blue-600" /> Resident Services
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Request verified service workers for your home</p>
        </div>
        <button onClick={() => setShowRequest(true)}
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
          <Wrench className="w-4 h-4" /> Request Service
        </button>
      </div>

      {/* My requests */}
      {requests.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100 text-center">
          <Wrench className="w-12 h-12 text-gray-200 mb-4" />
          <p className="font-semibold text-gray-700 mb-1">No service requests yet</p>
          <p className="text-sm text-gray-400 mb-4">Request a verified electrician, plumber, or any service worker</p>
          <button onClick={() => setShowRequest(true)}
            className="text-sm text-indigo-600 font-semibold hover:underline">Make your first request →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req: any) => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900">{req.title}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{req.description}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{timeAgo(req.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={cn('text-xs font-semibold px-2 py-1 rounded-lg',
                    STATUS_COLORS[req.status] ?? 'bg-gray-100 text-gray-600')}>
                    {req.status}
                  </span>
                  {req.status === 'COMPLETED' && (
                    <button onClick={() => setReviewOpen(req.id)}
                      className="text-xs text-amber-600 font-semibold hover:underline">
                      Rate service →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New request modal */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-5">Request a Service</h3>
            <div className="space-y-3 mb-5">
              <select value={form.categoryId} onChange={e => {
                const skill = SERVICE_TYPES[SERVICE_TYPES.findIndex((_, i) => `cat_${i}` === e.target.value)] ?? SERVICE_TYPES[0]
                setForm({...form, categoryId: e.target.value, title: `${skill} needed`})
              }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {SERVICE_TYPES.map((s, i) => (
                  <option key={s} value={`cat_${i}`}>{s}</option>
                ))}
              </select>
              <input value={form.title} onChange={e => setForm({...form, title:e.target.value})}
                placeholder="What do you need? *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={3}
                placeholder="Describe the issue or work needed..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <input value={form.locationAddress} onChange={e => setForm({...form, locationAddress:e.target.value})}
                placeholder="Your unit/block number"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRequest(false)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
              <button disabled={!form.title || createRequest.isPending}
                onClick={() => createRequest.mutate({ ...form, requiredSkills: [], workersNeeded: 1 })}
                className="flex-1 text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                style={{ background: 'linear-gradient(135deg,#4F46E5,#0D9488)' }}>
                {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-7 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-5">Rate the Service</h3>
            <div className="flex justify-center gap-3 mb-5">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)}
                  className={`text-4xl transition-transform hover:scale-110 ${s <= rating ? 'text-amber-400' : 'text-gray-200'}`}>
                  ★
                </button>
              ))}
            </div>
            <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="How was the service?"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setReviewOpen(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-semibold">Cancel</button>
              <button disabled={submitReview.isPending}
                onClick={() => submitReview.mutate({ requestId: reviewOpen, rating, comment })}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-60">
                {submitReview.isPending ? '...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
