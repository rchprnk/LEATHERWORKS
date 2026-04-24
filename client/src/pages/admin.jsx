import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

const UPLOAD_TIMEOUT_MS = 60_000
const SAVE_TIMEOUT_MS = 30_000

function openFilePicker(inputRef) {
  const el = inputRef?.current
  if (!el) return
  try {
    el.value = ''
  } catch {
    // ignore
  }
  el.click?.()
}

function finalizeFileSelection() {
  try {
    document?.activeElement?.blur?.()
  } catch {
    // ignore
  }
}

function useImageFilePicker({ onFileSelected, validate, onInvalid } = {}) {
  const inputRef = useRef(null)
  const objectUrlRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  function setPreviewFromFile(file) {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = null

    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    objectUrlRef.current = url
    setPreviewUrl(url)
  }

  function selectFile(file) {
    const v = validate ? validate(file) : { ok: true }
    if (!v.ok) {
      onInvalid?.(v.message || 'Invalid file.')
      return
    }
    onFileSelected?.(file || null)
    setPreviewFromFile(file || null)
  }

  function open(e) {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    openFilePicker(inputRef)
  }

  function onChange(e) {
    e?.preventDefault?.()
    const files = e?.target?.files
    if (!files || files.length === 0) {
      try {
        e.target.value = null
      } catch {
        // ignore
      }
      return
    }
    const file = files[0] || null
    selectFile(file)
    try {
      e.target.value = null
    } catch {
      // ignore
    }
    finalizeFileSelection()
  }

  function clear(e) {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    selectFile(null)
    try {
      if (inputRef.current) inputRef.current.value = ''
    } catch {
      // ignore
    }
  }

  return { inputRef, previewUrl, open, onChange, clear, selectFile, setPreviewFromFile }
}

async function fetchPortfolio() {
  const res = await api.get('/api/portfolio')
  return res.data?.data ?? res.data
}

async function createPortfolio(formData) {
  const res = await api.post('/api/portfolio', formData, { timeout: UPLOAD_TIMEOUT_MS })
  return res.data
}

async function deletePortfolio(id) {
  const res = await api.delete(`/api/portfolio/${id}`, { timeout: SAVE_TIMEOUT_MS })
  return res.data
}

async function updatePortfolio({ id, data }) {
  const res = await api.put(`/api/portfolio/${id}`, data, { timeout: UPLOAD_TIMEOUT_MS })
  return res.data
}

async function fetchCategories() {
  const res = await api.get('/api/categories')
  return res.data
}

async function createCategory(payload) {
  const res = await api.post('/api/categories', payload, { timeout: SAVE_TIMEOUT_MS })
  return res.data
}

async function deleteCategory(id) {
  const res = await api.delete(`/api/categories/${id}`, { timeout: SAVE_TIMEOUT_MS })
  return res.data
}

async function updateCategory({ id, data }) {
  const res = await api.put(`/api/categories/${id}`, data, { timeout: SAVE_TIMEOUT_MS })
  return res.data
}

async function fetchContact() {
  const res = await api.get('/api/contact', { params: { v: 1 }, timeout: SAVE_TIMEOUT_MS })
  return res.data
}

