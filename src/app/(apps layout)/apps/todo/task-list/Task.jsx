import classNames from 'classnames';
import { Draggable } from '@hello-pangea/dnd';
import { Badge, Dropdown, Form } from 'react-bootstrap';
import { MoreVertical, Star } from 'react-feather';
import HkBadge from '@/components/@hk-badge/@hk-badge';
import Image from 'next/image';

const Task = (props) => {
    
    // Auto sync Checkbox to backend API
    const handleToggleStatus = async () => {
        try {
            const res = await fetch('/api/todo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "TOGGLE_STATUS", payload: { id: props.task.id } })
            });
            if (res.ok) {
                 // Trigger full component reload or manual state sync, but for Jampack UI dragging it out might be easier
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (

        <Draggable
            draggableId={props.task.id}
            index={props.index}
        >
            {(provided, snapshot) => (

                <li
                    className={classNames("advance-list-item single-task-list active-todo", { "selected": props.task.checked })}
                    key={props.task.id}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                >
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">

                            <Form.Check>
                                <Form.Check.Input
                                    type="checkbox"
                                    defaultChecked={props.task.checked}
                                    onChange={handleToggleStatus}
                                />
                                <Form.Check.Label />
                            </Form.Check>

                            <div>
                                <span className={classNames("todo-star", { " marked": props.task.stared })}>
                                    <span className="feather-icon">
                                        <Star />
                                    </span>
                                </span>
                            </div>

                            <span className={classNames("badge-indicator", `badge-indicator-${props.task.indicator}`)}></span>
                            <span className="todo-text text-dark text-truncate" onClick={props.taskInfo}>{props.task.task_name}</span>
                            {
                                props.task.badge &&
                                props.task.badge.map((b, i) => (
                                    <Badge bg={b.bg} className="badge-sm ms-3 d-none d-lg-inline-block" key={i}>{b.text}</Badge>
                                ))
                            }
                        </div>
                        <div className="d-flex align-items-center">
                            {
                                props.task.task_time && props.task.task_time.map((t, i) => (
                                    <HkBadge bg="transparent" className="d-none d-sm-inline-block" text={t.text} key={i}>{t.time}</HkBadge>
                                ))
                            }
                            <div className="avatar avatar-xs avatar-rounded d-none d-md-inline-block ms-3">
                                {
                                    props.task.img && <Image src={props.task.img} alt="user" className="avatar-img" />
                                }
                                {
                                    props.task.avatarBg && <span className={classNames("initial-wrap", `bg-${props.task.avatarBg}`)}>{props.task.init_name}</span>
                                }

                            </div>
                            <Dropdown>
                                <Dropdown.Toggle as="a" href="#" className="btn btn-icon btn-flush-dark btn-rounded flush-soft-hover no-caret d-flex align-items-center ms-1">
                                    <span className="icon">
                                        <span className="feather-icon">
                                            <MoreVertical />
                                        </span>
                                    </span>
                                </Dropdown.Toggle>
                                <Dropdown.Menu align="end">
                                    <Dropdown.Item onClick={props.taskInfo}>View Details</Dropdown.Item>
                                    <Dropdown.Item>Action</Dropdown.Item>
                                    <Dropdown.Item>Another action</Dropdown.Item>
                                    <div className="dropdown-divider"></div>
                                    <Dropdown.Item className="text-danger">Delete</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </div>
                    </div>
                </li>
            )}
        </Draggable>

    )
}

export default Task