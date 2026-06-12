#!/usr/bin/env node
// scripts/debug-admin-jobs.js
// Usage:
// API_BASE=https://api.example.com/api/v1 API_TOKEN=token node scripts/debug-admin-jobs.js

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_URL
const TOKEN = process.env.API_TOKEN || process.env.API_TOKEN_BEARER
const LOCALE = process.env.LOCALE || 'ar'

if (!API_BASE) {
  console.error('Missing API_BASE. Set API_BASE or NEXT_PUBLIC_API_URL environment variable.')
  process.exit(1)
}

const statuses = ['pending','approved','active','rejected']

async function fetchJson(url, opts = {}) {
  const headers = { 'Accept': 'application/json', 'Accept-Language': LOCALE, ...opts.headers }
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`
  const res = await fetch(url, { ...opts, headers })
  const text = await res.text()
  try { return { status: res.status, body: JSON.parse(text) } } catch (e) { return { status: res.status, body: text } }
}

async function fetchAllPages(endpoint) {
  const firstUrl = `${endpoint}`
  const first = await fetchJson(firstUrl)
  if (first.status >= 400) {
    console.error('Error fetching', firstUrl, first.status, first.body)
    return { data: [], meta: null, raw: first.body }
  }
  let meta = (first.body && first.body.meta) || null
  let list = []
  if (Array.isArray(first.body)) {
    list = first.body
    meta = { current_page: 1, last_page: 1, per_page: list.length, total: list.length }
  } else if (Array.isArray(first.body.data)) {
    list = first.body.data
  } else {
    // try to find array in common fields
    const maybe = first.body.data || first.body.jobs || first.body.items
    if (Array.isArray(maybe)) list = maybe
  }
  const last = meta?.last_page ?? 1
  for (let p = 2; p <= last; p++) {
    const url = endpoint.includes('?') ? `${endpoint}&page=${p}` : `${endpoint}?page=${p}`
    const pageRes = await fetchJson(url)
    if (pageRes.status >= 400) break
    const body = pageRes.body
    if (Array.isArray(body)) list = list.concat(body)
    else if (Array.isArray(body.data)) list = list.concat(body.data)
    else {
      // try nested
      const maybe = body.data || body.jobs || body.items
      if (Array.isArray(maybe)) list = list.concat(maybe)
    }
  }
  return { data: list, meta }
}

function extractIds(list) {
  const ids = new Set()
  for (const item of list) {
    if (item && (item.id !== undefined)) ids.add(Number(item.id))
    else if (item && item.job && item.job.id !== undefined) ids.add(Number(item.job.id))
  }
  return ids
}

;(async () => {
  console.log('API_BASE:', API_BASE)

  const allEndpoint = `${API_BASE.replace(/\/$/, '')}/admin/jobs?page=1&locale=${LOCALE}`
  const allRes = await fetchAllPages(allEndpoint)
  const allIds = extractIds(allRes.data)
  console.log(`All endpoint reported meta.total=${allRes.meta?.total ?? 'unknown'}, fetched items=${allRes.data.length}, unique ids=${allIds.size}`)

  const perStatus = {}
  for (const status of statuses) {
    const ep = `${API_BASE.replace(/\/$/, '')}/admin/jobs?status=${status}&page=1&locale=${LOCALE}`
    const r = await fetchAllPages(ep)
    const ids = extractIds(r.data)
    perStatus[status] = { metaTotal: r.meta?.total ?? null, fetched: r.data.length, uniqueIds: ids, idsList: Array.from(ids) }
    console.log(`Status ${status}: meta.total=${r.meta?.total ?? 'unknown'}, fetched=${r.data.length}, uniqueIds=${ids.size}`)
  }

  // compute sums and overlaps
  const statusSums = Object.values(perStatus).reduce((s, v) => s + (v.metaTotal ? Number(v.metaTotal) : v.uniqueIds.size), 0)
  const unionIds = new Set()
  for (const s of Object.values(perStatus)) for (const id of s.uniqueIds) unionIds.add(id)

  console.log('\nSummary:')
  console.log('all.meta.total=', allRes.meta?.total)
  console.log('sum of per-status.meta (or uniqueIds) =', statusSums)
  console.log('union of per-status unique ids =', unionIds.size)

  const missingFromPerStatus = Array.from(allIds).filter(id => !unionIds.has(id))
  console.log('\nIDs present in /admin/jobs but missing from per-status union:', missingFromPerStatus)

  // Find IDs present in per-status but not in collected all
  const extraInPerStatus = Array.from(unionIds).filter(id => !allIds.has(id))
  console.log('IDs present in per-status union but not in /admin/jobs:', extraInPerStatus)

  // Print overlaps (ids appearing in multiple statuses)
  const idToStatuses = {}
  for (const [status, info] of Object.entries(perStatus)) {
    for (const id of info.uniqueIds) {
      idToStatuses[id] = idToStatuses[id] || []
      idToStatuses[id].push(status)
    }
  }
  const duplicates = Object.entries(idToStatuses).filter(([id, arr]) => arr.length > 1).map(([id, arr]) => ({ id: Number(id), statuses: arr }))
  console.log('\nIDs present in multiple status endpoints:', duplicates)

  console.log('\nDone. If you want, run this again with environment variable FETCH_SAMPLE_JOB=ID to print its applications details.')

  if (process.env.FETCH_SAMPLE_JOB) {
    const jobId = process.env.FETCH_SAMPLE_JOB
    const appsEp = `${API_BASE.replace(/\/$/, '')}/admin/job-applications?job_id=${jobId}&page=1&locale=${LOCALE}`
    const apps = await fetchAllPages(appsEp)
    console.log(`\nApplications for job ${jobId}: meta.total=${apps.meta?.total}, fetched=${apps.data.length}`)
    console.log('Sample application ids:', apps.data.map(a => a.id || (a.job && a.job.id) || null))
  }
})();
