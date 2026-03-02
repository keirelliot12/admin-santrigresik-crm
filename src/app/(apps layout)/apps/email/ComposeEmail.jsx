import { useState } from 'react';
import classNames from 'classnames';
import { Button, Form } from 'react-bootstrap';
import { Edit, Maximize2, Minimize2, Minus, Paperclip, Trash2, X } from 'react-feather';
import HkChips from '@/components/@hk-chips/@hk-chips';
import HkTooltip from '@/components/@hk-tooltip/HkTooltip';
import { useGlobalStateContext } from '@/context/GolobalStateProvider';

//Images
import avatar11 from '@/assets/img/avatar11.jpg';
import avatar12 from '@/assets/img/avatar12.jpg';
import avatar13 from '@/assets/img/avatar13.jpg';

const ComposeEmail = () => {
    const { states, dispatch } = useGlobalStateContext();
    const [recipients, setRecipients] = useState([]);
    const [newRecipient, setNewRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    const handleMinimize = () => {
        dispatch({ type: "maximize_modal", maximize: false })
        dispatch({ type: "minimize_modal", minimize: !states.emailState.minimize })

    }

    const handleClose = () => {
        dispatch({ type: "compose_email", composeEmail: !states.emailState.composeEmail })
        dispatch({ type: "maximize_modal", maximize: false })
        dispatch({ type: "minimize_modal", minimize: false })

    }

    const handleRecipients = () => {
        setRecipients(recipients => recipients.concat(newRecipient));
    }

    const onEnter = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleRecipients();
            setNewRecipient("");
        }
    }

    const removeChip = (index) => {
        const arr = [...recipients]
        arr.splice(index, 1)
        setRecipients(arr)
    }

    const handleSendEmail = async (e) => {
        e.preventDefault();
        let finalTo = recipients.join(",");
        if (newRecipient.trim() !== "") {
             finalTo += (finalTo ? "," : "") + newRecipient;
        }
        
        if (!finalTo) {
             alert("Tolong tambahkan penerima email!");
             return;
        }

        try {
            const res = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, body, to: finalTo })
            });

            if (res.ok) {
                alert("Email has been sent and saved to Database!");
                setRecipients([]);
                setNewRecipient("");
                setSubject("");
                setBody("");
                handleClose();
                window.location.reload(); // Refresh Inbox
            } else {
                alert("Failed to send email");
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={classNames("compose-email-popup", { "d-block": states.emailState.composeEmail }, { "minimize": states.emailState.minimize }, { "maximize": states.emailState.maximize })}>
            <header>
                <div className="d-flex align-items-center">
                    <span className="text-white">New Message</span>
                </div>
                <div className="d-flex align-items-center">
                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={handleMinimize} >
                        <span className="icon">
                            <span className="feather-icon">
                                {states.emailState.minimize ? <Maximize2 /> : <Minus />}
                            </span>
                        </span>
                    </Button>
                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={() => dispatch({ type: "maximize_modal", maximize: !states.emailState.maximize })} >
                        <span className="icon">
                            <span className="feather-icon">
                                {states.emailState.maximize ? <Minimize2 /> : <Maximize2 />}
                            </span>
                        </span>
                    </Button>
                    <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover ms-1" onClick={handleClose} >
                        <span className="icon">
                            <span className="feather-icon">
                                <X />
                            </span>
                        </span>
                    </Button>
                </div>
            </header>
            <div className="custom-slimscroll">
                <Form onSubmit={handleSendEmail}>
                    <Form.Group className="mb-3">
                        <div className="d-flex flex-wrap align-items-center form-control custom-input">
                            <div className="chip-wrap w-100 mb-0">
                                {
                                    recipients.map((data, index) => (
                                        <HkChips key={index} className="chip chip-dismissable chip-wth-icon mb-2 me-2" variant="primary" dismissable onClose={() => removeChip(index)} >
                                            <span>{data}</span>
                                        </HkChips>
                                    ))
                                }
                            </div>
                            <Form.Control type="text" className="border-0 p-0 shadow-none flex-1 mb-2 me-2" placeholder="Add recipients" value={newRecipient} onChange={e => setNewRecipient(e.target.value)} onKeyDown={onEnter} />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3" >
                        <Form.Control placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Control as="textarea" rows={10} value={body} onChange={e => setBody(e.target.value)} />
                    </Form.Group>
                    <div className="compose-email-footer mt-3">
                        <div>
                            <Button variant="primary" className="me-2" type="submit">Send</Button>
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                <HkTooltip id="flag" title="Add Flag" placement="top" >
                                    <span className="icon">
                                        <span className="feather-icon">
                                            <Paperclip />
                                        </span>
                                    </span>
                                </HkTooltip>
                            </Button>
                        </div>
                        <div>
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover">
                                <HkTooltip id="draft" title="Save Draft" placement="top" >
                                    <span className="icon">
                                        <span className="feather-icon">
                                            <Edit />
                                        </span>
                                    </span>
                                </HkTooltip>
                            </Button>
                            <Button variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover" onClick={handleClose}>
                                <HkTooltip id="delete" title="Delete" placement="top" >
                                    <span className="icon">
                                        <span className="feather-icon">
                                            <Trash2 />
                                        </span>
                                    </span>
                                </HkTooltip>
                            </Button>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default ComposeEmail;