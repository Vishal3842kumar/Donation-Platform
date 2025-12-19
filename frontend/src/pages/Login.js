import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/users/login', { email, password });
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        try {
          window.dispatchEvent(new CustomEvent('userChanged', { detail: res.data.user }));
        } catch (e) {
          // fallback: call storage event handler indirectly
          window.dispatchEvent(new Event('userChanged'));
        }
      }
      setSuccess('Login successful — redirecting...');
      setTimeout(() => navigate('/profile'), 900);
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Login failed';
      setError(message);
    }
  };

  return (
    <Container className="py-section">
      <Row>
        <Col lg={5} md={8} sm={10} className="mx-auto">
          <Card style={{border: 'none', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', borderRadius: '12px', overflow: 'hidden'}}>
            {/* Card Header with Gradient */}
            <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', color: 'white', textAlign: 'center'}}>
              <h2 style={{fontWeight: 700, marginBottom: '0.5rem'}}>👤 Sign In</h2>
              <p style={{margin: 0, opacity: 0.9}}>Welcome back to DonateHub</p>
            </div>

            <Card.Body className="p-4">
              {error && <Alert variant="danger" className="alert-custom">{error}</Alert>}
              {success && <Alert variant="success" className="alert-custom">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label style={{fontWeight: 600, color: '#2c3e50'}}>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control-custom"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label style={{fontWeight: 600, color: '#2c3e50'}}>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control-custom"
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 fw-bold"
                  style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none'}}
                >
                  Sign In
                </Button>
              </Form>

              <hr style={{margin: '2rem 0'}} />
              
              <p className="text-center" style={{color: '#555', marginBottom: '1.5rem'}}>
                Don't have an account? <Link to="/register" style={{color: '#667eea', fontWeight: 600}}>Create one</Link>
              </p>

              {/* Demo credentials for testing */}
              <Alert variant="info" className="alert-custom">
                <small style={{display: 'block'}}>
                  <strong>📧 Demo credentials:</strong><br />
                  Email: <code>seeduser@example.com</code><br />
                  Password: <code>password123</code>
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
