import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import api from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/users/register', { name, email, password });
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      setSuccess('Registration successful — redirecting...');
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      const message = err?.response?.data?.error || err.message || 'Registration failed';
      setError(message);
    }
  };

  return (
    <Container className="py-section">
      <Row>
        <Col lg={5} md={8} sm={10} className="mx-auto">
          <Card style={{border: 'none', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', borderRadius: '12px', overflow: 'hidden'}}>
            {/* Card Header with Gradient */}
            <div style={{background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', padding: '2rem', color: 'white', textAlign: 'center'}}>
              <h2 style={{fontWeight: 700, marginBottom: '0.5rem'}}>🎉 Create an Account</h2>
              <p style={{margin: 0, opacity: 0.9}}>Join our community of donors</p>
            </div>

            <Card.Body className="p-4">
              {error && <Alert variant="danger" className="alert-custom">{error}</Alert>}
              {success && <Alert variant="success" className="alert-custom">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label style={{fontWeight: 600, color: '#2c3e50'}}>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-control-custom"
                    required
                  />
                </Form.Group>

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
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control-custom"
                    required
                  />
                  <Form.Text className="text-muted">
                    Password should be at least 6 characters long
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 fw-bold"
                  style={{background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', border: 'none'}}
                >
                  Create Account
                </Button>
              </Form>

              <hr style={{margin: '2rem 0'}} />
              
              <p className="text-center" style={{color: '#555'}}>
                Already have an account? <Link to="/login" style={{color: '#667eea', fontWeight: 600}}>Sign in</Link>
              </p>

              <Alert variant="info" className="alert-custom mb-0">
                <small>
                  <strong>✅ Benefits of signing up:</strong><br />
                  • Save your donation history<br />
                  • Get automatic tax receipts<br />
                  • Personalized donor dashboard
                </small>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
