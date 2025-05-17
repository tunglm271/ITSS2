import { X, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { ordersAPI } from "../../services/api";
import { shopsAPI } from "../../services/api";

const ReceiptDetailsDialog = ({ open, onClose, orderId }) => {
  if (!open) return null;
  const [order, setOrder] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersAPI.getById(orderId);
        setOrder(response.data);
        const shopResponse = await shopsAPI.getById(response.data.shopId);
        setShop(shopResponse.data);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className="fixed inset-0 bg-gray-200/75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg"
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
                <span className="font-medium">#{order?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Thời gian nhận:</span>
                <span className="font-medium">{formatDateTime(order?.pickupTime)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Thông tin các file</h3>
            {order?.files?.map((file, index) => (
              <div key={index} className="border-b last:border-0 py-2">
                <a href={file.url} target="_blank" className="flex items-center gap-2 mb-1 hover:underline">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">{file.name}</span>
                </a>
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
                <span className="font-medium max-w-3/5 text-right">{shop?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Địa chỉ:</span>
                <span className="font-medium max-w-3/5 text-right">{shop?.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số điện thoại:</span>
                <span className="font-medium max-w-3/5 text-right">{shop?.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg cursor-pointer hover:bg-gray-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDetailsDialog;
