import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

async function fetchPortfolio() {
  const res = await api.get('/api/portfolio')
  return res.data?.data ?? res.data
}

async function createPortfolio(formData) {
  const res = await api.post('/api/portfolio', formData)
  return res.data
}

async function deletePortfolio(id) {
  const res = await api.delete(`/api/portfolio/${id}`)
  return res.data
}

async function fetchCategories() {
  const res = await api.get('/api/categories')
  return res.data
}

async function createCategory(payload) {
  const res = await api.post('/api/categories', payload)
  return res.data
}

async function deleteCategory(id) {
  const res = await api.delete(`/api/categories/${id}`)
  return res.data
}

async function fetchContact() {
  const res = await api.get('/api/contact', { params: { v: 1 } })
  return res.data
}

async function saveContact(payload) {
  const res = await api.put('/api/contact', payload)
  return res.data
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontSize: 13, letterSpacing: 1.2, textTransform: 'uppercase', color: '#d0d0d0' }}>
        {label}
      </div>
      {children}
    </label>
  )
}

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' }
  const stroke = { stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (name === 'dashboard') {
    return (
      <svg {...common}>
        <path {...stroke} d="M3 13.5V21h7.5v-7.5H3zM13.5 3H21v7.5h-7.5V3zM13.5 13.5H21V21h-7.5v-7.5zM3 3h7.5v7.5H3V3z" />
      </svg>
    )
  }
  if (name === 'portfolio') {
    return (
      <svg {...common}>
        <path {...stroke} d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1" />
        <path {...stroke} d="M4 7h16a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2Z" />
        <path {...stroke} d="M9.5 12h5" />
      </svg>
    )
  }
  if (name === 'add') {
    return (
      <svg {...common}>
        <path {...stroke} d="M12 5v14M5 12h14" />
      </svg>
    )
  }
  if (name === 'categories') {
    return (
      <svg {...common}>
        <path {...stroke} d="M4 7h16M4 12h16M4 17h16" />
        <path {...stroke} d="M7.5 7v0M7.5 12v0M7.5 17v0" />
      </svg>
    )
  }
  if (name === 'contacts') {
    return (
      <svg {...common}>
        <path {...stroke} d="M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
        <path {...stroke} d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </svg>
    )
  }
  if (name === 'upload') {
    return (
      <svg {...common}>
        <path {...stroke} d="M12 3v12" />
        <path {...stroke} d="M7 8l5-5 5 5" />
        <path {...stroke} d="M5 21h14" />
      </svg>
    )
  }
  if (name === 'image') {
    return (
      <svg {...common}>
        <path {...stroke} d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
        <path {...stroke} d="M8.5 10.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
        <path {...stroke} d="M21 16l-5.2-5.2a1.5 1.5 0 0 0-2.1 0L6 18" />
      </svg>
    )
  }
  return null
}

