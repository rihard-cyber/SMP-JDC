/**
 * =======================================================
 *   SMPJDC - Found Items / Lost & Found (Penemuan Barang)
 *   Component: FoundItems.jsx
 *   Signed by: Richard Meha (by -Richard)
 *   Description: Manage lost & found items with photo, claim workflow
 * =======================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Package, Archive, Search, Filter, Plus, Edit, Trash2, Eye, 
  CheckCircle, XCircle, AlertCircle, Info, Camera, Image,
  Download, Upload, Mail, Phone, User, Clock, Calendar,
  Tag, MapPin, Shield, ArrowRight, ArrowLeft, RefreshCw,
  ChevronDown, ChevronUp, MoreVertical, Printer, FileText
} from 'lucide-react';
import { compressImage } from '../utils/image';
import { hapticLight } from '../utils/haptics';
import ConfirmModal from './ConfirmModal';

const STATUS_OPTIONS = [
  { value: 'Ditemukan', label: 'Ditemukan', color: 'bg-blue-500', icon: Package },
  { value: 'Diklaim', label: 'Diklaim', color: 'bg-yellow-500', icon: AlertCircle },
  { value: 'Diambil', label: 'Diambil', color: 'bg-green-500', icon: CheckCircle },
  { value: 'Diserahkan', label: 'Diserahkan', color: 'bg-purple-500', icon: Archive },
  { value: 'Dihapus', label: 'Dihapus', color: 'bg-gray-500', icon: XCircle },
];

const JENIS_BARANG = [
  'Elektronik', 'Aksesoris', 'Dokumen', 'Pakaian', 
  'Tas/Dompet', 'Kunci', 'Kartu Akses', 'Lainnya'
];

const KATEGORI_BARANG = [
  { value: 'Value tinggi', label: 'Value Tinggi (>1jt)', color: 'bg-red-100 text-red-700' },
  { value: 'Value sedang', label: 'Value Sedang (100rb-1jt)', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Value rendah', label: 'Value Rendah (<100rb)', color: 'bg-green-100 text-green-700' },
  { value: 'Dokumentasi', label: 'Dokumentasi Penting', color: 'bg-blue-100 text-blue-700' },
];

const KATEGORI_PENEMU = [
  'Security', 'Cleaning', 'Tenant', 'Pengunjung', 'Staff Teknik', 'Lainnya'
];

export default function FoundItems({ 
  foundItems = [], 
  users = [], 
  currentUser,
  onAddFoundItem,
  onUpdateFoundItem,
  onDeleteFoundItem,
  onUpdateFoundItemStatus,
  isClient = false
}) {
  const [activeTab, setActiveTab] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [formData, setFormData] = useState({
    nama_barang: '',
    jenis_barang: '',
    kategori_barang: '',
    lokasi_penemuan: '',
    nama_penemu: '',
    kategori_penemu: 'Security',
    kontak_penemu: '',
    keterangan_penemu: '',
    foto_barang: '',
    photos: [],
  });
  const [claimData, setClaimData] = useState({
    nama_pengambil: '',
    kontak_pengambil: '',
    no_identitas_pengambil: '',
    foto_identitas: '',
    diserahkan_oleh: '',
    catatan_serah_terima: '',
  });
  const [cameraMode, setCameraMode] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Auto-clear toasts
  useEffect(() => {
    toasts.forEach(toast => {
      setTimeout(() => removeToast(toast.id), 3000);
    });
  }, [toasts]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Reset form when opening/closing
  useEffect(() => {
    if (!showForm && !editingItem) {
      setFormData({
        nama_barang: '',
        jenis_barang: '',
        kategori_barang: '',
        lokasi_penemuan: '',
        nama_penemu: currentUser?.nama || '',
        kategori_penemu: 'Security',
        kontak_penemu: currentUser?.nomor_hp || currentUser?.nomorHp || '',
        keterangan_penemu: '',
        foto_barang: '',
        photos: [],
      });
      setEditingItem(null);
      setCameraMode(false);
      setPhotoPreview(null);
      setActivePhotoIndex(0);
    }
    if (editingItem) {
      setFormData({
        nama_barang: editingItem.nama_barang || '',
        jenis_barang: editingItem.jenis_barang || '',
        kategori_barang: editingItem.kategori_barang || '',
        lokasi_penemuan: editingItem.lokasi_penemuan || '',
        nama_penemu: editingItem.nama_penemu || '',
        kategori_penemu: editingItem.kategori_penemu || 'Security',
        kontak_penemu: editingItem.kontak_penemu || '',
        keterangan_penemu: editingItem.keterangan_penemu || '',
        foto_barang: editingItem.foto_barang || '',
        photos: editingItem.photos || [],
      });
      setCameraMode(false);
      setPhotoPreview(null);
      setActivePhotoIndex(0);
    }
  }, [showForm, editingItem, currentUser]);

  // Filter items
  const filteredItems = useMemo(() => {
    let items = [...foundItems].sort((a, b) => new Date(b.tanggal_penemuan || 0) - new Date(a.tanggal_penemuan || 0));
    
    if (activeTab !== 'semua') {
      items = items.filter(f => f.status === activeTab);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(f => 
        (f.nama_barang || '').toLowerCase().includes(q) ||
        (f.item_code || '').toLowerCase().includes(q) ||
        (f.jenis_barang || '').toLowerCase().includes(q) ||
        (f.lokasi_penemuan || '').toLowerCase().includes(q) ||
        (f.nama_penemu || '').toLowerCase().includes(q) ||
        (f.nama_pengambil || '').toLowerCase().includes(q)
      );
    }
    
    return items;
  }, [foundItems, activeTab, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    total: foundItems.length,
    ditemukan: foundItems.filter(f => f.status === 'Ditemukan').length,
    diklaim: foundItems.filter(f => f.status === 'Diklaim').length,
    diambil: foundItems.filter(f => f.status === 'Diambil').length,
    diserahkan: foundItems.filter(f => f.status === 'Diserahkan').length,
  }), [foundItems]);

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      addToast('File harus berupa gambar', 'danger');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      addToast('Ukuran file maksimal 5MB', 'danger');
      return;
    }

    try {
      const compressed = await compressImage(file, 800, 0.7);
      if (field === 'foto_barang') {
        setFormData(prev => ({ ...prev, foto_barang: compressed }));
      } else if (field === 'foto_identitas') {
        setClaimData(prev => ({ ...prev, foto_identitas: compressed }));
      } else if (field === 'photos') {
        setFormData(prev => ({ ...prev, photos: [...prev.photos, compressed] }));
      }
      addToast('Foto berhasil ditambahkan', 'success');
    } catch (err) {
      addToast(`Gagal memproses foto: ${err.message}`, 'danger');
    }
  };

  const handleCameraCapture = async (field) => {
    try {
      const { Camera } = await import('@capacitor/camera');
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: true,
        resultType: 'dataUrl',
        source: 'camera',
        saveToGallery: false,
      });
      
      const dataUrl = photo.dataUrl;
      if (field === 'foto_barang') {
        setFormData(prev => ({ ...prev, foto_barang: dataUrl }));
      } else if (field === 'foto_identitas') {
        setClaimData(prev => ({ ...prev, foto_identitas: dataUrl }));
      } else if (field === 'photos') {
        setFormData(prev => ({ ...prev, photos: [...prev.photos, dataUrl] }));
      }
      addToast('Foto berhasil diambil', 'success');
    } catch (err) {
      if (!err.message?.includes('cancelled')) {
        addToast(`Gagal ambil foto: ${err.message}`, 'danger');
      }
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    hapticLight();
    
    if (!formData.nama_barang || !formData.jenis_barang || !formData.lokasi_penemuan) {
      addToast('Nama barang, jenis, dan lokasi wajib diisi', 'danger');
      return;
    }

    const itemData = {
      ...formData,
      photos: formData.photos.length > 0 ? formData.photos : undefined,
    };

    if (editingItem) {
      onUpdateFoundItem(editingItem.id, itemData);
      addToast('Data barang temuan diperbarui', 'success');
    } else {
      await onAddFoundItem(itemData);
    }
    
    setShowForm(false);
    setEditingItem(null);
  };

  const handleClaim = (item) => {
    setClaimData({
      nama_pengambil: '',
      kontak_pengambil: '',
      no_identitas_pengambil: '',
      foto_identitas: '',
      diserahkan_oleh: currentUser?.nama || '',
      catatan_serah_terima: '',
    });
    setShowConfirm({
      title: 'Konfirmasi Pengambilan Barang',
      message: <>Barang <strong>{item.nama_barang}</strong> (Kode: {item.item_code}) akan ditandai sebagai <strong>Diambil</strong>.<br/>Isi data pengambil di bawah ini.</>,
      confirmLabel: 'Proses Pengambilan',
      variant: 'success',
      showClaimForm: true,
      item,
      claimData,
      setClaimData,
      onConfirm: async () => {
        if (!claimData.nama_pengambil || !claimData.kontak_pengambil || !claimData.no_identitas_pengambil) {
          addToast('Nama, kontak, dan no identitas pengambil wajib diisi', 'danger');
          return false;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const updates = {
          status: 'Diambil',
          nama_pengambil: claimData.nama_pengambil,
          kontak_pengambil: claimData.kontak_pengambil,
          no_identitas_pengambil: claimData.no_identitas_pengambil,
          foto_identitas: claimData.foto_identitas,
          diserahkan_oleh: claimData.diserahkan_oleh,
          tanggal_pengambilan: today,
          catatan_serah_terima: claimData.catatan_serah_terima,
        };
        
        onUpdateFoundItemStatus(item.id, 'Diambil', updates);
        addToast('Barang berhasil diserahkan ke pengambil', 'success');
        setShowConfirm(null);
        return true;
      },
      onCancel: () => setShowConfirm(null),
    });
  };

  const handleHandover = (item) => {
    setShowConfirm({
      title: 'Serahkan ke Manajemen/Pihak Berwajib',
      message: <>Barang <strong>{item.nama_barang}</strong> akan ditandai sebagai <strong>Diserahkan</strong> ke manajemen/pihak berwajib.</>,
      confirmLabel: 'Serahkan',
      variant: 'primary',
      onConfirm: () => {
        onUpdateFoundItemStatus(item.id, 'Diserahkan', { 
          diserahkan_oleh: currentUser?.nama || '',
          keterangan: 'Diserahkan ke manajemen/pihak berwajib',
        });
        addToast('Barang telah diserahkan ke manajemen', 'success');
        setShowConfirm(null);
      },
      onCancel: () => setShowConfirm(null),
    });
  };

  const handleDelete = (item) => {
    setShowConfirm({
      title: 'Hapus Data Barang',
      message: <>Yakin hapus data <strong>{item.nama_barang}</strong> (Kode: {item.item_code})?<br/>Data yang dihapus tidak bisa dikembalikan.</>,
      confirmLabel: 'Hapus',
      variant: 'danger',
      onConfirm: () => {
        onDeleteFoundItem(item.id);
        addToast('Data barang temuan dihapus', 'success');
        setShowConfirm(null);
      },
      onCancel: () => setShowConfirm(null),
    });
  };

  const handleView = (item) => {
    setViewingItem(item);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const getStatusConfig = (status) => {
    return STATUS_OPTIONS.find(s => s.value === status) || { value: status, label: status, color: 'bg-gray-500', icon: Info };
  };

  const getKategoriConfig = (kat) => {
    return KATEGORI_BARANG.find(k => k.value === kat) || { value: kat, label: kat, color: 'bg-gray-100 text-gray-700' };
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { 
        day: '2-digit', month: 'short', year: 'numeric' 
      });
    } catch { return dateStr; }
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '-';
    return timeStr;
  };

  return (
    <div className="found-items-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            <Package className="inline mr-2" size={24} />
            Penemuan Barang (Lost & Found)
          </h1>
          <p className="page-subtitle">Kelola barang temuan, klaim, dan serah terima</p>
        </div>
        <div className="header-right">
          <button 
            className="btn-primary" 
            onClick={() => { setEditingItem(null); setShowForm(true); }}
          >
            <Plus size={18} className="mr-1" /> Catat Barang Temuan
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Barang</span>
          </div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.ditemukan}</span>
            <span className="stat-label">Ditemukan</span>
          </div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-icon"><AlertCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.diklaim}</span>
            <span className="stat-label">Diklaim</span>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon"><CheckCircle size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.diambil}</span>
            <span className="stat-label">Diambil</span>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon"><Archive size={24} /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.diserahkan}</span>
            <span className="stat-label">Diserahkan</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Cari nama barang, kode, lokasi, penemu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-tabs">
          {[
            { key: 'semua', label: 'Semua', count: stats.total },
            { key: 'Ditemukan', label: 'Ditemukan', count: stats.ditemukan },
            { key: 'Diklaim', label: 'Diklaim', count: stats.diklaim },
            { key: 'Diambil', label: 'Diambil', count: stats.diambil },
            { key: 'Diserahkan', label: 'Diserahkan', count: stats.diserahkan },
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <span className="tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="items-container">
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <Archive size={64} className="empty-icon" />
            <h3>Tidak ada data barang temuan</h3>
            <p>{activeTab !== 'semua' ? `Tidak ada barang dengan status "${activeTab}"` : 'Belum ada barang temuan yang dicatat'}</p>
            {activeTab === 'semua' && (
              <button className="btn-primary mt-4" onClick={() => setShowForm(true)}>
                <Plus size={18} className="mr-1" /> Catat Barang Temuan Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item, index) => {
              const StatusConfig = getStatusConfig(item.status);
              const KategoriConfig = getKategoriConfig(item.kategori_barang);
              const StatusIcon = StatusConfig.icon;
              
              return (
                <div key={item.id} className="item-card" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Photo Preview */}
                  <div className="item-image">
                    {item.foto_barang ? (
                      <img 
                        src={item.foto_barang} 
                        alt={item.nama_barang}
                        onClick={() => handleView(item)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="no-image" onClick={() => handleView(item)}>
                        <Package size={32} />
                      </div>
                    )}
                    <div className="item-status-badge" style={{ backgroundColor: StatusConfig.color.replace('bg-', '').replace('-500', '') }}>
                      <StatusIcon size={12} className="mr-1" />
                      {StatusConfig.label}
                    </div>
                    {item.photos && item.photos.length > 0 && (
                      <span className="photo-count-badge">
                        <Image size={12} className="mr-1" /> +{item.photos.length}
                      </span>
                    )}
                  </div>

                  <div className="item-content">
                    <div className="item-header">
                      <h3 className="item-name">{item.nama_barang}</h3>
                      <span className="item-code">{item.item_code}</span>
                    </div>
                    
                    <div className="item-meta">
                      <span className="meta-tag">
                        <Tag size={12} className="mr-1" /> {item.jenis_barang}
                      </span>
                      <span className={`meta-tag ${KategoriConfig.color}`}>
                        {KategoriConfig.label}
                      </span>
                    </div>

                    <div className="item-details">
                      <div className="detail-row">
                        <MapPin size={14} className="detail-icon" />
                        <span>{item.lokasi_penemuan}</span>
                      </div>
                      <div className="detail-row">
                        <Calendar size={14} className="detail-icon" />
                        <span>{formatDate(item.tanggal_penemuan)} · {formatTime(item.jam_penemuan)}</span>
                      </div>
                      <div className="detail-row">
                        <User size={14} className="detail-icon" />
                        <span>{item.nama_penemu} ({item.kategori_penemu})</span>
                      </div>
                      {item.kontak_penemu && (
                        <div className="detail-row">
                          <Phone size={14} className="detail-icon" />
                          <span>{item.kontak_penemu}</span>
                        </div>
                      )}
                    </div>

                    {/* Claim/Handover Info */}
                    {item.status === 'Diambil' && (
                      <div className="claim-info">
                        <div className="claim-row">
                          <User size={14} /> Diambil oleh: <strong>{item.nama_pengambil}</strong>
                        </div>
                        <div className="claim-row">
                          <Phone size={14} /> {item.kontak_pengambil} · ID: {item.no_identitas_pengambil}
                        </div>
                        <div className="claim-row">
                          <Calendar size={14} /> {formatDate(item.tanggal_pengambilan)} · Diserahkan oleh: {item.diserahkan_oleh}
                        </div>
                      </div>
                    )}

                    {item.status === 'Diserahkan' && (
                      <div className="claim-info">
                        <div className="claim-row">
                          <Shield size={14} /> Diserahkan ke manajemen/pihak berwajib
                        </div>
                        <div className="claim-row">
                          <User size={14} /> Oleh: {item.diserahkan_oleh}
                        </div>
                        {item.keterangan && (
                          <div className="claim-row">
                            <Info size={14} /> {item.keterangan}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="item-actions">
                      <button 
                        className="btn-action view" 
                        onClick={() => handleView(item)}
                        title="Lihat Detail"
                      >
                        <Eye size={16} />
                      </button>
                      {['Admin Super', 'Danru', 'Wadanru'].includes(currentUser?.jabatan) && (
                        <>
                          <button 
                            className="btn-action edit" 
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            disabled={item.status === 'Diambil' || item.status === 'Diserahkan'}
                          >
                            <Edit size={16} />
                          </button>
                          {item.status === 'Ditemukan' && (
                            <button 
                              className="btn-action claim" 
                              onClick={() => handleClaim(item)}
                              title="Proses Pengambilan"
                            >
                              <ArrowRight size={16} />
                            </button>
                          )}
                          {item.status === 'Diklaim' && (
                            <button 
                              className="btn-action claim" 
                              onClick={() => handleClaim(item)}
                              title="Proses Pengambilan"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {['Ditemukan', 'Diklaim'].includes(item.status) && (
                            <button 
                              className="btn-action handover" 
                              onClick={() => handleHandover(item)}
                              title="Serahkan ke Manajemen"
                            >
                              <Archive size={16} />
                            </button>
                          )}
                          <button 
                            className="btn-action delete" 
                            onClick={() => handleDelete(item)}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditingItem(null); }}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Edit Barang Temuan' : 'Catat Barang Temuan Baru'}</h2>
              <button className="modal-close" onClick={() => { setShowForm(false); setEditingItem(null); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Nama Barang <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.nama_barang}
                    onChange={e => setFormData(prev => ({ ...prev, nama_barang: e.target.value }))}
                    placeholder="Contoh: iPhone 13 Pro, Tas Hitam, Kunci Motor"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Jenis Barang <span className="required">*</span></label>
                  <select
                    value={formData.jenis_barang}
                    onChange={e => setFormData(prev => ({ ...prev, jenis_barang: e.target.value }))}
                    required
                  >
                    <option value="">Pilih jenis</option>
                    {JENIS_BARANG.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Kategori Nilai</label>
                  <select
                    value={formData.kategori_barang}
                    onChange={e => setFormData(prev => ({ ...prev, kategori_barang: e.target.value }))}
                  >
                    <option value="">Pilih kategori</option>
                    {KATEGORI_BARANG.map(k => <option key={k.value} value={k.value}>{k.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Lokasi Penemuan <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.lokasi_penemuan}
                    onChange={e => setFormData(prev => ({ ...prev, lokasi_penemuan: e.target.value }))}
                    placeholder="Contoh: Lantai 1 dekat tangga darurat B, Lobby utama"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nama Penemu</label>
                  <input
                    type="text"
                    value={formData.nama_penemu}
                    onChange={e => setFormData(prev => ({ ...prev, nama_penemu: e.target.value }))}
                    placeholder="Nama yang menemukan barang"
                  />
                </div>
                <div className="form-group">
                  <label>Kategori Penemu</label>
                  <select
                    value={formData.kategori_penemu}
                    onChange={e => setFormData(prev => ({ ...prev, kategori_penemu: e.target.value }))}
                  >
                    {KATEGORI_PENEMU.map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Kontak Penemu (WA/Telepon)</label>
                  <input
                    type="tel"
                    value={formData.kontak_penemu}
                    onChange={e => setFormData(prev => ({ ...prev, kontak_penemu: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Keterangan Penemu</label>
                  <textarea
                    value={formData.keterangan_penemu}
                    onChange={e => setFormData(prev => ({ ...prev, keterangan_penemu: e.target.value }))}
                    rows={3}
                    placeholder="Kondisi barang saat ditemukan, posisi, dll"
                  />
                </div>

                {/* Photo Section */}
                <div className="form-group full-width photo-section">
                  <label>Foto Utama Barang <span className="required">*</span></label>
                  <div className="photo-upload-area">
                    {formData.foto_barang ? (
                      <div className="photo-preview">
                        <img src={formData.foto_barang} alt="Preview" />
                        <button type="button" className="photo-remove" onClick={() => setFormData(prev => ({ ...prev, foto_barang: '' }))}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="photo-placeholder" onClick={() => setCameraMode(true)}>
                        <Camera size={32} className="mb-2" />
                        <p>Klik untuk ambil foto atau upload</p>
                        <span className="hint">Maks 5MB • JPG/PNG/WebP</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'foto_barang')} hidden id="foto_barang_input" />
                    <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'photos')} hidden id="photos_input" multiple />
                  </div>
                </div>

                {/* Additional Photos */}
                {formData.photos.length > 0 && (
                  <div className="form-group full-width">
                    <label>Foto Tambahan ({formData.photos.length})</label>
                    <div className="photos-grid">
                      {formData.photos.map((photo, idx) => (
                        <div key={idx} className="photo-thumb">
                          <img src={photo} alt={`Additional ${idx}`} />
                          <button type="button" className="photo-remove" onClick={() => removePhoto(idx)}>
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="photo-add" onClick={() => document.getElementById('photos_input').click()}>
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setShowForm(false); setEditingItem(null); }}>
                  Batal
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Simpan Perubahan' : 'Simpan Barang Temuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingItem && (
        <div className="modal-overlay" onClick={() => setViewingItem(null)}>
          <div className="modal-container large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detail Barang Temuan</h2>
              <button className="modal-close" onClick={() => setViewingItem(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body detail-view">
              <div className="detail-main">
                {viewingItem.foto_barang ? (
                  <img src={viewingItem.foto_barang} alt={viewingItem.nama_barang} className="detail-main-image" />
                ) : (
                  <div className="detail-no-image"><Package size={64} /></div>
                )}
                <div className="detail-main-info">
                  <h3>{viewingItem.nama_barang}</h3>
                  <span className="detail-code">{viewingItem.item_code}</span>
                  <div className="detail-status">
                    <StatusIcon size={16} className="mr-1" style={{ color: StatusConfig.color.replace('bg-', '').replace('-500', '') }} />
                    <span className={`status-badge ${StatusConfig.color.replace('bg-', 'text-')}`}>{StatusConfig.label}</span>
                  </div>
                  <div className="detail-kategori">
                    <Tag size={14} className="mr-1" /> {viewingItem.jenis_barang} · 
                    <span className={`kategori-badge ${KategoriConfig.color}`}>{KategoriConfig.label}</span>
                  </div>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-section">
                  <h4><MapPin size={16} className="mr-1" /> Lokasi & Waktu</h4>
                  <div className="detail-field"><span>Lokasi</span> <strong>{viewingItem.lokasi_penemuan}</strong></div>
                  <div className="detail-field"><span>Tanggal Penemuan</span> <strong>{formatDate(viewingItem.tanggal_penemuan)}</strong></div>
                  <div className="detail-field"><span>Jam Penemuan</span> <strong>{formatTime(viewingItem.jam_penemuan)}</strong></div>
                  <div className="detail-field"><span>Tanggal Laporan</span> <strong>{formatDate(viewingItem.tanggal_laporan)}</strong></div>
                </div>
                <div className="detail-section">
                  <h4><User size={16} className="mr-1" /> Penemu</h4>
                  <div className="detail-field"><span>Nama</span> <strong>{viewingItem.nama_penemu || '-'}</strong></div>
                  <div className="detail-field"><span>Kategori</span> <strong>{viewingItem.kategori_penemu || '-'}</strong></div>
                  <div className="detail-field"><span>Kontak</span> <strong>{viewingItem.kontak_penemu || '-'}</strong></div>
                  <div className="detail-field"><span>Keterangan</span> <strong>{viewingItem.keterangan_penemu || '-'}</strong></div>
                </div>
                <div className="detail-section">
                  <h4><Shield size={16} className="mr-1" /> Status & Proses</h4>
                  <div className="detail-field"><span>Status</span> <strong className={`status-badge ${StatusConfig.color.replace('bg-', 'text-')}`}>{StatusConfig.label}</strong></div>
                  {viewingItem.status === 'Diambil' && (
                    <>
                      <div className="detail-field"><span>Nama Pengambil</span> <strong>{viewingItem.nama_pengambil || '-'}</strong></div>
                      <div className="detail-field"><span>Kontak Pengambil</span> <strong>{viewingItem.kontak_pengambil || '-'}</strong></div>
                      <div className="detail-field"><span>No Identitas</span> <strong>{viewingItem.no_identitas_pengambil || '-'}</strong></div>
                      <div className="detail-field"><span>Tanggal Pengambilan</span> <strong>{formatDate(viewingItem.tanggal_pengambilan)}</strong></div>
                      <div className="detail-field"><span>Diserahkan Oleh</span> <strong>{viewingItem.diserahkan_oleh || '-'}</strong></div>
                      <div className="detail-field"><span>Catatan Serah Terima</span> <strong>{viewingItem.catatan_serah_terima || '-'}</strong></div>
                    </>
                  )}
                  {viewingItem.status === 'Diserahkan' && (
                    <>
                      <div className="detail-field"><span>Diserahkan Oleh</span> <strong>{viewingItem.diserahkan_oleh || '-'}</strong></div>
                      <div className="detail-field"><span>Keterangan</span> <strong>{viewingItem.keterangan || '-'}</strong></div>
                    </>
                  )}
                </div>
              </div>

              {viewingItem.photos && viewingItem.photos.length > 0 && (
                <div className="detail-section">
                  <h4><Image size={16} className="mr-1" /> Foto Tambahan</h4>
                  <div className="detail-photos">
                    {viewingItem.photos.map((photo, idx) => (
                      <img key={idx} src={photo} alt={`Photo ${idx}`} className="detail-photo" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal with Claim Form */}
      {showConfirm && (
        <ConfirmModal
          {...showConfirm}
          claimData={claimData}
          setClaimData={setClaimData}
          handleImageUpload={(e, field) => handleImageUpload(e, field)}
          handleCameraCapture={(field) => handleCameraCapture(field)}
        />
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <span>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)}><X size={14} /></button>
          </div>
        ))}
      </div>

      {/* Camera Mode Overlay */}
      {cameraMode && (
        <div className="camera-overlay" onClick={() => setCameraMode(false)}>
          <div className="camera-options" onClick={e => e.stopPropagation()}>
            <button className="camera-option" onClick={() => { handleCameraCapture('foto_barang'); setCameraMode(false); }}>
              <Camera size={24} className="mr-2" /> Ambil Foto (Kamera)
            </button>
            <button className="camera-option" onClick={() => { document.getElementById('foto_barang_input').click(); setCameraMode(false); }}>
              <Image size={24} className="mr-2" /> Pilih dari Galeri
            </button>
            <button className="camera-option cancel" onClick={() => setCameraMode(false)}>
              <X size={24} className="mr-2" /> Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}