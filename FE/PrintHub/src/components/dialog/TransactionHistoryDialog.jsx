import React, { useEffect, useState } from "react";
import { X, FileText, Eye, Search } from "lucide-react";
import ReceiptDetailsDialog from "./ReceiptDetailsDialog";
import { ordersAPI } from "../../services/api"; // Thêm dòng này

const TransactionHistoryDialog = ({ open, onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [filterDate, setFilterDate] = useState("");
  const [filterShop, setFilterShop] = useState("");
  const [shopOptions, setShopOptions] = useState([]);
  const [searchFile, setSearchFile] = useState("");
  const [fileMap, setFileMap] = useState({}); // orderId -> files

  useEffect(() => {
    if (!open) return;
    const cache = localStorage.getItem("printhub_notifications");
    if (cache) {
      try {
        const arr = JSON.parse(cache);
        setTransactions(
          arr
            .slice()
            .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        );
        const shops = Array.from(new Set(arr.map(t => t.shopName).filter(Boolean)));
        setShopOptions(shops);
        Promise.all(
          arr.map(async (t) => {
            try {
              const res = await ordersAPI.getById(t.id);
              return { orderId: t.id, files: res.data.files || [] };
            } catch {
              return { orderId: t.id, files: [] };
            }
          })
        ).then((results) => {
          const map = {};
          results.forEach(({ orderId, files }) => {
            map[orderId] = files;
          });
          setFileMap(map);
        });
      } catch {
        setTransactions([]);
        setShopOptions([]);
        setFileMap({});
      }
    } else {
      setTransactions([]);
      setShopOptions([]);
      setFileMap({});
    }
  }, [open]);

  const filteredTransactions = transactions.filter(t => {
    let match = true;
    if (filterDate) {
      match = match && t.date === filterDate;
    }
    if (filterShop) {
      match = match && t.shopName === filterShop;
    }
    if (searchFile) {
      const files = fileMap[t.id] || [];
      match = match && files.some(f =>
        (f.name || "").toLowerCase().includes(searchFile.toLowerCase())
      );
    }
    return match;
  });

  if (!open) return null;

  return (
    <>
      {selectedOrderId && (
        <ReceiptDetailsDialog
          open={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          orderId={selectedOrderId}
        />
      )}
      {!selectedOrderId && (
        <div className="fixed inset-0 bg-gray-200/75 flex items-center justify-center z-[99999]" onClick={onClose}>
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-2xl font-bold">Lịch sử giao dịch</h2>
              <button
                onClick={onClose}
                className="rounded-full cursor-pointer p-2 hover:bg-gray-100"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Bộ lọc */}
            <div className="flex gap-4 mb-4 items-end flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1">Lọc theo ngày</label>
                <input
                  type="date"
                  className="border rounded-lg px-3 py-2 text-sm w-[200px]"
                  value={filterDate}
                  onChange={e => setFilterDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lọc theo cửa hàng</label>
                <select
                  className="border rounded-lg px-3 py-2 text-sm w-[200px] min-w-0"
                  value={filterShop}
                  onChange={e => setFilterShop(e.target.value)}
                >
                  <option value="">Tất cả cửa hàng</option>
                  {shopOptions.map(shop => (
                    <option key={shop} value={shop}>{shop}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tìm theo tên file</label>
                <div className="flex items-center border rounded-lg px-2 py-1 bg-white w-[200px] h-[40px]"> 
                  <Search className="w-4 h-4 text-gray-400 mr-2" />
                  <input
                    type="text"
                    className="outline-none border-0 p-0 text-sm bg-transparent w-full h-full"
                    style={{ minWidth: 0 }}
                    placeholder="Nhập tên file..."
                    value={searchFile}
                    onChange={e => setSearchFile(e.target.value)}
                  />
                </div>
              </div>
              {(filterDate || filterShop || searchFile) && (
                <button
                  className="ml-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                  onClick={() => { setFilterDate(""); setFilterShop(""); setSearchFile(""); }}
                >
                  Xóa lọc
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-grow custom-scrollbar pr-2">
              {filteredTransactions.length === 0 ? (
                <div className="text-gray-500 text-center py-8">Chưa có giao dịch nào.</div>
              ) : (
                <ul className="divide-y">
                  {filteredTransactions.map((t) => {
                    const files = fileMap[t.id] || [];
                    const totalPrice = files.reduce((sum, f) => sum + (f.price || 0), 0);

                    return (
                      <li key={t.id} className="py-4 flex items-start gap-3">
                        <FileText className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-blue-700 truncate">
                            Đơn #{t.id} - {t.shopName || ""}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 truncate">
                            {t.date && t.time ? (
                              <>
                                Nhận lúc {t.time} {t.date}
                              </>
                            ) : null}
                          </div>
                          {t.shopAddress && (
                            <div className="text-xs text-gray-400 truncate">{t.shopAddress}</div>
                          )}
                          {files.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1 flex flex-wrap gap-2">
                              <span className="font-medium text-gray-500">File:</span>
                              {files.map((f, idx) => (
                                <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700 max-w-[180px] truncate inline-block">
                                  {f.name} {f.price ? `- ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(f.price)}` : ""}
                                </span>
                              ))}
                            </div>
                          )}
                          {files.length > 0 && (
                            <div className="text-xs text-blue-700 font-semibold mt-1">
                              Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(totalPrice)}
                            </div>
                          )}
                        </div>
                        <button
                          className="ml-2 flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-sm h-fit"
                          onClick={() => setSelectedOrderId(t.id)}
                        >
                          <Eye className="w-4 h-4" />
                          Xem chi tiết
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex justify-end mt-4 shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionHistoryDialog;