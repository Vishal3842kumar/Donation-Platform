import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import api from '../services/api';

function DonationsList() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterEmail, setFilterEmail] = useState('');
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchDonations();
    
    // Set up auto-refresh every 5 seconds to catch new donations
    const interval = setInterval(() => {
      console.log('Auto-refreshing donations list...');
      fetchDonations();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDonations = async () => {
    try {
      setError(null);
      const response = await api.get('/donations');
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const sortedDonations = Array.isArray(response.data) 
        ? response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];
      
      console.log('Donations fetched:', sortedDonations.length);
      setDonations(sortedDonations);
      setFilteredDonations(sortedDonations);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err.message || 'Failed to fetch donations';
      setError(errorMsg);
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const email = e.target.value.toLowerCase();
    setFilterEmail(email);
    
    if (!email.trim()) {
      setFilteredDonations(donations);
    } else {
      const filtered = donations.filter(
        donation => 
          donation.donor?.email?.toLowerCase().includes(email) ||
          donation.donor?.name?.toLowerCase().includes(email)
      );
      setFilteredDonations(filtered);
    }
  };

  const handleClearFilter = () => {
    setFilterEmail('');
    setFilteredDonations(donations);
  };

  const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
  const avgDonation = donations.length > 0 ? (totalAmount / donations.length).toFixed(2) : 0;
  const anonymousCount = donations.filter(d => d.donor?.anonymous).length;

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" style={{color: '#667eea'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-section">
      <div className="mb-5">
        <h1 style={{color: '#2c3e50', fontWeight: 700, fontSize: '2.5rem'}}>📊 All Donations</h1>
        <p className="lead text-muted">View and search recent donations from our community</p>
      </div>

      {error && <Alert variant="danger" className="alert-custom">{error}</Alert>}

      {/* Filter Section */}
      <div className="mb-5 p-4 rounded" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)'}}>
        <Form.Group className="mb-0">
          <Form.Label className="fw-bold" style={{color: '#2c3e50', marginBottom: '1rem'}}>🔍 Search by Donor Name or Email</Form.Label>
          <div className="d-flex gap-2 flex-wrap">
            <Form.Control
              type="text"
              placeholder="Enter donor email or name..."
              value={filterEmail}
              onChange={handleFilterChange}
              className="form-control-custom"
              style={{flex: 1, minWidth: '250px'}}
            />
            {filterEmail && (
              <Button className="btn" onClick={handleClearFilter} style={{background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '8px'}}>
                ✕ Clear
              </Button>
            )}
            <Button className="btn btn-primary-custom" onClick={fetchDonations}>
              🔄 Refresh
            </Button>
          </div>
          <Form.Text className="text-muted mt-2" style={{display: 'block'}}>
            {filterEmail
              ? `Showing ${filteredDonations.length} of ${donations.length} donations`
              : `Total donations: ${donations.length}`}
          </Form.Text>
        </Form.Group>
      </div>

      {/* Stats Cards */}
      {donations.length > 0 && (
        <Row className="mb-5">
          <Col md={3} className="mb-3 mb-md-0">
            <Card style={{border: 'none', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)', borderRadius: '12px'}}>
              <Card.Body className="py-4">
                <h3 style={{fontSize: '2rem', fontWeight: 700}}>{donations.length}</h3>
                <small style={{opacity: 0.9}}>Total Donations</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <Card style={{border: 'none', textAlign: 'center', background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', color: 'white', boxShadow: '0 5px 15px rgba(76, 175, 80, 0.3)', borderRadius: '12px'}}>
              <Card.Body className="py-4">
                <h3 style={{fontSize: '2rem', fontWeight: 700}}>${totalAmount.toFixed(2)}</h3>
                <small style={{opacity: 0.9}}>Total Amount</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3 mb-md-0">
            <Card style={{border: 'none', textAlign: 'center', background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', color: 'white', boxShadow: '0 5px 15px rgba(255, 152, 0, 0.3)', borderRadius: '12px'}}>
              <Card.Body className="py-4">
                <h3 style={{fontSize: '2rem', fontWeight: 700}}>${avgDonation}</h3>
                <small style={{opacity: 0.9}}>Average Donation</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{border: 'none', textAlign: 'center', background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)', color: 'white', boxShadow: '0 5px 15px rgba(156, 39, 176, 0.3)', borderRadius: '12px'}}>
              <Card.Body className="py-4">
                <h3 style={{fontSize: '2rem', fontWeight: 700}}>{anonymousCount}</h3>
                <small style={{opacity: 0.9}}>Anonymous</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Donations Table */}
      {filteredDonations.length === 0 ? (
        <Alert variant="info" className="alert-custom" style={{textAlign: 'center'}}>
          {filterEmail ? '🔍 No donations found matching your search.' : '📭 No donations yet.'}
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table hover style={{marginBottom: 0}}>
            <thead style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
              <tr>
                <th style={{borderBottom: 'none'}}>👤 Donor Name</th>
                <th style={{borderBottom: 'none'}}>📧 Email</th>
                <th style={{borderBottom: 'none'}}>💰 Amount</th>
                <th style={{borderBottom: 'none'}}>🏢 Charity</th>
                <th style={{borderBottom: 'none'}}>💳 Payment</th>
                <th style={{borderBottom: 'none'}}>📌 Status</th>
                <th style={{borderBottom: 'none'}}>🔖 Receipt</th>
                <th style={{borderBottom: 'none'}}>📅 Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((donation) => (
                <tr key={donation._id} style={{borderBottom: '1px solid #eee'}}>
                  <td style={{color: '#2c3e50', fontWeight: 500}}>
                    {donation.donor?.anonymous ? (
                      <span style={{color: '#7f8c8d', fontStyle: 'italic'}}>🔒 Anonymous</span>
                    ) : (
                      donation.donor?.name || 'Unknown'
                    )}
                  </td>
                  <td>
                    {donation.donor?.anonymous ? (
                      <span style={{color: '#7f8c8d'}}>—</span>
                    ) : (
                      <small style={{color: '#667eea'}}>{donation.donor?.email || '—'}</small>
                    )}
                  </td>
                  <td style={{color: '#4CAF50', fontWeight: 700, fontSize: '1.05rem'}}>
                    ${donation.amount?.toFixed(2) || '0.00'}
                  </td>
                  <td style={{color: '#2c3e50', fontWeight: 500}}>
                    {donation.charity?.name || donation.charity || 'Unknown'}
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
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '15px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'white',
                        background:
                          donation.status === 'completed'
                            ? '#4CAF50'
                            : donation.status === 'pending'
                            ? '#ffc107'
                            : donation.status === 'failed'
                            ? '#ff6b6b'
                            : '#667eea'
                      }}
                    >
                      {donation.status === 'completed' ? '✓' : ''} {donation.status?.charAt(0).toUpperCase() + donation.status?.slice(1)}
                    </span>
                  </td>
                  <td>
                    <small style={{color: '#667eea', fontWeight: 600}}>{donation.receiptNumber || '—'}</small>
                  </td>
                  <td>
                    <small style={{color: '#7f8c8d'}}>
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export default DonationsList;
