import axios from "axios";
import { useEffect, useState } from "react";
import {backendUrl} from '../store/consts'

const StoreStatus = () => {

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${backendUrl}/users/store-status`, {
          withCredentials: true,
        });

        if (response.data.success) {
          setIsOpen(response.data.data.isOpen);
        }
      } catch (error) {
        console.error("Error fetching store status:", error);
      }
    };

    fetchStatus();
  }, []);

  return (
    <div
      className="w-full text-center mb-3 py-2 font-semibold transition-all duration-300 text-gray-500 text-sm md:text-base lg:text-lg"
    >
      <p className="flex justify-center items-center gap-2">
        <span>Our Sangaiprou Store is currently:</span>
        <span className="font-bold text-black">{isOpen ? "Open " : "Closed "}</span>
      </p>
    </div>
  );
};

export default StoreStatus;
