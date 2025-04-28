import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createProduct, getProducts } from '../../services/bakeryService';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    quantity: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(newProduct.name, newProduct.price, newProduct.quantity);
      alert('Product added successfully!');
      setNewProduct({ name: '', price: 0, quantity: 0 });
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user || !user.isAdmin) {
    return <div className="container mt-5">Unauthorized access</div>;
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Admin Dashboard</h2>
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row g-3">
          <div className="col-md-4">
            <input
              type="text"
              className="form-control"
              placeholder="Product name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Quantity"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) })}
              required
            />
          </div>
          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100">
              Add Product <i className="fas fa-plus ms-2"></i>
            </button>
          </div>
        </div>
      </form>
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">${product.price}</p>
                <p className="card-text">Stock: {product.quantity}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;