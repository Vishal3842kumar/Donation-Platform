import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Form } from 'react-bootstrap';
import api from '../services/api';

function Admin() {
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [charTotal, setCharTotal] = useState(0);
  const [charPage, setCharPage] = useState(1);
  const [charLimit] = useState(10);
  const [charQuery, setCharQuery] = useState('');
  const [charStatus, setCharStatus] = useState('');
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) {
      setError('Not authenticated');
      return;
    }

    api.get('/admin/summary', { headers })
      .then(res => setSummary(res.data))
      .catch(err => setError(err?.response?.data?.error || err.message));

    api.get('/admin/users', { headers })
      .then(res => setUsers(res.data))
      .catch(err => setError(err?.response?.data?.error || err.message));

    fetchCharities(charPage, charLimit, charQuery, charStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCharities = useCallback((page = 1, limit = 10, q = '', status = '') => {
    if (!token) return;
    const params = { page, limit };
    if (q) params.q = q;
    if (status) params.status = status;

    api.get('/admin/charities', { headers, params })
      .then(res => {
        setCharities(res.data.data || []);
        setCharTotal(res.data.total || 0);
        setCharPage(res.data.page || page);
      })
      .catch(err => setError(err?.response?.data?.error || err.message));
  }, [token, headers]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`, { headers });
      setUsers(u => u.filter(x => x._id !== id));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      const res = await api.put(`/admin/charities/${id}/verify`, { status }, { headers });
      setCharities(list => list.map(c => c._id === id ? res.data : c));
    } catch (err) {
      setError(err?.response?.data?.error || err.message);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    fetchCharities(1, charLimit, charQuery, charStatus);
  };

  const goPage = (newPage) => {
    fetchCharities(newPage, charLimit, charQuery, charStatus);
  };

  if (error) return (
    <Container className="py-section">
      <Alert variant="danger">{error}</Alert>
    </Container>
  );

  return (
    <Container className="py-section">
      <h2 className="mb-4">Admin Dashboard</h2>
      <Row>
        <Col md={4} className="mb-3">
          <Card className="p-3">
            <h5>Users</h5>
            <p className="h3 m-0">{summary?.usersCount ?? '—'}</p>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="p-3">
            <h5>Charities</h5>
            <p className="h3 m-0">{summary?.charitiesCount ?? '—'}</p>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card className="p-3">
            <h5>Total Donated</h5>
            <p className="h3 m-0">${summary?.totalDonated ?? '0'}</p>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 mb-4">
        <Card.Body>
          <h5>Charities</h5>
          <Form onSubmit={onSearch} className="mb-3 d-flex gap-2">
            <Form.Control placeholder="Search charities or submitter" value={charQuery} onChange={e => setCharQuery(e.target.value)} />
            <Form.Select value={charStatus} onChange={e => setCharStatus(e.target.value)} style={{width: '180px'}}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
            <Button type="submit">Search</Button>
          </Form>

          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Submitted By</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {charities.map(c => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.category}</td>
                    <td>{c.submittedBy?.name || c.submittedBy?.email || '—'}</td>
                    <td>{c.verificationStatus}</td>
                    <td>
                      <Button size="sm" variant="success" className="me-2" onClick={() => handleVerify(c._id, 'verified')}>Verify</Button>
                      <Button size="sm" variant="warning" className="me-2" onClick={() => handleVerify(c._id, 'pending')}>Mark Pending</Button>
                      <Button size="sm" variant="danger" onClick={() => handleVerify(c._id, 'rejected')}>Reject</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <small>Showing page {charPage} — {charTotal} results</small>
            <div>
              <Button variant="outline-secondary" size="sm" disabled={charPage <= 1} onClick={() => goPage(charPage - 1)}>Previous</Button>{' '}
              <Button variant="outline-secondary" size="sm" disabled={(charPage * charLimit) >= charTotal} onClick={() => goPage(charPage + 1)}>Next</Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-4">
        <Card.Body>
          <h5>Users</h5>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Admin</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.isAdmin ? 'Yes' : 'No'}</td>
                    <td>
                      {!u.isAdmin && (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(u._id)}>Delete</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Admin;
