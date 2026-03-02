"use client"
import { Col, Container, Form, InputGroup, Nav, Row, Tab, Card } from 'react-bootstrap';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import moment from 'moment';
import { Calendar, Users, Target, Activity, FileText } from 'react-feather';
import ChatBotInterface from '../apps/chat-popup/chat-bot/ChatBotInterface';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const Dashboard = () => {
    const { data: session } = useSession();
    const [stats, setStats] = useState({
        contacts: { total: 0 },
        tasks: { total: 0, completed: 0 },
        invoices: { total: 0, revenue: 0, paidCount: 0 },
        events: { upcoming: 0 }
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard');
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <>
            <ChatBotInterface show={false} />
            <Container fluid="xxl" >
                <Tab.Container activeKey="overview">
                    {/* Page Header */}
                    <div className="hk-pg-header pg-header-wth-tab pt-7">
                        <div className="d-flex">
                            <div className="d-flex flex-wrap justify-content-between flex-1">
                                <div className="mb-lg-0 mb-2 me-8">
                                    <h1 className="pg-title">Welcome back, {session?.user?.name || "Admin"}!</h1>
                                    <p>Here is the overview of SantriGresik CRM activities.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    
                    {/* Page Body */}
                    <div className="hk-pg-body">
                        <Tab.Content>
                            <Tab.Pane eventKey="overview" >
                                <Row>
                                    <Col lg={3} sm={6} className="mb-3">
                                        <Card className="card-border card-sm">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="d-flex align-items-center">
                                                        <span className="feather-icon text-primary me-2"><Users /></span>
                                                        <span className="fw-medium text-dark">Total Contacts</span>
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-end">
                                                    <span className="d-block display-4 text-dark mb-0">{stats.contacts.total}</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col lg={3} sm={6} className="mb-3">
                                        <Card className="card-border card-sm">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="d-flex align-items-center">
                                                        <span className="feather-icon text-info me-2"><Target /></span>
                                                        <span className="fw-medium text-dark">Tasks (Active/Done)</span>
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-end">
                                                    <span className="d-block display-4 text-dark mb-0">{stats.tasks.total - stats.tasks.completed} <span className="fs-6 text-muted">/ {stats.tasks.completed}</span></span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col lg={3} sm={6} className="mb-3">
                                        <Card className="card-border card-sm">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="d-flex align-items-center">
                                                        <span className="feather-icon text-success me-2"><Activity /></span>
                                                        <span className="fw-medium text-dark">Revenue (Paid)</span>
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-end">
                                                    <span className="d-block display-4 text-dark mb-0">${stats.invoices.revenue.toLocaleString()}</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col lg={3} sm={6} className="mb-3">
                                        <Card className="card-border card-sm">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="d-flex align-items-center">
                                                        <span className="feather-icon text-warning me-2"><Calendar /></span>
                                                        <span className="fw-medium text-dark">Upcoming Events</span>
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-end">
                                                    <span className="d-block display-4 text-dark mb-0">{stats.events.upcoming}</span>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                                
                                <Row className="mt-4">
                                    <Col md={12}>
                                         <Card className="card-border text-center py-8">
                                             <Card.Body>
                                                <h3 className="mb-3">SantriGresik CRM System</h3>
                                                <p className="text-muted">Explore the Apps menu on the sidebar to manage Contacts, Kanban Boards, To-do Lists, Calendars, Invoices, Chat, and File Manager.</p>
                                             </Card.Body>
                                         </Card>
                                    </Col>
                                </Row>
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                    {/* /Page Body */}
                </Tab.Container>
            </Container>
        </>
    )
}

export default Dashboard;