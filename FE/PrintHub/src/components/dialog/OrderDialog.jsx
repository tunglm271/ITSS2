import { X, Trash2, Loader2 } from "lucide-react";
import React, { useRef, useState } from "react";
import OrderSuccessDialog from "./OrderSuccessDialog";
import { uploadFile } from "../../services/cloudinary";
import { ordersAPI } from "../../services/api";
import { PDFDocument } from 'pdf-lib';
import mammoth from 'mammoth';

const defaultSizes = ["A4", "A3", "A5", "A6"];
const defaultFormats = ["Đen trắng", "Màu"];

const PRICE_PER_SHEET = {
  "A3": 0.600,
  "A4": 0.350,
  "A5": 0.250,
  "A6": 0.150
};

const OrderDialog = ({ open, onClose, shop }) => {
  const [fileList, setFileList] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const fileInputRef = useRef(null);

  if (!open) return null;

  const calculatePrice = (item) => {
    const basePrice = PRICE_PER_SHEET[item.size];
    const isColor = item.format === "Màu";
    const pricePerSheet = isColor ? basePrice * 2 : basePrice;
    const sheets = item.file.type.startsWith('image/') ? 1 : Math.ceil(item.pageCount / 2);
    const price = pricePerSheet * sheets * item.quantity;
    const decimal = price - Math.floor(price);
    let roundedPrice;
    if (price < 0.5) {
      roundedPrice = 1;
    } else {
      roundedPrice = decimal < 0.5 ? Math.floor(price) : Math.ceil(price);
    }
    const finalPrice = roundedPrice * 1000;
    console.log(`[calculatePrice] Giá gốc: ${price}, Phần thập phân: ${decimal}, Giá làm tròn: ${roundedPrice}, Giá cuối: ${finalPrice}, File: ${item.file.name}`);
    return finalPrice;
  };

  const calculateTotalPrice = () => {
    const total = fileList.reduce((total, item) => total + calculatePrice(item), 0);
    const roundedTotal = Math.round(total);
    console.log(`[calculateTotalPrice] Tổng gốc: ${total}, Tổng làm tròn: ${roundedTotal}`);
    return roundedTotal;
  };

  const formatPrice = (price) => {
    const roundedPrice = Math.floor(price);
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(roundedPrice);
  };

  const handleAddFileClick = () => {
    fileInputRef.current.click();
  };

  const getPageCount = async (file) => {
    try {
      if (file.type === 'application/pdf') {
        try {
          const buffer = await file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(buffer, { 
            updateMetadata: false,
            ignoreEncryption: true
          });
          
          const pageCount = pdfDoc.getPageCount();
          
          console.log(`PDF page count for ${file.name}: ${pageCount} pages`);
          return pageCount;
        } catch (error) {
          console.error('Error with pdf-lib:', error);
          const estimatedPages = Math.max(1, Math.ceil(file.size / (75 * 1024)));
          console.log(`PDF-lib failed for ${file.name}, using size estimate: ${estimatedPages} pages`);
          return estimatedPages;
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          const htmlContent = result.value;
          
          const pageBreaks = (htmlContent.match(/<p[^>]*style=['"][^'"]*page-break-[^'"]*['"][^>]*>/g) || []).length;
          const headings = (htmlContent.match(/<h[1-6][^>]*>/g) || []).length;
          const paragraphs = (htmlContent.match(/<p[^>]*>/g) || []).length;
          const tables = (htmlContent.match(/<table[^>]*>/g) || []).length;
          const images = (htmlContent.match(/<img[^>]*>/g) || []).length;
          
          const contentBasedEstimate = Math.ceil(
            paragraphs / 15 + 
            tables * 1.2 +    
            images * 0.5 +   
            headings * 0.3    
          );
          
          const pageCount = pageBreaks > 0 ? 
            Math.max(pageBreaks + 1, contentBasedEstimate) : 
            contentBasedEstimate;
          
          console.log(`Word file ${file.name} estimated page count: ${pageCount}`);
          return Math.max(1, pageCount);
        } catch (error) {
          console.error('Error in Word content analysis:', error);
          const sizeEstimate = Math.max(1, Math.ceil(file.size / (30 * 1024))); // ~30KB per page
          console.log(`Falling back to size estimate: ${sizeEstimate} pages`);
          return sizeEstimate;
        }
      } else if (file.type.startsWith('image/')) {
        console.log(`Image file ${file.name} is counted as 1 page`);
        return 1;
      }
      
      console.log(`Unknown file type ${file.type} for ${file.name}, defaulting to 1 page`);
      return 1;
    } catch (error) {
      console.error('Error counting pages for file:', file.name, error);
      const estimatedPages = Math.max(1, Math.ceil(file.size / (75 * 1024)));
      console.log(`Using size-based estimate for ${file.name}: ${estimatedPages} pages`);
      return estimatedPages;
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    const newFiles = await Promise.all(files.map(async (file) => {
      const pageCount = await getPageCount(file);
      return {
        file,
        quantity: 1,
        size: defaultSizes[0],
        format: defaultFormats[0],
        pageCount
      };
    }));
    setFileList((prev) => [...prev, ...newFiles]);
    e.target.value = null; 
  };

  const handleRemoveFile = (index) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileOptionChange = (idx, field, value) => {
    setFileList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (fileList.length === 0)
      newErrors.files = "Vui lòng chọn ít nhất 1 file.";
    if (!date) newErrors.date = "Vui lòng chọn ngày nhận.";
    if (!time) newErrors.time = "Vui lòng chọn giờ nhận.";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const uploadPromises = fileList.map((item) => uploadFile(item.file));
        const uploadResults = await Promise.all(uploadPromises);

        const successfulUploads = uploadResults.filter(
          (result) => result !== null
        );

        if (successfulUploads.length === fileList.length) {
          const orderFiles = fileList.map((item, index) => ({
            name: successfulUploads[index].display_name,
            url: successfulUploads[index].url,
            quantity: item.quantity,
            size: item.size,
            format: item.format,
            pageCount: item.pageCount,
            price: calculatePrice(item)
          }));

          const totalAmount = calculateTotalPrice();
          console.log('Final total amount:', totalAmount);
          
          const response = await ordersAPI.create({
            userId: 1,
            shopId: shop.id,
            files: orderFiles,
            pickupTime: `${date}T${time}`,
            note,
            totalAmount: totalAmount
          });

          setOrderId(response.data.id);
          setShowSuccess(true);
        } else {
          setErrors({
            ...newErrors,
            files: "Một số file không thể tải lên. Vui lòng thử lại.",
          });
        }
      } catch (error) {
        console.error("Error uploading files:", error);
        setErrors({
          ...newErrors,
          files: "Có lỗi xảy ra khi tải file lên. Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  if (showSuccess) {
    return (
      <OrderSuccessDialog
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
        order={{
          id: orderId || "#ORD123456",
          date,
          time,
          shopName: shop?.name || "",
          shopAddress: shop?.address || "",
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 bg-gray-200/75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-2xl font-bold">Đặt in</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow custom-scrollbar pr-2">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block font-semibold">Files cần in</label>
              <button
                className="text-blue-600 font-medium cursor-pointer hover:underline"
                type="button"
                onClick={handleAddFileClick}
              >
                + Thêm file
              </button>
              <input
                type="file"
                multiple
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,image/*"
              />
            </div>
            <div>
              {fileList.length === 0 ? (
                <div className="text-gray-400 italic bg-gray-100 rounded-lg p-4 text-center">
                  Chưa có file nào
                </div>
              ) : (
                fileList.map((item, idx) => (
                  <div className="bg-gray-100 rounded p-2 mb-2" key={idx}>
                    <div className="flex items-center gap-2 flex-1 mb-2">
                      <span className="text-red-500">📄</span>
                      <span className="font-semibold text-sm truncate max-w-[200px]">
                        {item.file.name}
                      </span>
                      <button
                        className="ml-auto p-1 cursor-pointer rounded-full hover:bg-red-100"
                        onClick={() => handleRemoveFile(idx)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleFileOptionChange(idx, "quantity", e.target.value)
                        }
                        className="border rounded-lg px-2 py-1 w-16 flex-1 border-gray-300 bg-white hover:border-gray-400"
                        placeholder="Số lượng"
                      />
                      <select
                        className="border rounded-lg px-2 py-1 flex-1 border-gray-300 bg-white hover:border-gray-400"
                        value={item.size}
                        onChange={(e) =>
                          handleFileOptionChange(idx, "size", e.target.value)
                        }
                      >
                        {defaultSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                      <select
                        className="border rounded-lg px-2 py-1 flex-1 border-gray-300 bg-white hover:border-gray-400"
                        value={item.format}
                        onChange={(e) =>
                          handleFileOptionChange(idx, "format", e.target.value)
                        }
                      >
                        {defaultFormats.map((format) => (
                          <option key={format} value={format}>
                            {format}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <div>
                        {item.file.type.startsWith('image/') ? (
                          'File ảnh'
                        ) : (
                          'File tài liệu'
                        )}
                      </div>
                      <div className="font-medium">
                        {formatPrice(calculatePrice(item))}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {errors.files && (
                <div className="text-red-500 text-sm mt-1">{errors.files}</div>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Thời gian nhận</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="border rounded-lg px-2 py-1 flex-1 border-gray-300 hover:border-gray-400"
                placeholder="Ngày nhận"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <input
                type="time"
                className="border rounded-lg px-2 py-1 flex-1 border-gray-300 hover:border-gray-400"
                placeholder="Giờ nhận"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            {(errors.date || errors.time) && (
              <div className="text-red-500 text-sm mt-1">
                {errors.date || errors.time}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-2">Ghi chú</label>
            <textarea
              className="border rounded-lg px-2 py-1 w-full resize-none text-sm text-gray-700 border-gray-300 hover:border-gray-400"
              rows={4}
              placeholder="Nhập ghi chú của bạn..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mt-6 shrink-0">
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Tổng tiền:</span>
            <span className="text-blue-600">{formatPrice(calculateTotalPrice())}</span>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="border border-gray-400 rounded-lg py-1 px-4 cursor-pointer hover:bg-gray-100"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              className={`flex items-center gap-2 rounded-lg py-1 px-4 cursor-pointer ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-700 hover:bg-blue-800"
              } text-white`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải lên...
                </>
              ) : (
                "Đặt in"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDialog;
