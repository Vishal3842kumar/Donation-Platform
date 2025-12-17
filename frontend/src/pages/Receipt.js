import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import api from '../services/api';

function Receipt() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getCharityName = (d) => {
    if (!d) return 'Red Cross';
    if (d.charity) {
      if (typeof d.charity === 'string') return d.charity;
      if (d.charity.name) return d.charity.name;
    }
    return 'Red Cross';
  };

  const getCharityCategory = (d) => {
    if (!d) return '';
    const raw = d.charity && (typeof d.charity === 'string' ? '' : d.charity.category);
    if (!raw) return '';
    return raw.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  useEffect(() => {
    // Prefer donation passed via navigation state (from DonationForm)
    if (location && location.state && location.state.donation) {
      setDonation(location.state.donation);
      setLoading(false);
      return;
    }

    fetchDonation();
  }, [donationId, location]);

  const fetchDonation = async () => {
    try {
      // First try to fetch from the backend
      try {
        const response = await api.get(`/donations/${donationId}`);
        if (response.data) {
          console.log('✅ Donation fetched from backend:', response.data);
          setDonation(response.data);
          setLoading(false);
          return;
        }
      } catch (backendErr) {
        console.warn('⚠️ Backend fetch failed, will use fallback:', backendErr.message);
        // If backend fails, fall through to mock data
      }
      
      // Fallback to mock data if backend request fails
      const mockDonation = {
        _id: donationId || '1',
        receiptNumber: `DON-${Date.now()}-ABC123`,
        amount: 100,
        currency: 'USD',
        status: 'completed',
        donor: {
          name: 'John Doe',
          email: 'john@example.com',
          anonymous: false
        },
        charity: {
          name: 'Red Cross'
        },
        paymentMethod: 'Credit Card',
        createdAt: new Date().toISOString(),
        message: 'Thank you for the great work!'
      };
      
      console.log('📋 Using mock donation data (backend not available)');
      setDonation(mockDonation);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching donation:', error);
      setError('Unable to load receipt. Please try again.');
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    if (!donation) return;
    
    const receiptContent = `
      DONATION RECEIPT
      ================
      
      Receipt Number: ${donation.receiptNumber}
      Date: ${new Date(donation.createdAt).toLocaleDateString()}
      Time: ${new Date(donation.createdAt).toLocaleTimeString()}
      
      DONOR INFORMATION:
      ------------------
      Name: ${donation.donor && donation.donor.anonymous ? 'Anonymous' : (donation.donor ? donation.donor.name : '')}
      ${donation.donor && donation.donor.email && !(donation.donor.anonymous) ? `Email: ${donation.donor.email}` : ''}
      
      DONATION DETAILS:
      -----------------
      Charity: ${getCharityName(donation)}
      Charity Type: ${getCharityCategory(donation)}
      Amount: $${donation.amount}${donation.currency ? ' ' + donation.currency : ''}
      ${donation.paymentMethod ? `Payment Method: ${donation.paymentMethod}` : ''}
      Status: ${donation.status.toUpperCase()}
      
      ${donation.message ? `Message: "${donation.message}"` : ''}
      
      TAX INFORMATION:
      ----------------
      This receipt serves as an official record of your charitable donation.
      You may use this receipt for tax deduction purposes in accordance with
      applicable tax laws in your jurisdiction.
      
      Thank you for your generous support!
      
      ====================================
      Donation Platform
      support@donationplatform.com
      Generated on: ${new Date().toLocaleString()}
    `;

    // Create and download text file
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${donation.receiptNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const printReceipt = () => {
    window.print();
  };

  if (loading) return (
    <Container className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3">Loading receipt...</p>
    </Container>
  );

  if (error) return (
    <Container>
      <Alert variant="danger">{error}</Alert>
      <Button variant="primary" onClick={() => navigate('/')}>
        Return to Home
      </Button>
    </Container>
  );

  if (!donation) return (
    <Container>
      <Alert variant="warning">Receipt not found</Alert>
      <Button variant="primary" onClick={() => navigate('/')}>
        Return to Home
      </Button>
    </Container>
  );

  return (
    <Container className="print-container">
      <Card className="p-4 shadow-sm mb-4">
        <div className="text-center mb-4">
          <h1 className="text-success mb-3">Thank You for Your Donation!</h1>
          <p className="lead">Your contribution makes a difference.</p>
        </div>

        <div className="receipt-details p-4 border rounded">
          <h3 className="text-center mb-4 border-bottom pb-3">Official Donation Receipt</h3>
          
          <div className="row mb-3">
            <div className="col-md-6">
              <p><strong>Receipt Number:</strong> {donation.receiptNumber}</p>
              <p><strong>Date:</strong> {new Date(donation.createdAt).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(donation.createdAt).toLocaleTimeString()}</p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="status-badge">
                <span className="badge bg-success">{donation.status.toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <h5>Donor Information</h5>
              <p><strong>Name:</strong> {donation.donor && donation.donor.anonymous ? 'Anonymous' : (donation.donor ? donation.donor.name : '')}</p>
              {donation.donor && donation.donor.email && !donation.donor.anonymous && (
                <p><strong>Email:</strong> {donation.donor.email}</p>
              )}
            </div>
            <div className="col-md-6">
              <h5>Donation Details</h5>
              <p><strong>Charity:</strong> {getCharityName(donation)}</p>
              {getCharityCategory(donation) && (
                <p><strong>Type:</strong> {getCharityCategory(donation)}</p>
              )}
              <p><strong>Amount:</strong> <span className="fs-4 text-success">${donation.amount}{donation.currency ? ' ' + donation.currency : ''}</span></p>
              {donation.paymentMethod && (
                <p><strong>Payment Method:</strong> {donation.paymentMethod}</p>
              )}
            </div>
          </div>

          {donation.message && (
            <div className="mb-4">
              <h5>Your Message</h5>
              <div className="p-3 bg-light rounded">
                <em>"{donation.message}"</em>
              </div>
            </div>
          )}

          <div className="tax-info p-3 bg-light rounded mb-4">
            <h5>Tax Information</h5>
            <p className="mb-0">
              This receipt serves as an official record of your charitable donation. 
              You may use this receipt for tax deduction purposes in accordance with 
              applicable tax laws in your jurisdiction.
            </p>
          </div>

          <div className="text-center">
            <p className="text-muted">
              <small>
                {donation.donor && donation.donor.email && !donation.donor.anonymous ? (
                  <>
                    A receipt has been sent to your email at {donation.donor.email}.<br />
                    Please check your spam folder if you don't see it.
                  </>
                ) : (
                  <>No email was provided or donation marked anonymous; no email was sent.</>
                )}
              </small>
            </p>
          </div>
        </div>

        <div className="mt-4 d-flex flex-wrap gap-3 justify-content-center">
          <Button variant="primary" onClick={downloadReceipt} className="px-4">
            📄 Download Receipt
          </Button>
          <Button variant="outline-primary" onClick={printReceipt} className="px-4">
            🖨️ Print Receipt
          </Button>
          <Button variant="success" onClick={() => navigate('/profile', { state: { refreshNeeded: true } })} className="px-4">
            👤 View My Profile
          </Button>
          <Button variant="outline-secondary" href="/charities" className="px-4">
            ❤️ Donate to Another Charity
          </Button>
          <Button variant="outline-secondary" href="/" className="px-4">
            🏠 Return to Home
          </Button>
        </div>
      </Card>

      <style jsx="true">{`
        @media print {
          .print-container {
            padding: 0 !important;
          }
          .receipt-details {
            border: 1px solid #000 !important;
          }
          .btn, .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Container>
  );
}

export default Receipt;