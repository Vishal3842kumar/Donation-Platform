import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Home() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const onStorage = () => {
      try {
        const raw = localStorage.getItem('user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        setUser(null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <Container className="py-section">
      {/* Hero Section */}
      <div className="hero-section text-center mb-5">
        <h1 className="display-4 mb-4">Make a Difference Today</h1>
        <p className="lead mb-5">
          Support causes you care about with our secure, transparent donation platform.
          Every contribution makes an impact.
        </p>
        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <Button as={Link} to="/charities" className="btn btn-success-custom" style={{background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'}}>
            💚 Donate Now
          </Button>
          {!user ? (
            <>
              <Button as={Link} to="/login" className="btn btn-primary-custom">
                Sign In
              </Button>
              <Button as={Link} to="/register" className="btn" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none'}}>
                Create Account
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/profile" className="btn btn-primary-custom">
                👤 View Profile
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Features Section */}
      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="feature-card">
            <Card.Body>
              <div className="feature-icon mb-3 text-center">
                <span style={{ fontSize: '3.5rem' }}>🔒</span>
              </div>
              <Card.Title className="text-center">Secure Payments</Card.Title>
              <Card.Text className="text-center">
                Multiple secure payment options with end-to-end encryption for your safety.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="feature-card">
            <Card.Body>
              <div className="feature-icon mb-3 text-center">
                <span style={{ fontSize: '3.5rem' }}>📄</span>
              </div>
              <Card.Title className="text-center">Instant Receipts</Card.Title>
              <Card.Text className="text-center">
                Get immediate tax-deductible receipts via email for all your donations.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="feature-card">
            <Card.Body>
              <div className="feature-icon mb-3 text-center">
                <span style={{ fontSize: '3.5rem' }}>🌍</span>
              </div>
              <Card.Title className="text-center">Verified Charities</Card.Title>
              <Card.Text className="text-center">
                All organizations are thoroughly vetted to ensure your donations reach the cause.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* How It Works */}
      <div className="mb-5">
        <h2 className="text-center mb-5" style={{color: '#2c3e50', fontSize: '2.5rem', fontWeight: 700}}>How It Works</h2>
        <Row className="text-center">
          <Col md={3} className="mb-4">
            <div className="step-number mb-3">1</div>
            <h5 style={{color: '#2c3e50', fontWeight: 600}}>Choose a Cause</h5>
            <p className="text-muted">Browse verified charities and select one to support.</p>
          </Col>
          <Col md={3} className="mb-4">
            <div className="step-number mb-3">2</div>
            <h5 style={{color: '#2c3e50', fontWeight: 600}}>Enter Details</h5>
            <p className="text-muted">Specify amount and add a personal message (optional).</p>
          </Col>
          <Col md={3} className="mb-4">
            <div className="step-number mb-3">3</div>
            <h5 style={{color: '#2c3e50', fontWeight: 600}}>Secure Payment</h5>
            <p className="text-muted">Pay safely using your preferred payment method.</p>
          </Col>
          <Col md={3} className="mb-4">
            <div className="step-number mb-3">4</div>
            <h5 style={{color: '#2c3e50', fontWeight: 600}}>Get Receipt</h5>
            <p className="text-muted">Receive instant confirmation and tax receipt.</p>
          </Col>
        </Row>
      </div>

      {/* Stats Section */}
      <div className="mb-5 p-5 rounded" style={{background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', color: 'white'}}>
        <Row className="text-center">
          <Col md={3} className="mb-4 mb-md-0">
            <h3 style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem'}}>$500K+</h3>
            <p style={{fontSize: '1.1rem', fontWeight: 500}}>Total Donations</p>
          </Col>
          <Col md={3} className="mb-4 mb-md-0">
            <h3 style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem'}}>50+</h3>
            <p style={{fontSize: '1.1rem', fontWeight: 500}}>Charities Supported</p>
          </Col>
          <Col md={3} className="mb-4 mb-md-0">
            <h3 style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem'}}>10K+</h3>
            <p style={{fontSize: '1.1rem', fontWeight: 500}}>Active Donors</p>
          </Col>
          <Col md={3}>
            <h3 style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem'}}>24/7</h3>
            <p style={{fontSize: '1.1rem', fontWeight: 500}}>Support Available</p>
          </Col>
        </Row>
      </div>
    </Container>
  );
}

export default Home;