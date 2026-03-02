import { useState, useEffect } from 'react';
import { Button, Col, Form, Modal, Row, Spinner, Alert } from 'react-bootstrap';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { DATASET } from './KanbanDatas';
import DragDropCards from './DragDropCards';
import { nanoid } from 'nanoid';

const Board = () => {
    const [dataset, setDataset] = useState(DATASET);
    const [tasks, setTasks] = useState(dataset.tasks);
    const [cards, setCards] = useState(dataset.cards);
    const [cardOrder, setCardOrder] = useState(dataset.cardOrder);

    const [addNewBoard, setAddNewBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Initial Data
    useEffect(() => {
        const fetchKanban = async () => {
            try {
                const res = await fetch('/api/kanban');
                if (!res.ok) throw new Error('Failed to fetch Kanban boards');
                const boards = await res.json();
                
                // If Database is empty, fallback to Jampack's DATASET dummy to maintain UI structure visually
                if (boards.length === 0) {
                    setLoading(false);
                    return;
                }

                // Format DB schema into Jampack's required object structure
                const dbTasks = {};
                const dbCards = {};
                const dbCardOrder = [];

                boards.forEach(board => {
                    dbCardOrder.push(board.id);
                    dbCards[board.id] = {
                        id: board.id,
                        title: board.title,
                        taskIds: board.tasks.map(t => t.id)
                    };

                    board.tasks.forEach(task => {
                        dbTasks[task.id] = {
                            id: task.id,
                            Task_Name: task.title,
                            Footer: false
                        };
                    });
                });

                setTasks(dbTasks);
                setCards(dbCards);
                setCardOrder(dbCardOrder);

            } catch (err) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchKanban();
    }, []);

    const onAddNewCard = async () => {
        if (!newBoardName.trim()) return;

        try {
            const res = await fetch('/api/kanban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "ADD_BOARD",
                    payload: { title: newBoardName, order: cardOrder.length }
                })
            });

            if (res.ok) {
                const createdBoard = await res.json();
                
                // Update local state to reflect DB id
                const newCardOrder = Array.from(cardOrder);
                newCardOrder.push(createdBoard.id);
                setCards({
                    ...cards,
                    [createdBoard.id]: { id: createdBoard.id, title: createdBoard.title, taskIds: [] }
                });
                setCardOrder(newCardOrder);
                setNewBoardName("");
                setAddNewBoard(false);
            } else {
                alert("Failed to create board.");
            }
        } catch (err) {
            console.error("ADD BOARD ERROR", err);
        }
    };

    if (loading) {
        return (
            <div className="taskboard-body d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        )
    }

    return (
        <>
            <div className="taskboard-body">
                {error && <Alert variant="warning" className="m-3">{error} (Showing sample data instead)</Alert>}
                <div>
                    <PerfectScrollbar className="tasklist-scroll position-relative">
                        <div id="board" className="tasklist-wrap">
                            <DragDropCards
                                tasks={tasks}
                                cards={cards}
                                cardOrder={cardOrder}
                                setCards={setCards}
                                setTasks={setTasks}
                                setCardOrder={setCardOrder}
                            />
                        </div>
                        <div className="card card-simple card-border tasklist add-new-task">
                            <Button variant="soft-primary" className="btn-add-newlist flex-shrink-0" onClick={() => setAddNewBoard(!addNewBoard)} >Add New List</Button>
                        </div>
                    </PerfectScrollbar>
                </div>
            </div>

            {/* Add New Board */}
            <Modal show={addNewBoard} onHide={() => setAddNewBoard(!addNewBoard)} size="sm" centered className="add-tasklist-modal">
                <Modal.Body>
                    <Button bsPrefix="btn-close" onClick={() => setAddNewBoard(!addNewBoard)} >
                        <span aria-hidden="true">×</span>
                    </Button>
                    <h5 className="mb-4">Add Task List</h5>
                    <Form>
                        <Row className="gx-3">
                            <Col sm={12}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control type="text" value={newBoardName} onChange={e => setNewBoardName(e.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="align-items-center">
                    <Button variant="secondary" onClick={() => setAddNewBoard(!addNewBoard)} >Cancel</Button>
                    <Button variant="primary" className="btn-add-Board" onClick={onAddNewCard}>Add</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default Board;