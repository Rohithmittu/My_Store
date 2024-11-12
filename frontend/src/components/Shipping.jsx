import React, { useState } from "react";
import { useCartStore } from "../stores/useCartStore.js";
import { useNavigate } from "react-router-dom";

const Shipping = () => {
  const { saveShippingInfo, cart, coupon } = useCartStore();
  const navigate = useNavigate();

  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await saveShippingInfo(shippingInfo);

      navigate("/payment"); // Redirecting to the payment page after saving shipping info
    } catch (error) {
      console.error("Error in saving shipping info", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
      <button className="back-btn" onClick={() => navigate("/cart")}>
        Back
      </button>
      <h2 className="text-2xl font-semibold text-violet-400 mb-4">
        Shipping Information
      </h2>
      <form onSubmit={submitHandler} className="space-y-4">
        {["address", "city", "state", "country", "pinCode"].map((field) => (
          <div key={field} className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <input
              type="text"
              name={field}
              value={shippingInfo[field]}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-sm bg-gray-900 border border-gray-600 rounded-lg text-gray-200 focus:border-violet-500 focus:outline-none"
            />
          </div>
        ))}
        <button
          type="submit"
          className="w-full py-2 mt-4 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-400"
        >
          Save Shipping Info
        </button>
      </form>
    </div>
  );
};

export default Shipping;
