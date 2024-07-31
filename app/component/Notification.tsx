import React, { useEffect, useState } from "react";

interface NotificationProps {
  message: string;
  type: "success" | "warning" | "error";
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose(); 
    }, 3000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  let colorClasses;
  switch (type) {
    case "success":
      colorClasses = "text-green-600 bg-green-100 border-green-400";
      break;
    case "warning":
      colorClasses = "text-yellow-600 bg-yellow-100 border-yellow-400";
      break;
    case "error":
      colorClasses = "text-red-600 bg-red-100 border-red-400";
      break;
    default:
      colorClasses = "text-gray-600 bg-gray-100 border-gray-400";
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 m-2 rounded border ${colorClasses} text-center`}>
      {message}
    </div>
  );
};

export default Notification;
