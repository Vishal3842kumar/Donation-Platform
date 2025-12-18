import React, { useState } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import api from '../services/api';

function ContactUs() {
  const [formData, setFormData] = useState({
    charityName: '',
    description: '',
    category: 'education',
    website: '',
    contactEmail: '',
    contactName: '',
    reason: 'add_charity'
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/charities/request', formData);

      setSubmitted(true);
      setFormData({
        charityName: '',
        description: '',
        category: 'education',
        website: '',
        contactEmail: '',
        contactName: '',
        reason: 'add_charity'
      });

      // Reset submitted message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="mb-5 text-center">
        <h1 style={{ color: '#2c3e50', fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
          Add Your Charity
        </h1>
        <p className="lead text-muted" style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Is your charity organization not listed? Submit your details below and our team will review your request. 
          We verify all charities to ensure transparency and legitimacy.
        </p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          {submitted && (
            <Alert variant="success" className="mb-4">
              <Alert.Heading>Thank You! ✅</Alert.Heading>
              <p>
                Your charity submission has been received. Our team will review your request within 2-3 business days.
                We'll contact you at the email provided with updates.
              </p>
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="mb-4">
              <Alert.Heading>Error!</Alert.Heading>
              <p>{error}</p>
            </Alert>
          )}

          <Card className="shadow-lg" style={{ border: 'none', borderRadius: '12px' }}>
            <Card.Body className="p-5">
              <Form onSubmit={handleSubmit}>
                {/* Contact Information Section */}
                <h5 className="mb-4" style={{ color: '#2c3e50', fontWeight: 600, borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
                  Your Information
                </h5>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#2c3e50' }}>Contact Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    style={{ borderRadius: '8px', border: '1px solid #ddd', padding: '10px' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#2c3e50' }}>Email Address *</Form.Label>
                  <Form.Control
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                    style={{ borderRadius: '8px', border: '1px solid #ddd', padding: '10px' }}
                  />
                </Form.Group>

                {/* Charity Information Section */}
                <h5 className="mb-4 mt-5" style={{ color: '#2c3e50', fontWeight: 600, borderBottom: '2px solid #4CAF50', paddingBottom: '10px' }}>
                  Charity Information
                </h5>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#2c3e50' }}>Charity Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="charityName"
                    value={formData.charityName}
                    onChange={handleChange}
                    placeholder="Official charity organization name"
                    required
                    style={{ borderRadius: '8px', border: '1px solid #ddd', padding: '10px' }}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#2c3e50' }}>Category *</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{ borderRadius: '8px', border: '1px solid #ddd', padding: '10px' }}
                  >
                    <option value="education">Education</option>
                    <option value="health">Health & Medical</option>
                    <option value="environment">Environment</option>
                    <option value="animal_welfare">Animal Welfare</option>
                    <option value="humanitarian">Humanitarian Aid</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#2c3e50' }}>Description *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about your charity organization, mission, and impact..."
                    required
                    style={{ borderRadius: '8px', border: '1px solid #ddd', padding: '10px' }}
                  />
                  <Form.Text className="text-muted">Minimum 50 characters</Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label style={{ fontWeight: 600, color: '#2c3e50' }}>Website URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.yourcharity.org"
                    style={{ borderRadius: '8px', border: '1px solid #ddd', padding: '10px' }}
                  />
                </Form.Group>

                {/* Submission Button */}
                <div className="d-grid gap-2 mt-5">
                  <Button
                    type="submit"
                    disabled={loading}
                    style={{
                      background: loading ? '#ccc' : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      border: 'none',
                      padding: '12px',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      borderRadius: '8px'
                    }}
                  >
                    {loading ? 'Submitting...' : '📤 Submit Your Charity'}
                  </Button>
                </div>

                <p className="text-muted text-center mt-4" style={{ fontSize: '0.95rem' }}>
                  * Required fields. We'll review your submission and get back to you within 2-3 business days.
                </p>
              </Form>
            </Card.Body>
          </Card>

          {/* Additional Information */}
          <Card className="mt-5" style={{ border: 'none', borderRadius: '12px', background: '#f8f9fa' }}>
            <Card.Body className="p-4">
              <h5 style={{ color: '#2c3e50', fontWeight: 600, marginBottom: '1rem' }}>✅ What We Verify</h5>
              <ul style={{ color: '#555', lineHeight: '1.8' }}>
                <li>Official charity registration and legal status</li>
                <li>Mission alignment with our platform values</li>
                <li>Transparency in financial reporting</li>
                <li>Contact information and operational legitimacy</li>
              </ul>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default ContactUs;
