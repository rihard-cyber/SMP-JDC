import {
  LayoutDashboard,
  Target,
  FileSpreadsheet,
  ClipboardList,
  BookOpen,
  FileText,
  Menu,
  Smartphone,
  QrCode
} from 'lucide-react';

export default function BottomNav({ currentTab, onNavClick, onToggleSidebar, user }) {
  const isGuard = ['Danru', 'Wadanru', 'Anggota'].includes(user?.jabatan);
  const isGuest = user?.jabatan === 'Guest Viewer';

  const getItems = () => {
    if (isGuest) {
      return [
        { id: 'target-compliance', label: 'Target', icon: Target },
        { id: null, label: 'Menu', icon: Menu, isMenu: true },
      ];
    }
    if (isGuard) {
      return [
        { id: 'guard-simulator', label: 'Patroli', icon: Smartphone },
        { id: 'absensi', label: 'Absensi', icon: ClipboardList },
        { id: 'mutasi', label: 'Mutasi', icon: BookOpen },
        { id: 'lapor', label: 'Lapor', icon: FileText },
        { id: null, label: 'Menu', icon: Menu, isMenu: true },
      ];
    }
    return [
      { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
      { id: 'absensi', label: 'Absensi', icon: ClipboardList },
      { id: 'target-compliance', label: 'Target', icon: Target },
      { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
      { id: null, label: 'Menu', icon: Menu, isMenu: true },
    ];
  };

  const items = getItems();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        if (item.isMenu) {
          return (
            <button
              key="menu"
              className="bottom-nav-btn bottom-nav-menu"
              onClick={onToggleSidebar}
              aria-label="Buka Menu"
            >
              <Menu size={22} />
              <span>{item.label}</span>
            </button>
          );
        }
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={`bottom-nav-btn ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => onNavClick(item.id)}
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
