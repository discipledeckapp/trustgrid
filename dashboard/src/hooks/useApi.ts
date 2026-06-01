'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardData, TrustDistribution, Worker, WorkerProfile, ServiceRequest } from '@/types'

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/analytics/dashboard').then((r) => r.data),
    staleTime: 2 * 60 * 1000,
  })
}

export function useTrustDistribution() {
  return useQuery<TrustDistribution>({
    queryKey: ['trust-distribution'],
    queryFn: () => api.get('/analytics/trust-distribution').then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Workers ──────────────────────────────────────────────────────────────────
export function useWorkers(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['workers', filters],
    queryFn: () => api.get('/workers', { params: filters }).then((r) => r.data),
  })
}

export function useWorker(id: string) {
  return useQuery<WorkerProfile>({
    queryKey: ['worker', id],
    queryFn: () => api.get(`/workers/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useWorkerTrustScore(id: string) {
  return useQuery({
    queryKey: ['worker-trust', id],
    queryFn: () => api.get(`/workers/${id}/trust-score`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateWorker() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/workers', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workers'] }),
  })
}

export function useEndorseWorker(workerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) =>
      api.post(`/workers/${workerId}/endorsements`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['worker', workerId] })
      qc.invalidateQueries({ queryKey: ['worker-trust', workerId] })
    },
  })
}

// ─── Service Requests ─────────────────────────────────────────────────────────
export function useServiceRequests(status?: string) {
  return useQuery({
    queryKey: ['service-requests', status],
    queryFn: () =>
      api.get('/service-requests', { params: status ? { status } : {} }).then((r) => r.data),
  })
}

export function useServiceRequest(id: string) {
  return useQuery<ServiceRequest>({
    queryKey: ['service-request', id],
    queryFn: () => api.get(`/service-requests/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useMatchedWorkers(requestId: string) {
  return useQuery<Worker[]>({
    queryKey: ['matched-workers', requestId],
    queryFn: () =>
      api.get(`/service-requests/${requestId}/matched-workers`).then((r) => r.data),
    enabled: !!requestId,
  })
}

export function useCreateServiceRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/service-requests', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service-requests'] }),
  })
}

export function useAssignWorkers(requestId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (workerIds: string[]) =>
      api.post(`/service-requests/${requestId}/assign`, { workerIds }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-request', requestId] })
      qc.invalidateQueries({ queryKey: ['service-requests'] })
    },
  })
}

// ─── Identity / Verification (consent-gated) ─────────────────────────────────

export function useVerifiedDetails(workerId: string) {
  return useQuery({
    queryKey: ['verified-details', workerId],
    queryFn: () => api.get(`/identity/workers/${workerId}/details`).then(r => r.data),
    enabled: !!workerId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useWorkerPhoto(workerId: string) {
  return useQuery<{ photo: string | null; hasPhoto: boolean }>({
    queryKey: ['worker-photo', workerId],
    queryFn: () => api.get(`/identity/workers/${workerId}/photo`).then(r => r.data),
    enabled: !!workerId,
    staleTime: 10 * 60 * 1000,
  })
}

// ─── Config ───────────────────────────────────────────────────────────────────

export function useInstitutionConfig() {
  return useQuery({
    queryKey: ['institution-config'],
    queryFn: () => api.get('/institution/config').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch('/institution/config', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['institution-config'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// ─── Volunteers ────────────────────────────────────────────────────────────────

export function useVolunteers(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['volunteers', filters],
    queryFn: () => api.get('/volunteers', { params: filters }).then(r => r.data),
  })
}

export function useCreateVolunteer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/volunteers', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['volunteers'] }),
  })
}

// ─── Emergency Mobilisation ───────────────────────────────────────────────────

export function useMobilise() {
  return useMutation({
    mutationFn: (data: unknown) =>
      api.post('/service-requests/mobilise', data).then(r => r.data),
  })
}

// ─── Incidents ────────────────────────────────────────────────────────────────
export function useIncidents(status?: string) {
  return useQuery({
    queryKey: ['incidents', status],
    queryFn: () =>
      api.get('/incidents', { params: status ? { status } : {} }).then((r) => r.data),
  })
}

export function useCreateIncident() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/incidents', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['incidents'] }),
  })
}

export function useSubmitReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.post('/performance-reviews', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workers'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
