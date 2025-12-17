import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Table, Badge } from 'react-bootstrap';
import api from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserAndDonations();
    
    // Also listen for storage changes to detect when donations are made from receipt page
    const handleStorageChange = () => {
      console.log('Storage changed, refreshing donations...');
      fetchUserAndDonations();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const fetchUserAndDonations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No session found. Please log in.');
        navigate('/login');
        return;
      }

      // Fetch user info from /api/users/me
      const userResponse = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userResponse.data);

      // Fetch all donations and filter by user email
      const donationsResponse = await api.get('/donations');
      
      if (!Array.isArray(donationsResponse.data)) {
        throw new Error('Invalid donations data format');
      }
      
      const userDonations = donationsResponse.data.filter(
        donation => donation.donor?.email === userResponse.data.email
      );
      const sortedDonations = userDonations.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      console.log('User donations fetched:', sortedDonations.length);
      setDonations(sortedDonations);
    } catch (err) {
      console.error('Error fetching profile:', err);
      const errorMsg = err?.response?.data?.error || err.message || 'Failed to load profile';
      setError(errorMsg);
      // Redirect to login if token is invalid
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" style={{color: '#667eea'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="alert-custom">{error || 'Unable to load profile'}</Alert>
        <Button className="btn btn-primary-custom" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  const totalDonated = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const avgDonation = donations.length > 0 ? (totalDonated / donations.length).toFixed(2) : 0;

  return (
    <Container className="py-section">
      {/* User Profile Card */}
      <Row className="mb-4">
        <Col md={8}>
          <Card style={{border: 'none', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', borderRadius: '12px', overflow: 'hidden'}}>
            <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem', color: 'white'}}>
              <h3 className="mb-0" style={{fontWeight: 700}}>👤 {user.name}</h3>
              <small style={{opacity: 0.9}}>Registered Member</small>
            </div>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="mb-4">
                    <small style={{color: '#7f8c8d', fontWeight: 600}}>EMAIL ADDRESS</small>
                    <p style={{color: '#2c3e50', fontSize: '1.05rem'}}>{user.email}</p>
                  </div>
                  <div className="mb-4">
                    <small style={{color: '#7f8c8d', fontWeight: 600}}>MEMBER SINCE</small>
                    <p style={{color: '#2c3e50', fontSize: '1.05rem'}}>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-4">
                    <small style={{color: '#7f8c8d', fontWeight: 600}}>ACCOUNT STATUS</small>
                    <Badge bg="success" style={{fontSize: '0.95rem'}}>✓ Active</Badge>
                  </div>
                  <div className="mb-4">
                    <small style={{color: '#7f8c8d', fontWeight: 600}}>VERIFIED</small>
                    <Badge bg="info" style={{fontSize: '0.95rem'}}>✓ Email Verified</Badge>
                  </div>
                </Col>
              </Row>

              <hr style={{margin: '1.5rem 0'}} />

              <div className="d-flex gap-2 flex-wrap">
                <Button className="btn btn-primary-custom" onClick={fetchUserAndDonations}>
                  🔄 Refresh Profile
                </Button>
                <Button className="btn" onClick={handleLogout} style={{background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.5rem', fontWeight: 600}}>
                  🚪 Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Stats */}
        <Col md={4}>
          <Card style={{border: 'none', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', borderRadius: '12px', background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white', marginBottom: '1.5rem'}}>
            <Card.Body className="text-center">
              <h6 style={{opacity: 0.9, marginBottom: '1rem', fontWeight: 600}}>💚 IMPACT SUMMARY</h6>
              <hr style={{opacity: 0.3}} />
              <div className="mb-3">
                <h2 style={{fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem'}}>
                  ${totalDonated.toFixed(2)}
                </h2>
                <small style={{opacity: 0.9, fontWeight: 500}}>Total Contributed</small>
              </div>
              <hr style={{opacity: 0.3}} />
              <div>
                <h3 style={{fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem'}}>{donations.length}</h3>
                <small style={{opacity: 0.9, fontWeight: 500}}>Donations Made</small>
              </div>
            </Card.Body>
          </Card>

          <Button
            className="w-100 btn btn-success-custom"
            style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none'}}
            onClick={() => navigate('/charities')}
          >
            💚 Make Another Donation
          </Button>
        </Col>
      </Row>

      {/* Donation History */}
      <Row className="mt-5">
        <Col>
          <Card style={{border: 'none', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', borderRadius: '12px', overflow: 'hidden'}}>
            <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1.5rem', color: 'white'}}>
              <h4 className="mb-0" style={{fontWeight: 700}}>📊 My Donation History</h4>
            </div>
            <Card.Body>
              {donations.length === 0 ? (
                <Alert variant="info" className="alert-custom mb-0">
                  You haven't made any donations yet.{' '}
                  <Button
                    variant="link"
                    onClick={() => navigate('/charities')}
                    className="p-0"
                    style={{color: '#667eea', fontWeight: 600, textDecoration: 'none'}}
                  >
                    Start donating today! 💚
                  </Button>
                </Alert>
              ) : (
                <div className="table-responsive">
                  <Table hover style={{marginBottom: 0}}>
                    <thead style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
                      <tr>
                        <th style={{borderBottom: 'none'}}>📅 Date</th>
                        <th style={{borderBottom: 'none'}}>🏢 Charity</th>
                        <th style={{borderBottom: 'none'}}>💰 Amount</th>
                        <th style={{borderBottom: 'none'}}>💳 Payment</th>
                        <th style={{borderBottom: 'none'}}>📌 Status</th>
                        <th style={{borderBottom: 'none'}}>🔖 Receipt</th>
                        <th style={{borderBottom: 'none'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation) => (
                        <tr key={donation._id} style={{borderBottom: '1px solid #eee'}}>
                          <td>
                            <small style={{color: '#7f8c8d'}}>
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </small>
                          </td>
                          <td style={{color: '#2c3e50', fontWeight: 600}}>{donation.charity?.name || 'Unknown'}</td>
                          <td style={{color: '#4CAF50', fontWeight: 700}}>
                            ${donation.amount?.toFixed(2) || '0.00'}
                          </td>
                          <td>
                            <small style={{color: '#555'}}>
                              {donation.paymentMethod === 'stripe'
                                ? '💳 Card'
                                : donation.paymentMethod === 'paypal'
                                ? '💰 PayPal'
                                : donation.paymentMethod === 'bank_transfer'
                                ? '🏦 Bank'
                                : donation.paymentMethod}
                            </small>
                          </td>
                          <td>
                            <Badge
                              style={{
                                background:
                                  donation.status === 'completed'
                                    ? '#4CAF50'
                                    : donation.status === 'pending'
                                    ? '#ffc107'
                                    : donation.status === 'failed'
                                    ? '#ff6b6b'
                                    : '#667eea',
                                color: donation.status === 'pending' ? '#333' : 'white'
                              }}
                            >
                              {donation.status === 'completed' ? '✓' : ''} {donation.status?.charAt(0).toUpperCase() + donation.status?.slice(1)}
                            </Badge>
                          </td>
                          <td>
                            <small style={{color: '#667eea', fontWeight: 600}}>{donation.receiptNumber || '—'}</small>
                          </td>
                          <td>
                            <Button
                              size="sm"
                              className="btn-primary-custom"
                              style={{padding: '0.4rem 0.8rem', fontSize: '0.85rem'}}
                              onClick={() =>
                                navigate(`/receipt/${donation._id}`, {
                                  state: { donation }
                                })
                              }
                            >
                              📄 View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Section */}
      <Row className="mt-5">
        <Col md={4} className="mb-3 mb-md-0">
          <Card style={{border: 'none', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)', borderRadius: '12px'}}>
            <Card.Body className="py-4">
              <h3 style={{fontSize: '2.5rem', fontWeight: 700}}>{donations.length}</h3>
              <p style={{opacity: 0.9, marginBottom: 0}}>Total Donations</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <Card style={{border: 'none', textAlign: 'center', background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white', boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)', borderRadius: '12px'}}>
            <Card.Body className="py-4">
              <h3 style={{fontSize: '2.5rem', fontWeight: 700}}>${totalDonated.toFixed(2)}</h3>
              <p style={{opacity: 0.9, marginBottom: 0}}>Total Contributed</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{border: 'none', textAlign: 'center', background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white', boxShadow: '0 5px 15px rgba(255, 152, 0, 0.3)', borderRadius: '12px'}}>
            <Card.Body className="py-4">
              <h3 style={{fontSize: '2.5rem', fontWeight: 700}}>${avgDonation}</h3>
              <p style={{opacity: 0.9, marginBottom: 0}}>Average Donation</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
