import { useState, useEffect } from 'react';
import SimpleBar from 'simplebar-react';
import { Button, Col, Form, Pagination, Row, Table, Spinner, Alert } from 'react-bootstrap';
import HkDataTable from '@/components/@hk-data-table';
import { columns } from '@/data/contact/contact-list';

const ContactAppBody = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [newContact, setNewContact] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        jobTitle: '',
        status: 'LEAD'
    });

    const fetchContacts = async () => {
        try {
            const res = await fetch('/api/contacts');
            if (!res.ok) throw new Error('Failed to fetch contacts');
            const data = await res.json();
            
            // Format data to match Jampack's HkDataTable structure
            const formattedData = data.map(contact => ({
                id: contact.id,
                starred: false,
                name: [{ cstmAvt: contact.name.charAt(0).toUpperCase(), avtBg: "primary", userName: contact.name }],
                email: contact.email || "-",
                phone: contact.phone || "-",
                tags: [{ title: contact.status, bg: contact.status === "LEAD" ? "info" : "success" }],
                labels: contact.company || contact.jobTitle || "-",
                dateCreated: new Date(contact.createdAt).toLocaleDateString(),
                actions: [{ archiveLink: "#", editLink: "#", deleteLink: "#" }]
            }));
            
            setContacts(formattedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleCreateContact = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newContact),
            });
            
            if (res.ok) {
                // Refresh list and clear form
                fetchContacts();
                setNewContact({ name: '', email: '', phone: '', company: '', jobTitle: '', status: 'LEAD' });
                // Hide form
                document.getElementById('collapseQuick').classList.remove('show');
            } else {
                alert('Failed to create contact');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        }
    };

    return (
        <div className="contact-body">
            <SimpleBar className="nicescroll-bar">
                <div className="collapse" id="collapseQuick">
                    <div className="quick-access-form-wrap">
                        <Form className="quick-access-form border" onSubmit={handleCreateContact}>
                            <Row className="gx-3">
                                <Col xxl={10}>
                                    <div className="position-relative">
                                        <Col md={12}>
                                            <Row className="gx-3">
                                                <Col lg={4}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Control required placeholder="Full name*" type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Control placeholder="Job Title" type="text" value={newContact.jobTitle} onChange={e => setNewContact({...newContact, jobTitle: e.target.value})} />
                                                    </Form.Group>
                                                </Col>
                                                <Col lg={4}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Control required placeholder="Email Id*" type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Control placeholder="Phone" type="text" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                                                    </Form.Group>
                                                </Col>
                                                <Col lg={4}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Control placeholder="Company" type="text" value={newContact.company} onChange={e => setNewContact({...newContact, company: e.target.value})} />
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Select value={newContact.status} onChange={e => setNewContact({...newContact, status: e.target.value})}>
                                                            <option value="LEAD">Lead</option>
                                                            <option value="CUSTOMER">Customer</option>
                                                            <option value="ARCHIVED">Archived</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </div>
                                </Col>
                                <Col xxl={2}>
                                    <Form.Group className="mb-3">
                                        <Button variant="primary" type="submit" className="btn-block">Create New</Button>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Button variant="secondary" className="btn-block btn-ghost" data-bs-toggle="collapse" href="#collapseQuick" aria-expanded="false">Discard</Button>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                </div>
                
                <div className="contact-list-view">
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3">Loading Contacts...</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="m-4">{error}</Alert>
                    ) : (
                        <HkDataTable
                            column={columns}
                            rowData={contacts}
                            rowSelection={true}
                            rowsPerPage={10}
                            classes="nowrap w-100 mb-5"
                            responsive
                        />
                    )}
                </div>
            </SimpleBar>
        </div>
    )
}

export default ContactAppBody;