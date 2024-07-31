import React, { useEffect, useState } from "react";

interface NotificationProps {
  message: string;
  type: "success" | "warning" | "error";
}

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000); // Hide notification after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  let backgroundColor;
  switch (type) {
    case "success":
      backgroundColor = "bg-green-500";
      break;
    case "warning":
      backgroundColor = "bg-yellow-500";
      break;
    case "error":
      backgroundColor = "bg-red-500";
      break;
    default:
      backgroundColor = "bg-gray-500";
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 text-white ${backgroundColor} text-center`}>
      {message}
    </div>
  );
};

export default Notification;
