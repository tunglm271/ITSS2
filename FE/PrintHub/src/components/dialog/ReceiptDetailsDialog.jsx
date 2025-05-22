import { X, FileText, Download } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { ordersAPI } from "../../services/api";
import { shopsAPI } from "../../services/api";
import * as htmlToImage from 'html-to-image';

const ReceiptDetailsDialog = ({ open, onClose, orderId }) => {
  if (!open) return null;
  const [order, setOrder] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef(null);

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
        console.log('Order data:', response.data);
        if (response.data.files) {
          console.log('Order files:', response.data.files);
        }
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

  const downloadReceiptAsImage = async () => {
    try {
      setDownloading(true);
      
      if (receiptRef.current) {
        const dataUrl = await htmlToImage.toPng(receiptRef.current, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: 'white',
          skipFonts: false,
          canvasWidth: 1200,
          canvasHeight: 1500
        });
        
        const link = document.createElement('a');
        link.download = `hoa-don-${orderId}.png`;
        link.href = dataUrl;
        link.click();
        
        setTimeout(() => {
          setDownloading(false);
          onClose();
        }, 500);
      } else {
        alert("Không thể tạo hình ảnh hóa đơn. Vui lòng thử lại sau.");
        setDownloading(false);
      }
    } catch (error) {
      console.error("Lỗi khi tạo hình ảnh:", error);
      alert("Có lỗi khi tạo hình ảnh hóa đơn. Vui lòng thử lại sau.");
      setDownloading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div
      className="fixed inset-0 bg-gray-200/75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 shrink-0">
          <h2 className="text-2xl font-bold">Chi tiết hóa đơn</h2>
          <button
            onClick={onClose}
            className="rounded-full cursor-pointer p-2 hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow custom-scrollbar pr-2">
          <div id="receipt-content" ref={receiptRef} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-center mb-3">Hóa đơn đặt in</h2>
            
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

            <div className="bg-gray-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <h3 className="font-semibold mb-2">Thông tin các file</h3>
              {order?.files?.map((file, index) => {
                console.log(`File ${index} details:`, {
                  name: file.name,
                  quantity: file.quantity,
                  size: file.size,
                  format: file.format,
                  price: file.price
                });
                return (
                  <div key={index} className="border-b last:border-0 py-3 px-2">
                    <div className="flex items-center gap-2 mb-2 bg-white p-2 rounded">
                      <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                      <span className="font-medium text-sm w-full truncate">{file.name || 'Tên file không xác định'}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>Số lượng: {file.quantity}</div>
                      <div>Kích thước: {file.size}</div>
                      <div>Định dạng: {file.format}</div>
                    </div>
                    <div className="text-right text-blue-600 font-semibold mt-1">
                      Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(file.price)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Tổng tiền:</span>
                <span className="text-blue-600 font-bold text-lg">
                  {order?.totalAmount ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(order.totalAmount) : ''}
                </span>
              </div>
              {order?.note && (
                <div className="mt-2">
                  <span className="font-semibold">Ghi chú:</span>
                  <span className="ml-2">{order.note}</span>
                </div>
              )}
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
        </div>

        <div className="flex justify-between mt-6 shrink-0">
          <button
            onClick={downloadReceiptAsImage}
            disabled={downloading}
            className={`px-4 py-2 flex items-center gap-2 text-white rounded-lg cursor-pointer ${downloading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            <Download className="w-5 h-5" />
            {downloading ? 'Đang tải...' : 'Tải xuống PNG'}
          </button>
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
