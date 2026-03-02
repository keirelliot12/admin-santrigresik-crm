import { useEffect, useState } from 'react';
import SimpleBar from 'simplebar-react';
import { Col, Container, Form, Pagination, Row, Spinner, Alert } from 'react-bootstrap';
import { DATASET } from '../../../../../data/todo/todo-data';
import DragCard from './DragCard';
import avatar7 from '@/assets/img/avatar7.jpg'; // Dummy avatar mapping 

const Body = ({ showInfo }) => {

    const [dataset, setDataset] = useState(DATASET);
    const [tasks, setTasks] = useState(dataset.tasks);
    const [cards, setCards] = useState(dataset.cards);
    const [cardOrder, setCardOrder] = useState(dataset.cardOrder);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTasks = async () => {
        try {
            const res = await fetch('/api/todo');
            if (!res.ok) throw new Error('Failed to fetch Todo list');
            const data = await res.json();
            
            // Map DB structure to Jampack Todo Structure
            const formattedTasks = {};
            const dbCards = {
                "card-1": { id: "card-1", title: "All Tasks", taskIds: [] },
                "card-2": { id: "card-2", title: "Completed", taskIds: [] },
            };

            data.forEach((task) => {
                formattedTasks[task.id] = {
                    id: task.id,
                    checked: task.status === "DONE",
                    stared: false,
                    task_name: task.title,
                    priority: task.priority || "Medium",
                    indicator: task.priority === "HIGH" ? "danger" : "primary",
                    task_time: [{ time: new Date(task.createdAt).toLocaleDateString(), text: "primary" }],
                    img: avatar7, // Mocking avatar for now
                    badge: [{ text: task.status, bg: task.status === "DONE" ? "success" : "info" }],
                };
                
                if (task.status === "DONE") {
                    dbCards["card-2"].taskIds.push(task.id);
                } else {
                    dbCards["card-1"].taskIds.push(task.id);
                }
            });

            // Prevent blank screen if empty
            if (Object.keys(formattedTasks).length > 0) {
                 setTasks(formattedTasks);
                 setCards(dbCards);
                 setCardOrder(["card-1", "card-2"]);
            }
            
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    return (
        <div className="todo-body">
            <SimpleBar className="nicescroll-bar">
                <Container>
                    <div className="todo-toolbar">
                        <div>
                            <Form.Select size="sm" >
                                <option value={0}>Bulk actions</option>
                            </Form.Select>
                            <button className="btn btn-sm btn-light ms-2" onClick={fetchTasks}>Refresh</button>
                        </div>
                        <div>
                            <Pagination className="custom-pagination pagination-simple m-0 ms-3">
                                <Pagination.Prev disabled>
                                    <i className="ri-arrow-left-s-line" />
                                </Pagination.Prev>
                                <Pagination.Item className="paginate_button active">1</Pagination.Item>
                                <Pagination.Next className="paginate_button" disabled>
                                    <i className="ri-arrow-right-s-line" />
                                </Pagination.Next>
                            </Pagination>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                        </div>
                    ) : error ? (
                        <Alert variant="danger">{error} (Showing dummy data instead)</Alert>
                    ) : (
                        <DragCard
                            cards={cards}
                            tasks={tasks}
                            cardOrder={cardOrder}
                            setCards={setCards}
                            setTasks={setTasks}
                            setCardOrder={setCardOrder}
                            taskInfo={showInfo}
                        />
                    )}

                </Container>
            </SimpleBar>
        </div >
    )
}

export default Body