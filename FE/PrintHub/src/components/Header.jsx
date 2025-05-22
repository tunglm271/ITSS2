import React, { useState, useRef } from "react";
import { Search, Bell, RefreshCw } from "lucide-react";
import ReactDOM from "react-dom";

export const NotificationContext = React.createContext({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearNotifications: () => {},
});

const Header = ({ onSearch, refreshing, loading, handleRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { notifications, removeNotification, clearNotifications } = React.useContext(NotificationContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    const cache = localStorage.getItem('printhub_notifications_read');
    return cache ? JSON.parse(cache) : [];
  });
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const handleRead = (id) => {
    if (!readIds.includes(id)) {
      const newRead = [...readIds, id];
      setReadIds(newRead);
      localStorage.setItem('printhub_notifications_read', JSON.stringify(newRead));
    }
    removeNotification(id);
  };

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  React.useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (!e.target.closest('.notification-dropdown') && !e.target.closest('.notification-bell')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

  function normalizeVN(str) {
    return str
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase();
  }

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      clearTimeout(window.searchTimeout);
      window.searchTimeout = setTimeout(() => {
        onSearch(value, normalizeVN(value));
      }, 300);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      clearTimeout(window.searchTimeout);
      onSearch(searchTerm, normalizeVN(searchTerm));
    }
  };

  React.useEffect(() => {
    if (notifications.length === 0) return;
    const sorted = notifications.slice().sort((a, b) => b.createdAt - a.createdAt);
    const latest = sorted[0];
    if (!toast || toast.id !== latest.id) {
      setToast(latest);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 3000);
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [notifications]);

  const notificationDropdown = showDropdown && (
    ReactDOM.createPortal(
      <div className="fixed right-8 top-16 w-80 max-h-96 bg-white border border-gray-200 rounded-lg shadow-2xl z-[99999] notification-dropdown overflow-y-auto p-0">
        <div className="p-3 font-semibold border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <span>Thông báo</span>
          {notifications.length > 0 && (
            <button className="text-xs text-blue-600 hover:underline" onClick={clearNotifications}>Xóa tất cả</button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-gray-500 text-center">Không có thông báo nào</div>
        ) : notifications
          .slice()
          .sort((a, b) => {
            const aRead = readIds.includes(a.id);
            const bRead = readIds.includes(b.id);
            if (aRead !== bRead) return aRead ? 1 : -1;
            return b.createdAt - a.createdAt;
          })
          .map((n) => {
            const isRead = readIds.includes(n.id);
            return (
              <div key={n.id} className={`p-4 min-h-[64px] flex items-start gap-2 hover:bg-gray-100 cursor-pointer border-b last:border-0 ${isRead ? 'opacity-60' : ''}`} onClick={() => handleRead(n.id)}>
                <span className={`inline-block w-2 h-2 rounded-full mt-2 ${isRead ? 'bg-gray-300' : 'bg-blue-500'}`}></span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-blue-700 break-words">Đơn #{n.id} - {n.shopName || ''} đã được cửa hàng xác nhận!</div>
                  <div className="text-xs text-gray-500 mt-1 break-words whitespace-pre-line">Nhấn để xem hóa đơn và tải hóa đơn</div>
                </div>
                {isRead && <span className="text-xs text-gray-400 ml-2 mt-2">Đã xem</span>}
              </div>
            );
          })}
      </div>,
      document.body
    )
  );

  return (
    <div className="mb-5 w-full">
      {toast && (
        <div className="fixed top-6 right-4 z-[9999] bg-white border border-blue-200 shadow-lg rounded-lg px-6 py-4 flex items-center gap-3 animate-fade-in-up min-w-[260px] max-w-sm w-fit pointer-events-auto">
          <Bell className="text-blue-500 w-6 h-6 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-blue-700 truncate">Đơn #{toast.id} - {toast.shopName || ''}</div>
            <div className="text-xs text-gray-500 mt-1 truncate">Đơn hàng mới đã được xác nhận!</div>
          </div>
        </div>
      )}
      <div className="relative flex items-center py-4 px-4">
        <p className="text-3xl font-bold text-blue-600">PrintHub</p>
        <div className="relative ml-15 w-[770px] max-w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
          />
          {searchTerm && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSearchTerm("");
                if (onSearch) onSearch("");
              }}
            >
              ✕
            </button>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing || loading}
          className="absolute right-88 top-1/2 -translate-y-1/2 flex items-center gap-2 text-blue-600 px-6 py-2 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-150"
          title="Sử dụng khi muốn cập nhật vị trí thủ công"
        >
          <RefreshCw size={18} className={`${refreshing ? 'animate-spin' : ''}`} />
          <span className="font-semibold text-base">Làm mới vị trí</span>
        </button>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center space-x-4 pr-0 flex-shrink-0">
          <button className="text-gray-600 relative notification-bell" onClick={() => setShowDropdown((v) => !v)}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
            )}
          </button>
        </div>
      </div>
      {notificationDropdown}
      <div className="border-b border-gray-200"></div>
    </div>
  );
};

export default Header;
