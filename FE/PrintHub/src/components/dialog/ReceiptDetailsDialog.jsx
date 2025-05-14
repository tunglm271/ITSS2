import { X, FileText } from "lucide-react";
import React from "react";

const ReceiptDetailsDialog = ({ open, onClose, order }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-gray-200/75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Chi tiết hóa đơn</h2>
          <button
            onClick={onClose}
            className="rounded-full cursor-pointer p-2 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Thông tin đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian nhận:</span>
                <span className="font-medium">
                  {order.time} – {order.date && new Date(order.date).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Thông tin các file</h3>
            {order.files?.map((file, index) => (
              <div key={index} className="border-b last:border-0 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>Số lượng: {file.quantity}</div>
                  <div>Kích thước: {file.size}</div>
                  <div>Định dạng: {file.format}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Thông tin cửa hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tên cửa hàng:</span>
                <span className="font-medium">{order.shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Địa chỉ:</span>
                <span className="font-medium">{order.shopAddress}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetailsDialog;