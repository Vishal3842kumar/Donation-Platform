import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';

function NavigationBar() {
  const location = useLocation();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
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
        setToken(localStorage.getItem('token'));
        const raw = localStorage.getItem('user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {
        setToken(null);
        setUser(null);
      }
    };

    const onUserChanged = (e) => {
      if (e?.detail) {
        setUser(e.detail);
        setToken(localStorage.getItem('token'));
      } else {
        onStorage();
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('userChanged', onUserChanged);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userChanged', onUserChanged);
    };
  }, []);

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="navbar-custom">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <span style={{ color: '#4CAF50', marginRight: '8px', fontSize: '1.8rem' }}>❤️</span>
          <span style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                         WebkitBackgroundClip: 'text',
                         WebkitTextFillColor: 'transparent',
                         backgroundClip: 'text' }}>
            DonateHub
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'} className="fw-600">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/charities" active={location.pathname === '/charities'} className="fw-600">
              Charities
            </Nav.Link>
            <Nav.Link as={Link} to="/donations" active={location.pathname === '/donations'} className="fw-600">
              All Donations
            </Nav.Link>
            <Nav.Link as={Link} to="/contact-us" active={location.pathname === '/contact-us'} className="fw-600">
              Add Charity
            </Nav.Link>
            {!token && (
              <>
                <Nav.Link as={Link} to="/register" active={location.pathname === '/register'} className="fw-600">
                  Register
                </Nav.Link>
                <Nav.Link as={Link} to="/login" active={location.pathname === '/login'} className="fw-600">
                  Login
                </Nav.Link>
              </>
            )}
            {token && (
              <>
                <Nav.Link as={Link} to="/profile" active={location.pathname === '/profile'} className="fw-600">
                  Profile
                </Nav.Link>
                {user?.isAdmin && (
                  <Nav.Link as={Link} to="/admin" active={location.pathname === '/admin'} className="fw-600">
                    Admin
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
          <div className="d-flex gap-2 flex-wrap">
            <Button 
              as={Link} 
              to="/charities" 
              className="btn btn-success-custom"
              style={{background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'}}
            >
              💚 Donate Now
            </Button>
            {!token ? (
              <>
                <Button as={Link} to="/login" variant="outline-light" className="fw-600">
                  Sign In
                </Button>
                <Button as={Link} to="/register" variant="outline-light" className="fw-600">
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <span className="text-white me-3 d-flex align-items-center fw-600">
                  Welcome, {user?.name || 'User'}!
                </span>
                {user?.isAdmin && (
                  <Button as={Link} to="/admin" variant="outline-light" className="fw-600 me-2">
                    ⚙️ Admin
                  </Button>
                )}
                <Button 
                  as={Link} 
                  to="/profile" 
                  variant="outline-light"
                  className="fw-600"
                >
                  👤 My Profile
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;