export default function Admin() {
  const qc = useQueryClient()
  const [toast, setToast] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [deletingCatId, setDeletingCatId] = useState(null)
  const [activeSection, setActiveSection] = useState('portfolio')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const styles = useMemo(() => {
    const gold = '#c8902a'
    const bg = '#0a0a0a'
    const panel = 'rgba(18,18,18,0.85)'
    const border = 'rgba(255,255,255,0.08)'
    const input = {
      width: '100%',
      padding: '12px 12px',
      borderRadius: 8,
      border: `1px solid ${border}`,
      background: 'rgba(12,12,12,0.9)',
      color: '#fff',
      outline: 'none',
    }
    return {
      gold,
      bg,
      panel,
      border,
      input,
      button: {
        padding: '12px 14px',
        borderRadius: 10,
        border: `1px solid rgba(200,144,42,0.35)`,
        background: 'rgba(200,144,42,0.12)',
        color: '#fff',
        cursor: 'pointer',
      },
      buttonDanger: {
        padding: '10px 12px',
        borderRadius: 10,
        border: '1px solid rgba(255,90,90,0.35)',
        background: 'rgba(255,90,90,0.12)',
        color: '#fff',
        cursor: 'pointer',
      },
      portfolioCard: {
        background: '#171717',
        border: '1.2px solid #262626',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: '0 18px 60px -34px rgba(0,0,0,0.75)',
      },
    }
  }, [])

  // Categories
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['categories'] })
      setToast({ type: 'success', text: 'Category added.' })
    },
    onError: (e) => setToast({ type: 'error', text: e?.message || 'Failed to add category.' }),
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: async (id) => {
      setDeletingCatId(id)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['categories'] })
      setToast({ type: 'success', text: 'Category deleted.' })
    },
    onError: (e) => setToast({ type: 'error', text: e?.message || 'Failed to delete category.' }),
    onSettled: () => setDeletingCatId(null),
  })

  // Portfolio
  const portfolioQuery = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  })

  const createMutation = useMutation({
    mutationFn: createPortfolio,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['portfolio'] })
      setToast({ type: 'success', text: 'Portfolio item added.' })
    },
    onError: (e) => setToast({ type: 'error', text: e?.message || 'Failed to add item.' }),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePortfolio,
    onMutate: async (id) => {
      setDeletingId(id)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['portfolio'] })
      setToast({ type: 'success', text: 'Deleted.' })
    },
    onError: (e) => setToast({ type: 'error', text: e?.message || 'Failed to delete.' }),
    onSettled: () => setDeletingId(null),
  })

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    before: null,
    after: null,
  })

  const beforeInputRef = useRef(null)
  const afterInputRef = useRef(null)
  const beforeObjectUrlRef = useRef(null)
  const afterObjectUrlRef = useRef(null)
  const [beforePreviewUrl, setBeforePreviewUrl] = useState(null)
  const [afterPreviewUrl, setAfterPreviewUrl] = useState(null)

  useEffect(() => {
    return () => {
      if (beforeObjectUrlRef.current) URL.revokeObjectURL(beforeObjectUrlRef.current)
      if (afterObjectUrlRef.current) URL.revokeObjectURL(afterObjectUrlRef.current)
    }
  }, [])

  function setBeforeFile(file) {
    setNewItem((s) => ({ ...s, before: file }))
    if (beforeObjectUrlRef.current) URL.revokeObjectURL(beforeObjectUrlRef.current)
    if (!file) {
      beforeObjectUrlRef.current = null
      setBeforePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    beforeObjectUrlRef.current = url
    setBeforePreviewUrl(url)
  }

  function setAfterFile(file) {
    setNewItem((s) => ({ ...s, after: file }))
    if (afterObjectUrlRef.current) URL.revokeObjectURL(afterObjectUrlRef.current)
    if (!file) {
      afterObjectUrlRef.current = null
      setAfterPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    afterObjectUrlRef.current = url
    setAfterPreviewUrl(url)
  }

  function resetNewWorkForm(formEl) {
    setNewItem({ title: '', description: '', category: '', before: null, after: null })
    if (beforeObjectUrlRef.current) URL.revokeObjectURL(beforeObjectUrlRef.current)
    if (afterObjectUrlRef.current) URL.revokeObjectURL(afterObjectUrlRef.current)
    beforeObjectUrlRef.current = null
    afterObjectUrlRef.current = null
    setBeforePreviewUrl(null)
    setAfterPreviewUrl(null)
    if (beforeInputRef.current) beforeInputRef.current.value = ''
    if (afterInputRef.current) afterInputRef.current.value = ''
    formEl?.reset?.()
  }

  function clearBefore() {
    setBeforeFile(null)
    if (beforeInputRef.current) beforeInputRef.current.value = ''
  }

  function clearAfter() {
    setAfterFile(null)
    if (afterInputRef.current) afterInputRef.current.value = ''
  }

  async function onSubmitNewItem(e) {
    e.preventDefault()
    if (!newItem.category) {
      setToast({ type: 'error', text: 'Please select a category.' })
      return
    }
    const fd = new FormData()
    fd.append('title', newItem.title)
    fd.append('description', newItem.description)
    fd.append('category', newItem.category)
    if (newItem.before) fd.append('before', newItem.before)
    if (newItem.after) fd.append('after', newItem.after)
    await createMutation.mutateAsync(fd)
    resetNewWorkForm(e.target)
  }

  // Contact
  const contactQuery = useQuery({
    queryKey: ['contact'],
    queryFn: fetchContact,
  })

  const contactDefaults = useMemo(() => {
    const c = contactQuery.data
    return {
      phone: c?.phone || '',
      email: c?.email || '',
      address: c?.address || '',
      working_hours: c?.working_hours || '',
      messenger_whatsapp: c?.messenger_whatsapp || '',
      messenger_telegram: c?.messenger_telegram || '',
    }
  }, [contactQuery.data])

  const [contactDraft, setContactDraft] = useState(null)
  const contactForm = contactDraft ?? contactDefaults

  function updateContactField(field, value) {
    setContactDraft((draft) => ({ ...(draft ?? contactDefaults), [field]: value }))
  }

  const saveMutation = useMutation({
    mutationFn: saveContact,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['contact'] })
      setContactDraft(null)
      setToast({ type: 'success', text: 'Contact details saved.' })
    },
    onError: (e) => setToast({ type: 'error', text: e?.message || 'Failed to save contact.' }),
  })

  async function onSaveContact() {
    await saveMutation.mutateAsync({
      phone: contactForm.phone,
      email: contactForm.email,
      address: contactForm.address,
      working_hours: contactForm.working_hours,
      messenger_whatsapp: contactForm.messenger_whatsapp,
      messenger_telegram: contactForm.messenger_telegram,
    })
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const menu = useMemo(() => {
    return [
      { id: 'portfolio', label: 'Portfolio', icon: 'portfolio' },
      { id: 'add', label: 'Add New Work', icon: 'add' },
      { id: 'categories', label: 'Categories', icon: 'categories' },
      { id: 'contacts', label: 'Contacts', icon: 'contacts' },
    ]
  }, [])

  function goTo(sectionId) {
    setActiveSection(sectionId)
    setSidebarOpen(false)
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      // ignore
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#121212', color: '#fff' }}>
      <style>{`
        .admin-shell { min-height: 100vh; display: grid; grid-template-columns: 260px 1fr; }
        .admin-sidebar { position: sticky; top: 0; height: 100vh; padding: 18px 16px; background: rgba(18,18,18,0.92); border-right: 1px solid rgba(255,255,255,0.08); overflow: auto; }
        .admin-brand { display: grid; gap: 8px; margin-bottom: 14px; padding: 8px 8px 14px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .admin-brand .kicker { color: ${styles.gold}; letter-spacing: 3.2px; text-transform: uppercase; font-size: 11px; }
        .admin-brand .title { font-size: 18px; font-weight: 650; }
        .admin-nav { display: grid; gap: 6px; padding: 10px 0; }
        .admin-nav-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10,10,10,0.30); color: rgba(255,255,255,0.88); cursor: pointer; text-align: left; }
        .admin-nav-btn:hover { background: rgba(10,10,10,0.55); }
        .admin-nav-btn.active { background: rgba(200,144,42,0.12); border-color: rgba(200,144,42,0.35); box-shadow: 0 10px 38px -28px rgba(200,144,42,0.45); }
        .admin-nav-icon { color: rgba(255,255,255,0.85); }
        .admin-nav-btn.active .admin-nav-icon { color: ${styles.gold}; }
        .admin-nav-label { font-size: 14px; font-weight: 550; }
        .admin-main { padding: 28px 22px; }
        .admin-topbar { display: none; align-items: center; justify-content: space-between; gap: 12px; padding: 14px 14px; background: rgba(18,18,18,0.92); border-bottom: 1px solid rgba(255,255,255,0.08); position: sticky; top: 0; z-index: 150; }
        .admin-hamburger { width: 44px; height: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); background: rgba(10,10,10,0.40); color: #fff; cursor: pointer; }
        .admin-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 180; }
        .admin-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .admin-portfolio-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
        .admin-media-frame { position: relative; flex: 1; overflow: hidden; }
        .admin-media-remove { position: absolute; top: 10px; right: 10px; width: 32px; height: 32px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.22); background: rgba(0,0,0,0.55); color: #fff; cursor: pointer; display: grid; place-items: center; line-height: 1; }
        .admin-media-remove:hover { background: rgba(0,0,0,0.72); }
        .admin-media-pill { position: absolute; top: 12px; left: 12px; background: rgba(130,24,26,0.80); border: 1.12px solid #C10007; border-radius: 6px; padding: 7px 13px; font-size: 12px; font-weight: 600; color: #fff; letter-spacing: 0.6px; }
        .admin-media-pill.after { left: auto; right: 12px; background: rgba(13,84,43,0.80); border-color: #008236; }
        .admin-file-input { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        .admin-upload-box { position: relative; border-radius: 14px; border: 1.2px dashed rgba(255,255,255,0.18); background: rgba(10,10,10,0.40); min-height: 220px; display: grid; place-items: center; overflow: hidden; cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease; }
        .admin-upload-box:hover { border-color: rgba(200,144,42,0.65); background: rgba(10,10,10,0.55); transform: translateY(-1px); }
        .admin-upload-inner { display: grid; gap: 10px; text-align: center; padding: 18px; color: rgba(255,255,255,0.86); }
        .admin-upload-icon { width: 44px; height: 44px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.25); display: grid; place-items: center; margin: 0 auto; }
        .admin-upload-title { font-size: 14px; font-weight: 650; }
        .admin-upload-sub { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.5; }
        .admin-upload-preview { position: absolute; inset: 0; }
        .admin-upload-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .admin-upload-actions { position: absolute; inset: 0; display: flex; align-items: flex-start; justify-content: flex-end; padding: 10px; gap: 8px; }
        .admin-upload-action { width: 34px; height: 34px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.22); background: rgba(0,0,0,0.55); color: #fff; cursor: pointer; display: grid; place-items: center; line-height: 1; }
        .admin-upload-action:hover { background: rgba(0,0,0,0.72); }
        .admin-upload-chip { position: absolute; left: 12px; bottom: 12px; padding: 8px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.16); background: rgba(0,0,0,0.40); color: rgba(255,255,255,0.92); font-size: 12px; letter-spacing: 0.4px; }
        @media (max-width: 900px) {
          .admin-shell { grid-template-columns: 1fr; }
          .admin-topbar { display: flex; }
          .admin-sidebar { position: fixed; left: 0; top: 0; width: 270px; height: 100vh; z-index: 200; transform: translateX(-100%); transition: transform 240ms ease; }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-overlay { display: block; }
          .admin-main { padding: 18px 14px; }
          .admin-portfolio-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) {
          .admin-grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="admin-shell">
        {sidebarOpen && <div className="admin-overlay" onClick={() => setSidebarOpen(false)} />}

        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="admin-brand">
            <div className="kicker">Prime Leather Repair</div>
            <div className="title">Admin Panel</div>
          </div>

          <nav className="admin-nav">
            {menu.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`admin-nav-btn ${activeSection === m.id ? 'active' : ''}`}
                onClick={() => goTo(m.id)}
              >
                <span className="admin-nav-icon" aria-hidden="true">
                  <Icon name={m.icon} />
                </span>
                <span className="admin-nav-label">{m.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          <div className="admin-topbar">
            <button className="admin-hamburger" type="button" onClick={() => setSidebarOpen((s) => !s)} aria-label="Open menu">
              ☰
            </button>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
              {menu.find((m) => m.id === activeSection)?.label || 'Admin'}
            </div>
            <div style={{ width: 44 }} />
          </div>

          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 18 }}>
            {toast && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${toast.type === 'success' ? 'rgba(80,200,120,0.35)' : 'rgba(255,90,90,0.35)'}`,
                  background: toast.type === 'success' ? 'rgba(80,200,120,0.10)' : 'rgba(255,90,90,0.10)',
                  color: '#fff',
                  maxWidth: 740,
                }}
              >
                {toast.text}
              </div>
            )}

            {activeSection === 'portfolio' && (
              <section
                style={{
                  background: styles.panel,
                  border: `1px solid ${styles.border}`,
                  borderRadius: 14,
                  padding: 22,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 20 }}>Portfolio</h2>
                <div style={{ height: 1, background: styles.border, margin: '16px 0 18px' }} />

                <div className="admin-portfolio-grid">
                  {portfolioQuery.isLoading && <div style={{ color: '#cfcfcf' }}>Loading portfolio…</div>}
                  {portfolioQuery.error && (
                    <div style={{ color: '#ffb3b3' }}>Error: {portfolioQuery.error.message}</div>
                  )}
                  {!portfolioQuery.isLoading && !portfolioQuery.error && portfolioQuery.data?.length === 0 && (
                    <div style={{ color: '#cfcfcf' }}>No portfolio items yet.</div>
                  )}
                  {(portfolioQuery.data || []).map((item) => (
                    <div key={item.id} style={styles.portfolioCard}>
                      <div style={{ display: 'flex', height: 363, position: 'relative' }}>
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={item.before_url}
                            alt="Before"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,23,23,0.20)' }} />
                          <div className="admin-media-pill">BEFORE</div>
                        </div>
                        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                          <img
                            src={item.after_url}
                            alt="After"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            loading="lazy"
                          />
                          <div className="admin-media-pill after">AFTER</div>
                        </div>
                      </div>

                      <div
                        style={{
                          padding: '18px 18px',
                          borderTop: '1.12px solid #262626',
                          background: 'rgba(23,23,23,0.95)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'grid', gap: 6, flex: 1 }}>
                          <div style={{ color: '#FE9A00', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 500 }}>
                            {item.category || 'uncategorized'}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 600 }}>{item.title}</div>
                          {item.description && <div style={{ color: '#A1A1A1', fontSize: 14, lineHeight: 1.5 }}>{item.description}</div>}
                        </div>
                        <button
                          type="button"
                          style={{
                            ...styles.buttonDanger,
                            opacity: deleteMutation.isPending ? 0.7 : 1,
                            cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                          onClick={() => deleteMutation.mutate(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {item.id === deletingId ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === 'add' && (
              <section
                style={{
                  background: styles.panel,
                  border: `1px solid ${styles.border}`,
                  borderRadius: 14,
                  padding: 22,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 20 }}>Add New Work</h2>
                <div style={{ height: 1, background: styles.border, margin: '16px 0 18px' }} />

                <form
                  onSubmit={onSubmitNewItem}
                  style={{
                    border: `1px solid ${styles.border}`,
                    borderRadius: 14,
                    padding: 16,
                    display: 'grid',
                    gap: 14,
                    background: 'rgba(10,10,10,0.40)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Upload</div>
                    <div style={{ color: '#bdbdbd', fontSize: 12 }}>Uploads to Supabase bucket: portfolio</div>
                  </div>

                  <div className="admin-grid-2">
                    <Field label="Title">
                      <input
                        value={newItem.title}
                        onChange={(e) => setNewItem((s) => ({ ...s, title: e.target.value }))}
                        style={styles.input}
                        placeholder="e.g. Vintage chair restoration"
                        required
                      />
                    </Field>

                    <Field label="Category">
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem((s) => ({ ...s, category: e.target.value }))}
                        style={styles.input}
                        required
                        disabled={categoriesQuery.isLoading || (categoriesQuery.data || []).length === 0}
                      >
                        <option value="" disabled>
                          {(categoriesQuery.data || []).length === 0 ? 'No categories (add one first)' : 'Select a category…'}
                        </option>
                        {(categoriesQuery.data || []).map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label="Description">
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem((s) => ({ ...s, description: e.target.value }))}
                      style={{ ...styles.input, minHeight: 90, resize: 'vertical' }}
                      placeholder="Optional details about the restoration work…"
                    />
                  </Field>

                  <div className="admin-grid-2">
                    <Field label="Before Photo">
                      <div
                        className="admin-upload-box"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') beforeInputRef.current?.click?.()
                        }}
                        onClick={() => beforeInputRef.current?.click?.()}
                        onDragOver={(e) => {
                          e.preventDefault()
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const file = e.dataTransfer?.files?.[0]
                          if (file) setBeforeFile(file)
                        }}
                      >
                        <input
                          ref={beforeInputRef}
                          className="admin-file-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                          required
                        />

                        {!beforePreviewUrl && (
                          <div className="admin-upload-inner">
                            <div className="admin-upload-icon" aria-hidden="true">
                              <Icon name="upload" />
                            </div>
                            <div className="admin-upload-title">Click to upload Before Photo</div>
                            <div className="admin-upload-sub">or drag and drop an image here</div>
                          </div>
                        )}

                        {beforePreviewUrl && (
                          <>
                            <div className="admin-upload-preview">
                              <img src={beforePreviewUrl} alt="Before preview" />
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,23,23,0.18)' }} />
                              <div className="admin-media-pill">BEFORE</div>
                              <div className="admin-upload-chip">Click to change</div>
                            </div>
                            <div className="admin-upload-actions">
                              <button
                                className="admin-upload-action"
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  clearBefore()
                                }}
                                aria-label="Remove before image"
                              >
                                ×
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </Field>

                    <Field label="After Photo">
                      <div
                        className="admin-upload-box"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') afterInputRef.current?.click?.()
                        }}
                        onClick={() => afterInputRef.current?.click?.()}
                        onDragOver={(e) => {
                          e.preventDefault()
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const file = e.dataTransfer?.files?.[0]
                          if (file) setAfterFile(file)
                        }}
                      >
                        <input
                          ref={afterInputRef}
                          className="admin-file-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
                          required
                        />

                        {!afterPreviewUrl && (
                          <div className="admin-upload-inner">
                            <div className="admin-upload-icon" aria-hidden="true">
                              <Icon name="image" />
                            </div>
                            <div className="admin-upload-title">Click to upload After Photo</div>
                            <div className="admin-upload-sub">or drag and drop an image here</div>
                          </div>
                        )}

                        {afterPreviewUrl && (
                          <>
                            <div className="admin-upload-preview">
                              <img src={afterPreviewUrl} alt="After preview" />
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,23,23,0.18)' }} />
                              <div className="admin-media-pill after">AFTER</div>
                              <div className="admin-upload-chip">Click to change</div>
                            </div>
                            <div className="admin-upload-actions">
                              <button
                                className="admin-upload-action"
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  clearAfter()
                                }}
                                aria-label="Remove after image"
                              >
                                ×
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </Field>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      style={styles.button}
                      disabled={createMutation.isPending || categoriesQuery.isLoading || (categoriesQuery.data || []).length === 0 || !newItem.category}
                    >
                      {createMutation.isPending ? 'Uploading…' : 'Add to Portfolio'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeSection === 'categories' && (
              <section
                style={{
                  background: styles.panel,
                  border: `1px solid ${styles.border}`,
                  borderRadius: 14,
                  padding: 22,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 20 }}>Categories</h2>
                <div style={{ height: 1, background: styles.border, margin: '16px 0 18px' }} />

                <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
                  {categoriesQuery.isLoading && <div style={{ color: '#cfcfcf' }}>Loading categories…</div>}
                  {categoriesQuery.error && (
                    <div style={{ color: '#ffb3b3' }}>Error: {categoriesQuery.error.message}</div>
                  )}
                  {!categoriesQuery.isLoading && !categoriesQuery.error && (categoriesQuery.data || []).length === 0 && (
                    <div style={{ color: '#cfcfcf' }}>No categories yet. Add one below.</div>
                  )}

                  {(categoriesQuery.data || []).map((cat) => (
                    <div
                      key={cat.id}
                      style={{
                        border: `1px solid ${styles.border}`,
                        borderRadius: 14,
                        padding: 14,
                        background: 'rgba(10,10,10,0.40)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1, display: 'grid', gap: 6 }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{cat.name}</div>
                        {cat.description && <div style={{ color: '#A1A1A1', fontSize: 14, lineHeight: 1.5 }}>{cat.description}</div>}
                      </div>
                      <button
                        type="button"
                        style={{
                          ...styles.buttonDanger,
                          opacity: deleteCategoryMutation.isPending ? 0.7 : 1,
                          cursor: deleteCategoryMutation.isPending ? 'not-allowed' : 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => deleteCategoryMutation.mutate(cat.id)}
                        disabled={deleteCategoryMutation.isPending}
                      >
                        {cat.id === deletingCatId ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const form = new FormData(e.currentTarget)
                    const name = String(form.get('name') || '').trim()
                    const description = String(form.get('description') || '').trim()
                    await createCategoryMutation.mutateAsync({ name, description: description || null })
                    e.currentTarget.reset()
                  }}
                  style={{
                    border: `1px solid ${styles.border}`,
                    borderRadius: 14,
                    padding: 16,
                    display: 'grid',
                    gap: 14,
                    background: 'rgba(10,10,10,0.40)',
                  }}
                >
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Add Category</div>
                  <div className="admin-grid-2">
                    <Field label="Name">
                      <input name="name" style={styles.input} placeholder="e.g. Furniture" required />
                    </Field>
                    <Field label="Description">
                      <input name="description" style={styles.input} placeholder="Optional short description…" />
                    </Field>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" style={styles.button} disabled={createCategoryMutation.isPending}>
                      {createCategoryMutation.isPending ? 'Saving…' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </section>
            )}

            {activeSection === 'contacts' && (
              <section
                style={{
                  background: styles.panel,
                  border: `1px solid ${styles.border}`,
                  borderRadius: 14,
                  padding: 22,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 20 }}>Contacts</h2>
                <div style={{ height: 1, background: styles.border, margin: '16px 0 18px' }} />

                {contactQuery.isLoading && <div style={{ color: '#cfcfcf' }}>Loading contact…</div>}
                {contactQuery.error && <div style={{ color: '#ffb3b3' }}>Error: {contactQuery.error.message}</div>}

                {!contactQuery.isLoading && !contactQuery.error && (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Phone">
                        <input
                          value={contactForm.phone}
                          onChange={(e) => updateContactField('phone', e.target.value)}
                          style={styles.input}
                          placeholder="+1 (312) 555-0199"
                        />
                      </Field>
                      <Field label="Email">
                        <input
                          value={contactForm.email}
                          onChange={(e) => updateContactField('email', e.target.value)}
                          style={styles.input}
                          placeholder="info@primeleatherrepair.com"
                        />
                      </Field>
                    </div>

                    <Field label="Address">
                      <input
                        value={contactForm.address}
                        onChange={(e) => updateContactField('address', e.target.value)}
                        style={styles.input}
                        placeholder="123 Craft Street, Chicago, IL 60614"
                      />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Field label="Working Hours (Mon–Fri)">
                        <input
                          value={contactForm.working_hours}
                          onChange={(e) => updateContactField('working_hours', e.target.value)}
                          style={styles.input}
                          placeholder="9AM - 6PM"
                        />
                      </Field>

                      <Field label="WhatsApp Link">
                        <input
                          value={contactForm.messenger_whatsapp}
                          onChange={(e) => updateContactField('messenger_whatsapp', e.target.value)}
                          style={styles.input}
                          placeholder="https://wa.me/13125550199"
                        />
                      </Field>
                    </div>

                    <Field label="Telegram Link">
                      <input
                        value={contactForm.messenger_telegram}
                        onChange={(e) => updateContactField('messenger_telegram', e.target.value)}
                        style={styles.input}
                        placeholder="https://t.me/yourhandle"
                      />
                    </Field>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="button" style={styles.button} onClick={onSaveContact} disabled={saveMutation.isPending}>
                        {saveMutation.isPending ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
