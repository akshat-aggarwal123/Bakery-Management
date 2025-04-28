import React from 'react';
// Remove unused imports
import { addToCart } from '../../services/bakeryService';

const ProductCard = ({ product }) => {
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, 1);
      alert('Item added to cart!');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="card shadow-sm h-100">
      <img
        src={product.image || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="card-img-top img-fluid"
        style={{ height: '200px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text text-muted">${product.price}</p>
        <button
          className="btn btn-primary mt-auto"
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;