import { ChevronDown, ChevronUp } from "react-feather";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Badge, Button, Dropdown, Form, ListGroup, Spinner } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import classNames from 'classnames';
import { useWindowWidth } from '@react-hook/window-size';
import { Archive, Calendar, Check, Edit, Inbox, Layout, Mail, RefreshCw, Send, Settings, Star, Trash2 } from 'react-feather';
import { useGlobalStateContext } from '@/context/GolobalStateProvider';
import ComposeEmail from './ComposeEmail';

const InboxList = ({ show, toggleSidebar }) => {
    const { states, dispatch } = useGlobalStateContext();
    const [showComposePopup, setShowComposePopup] = useState(false);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);

    const width = useWindowWidth();
    
    const Conversation = () => {
        if (width <= 991) {
            dispatch({ type: "open_email" })
            dispatch({ type: "top_nav_toggle" })
        }
    }

    const fetchEmails = async () => {
        try {
            const res = await fetch('/api/email');
            if (res.ok) {
                const data = await res.json();
                setEmails(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    return (
        <>
            <div className="emailapp-aside">
                <header className="aside-header">
                    <Dropdown>
                        <Dropdown.Toggle as="a" className="emailapp-title link-dark" href="#">
                            <h1>Inbox</h1>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item>
                                <span className="feather-icon dropdown-icon">
                                    <Inbox />
                                </span>
                                <span>Inbox</span>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <span className="feather-icon dropdown-icon">
                                    <Send />
                                </span>
                                <span>Sent</span>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <span className="feather-icon dropdown-icon">
                                    <Archive />
                                </span>
                                <span>Archive</span>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <span className="feather-icon dropdown-icon">
                                    <Edit />
                                </span>
                                <span>Draft</span>
                            </Dropdown.Item>
                            <Dropdown.Item>
                                <span className="feather-icon dropdown-icon">
                                    <Trash2 />
                                </span>
                                <span>Trash</span>
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <div className="d-flex">
                        <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={fetchEmails}>
                            <span className="icon">
                                <span className="feather-icon">
                                    <RefreshCw />
                                </span>
                            </span>
                        </Button>
                        <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover mx-1">
                            <span className="icon">
                                <span className="feather-icon">
                                    <Settings />
                                </span>
                            </span>
                        </Button>
                        <Button as="a" href="#" className="btn-icon btn-flush-dark btn-rounded flush-soft-hover hk-navbar-togglable d-sm-inline-block d-none" onClick={() => dispatch({ type: "top_nav_toggle" })} >
                            <span className="icon">
                                <span className="feather-icon">
                                    {states.layoutState.topNavCollapse ? <ChevronDown /> : <ChevronUp />}
                                </span>
                            </span>
                        </Button>
                    </div>
                    <div className={classNames("hk-sidebar-togglable", { "active": !show })} onClick={toggleSidebar} />
                </header>

                <SimpleBar className="aside-body">
                    <Form className="aside-search" role="search">
                        <Form.Control type="text" placeholder="Search inbox" />
                    </Form>
                    
                    {loading ? (
                        <div className="d-flex justify-content-center p-4">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : (
                        <ListGroup variant="flush" className="email-list">
                            {emails.length === 0 ? (
                                <div className="text-center p-4 text-muted">No emails found</div>
                            ) : (
                                emails.map((email, index) => (
                                    <ListGroup.Item as="li" onClick={Conversation} key={index}>
                                        <div className={classNames("media", { "read-email": email.isRead })}>
                                            <div className="media-head">
                                                <div className="avatar avatar-sm avatar-primary avatar-rounded">
                                                    <span className="initial-wrap">{email.sender?.name?.charAt(0).toUpperCase() || email.sender?.email?.charAt(0).toUpperCase() || "U"}</span>
                                                </div>
                                            </div>
                                            <div className="media-body">
                                                <div>
                                                    <div>
                                                        <div className="email-head">{email.sender?.name || email.sender?.email}</div>
                                                        <div>
                                                            <span className={classNames("email-star", { "marked": email.isStarred })}><span className="feather-icon"><Star /></span></span>
                                                            <div className="email-time">{new Date(email.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="email-subject">{email.subject}</div>
                                                    <div className="email-text">
                                                        <p>{email.body}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    )}
                </SimpleBar>
            </div>
            {/* Compose email */}
            <ComposeEmail show={showComposePopup} onClose={() => setShowComposePopup(!showComposePopup)} />
            {/* /Compose email */}
        </>
    )
}

export default InboxList;