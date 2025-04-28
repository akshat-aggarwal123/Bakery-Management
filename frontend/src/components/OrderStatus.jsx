import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrderStatus } from '../services/bakeryService';

const OrderStatus = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await getOrderStatus(orderId);
      setOrder(data);
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user) return <div>Please login to check order status.</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Check Order Status</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label htmlFor="orderId" className="form-label">
            Order ID
          </label>
          <input
            type="number"
            className="form-control"
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Check Status
        </button>
      </form>

      {order && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Order #{order.id}</h5>
            <p className="card-text">
              <strong>Product:</strong> {order.product.name}
            </p>
            <p className="card-text">
              <strong>Quantity:</strong> {order.quantity}
            </p>
            <p className="card-text">
              <strong>Status:</strong> {order.status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatus;