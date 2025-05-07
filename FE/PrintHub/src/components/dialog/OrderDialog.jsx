import { X, Trash2 } from "lucide-react";
import React, { useRef, useState } from "react";
import OrderSuccessDialog from "./OrderSuccessDialog";

const defaultSizes = ["A4", "A5", "A3"];
const defaultFormats = ["Màu", "Đen trắng"];

const OrderDialog = ({ open, onClose, shop }) => {
  const [fileList, setFileList] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const handleAddFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = files.map((file) => ({
      file,
      quantity: 1,
      size: defaultSizes[0],
      format: defaultFormats[0],
    }));
    setFileList((prev) => [...prev, ...newFiles]);
    e.target.value = null; // reset input
  };

  const handleRemoveFile = (index) => {
    setFileList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileOptionChange = (idx, field, value) => {
    setFileList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (fileList.length === 0)
      newErrors.files = "Vui lòng chọn ít nhất 1 file.";
    if (!date) newErrors.date = "Vui lòng chọn ngày nhận.";
    if (!time) newErrors.time = "Vui lòng chọn giờ nhận.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setShowSuccess(true);
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
          id: "#ORD123456",
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
        className="bg-white rounded-xl drop-shadow-xl p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full cursor-pointer p-2 hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>
        <p className="text-2xl font-bold mb-4">
          Đặt in tại {shop?.name || "Shop Name"}
        </p>
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
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="border border-gray-400 rounded-lg py-1 px-4 cursor-pointer hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            className="bg-blue-700 text-white rounded-lg py-1 px-4 cursor-pointer hover:bg-blue-800"
            onClick={handleSubmit}
          >
            Đặt in
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDialog;
