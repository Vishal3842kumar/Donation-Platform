import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Container, Card, Alert, Row, Col, Spinner } from 'react-bootstrap';
import api from '../services/api';

const DonationForm = () => {
  const { charityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [charity, setCharity] = useState(null);
  const [charities, setCharities] = useState([]);
  const [selectedCharityId, setSelectedCharityId] = useState(charityId || '');
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState({
    amount: '',
    donor: {
      name: '',
      email: '',
      anonymous: false
    },
    message: '',
    paymentMethod: 'card'
  });
  const [suggestedAmounts] = useState([10, 25, 50, 100, 250, 500]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCharity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charityId]);

  const fetchCharity = async () => {
    try {
      // If navigation provided the charity object in location.state, use it directly
      if (location && location.state && location.state.charity) {
        const locChar = location.state.charity;
        setCharity(locChar);
        setCharities([locChar]);
        setSelectedCharityId(locChar._id || locChar.id || '');
        setLoading(false);
        return;
      }
      // First try to fetch from backend
      const response = await api.get(`/api/charities`);
      
      if (response && response.data && Array.isArray(response.data)) {
        setCharities(response.data);
        // If charityId param exists, find it in the list
        if (charityId) {
          const found = response.data.find(c => c._id === charityId);
          setCharity(found || response.data[0]);
          setSelectedCharityId(found?._id || response.data[0]._id);
        } else {
          // Default to first charity if no param
          setCharity(response.data[0]);
          setSelectedCharityId(response.data[0]._id);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching charity:', error);
      
      // Fallback to mock charity data if API fails
      const mockCharities = [
        {
          _id: '1',
          name: 'Red Cross',
          description: 'Providing emergency assistance, disaster relief, and education internationally.',
          category: 'humanitarian'
        },
        {
          _id: '2',
          name: 'World Wildlife Fund',
          description: 'Conserving nature and reducing the most pressing threats to biodiversity.',
          category: 'environment'
        },
        {
          _id: '3',
          name: 'UNICEF',
          description: 'Working for the rights of every child, every day, across the globe.',
          category: 'humanitarian'
        },
        {
          _id: '4',
          name: 'Doctors Without Borders',
          description: 'Providing medical aid where it\'s needed most, independent of governments.',
          category: 'health'
        },
        {
          _id: '5',
          name: 'The Nature Conservancy',
          description: 'Conserving the lands and waters on which all life depends.',
          category: 'environment'
        },
        {
          _id: '6',
          name: 'Save the Children',
          description: 'Giving children a healthy start, education, and protection from harm.',
          category: 'education'
        }
      ];
      
      setCharities(mockCharities);
      // Find the requested charity or default to first one
      const found = mockCharities.find(c => c._id === charityId);
      setCharity(found || mockCharities[0]);
      setSelectedCharityId(found?._id || mockCharities[0]._id);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('donor.')) {
      const donorField = name.split('.')[1];
      setDonation(prev => ({
        ...prev,
        donor: {
          ...prev.donor,
          [donorField]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setDonation(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAmountClick = (amount) => {
    setDonation(prev => ({
      ...prev,
      amount: amount.toString()
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!donation.amount || parseFloat(donation.amount) < 1) {
      newErrors.amount = 'Please enter a valid donation amount (minimum $1)';
    }

    // If donor chooses anonymous, skip name/email requirement
    if (!donation.donor.anonymous) {
      if (!donation.donor.name.trim()) {
        newErrors.name = 'Name is required';
      }
      if (!donation.donor.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(donation.donor.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const paymentMap = { card: 'stripe', paypal: 'paypal', bank: 'bank_transfer' };
      const payload = {
        charityId: (charity && charity._id) || charityId,
        amount: parseFloat(donation.amount),
        donor: donation.donor,
        paymentMethod: paymentMap[donation.paymentMethod] || donation.paymentMethod,
        message: donation.message
      };

      console.log('Sending donation payload:', payload);
      const response = await api.post('/donations', payload);
      
      console.log('Donation response:', response.data);
      
      // Handle response - backend returns { success, donation, receiptNumber }
      if (response && response.data) {
        const saved = response.data.donation || response.data;
        
        if (!saved || !saved._id) {
          throw new Error('Invalid donation response from server');
        }
        
        const charityName = (saved.charity && (saved.charity.name || (typeof saved.charity === 'string' ? saved.charity : null))) || charity?.name || 'Red Cross';
        const charityCategoryRaw = saved.charity && (saved.charity.category || (saved.charity.category === '' ? '' : null));
        const charityCategory = charityCategoryRaw ? (charityCategoryRaw.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())) : (charity && charity.category ? charity.category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');
        
        // normalize charity object when backend returned just an id/string
        if (saved.charity && typeof saved.charity === 'string') {
          saved.charity = { name: saved.charity };
        }
        
        alert(`Thank you for your donation of $${saved.amount} to ${charityName}${charityCategory ? ' (' + charityCategory + ')' : ''}!`);
        
        // Navigate with full donation data to ensure receipt page has fresh data
        navigate(`/receipt/${saved._id}`, { state: { donation: saved, refreshNeeded: true } });
        return;
      }
    } catch (err) {
      console.error('Donation API error:', err?.response?.data || err.message || err);
      alert(`Error processing donation: ${err?.response?.data?.error || err.message || 'Unknown error'}`);
      return;
    }

    // If we reach here, something went wrong - try fallback to local mock if API fails
    try {
      const mockDonation = {
        _id: `donation-${Date.now()}`,
        receiptNumber: `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        amount: parseFloat(donation.amount),
        charity: { name: charity?.name || 'Charity', _id: charity?.id || charity?._id },
        donor: donation.donor,
        paymentMethod: donation.paymentMethod === 'card' ? 'Credit/Debit Card' : (donation.paymentMethod === 'paypal' ? 'PayPal' : (donation.paymentMethod === 'bank' ? 'Bank Transfer' : donation.paymentMethod)),
        currency: 'USD',
        status: 'completed',
        createdAt: new Date().toISOString()
      };
      alert(`Thank you for your donation of $${donation.amount} to ${charity?.name}!`);
      navigate(`/receipt/${mockDonation._id}`, { state: { donation: mockDonation, refreshNeeded: true } });
    } catch (err) {
      console.error('Fallback error:', err);
      alert('There was an error processing your donation. Please try again.');
    }
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" style={{color: '#667eea'}} role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </Container>
  );

  if (!charity) return (
    <Container className="py-5">
      <Alert variant="danger">Charity not found</Alert>
      <Button className="btn btn-primary-custom" onClick={() => navigate('/charities')}>
        Browse Charities
      </Button>
    </Container>
  );

  return (
    <Container className="py-section">
      <div className="text-center mb-5">
        <h1 style={{color: '#2c3e50', fontWeight: 700, fontSize: '2.5rem'}}>💚 Donate to {charity.name}</h1>
        <p className="lead text-muted">Your donation will help make a difference</p>
      </div>

      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="p-4" style={{border: 'none', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)', borderRadius: '12px'}}>
            <Form onSubmit={handleSubmit}>
              {/* Charity selector */}
              {charities && charities.length > 0 && (
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold fs-5" style={{color: '#2c3e50'}}>Choose Charity</Form.Label>
                  <Form.Select
                    value={selectedCharityId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedCharityId(val);
                      const sel = charities.find(c => c._id === val);
                      if (sel) setCharity(sel);
                    }}
                    className="form-control-custom"
                  >
                    {charities.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
              {/* Donation Amount */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-5" style={{color: '#2c3e50'}}>Select Donation Amount</Form.Label>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {suggestedAmounts.map(amount => (
                    <Button
                      key={amount}
                      type="button"
                      className={`amount-btn ${donation.amount === amount.toString() ? 'active' : ''}`}
                      onClick={() => handleAmountClick(amount)}
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Form.Control
                  type="number"
                  name="amount"
                  value={donation.amount}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  placeholder="Enter custom amount"
                  isInvalid={!!errors.amount}
                  className="form-control-custom"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.amount}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Minimum donation: $1
                </Form.Text>
              </Form.Group>

              {/* Donor Information */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-5" style={{color: '#2c3e50'}}>Your Information</Form.Label>
                <Form.Control
                  type="text"
                  name="donor.name"
                  value={donation.donor.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="mb-3 form-control-custom"
                  isInvalid={!!errors.name}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
                
                <Form.Control
                  type="email"
                  name="donor.email"
                  value={donation.donor.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="form-control-custom"
                  isInvalid={!!errors.email}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
                
                <Form.Text className="text-muted">
                  We'll send your receipt to this email
                </Form.Text>
                
                <Form.Check
                  type="checkbox"
                  name="donor.anonymous"
                  label="Make this donation anonymous"
                  checked={donation.donor.anonymous}
                  onChange={handleChange}
                  className="mt-3 fw-500"
                />
              </Form.Group>

              {/* Message */}
              <Form.Group className="mb-4">
                <Form.Label style={{color: '#2c3e50', fontWeight: 600}}>Optional Message</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  value={donation.message}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add a personal message for the charity (optional)"
                  className="form-control-custom"
                />
              </Form.Group>

              {/* Payment Method */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-5" style={{color: '#2c3e50'}}>Payment Method</Form.Label>
                <div className="d-flex flex-wrap gap-3">
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    label={
                      <div className="d-flex align-items-center fw-500">
                        <span className="me-2">💳</span>
                        Credit/Debit Card
                      </div>
                    }
                    value="card"
                    checked={donation.paymentMethod === 'card'}
                    onChange={handleChange}
                    id="payment-card"
                  />
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    label={
                      <div className="d-flex align-items-center fw-500">
                        <span className="me-2">💰</span>
                        PayPal
                      </div>
                    }
                    value="paypal"
                    checked={donation.paymentMethod === 'paypal'}
                    onChange={handleChange}
                    id="payment-paypal"
                  />
                  <Form.Check
                    type="radio"
                    name="paymentMethod"
                    label={
                      <div className="d-flex align-items-center fw-500">
                        <span className="me-2">🏦</span>
                        Bank Transfer
                      </div>
                    }
                    value="bank"
                    checked={donation.paymentMethod === 'bank'}
                    onChange={handleChange}
                    id="payment-bank"
                  />
                </div>
              </Form.Group>

              {/* Summary */}
              <Card className="mb-4" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)', border: 'none', borderLeft: '4px solid #667eea'}}>
                <Card.Body>
                  <h5 style={{color: '#2c3e50', fontWeight: 700}}>Donation Summary</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Donation Amount:</span>
                    <strong style={{color: '#667eea'}}>${donation.amount || '0'}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Processing Fee:</span>
                    <span className="text-success fw-bold">Free</span>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between fs-5">
                    <span style={{fontWeight: 600}}>Total:</span>
                    <strong style={{color: '#4CAF50', fontSize: '1.3rem'}}>${donation.amount || '0'}</strong>
                  </div>
                </Card.Body>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-100 py-3 fw-bold btn btn-success-custom"
                style={{background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)', border: 'none'}}
              >
                💚 Donate ${donation.amount || '0'} to {charity.name}
              </Button>
              
              <p className="text-center text-muted mt-3">
                <small>
                  ✅ Your donation is secure and tax-deductible. You'll receive a receipt immediately.
                </small>
              </p>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DonationForm;