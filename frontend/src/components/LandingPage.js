import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="text-center">
        <h1 className="display-3 text-primary mb-4">Welcome to BakeryMS</h1>
        <p className="lead mb-5">Manage your bakery inventory and orders with ease</p>
        <Link to="/products" className="btn btn-primary btn-lg px-5">
          View Products <i className="ms-2 fas fa-bread-slice"></i>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;