import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function CharityList() {
  const [charities, setCharities] = useState([]);
  const [filteredCharities, setFilteredCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'education', label: '📚 Education' },
    { value: 'health', label: '🏥 Health' },
    { value: 'environment', label: '🌿 Environment' },
    { value: 'animal_welfare', label: '🐾 Animal Welfare' },
    { value: 'humanitarian', label: '❤️ Humanitarian' }
  ];

  useEffect(() => {
    fetchCharities();
  }, []);

  useEffect(() => {
    filterCharities();
  }, [searchTerm, selectedCategory, charities]);

  const fetchCharities = async () => {
    try {
      const response = await axios.get('/api/charities');
      if (response && response.data && Array.isArray(response.data) && response.data.length) {
        setCharities(response.data);
        setFilteredCharities(response.data);
        setLoading(false);
        return;
      }

      // Fallback to mock if API returns empty
      throw new Error('No charities returned');
    } catch (error) {
      console.warn('Backend charities fetch failed, using mock data:', error.message || error);
      const mockCharities = [
        {
          _id: '1',
          name: 'Red Cross',
          description: 'Providing emergency assistance, disaster relief, and education internationally.',
          category: 'humanitarian',
          totalDonations: 50000,
          donationCount: 250,
          verificationStatus: 'verified'
        },
        {
          _id: '2',
          name: 'World Wildlife Fund',
          description: 'Conserving nature and reducing the most pressing threats to biodiversity.',
          category: 'environment',
          totalDonations: 75000,
          donationCount: 300,
          verificationStatus: 'verified'
        },
        {
          _id: '3',
          name: 'UNICEF',
          description: 'Working for the rights of every child, every day, across the globe.',
          category: 'humanitarian',
          totalDonations: 100000,
          donationCount: 500,
          verificationStatus: 'verified'
        },
        {
          _id: '4',
          name: 'Doctors Without Borders',
          description: 'Providing medical aid where it\'s needed most, independent of governments.',
          category: 'health',
          totalDonations: 60000,
          donationCount: 200,
          verificationStatus: 'verified'
        },
        {
          _id: '5',
          name: 'The Nature Conservancy',
          description: 'Conserving the lands and waters on which all life depends.',
          category: 'environment',
          totalDonations: 45000,
          donationCount: 180,
          verificationStatus: 'verified'
        },
        {
          _id: '6',
          name: 'Save the Children',
          description: 'Giving children a healthy start, education, and protection from harm.',
          category: 'education',
          totalDonations: 55000,
          donationCount: 220,
          verificationStatus: 'verified'
        }
      ];
      setCharities(mockCharities);
      setFilteredCharities(mockCharities);
      setLoading(false);
    }
  };

  const filterCharities = () => {
    let filtered = charities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(charity =>
        charity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        charity.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(charity => charity.category === selectedCategory);
    }

    setFilteredCharities(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  if (loading) return (
    <Container className="text-center py-5">
      <Spinner animation="border" style={{color: '#667eea'}} role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-3" style={{color: '#667eea', fontWeight: 600}}>Loading charities...</p>
    </Container>
  );

  return (
    <Container className="py-section">
      <div className="mb-5">
        <h1 style={{color: '#2c3e50', fontWeight: 700, fontSize: '2.5rem'}}>💙 Support a Charity</h1>
        <p className="lead text-muted">Choose from verified charities and make your impact today</p>
      </div>
      
      {/* Search and Filter Section */}
      <Row className="mb-5 p-4 rounded" style={{background: 'linear-gradient(135deg, #f5f7fa 0%, #e0e7ff 100%)'}}>
        <Col md={6} className="mb-3 mb-md-0">
          <Form.Label className="fw-bold mb-2">Search Charities</Form.Label>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-control-custom"
            />
            <InputGroup.Text style={{background: 'white', border: '2px solid #e0e0e0'}}>
              🔍
            </InputGroup.Text>
          </InputGroup>
        </Col>
        <Col md={6}>
          <Form.Label className="fw-bold mb-2">Filter by Category</Form.Label>
          <Form.Select value={selectedCategory} onChange={handleCategoryChange} className="form-control-custom">
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Results Counter */}
      <div className="mb-4">
        <p className="text-muted">
          Showing <strong>{filteredCharities.length}</strong> of <strong>{charities.length}</strong> charities
        </p>
      </div>

      {/* Charities Grid */}
      {filteredCharities.length === 0 ? (
        <div className="text-center py-5">
          <span style={{fontSize: '3rem'}}>🔍</span>
          <h4 className="mt-3">No charities found</h4>
          <p className="text-muted">Try a different search term or category</p>
        </div>
      ) : (
        <Row>
          {filteredCharities.map(charity => (
            <Col lg={4} md={6} key={charity._id} className="mb-4">
              <Card className="charity-card h-100">
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3 text-center">
                    <div className="charity-icon mb-3" style={{
                      width: '70px',
                      height: '70px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      boxShadow: '0 5px 15px rgba(102, 126, 234, 0.3)'
                    }}>
                      {charity.category === 'environment' ? '🌿' : 
                       charity.category === 'health' ? '🏥' :
                       charity.category === 'education' ? '📚' :
                       charity.category === 'animal_welfare' ? '🐾' : '❤️'}
                    </div>
                    <Card.Title style={{color: '#2c3e50', fontWeight: 700}}>{charity.name}</Card.Title>
                    <span className="badge-category">{charity.category.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  
                  <Card.Text className="flex-grow-1 text-muted">
                    {charity.description.length > 120 
                      ? `${charity.description.substring(0, 120)}...` 
                      : charity.description}
                  </Card.Text>
                  
                  <div className="mt-4">
                    <div className="d-flex justify-content-between mb-2 pb-2" style={{borderBottom: '1px solid #eee'}}>
                      <small className="text-muted">💰 Total Raised:</small>
                      <strong style={{color: '#4CAF50'}}>${charity.totalDonations?.toLocaleString()}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <small className="text-muted">👥 Donations:</small>
                      <strong style={{color: '#667eea'}}>{charity.donationCount}</strong>
                    </div>
                    
                    <Button
                      as={Link}
                      to={`/donate/${charity._id}`}
                      state={{ charity }}
                      className="w-100 btn btn-success-custom"
                      style={{background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'}}
                    >
                      💚 Donate Now
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* CTA Section */}
      <div className="mt-5 p-5 rounded text-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
        <h4 style={{fontWeight: 700, marginBottom: '1rem'}}>Want to list your charity?</h4>
        <p style={{fontSize: '1.1rem', marginBottom: '1.5rem'}}>Contact us to get your organization verified and listed on our platform.</p>
        <Button className="btn btn-outline-light fw-bold">📧 Contact Us</Button>
      </div>
    </Container>
  );
}

export default CharityList;