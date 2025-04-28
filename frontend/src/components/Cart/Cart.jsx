import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCart, placeOrder } from '../../services/bakeryService';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCart(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (user) fetchCart();
  }, [user]);

  const handleCheckout = async () => {
    try {
      if (!cart || cart.items.length === 0) {
        alert('Cart is empty!');
        return;
      }

      // Place orders for each cart item (since backend handles single-product orders)
      for (const item of cart.items) {
        await placeOrder(item.product.id, item.quantity);
      }

      alert('Order placed successfully!');
      navigate('/order-status');
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user) return <div className="container mt-5">Please login to view cart</div>;

  return (
    <div className="container py-5">
      <h2 className="mb-4">Your Cart</h2>
      {cart?.items?.length === 0 ? (
        <p className="lead">Your cart is empty</p>
      ) : (
        <div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart?.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.product.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.product.price}</td>
                  <td>${(item.quantity * item.product.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-end mt-4">
            <button className="btn btn-success" onClick={handleCheckout}>
              Checkout <i className="fas fa-shopping-cart ms-2"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;