async function saveContact(payload) {
  const res = await api.put('/api/contact', payload, { timeout: SAVE_TIMEOUT_MS })
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
  if (name === 'camera') {
    return (
      <svg {...common}>
        <path {...stroke} d="M20 19a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-2H9L7 7H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16Z" />
        <path {...stroke} d="M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      </svg>
    )
  }
  if (name === 'edit') {
    return (
      <svg {...common}>
        <path {...stroke} d="M12 20h9" />
        <path {...stroke} d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" />
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
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '', description: '' })
  const [savingCatId, setSavingCatId] = useState(null)
  const [editingWorkId, setEditingWorkId] = useState(null)
  const [editWorkForm, setEditWorkForm] = useState({ title: '', description: '' })
  const [savingWorkId, setSavingWorkId] = useState(null)

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
      buttonSubtle: {
        padding: '10px 12px',
        borderRadius: 10,
        border: `1px solid ${border}`,
        background: 'rgba(10,10,10,0.35)',
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

  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onMutate: async ({ id }) => {
      setSavingCatId(id)
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['categories'] })
      setToast({ type: 'success', text: 'Category updated.' })
      setEditingCategoryId(null)
      resetEditCategoryImage()
    },
    onError: (e) => setToast({ type: 'error', text: e?.message || 'Failed to update category.' }),
    onSettled: () => setSavingCatId(null),
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

  const updateWorkMutation = useMutation({
    mutationFn: updatePortfolio,
    onMutate: async ({ id }) => {
      setSavingWorkId(id)
    },
    onSuccess: async (updated) => {
      qc.setQueryData(['portfolio'], (old) => {
        const list = Array.isArray(old) ? old : []
        return list.map((w) => (w?.id === updated?.id ? { ...w, ...updated } : w))
      })
      await qc.invalidateQueries({ queryKey: ['portfolio'] })
      setToast({ type: 'success', text: 'Work updated.' })
      setEditingWorkId(null)
      resetEditWorkImages()
    },
    onError: (e) => setToast({ type: 'error', text: e?.message || 'Failed to update work.' }),
    onSettled: () => setSavingWorkId(null),
  })

  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: '',
    before: null,
    after: null,
  })

  const [categoryImageFile, setCategoryImageFile] = useState(null)
  const {
    inputRef: categoryImageInputRef,
    previewUrl: categoryImagePreviewUrl,
    open: openCategoryPicker,
    onChange: onCategoryImageChange,
    clear: clearCategoryImage,
    selectFile: selectCategoryImageFile,
  } = useImageFilePicker({
    onFileSelected: setCategoryImageFile,
    validate: validateCategoryImage,
    onInvalid: (message) => setToast({ type: 'error', text: message }),
  })

  const [editCategoryImageFile, setEditCategoryImageFile] = useState(null)
  const {
    inputRef: editCategoryImageInputRef,
    previewUrl: editCategoryImagePreviewUrl,
    open: openEditCategoryPicker,
    onChange: onEditCategoryImageChange,
    clear: clearEditCategoryImage,
  } = useImageFilePicker({
    onFileSelected: setEditCategoryImageFile,
    validate: validateCategoryImage,
    onInvalid: (message) => setToast({ type: 'error', text: message }),
  })

  const {
    inputRef: beforeInputRef,
    previewUrl: beforePreviewUrl,
    open: openBeforePicker,
    onChange: onBeforeChange,
    selectFile: selectBeforeFile,
    clear: clearBeforeFile,
  } = useImageFilePicker({
    onFileSelected: (file) => setNewItem((s) => ({ ...s, before: file })),
    validate: validateWorkImage,
    onInvalid: (message) => setToast({ type: 'error', text: message }),
  })

  const {
    inputRef: afterInputRef,
    previewUrl: afterPreviewUrl,
    open: openAfterPicker,
    onChange: onAfterChange,
    selectFile: selectAfterFile,
    clear: clearAfterFile,
  } = useImageFilePicker({
    onFileSelected: (file) => setNewItem((s) => ({ ...s, after: file })),
    validate: validateWorkImage,
    onInvalid: (message) => setToast({ type: 'error', text: message }),
  })

  const [editWorkBeforeFile, setEditWorkBeforeFile] = useState(null)
  const {
    inputRef: editWorkBeforeInputRef,
    previewUrl: editWorkBeforePreviewUrl,
    open: openEditWorkBeforePicker,
    onChange: onEditWorkBeforeChange,
    clear: clearEditWorkBeforeFile,
  } = useImageFilePicker({
    onFileSelected: setEditWorkBeforeFile,
    validate: validateWorkImage,
    onInvalid: (message) => setToast({ type: 'error', text: message }),
  })

  const [editWorkAfterFile, setEditWorkAfterFile] = useState(null)
  const {
    inputRef: editWorkAfterInputRef,
    previewUrl: editWorkAfterPreviewUrl,
    open: openEditWorkAfterPicker,
    onChange: onEditWorkAfterChange,
    clear: clearEditWorkAfterFile,
  } = useImageFilePicker({
    onFileSelected: setEditWorkAfterFile,
    validate: validateWorkImage,
    onInvalid: (message) => setToast({ type: 'error', text: message }),
  })

  function validateCategoryImage(file) {
    if (!file) return { ok: true }
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
    const allowedExt = /\.(jpe?g|png|webp)$/i
    if (file.size > 2 * 1024 * 1024) return { ok: false, message: 'Category image must be <= 2MB.' }
    if (file.type && !allowedTypes.has(file.type)) return { ok: false, message: 'Only .jpg, .png, and .webp are allowed.' }
    if (!file.type && !allowedExt.test(file.name || '')) return { ok: false, message: 'Only .jpg, .png, and .webp are allowed.' }
    return { ok: true }
  }

  function validateWorkImage(file) {
    if (!file) return { ok: true }
    if (file.size > 15 * 1024 * 1024) return { ok: false, message: 'Image must be <= 15MB.' }
    if (file.type && !String(file.type).startsWith('image/')) return { ok: false, message: 'Please select an image file.' }
    return { ok: true }
  }

  function resetEditCategoryImage() {
    clearEditCategoryImage()
  }

  function resetEditWorkImages() {
    clearEditWorkBeforeFile()
    clearEditWorkAfterFile()
  }

  function resetNewWorkForm(formEl) {
    setNewItem({ title: '', description: '', category: '', before: null, after: null })
    clearBeforeFile()
    clearAfterFile()
    formEl?.reset?.()
  }

  function resetNewCategoryForm(formEl) {
    clearCategoryImage()
    formEl?.reset?.()
  }

  function startEditCategory(cat) {
    setEditingCategoryId(cat.id)
    setEditCategoryForm({ name: cat.name || '', description: cat.description || '' })
    resetEditCategoryImage()
  }

  function cancelEditCategory() {
    setEditingCategoryId(null)
    setEditCategoryForm({ name: '', description: '' })
    resetEditCategoryImage()
  }

  function startEditWork(work) {
    setEditingWorkId(work.id)
    setEditWorkForm({ title: work.title || '', description: work.description || '' })
    resetEditWorkImages()
  }

  function cancelEditWork() {
    setEditingWorkId(null)
    setEditWorkForm({ title: '', description: '' })
    resetEditWorkImages()
  }

  async function onSubmitNewItem(e) {
    e.preventDefault()
    if (!newItem.category) {
      setToast({ type: 'error', text: 'Please select a category.' })
      return
    }
    if (!newItem.before || !newItem.after) {
      setToast({ type: 'error', text: 'Please select both Before and After photos.' })
      return
    }
    const fd = new FormData()
    fd.append('title', newItem.title)
    fd.append('description', newItem.description)
    fd.append('category', newItem.category)
    fd.append('beforeImage', newItem.before)
    fd.append('afterImage', newItem.after)
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
        .admin-media-pill { z-index: 3; pointer-events: none; }
        .admin-file-input { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
        .admin-upload-box { position: relative; border-radius: 14px; border: 1.2px dashed rgba(255,255,255,0.18); background: rgba(10,10,10,0.40); min-height: 220px; display: grid; place-items: center; overflow: hidden; cursor: pointer; transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
        @media (hover: hover) and (pointer: fine) {
          .admin-upload-box:hover { border-color: rgba(200,144,42,0.65); background: rgba(10,10,10,0.55); transform: translateY(-1px); }
        }
        .admin-upload-inner { position: relative; z-index: 2; display: grid; gap: 10px; text-align: center; padding: 18px; color: rgba(255,255,255,0.86); }
        .admin-upload-icon { width: 44px; height: 44px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.12); background: rgba(0,0,0,0.25); display: grid; place-items: center; margin: 0 auto; }
        .admin-upload-title { font-size: 14px; font-weight: 650; }
        .admin-upload-sub { font-size: 12px; color: rgba(255,255,255,0.65); line-height: 1.5; }
        .admin-upload-preview { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
        .admin-upload-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .admin-upload-actions { position: absolute; inset: 0; z-index: 3; display: flex; align-items: flex-start; justify-content: flex-end; padding: 10px; gap: 8px; pointer-events: none; }
        .admin-upload-action { width: 34px; height: 34px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.22); background: rgba(0,0,0,0.55); color: #fff; cursor: pointer; display: grid; place-items: center; line-height: 1; }
        .admin-upload-action:hover { background: rgba(0,0,0,0.72); }
        .admin-upload-action { pointer-events: auto; }
        .admin-upload-chip { position: absolute; left: 12px; bottom: 12px; z-index: 2; padding: 8px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.16); background: rgba(0,0,0,0.40); color: rgba(255,255,255,0.92); font-size: 12px; letter-spacing: 0.4px; pointer-events: none; }
        .admin-cat-row { border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px; background: rgba(10,10,10,0.40); display: flex; justify-content: space-between; gap: 12px; }
        .admin-cat-left { flex: 1; min-width: 0; display: flex; gap: 12px; align-items: flex-start; }
        .admin-cat-text { flex: 1; min-width: 0; display: grid; gap: 6px; }
        .admin-cat-name { font-size: 16px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .admin-cat-desc { color: #A1A1A1; font-size: 14px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .admin-actions-row { display: flex; gap: 8px; align-items: center; justify-content: flex-end; }
        .admin-cat-actions { flex-shrink: 0; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; }
        .admin-work-actions { flex-shrink: 0; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; }
        .admin-work-desc { color: #A1A1A1; font-size: 14px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .admin-img-change { position: absolute; top: 10px; right: 10px; z-index: 4; width: 36px; height: 36px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.22); background: rgba(0,0,0,0.55); color: #fff; cursor: pointer; display: grid; place-items: center; }
        .admin-img-change:hover { background: rgba(0,0,0,0.72); }
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
                              key={editingWorkId === item.id && editWorkBeforePreviewUrl ? `preview:${editWorkBeforePreviewUrl}` : `remote:${item.before_url}`}
                              src={editingWorkId === item.id && editWorkBeforePreviewUrl ? editWorkBeforePreviewUrl : item.before_url}
                              alt="Before"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              loading="lazy"
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,23,23,0.20)' }} />
                            <div className="admin-media-pill">BEFORE</div>
                            {editingWorkId === item.id && (
                              <>
                                <input
                                  ref={editWorkBeforeInputRef}
                                  className="admin-file-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={onEditWorkBeforeChange}
                                />
                                <button
                                  type="button"
                                  className="admin-img-change"
                                  onClick={openEditWorkBeforePicker}
                                  aria-label="Change before image"
                                >
                                  <Icon name="camera" />
                                </button>
                              </>
                            )}
                          </div>
                          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                            <img
                              key={editingWorkId === item.id && editWorkAfterPreviewUrl ? `preview:${editWorkAfterPreviewUrl}` : `remote:${item.after_url}`}
                              src={editingWorkId === item.id && editWorkAfterPreviewUrl ? editWorkAfterPreviewUrl : item.after_url}
                              alt="After"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              loading="lazy"
                            />
                            <div className="admin-media-pill after">AFTER</div>
                            {editingWorkId === item.id && (
                              <>
                                <input
                                  ref={editWorkAfterInputRef}
                                  className="admin-file-input"
                                  type="file"
                                  accept="image/*"
                                  onChange={onEditWorkAfterChange}
                                />
                                <button
                                  type="button"
                                  className="admin-img-change"
                                  onClick={openEditWorkAfterPicker}
                                  aria-label="Change after image"
                                >
                                  <Icon name="camera" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                      <div
                        style={{
                          padding: '18px 18px',
                          borderTop: '1.12px solid #262626',
                          background: 'rgba(23,23,23,0.95)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'stretch',
                          gap: 12,
                          minHeight: 140,
                        }}
                      >
                        <div style={{ display: 'grid', gap: 6, flex: 1 }}>
                          <div style={{ color: '#FE9A00', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 500 }}>
                            {item.category || 'uncategorized'}
                          </div>
                          {editingWorkId === item.id ? (
                            <>
                              <input
                                value={editWorkForm.title}
                                onChange={(e) => setEditWorkForm((s) => ({ ...s, title: e.target.value }))}
                                style={{ ...styles.input, padding: '10px 12px' }}
                                placeholder="Title"
                                required
                              />
                              <textarea
                                value={editWorkForm.description}
                                onChange={(e) => setEditWorkForm((s) => ({ ...s, description: e.target.value }))}
                                style={{
                                  ...styles.input,
                                  padding: '10px 12px',
                                  minHeight: 74,
                                  maxHeight: 180,
                                  overflowY: 'auto',
                                  resize: 'vertical',
                                }}
                                placeholder="Description (optional)"
                              />
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: 20, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.title}
                              </div>
                              {item.description && <div className="admin-work-desc">{item.description}</div>}
                            </>
                          )}
                        </div>
                        <div className="admin-work-actions">
                          {editingWorkId === item.id ? (
                            <>
                              <div className="admin-actions-row" style={{ marginTop: 'auto' }}>
                                <button
                                  type="button"
                                  style={{
                                    ...styles.button,
                                    opacity: updateWorkMutation.isPending ? 0.7 : 1,
                                    cursor: updateWorkMutation.isPending ? 'not-allowed' : 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                  onClick={() => {
                                    const fd = new FormData()
                                    fd.append('title', editWorkForm.title)
                                    fd.append('description', editWorkForm.description || '')
                                    if (editWorkBeforeFile) fd.append('before', editWorkBeforeFile)
                                    if (editWorkAfterFile) fd.append('after', editWorkAfterFile)
                                    updateWorkMutation.mutate({ id: item.id, data: fd })
                                  }}
                                  disabled={updateWorkMutation.isPending}
                                >
                                  {item.id === savingWorkId ? 'Saving…' : 'Save'}
                                </button>
                                <button type="button" style={styles.buttonSubtle} onClick={cancelEditWork}>
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="admin-actions-row" style={{ marginTop: 'auto' }}>
                                <button
                                  type="button"
                                  style={{
                                    ...styles.buttonSubtle,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    whiteSpace: 'nowrap',
                                  }}
                                  onClick={() => startEditWork(item)}
                                  disabled={deleteMutation.isPending || updateWorkMutation.isPending}
                                >
                                  <Icon name="edit" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  style={{
                                    ...styles.buttonDanger,
                                    opacity: deleteMutation.isPending ? 0.7 : 1,
                                    cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                  onClick={() => deleteMutation.mutate(item.id)}
                                  disabled={deleteMutation.isPending || updateWorkMutation.isPending}
                                >
                                  {item.id === deletingId ? 'Deleting…' : 'Delete'}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
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
                          if (e.key === 'Enter' || e.key === ' ') openBeforePicker(e)
                        }}
                        onClick={openBeforePicker}
                        onDragOver={(e) => {
                          e.preventDefault()
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const file = e.dataTransfer?.files?.[0]
                          if (file) selectBeforeFile(file)
                        }}
                      >
                        <input
                          ref={beforeInputRef}
                          className="admin-file-input"
                          type="file"
                          accept="image/*"
                          onChange={onBeforeChange}
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
                              <img key={`preview:${beforePreviewUrl}`} src={beforePreviewUrl} alt="Before preview" />
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,23,23,0.18)' }} />
                              <div className="admin-media-pill">BEFORE</div>
                              <div className="admin-upload-chip">Click to change</div>
                            </div>
                            <div className="admin-upload-actions">
                              <button
                                className="admin-upload-action"
                                type="button"
                                onClick={clearBeforeFile}
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
                          if (e.key === 'Enter' || e.key === ' ') openAfterPicker(e)
                        }}
                        onClick={openAfterPicker}
                        onDragOver={(e) => {
                          e.preventDefault()
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          const file = e.dataTransfer?.files?.[0]
                          if (file) selectAfterFile(file)
                        }}
                      >
                        <input
                          ref={afterInputRef}
                          className="admin-file-input"
                          type="file"
                          accept="image/*"
                          onChange={onAfterChange}
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
                              <img key={`preview:${afterPreviewUrl}`} src={afterPreviewUrl} alt="After preview" />
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,23,23,0.18)' }} />
                              <div className="admin-media-pill after">AFTER</div>
                              <div className="admin-upload-chip">Click to change</div>
                            </div>
                            <div className="admin-upload-actions">
                              <button
                                className="admin-upload-action"
                                type="button"
                                onClick={clearAfterFile}
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
                      disabled={
                        createMutation.isPending ||
                        categoriesQuery.isLoading ||
                        (categoriesQuery.data || []).length === 0 ||
                        !newItem.category ||
                        !newItem.before ||
                        !newItem.after
                      }
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
                      className="admin-cat-row"
                    >
                      <div className="admin-cat-left">
                        <div
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: `1px solid ${styles.border}`,
                            background: 'rgba(0,0,0,0.25)',
                            flexShrink: 0,
                            position: 'relative',
                          }}
                        >
                          {(editingCategoryId === cat.id && editCategoryImagePreviewUrl ? editCategoryImagePreviewUrl : cat.img_categories) ? (
                            <img
                              key={editingCategoryId === cat.id && editCategoryImagePreviewUrl ? `preview:${editCategoryImagePreviewUrl}` : `remote:${cat.img_categories}`}
                              src={editingCategoryId === cat.id && editCategoryImagePreviewUrl ? editCategoryImagePreviewUrl : cat.img_categories}
                              alt={cat.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              loading="lazy"
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'rgba(255,255,255,0.65)' }}>
                              <Icon name="image" />
                            </div>
                          )}
                          {editingCategoryId === cat.id && (
                            <>
                              <input
                                ref={editCategoryImageInputRef}
                                className="admin-file-input"
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                onChange={onEditCategoryImageChange}
                              />
                              <button
                                type="button"
                                className="admin-img-change"
                                style={{ width: 30, height: 30, top: 8, right: 8 }}
                                onClick={openEditCategoryPicker}
                                aria-label="Change category image"
                              >
                                <Icon name="camera" />
                              </button>
                            </>
                          )}
                        </div>

                        <div className="admin-cat-text">
                          {editingCategoryId === cat.id ? (
                            <>
                              <input
                                value={editCategoryForm.name}
                                onChange={(e) => setEditCategoryForm((s) => ({ ...s, name: e.target.value }))}
                                style={{ ...styles.input, padding: '10px 12px' }}
                                placeholder="Category name"
                                required
                              />
                              <textarea
                                value={editCategoryForm.description}
                                onChange={(e) => setEditCategoryForm((s) => ({ ...s, description: e.target.value }))}
                                style={{
                                  ...styles.input,
                                  padding: '10px 12px',
                                  minHeight: 74,
                                  maxHeight: 140,
                                  overflowY: 'auto',
                                  resize: 'vertical',
                                }}
                                placeholder="Description (optional)"
                              />
                            </>
                          ) : (
                            <>
                              <div className="admin-cat-name">{cat.name}</div>
                              {cat.description && <div className="admin-cat-desc">{cat.description}</div>}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="admin-cat-actions">
                        {editingCategoryId === cat.id ? (
                          <>
                            <div className="admin-actions-row" style={{ marginTop: 'auto' }}>
                              <button
                                type="button"
                                style={{
                                  ...styles.button,
                                  opacity: updateCategoryMutation.isPending ? 0.7 : 1,
                                  cursor: updateCategoryMutation.isPending ? 'not-allowed' : 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                                onClick={() => {
                                  const fd = new FormData()
                                  fd.append('name', editCategoryForm.name)
                                  fd.append('description', editCategoryForm.description || '')
                                  if (editCategoryImageFile) fd.append('image', editCategoryImageFile)
                                  updateCategoryMutation.mutate({ id: cat.id, data: fd })
                                }}
                                disabled={updateCategoryMutation.isPending}
                              >
                                {cat.id === savingCatId ? 'Saving…' : 'Save'}
                              </button>
                              <button type="button" style={styles.buttonSubtle} onClick={cancelEditCategory}>
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="admin-actions-row" style={{ marginTop: 'auto' }}>
                              <button
                                type="button"
                                style={{
                                  ...styles.buttonSubtle,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  whiteSpace: 'nowrap',
                                }}
                                onClick={() => startEditCategory(cat)}
                                disabled={deleteCategoryMutation.isPending || updateCategoryMutation.isPending}
                              >
                                <Icon name="edit" />
                                Edit
                              </button>
                              <button
                                type="button"
                                style={{
                                  ...styles.buttonDanger,
                                  opacity: deleteCategoryMutation.isPending ? 0.7 : 1,
                                  cursor: deleteCategoryMutation.isPending ? 'not-allowed' : 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                                onClick={() => deleteCategoryMutation.mutate(cat.id)}
                                disabled={deleteCategoryMutation.isPending || updateCategoryMutation.isPending}
                              >
                                {cat.id === deletingCatId ? 'Deleting…' : 'Delete'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const form = new FormData(e.currentTarget)
                    const name = String(form.get('name') || '').trim()
                    const description = String(form.get('description') || '').trim()
                    const fd = new FormData()
                    fd.append('name', name)
                    fd.append('description', description)
                    if (categoryImageFile) fd.append('image', categoryImageFile)
                    await createCategoryMutation.mutateAsync(fd)
                    resetNewCategoryForm(e.currentTarget)
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
                  <Field label="Category Image">
                    <div
                      className="admin-upload-box"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') openCategoryPicker(e)
                      }}
                      onClick={openCategoryPicker}
                      onDragOver={(e) => {
                        e.preventDefault()
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const file = e.dataTransfer?.files?.[0]
                        if (file) selectCategoryImageFile(file)
                      }}
                      style={{ minHeight: 180 }}
                    >
                      <input
                        ref={categoryImageInputRef}
                        className="admin-file-input"
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                        onChange={onCategoryImageChange}
                      />

                      {!categoryImagePreviewUrl && (
                        <div className="admin-upload-inner">
                          <div className="admin-upload-icon" aria-hidden="true">
                            <Icon name="image" />
                          </div>
                          <div className="admin-upload-title">Click to upload category image</div>
                          <div className="admin-upload-sub">JPG, PNG, or WEBP • max 2MB • square recommended</div>
                        </div>
                      )}

                      {categoryImagePreviewUrl && (
                        <>
                          <div className="admin-upload-preview">
                            <img key={`preview:${categoryImagePreviewUrl}`} src={categoryImagePreviewUrl} alt="Category preview" />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(23,23,23,0.18)' }} />
                            <div className="admin-upload-chip">Click to change</div>
                          </div>
                          <div className="admin-upload-actions">
                            <button
                              className="admin-upload-action"
                              type="button"
                              onClick={clearCategoryImage}
                              aria-label="Remove category image"
                            >
                              ×
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </Field>
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
