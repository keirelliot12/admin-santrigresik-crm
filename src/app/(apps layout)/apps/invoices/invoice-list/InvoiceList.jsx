import { useState, useEffect } from 'react';
import { Col, Form, Row, Spinner, Alert } from 'react-bootstrap';
import HkDataTable from '@/components/@hk-data-table'
import { columns } from '@/data/invoices/invoice-table';

const InvoiceList = () => {

    const [searchTerm, setSearchTerm] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch('/api/invoices');
                if (!res.ok) throw new Error('Failed to fetch invoices');
                const data = await res.json();
                
                const formattedInvoices = data.map(inv => ({
                    id: inv.id,
                    invoice: inv.invoiceNumber,
                    date: new Date(inv.date).toLocaleDateString(),
                    reciplent: [{ title: inv.contact?.name || "No Contact", id: inv.contact?.email || "-" }],
                    status: [{ title: inv.status, bg: inv.status === "PAID" ? "success" : (inv.status === "DRAFT" ? "secondary" : "warning"), text: inv.dueDate ? `Due ${new Date(inv.dueDate).toLocaleDateString()}` : "" }],
                    activity: "-",
                    amount: `${inv.currency} ${inv.amount.toLocaleString()}`,
                    actions: [{ editLink: "#" }]
                }));

                setInvoices(formattedInvoices);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    return (
        <>
            <Row className="mb-3" >
                <Col xs={7} mb={3}>
                    <div className="invoice-toolbar-left">
                        <Form.Select size="sm" className="d-flex align-items-center w-130p">
                            <option value={1}>Export to CSV</option>
                            <option value={2}>Export to PDF</option>
                            <option value={3}>Send Message</option>
                            <option value={4}>Delegate Access</option>
                        </Form.Select>
                    </div>
                </Col>
                <Col xs={5} mb={3}>
                    <div className="invoice-toolbar-right">
                        <div className="dataTables_filter">
                            <label>
                                <Form.Control
                                    size='sm'
                                    type='search'
                                    placeholder='Search'
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </label>
                        </div>
                    </div>
                </Col>
            </Row>
            
            {loading ? (
                <div className="text-center p-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <HkDataTable
                    column={columns}
                    rowData={invoices}
                    rowSelection={true}
                    rowsPerPage={10}
                    searchQuery={searchTerm}
                    classes="nowrap w-100 mb-5"
                    responsive
                />
            )}
        </>
    )
}

export default InvoiceList;