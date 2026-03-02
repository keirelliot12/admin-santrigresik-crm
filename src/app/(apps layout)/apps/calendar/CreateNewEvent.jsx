import { useState } from 'react';
import { Button, Col, Form, InputGroup, Modal, Row } from 'react-bootstrap';
import DateRangePicker from 'react-bootstrap-daterangepicker';

const CreateNewEvent = ({ show, hide, calendarRef }) => {

    const [title, setTitle] = useState("");
    const [start, setStart] = useState(new Date().toISOString().substring(0, 16));
    const [end, setEnd] = useState(new Date().toISOString().substring(0, 16));
    const [calendarType, setCalendarType] = useState("Work");
    const [description, setDescription] = useState("");

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/calendar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    start: start,
                    end: end,
                    calendar: calendarType,
                    description: description
                })
            });
            if (res.ok) {
                const newEvent = await res.json();
                
                // Add event to FullCalendar UI immediately without waiting for parent fetch
                let calendarApi = calendarRef.current.getApi();
                calendarApi.addEvent({
                    id: newEvent.id,
                    title: newEvent.title,
                    start: newEvent.start,
                    end: newEvent.end,
                    backgroundColor: newEvent.calendar === "Work" ? "#298DFF" : (newEvent.calendar === "Personal" ? "#da82f8" : "#FFC400"),
                    borderColor: newEvent.calendar === "Work" ? "#298DFF" : (newEvent.calendar === "Personal" ? "#da82f8" : "#FFC400"),
                });

                // Reset Form
                setTitle("");
                setCalendarType("Work");
                setDescription("");
                hide();
            } else {
                alert("Failed to create event");
            }
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <Modal show={show} onHide={hide} size="lg" centered >
            <Modal.Body>
                <Button bsPrefix='btn-close' onClick={hide} >
                    <span aria-hidden="true">×</span>
                </Button>
                <h5 className="mb-4">Create New Event</h5>
                <Form onSubmit={handleCreateEvent}>
                    <Row className="gx-3">
                        <Col sm={12} as={Form.Group} className="mb-3" >
                            <Form.Label>Name</Form.Label>
                            <Form.Control required className="cal-event-name" type="text" value={title} onChange={e => setTitle(e.target.value)} />
                        </Col>
                        <Col sm={6} as={Form.Group} className="mb-3" >
                            <Form.Label>Start Date/Time</Form.Label>
                            <Form.Control required type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
                        </Col>
                        <Col sm={6} as={Form.Group} className="mb-3" >
                            <Form.Label>End Date/Time</Form.Label>
                            <Form.Control required type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
                        </Col>
                        <Col sm={12} as={Form.Group} className="mb-3">
                            <Form.Label>Calendar Type</Form.Label>
                            <Form.Select value={calendarType} onChange={e => setCalendarType(e.target.value)}>
                                <option value="Work">Work (Blue)</option>
                                <option value="Personal">Personal (Purple)</option>
                                <option value="Important">Important (Yellow)</option>
                            </Form.Select>
                        </Col>
                        <Col sm={12} as={Form.Group} className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                        </Col>
                    </Row>
                    <Modal.Footer className="align-items-center mt-3 p-0 pt-3">
                        <Button variant="secondary" onClick={hide} >Discard</Button>
                        <Button variant="primary" type="submit" >Add Event</Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

export default CreateNewEvent;