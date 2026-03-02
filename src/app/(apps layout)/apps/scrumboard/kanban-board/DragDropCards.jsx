import { nanoid } from 'nanoid';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import Cards from './Cards';

const DragDropCards = ({
    cards,
    tasks,
    cardOrder,
    setCards,
    setTasks,
    setCardOrder
}) => {

    const reorderCards = async (source, destination, draggableId) => {
        const newCardOrder = Array.from(cardOrder);
        newCardOrder.splice(source.index, 1);
        newCardOrder.splice(destination.index, 0, draggableId);
        setCardOrder(newCardOrder);

        // Sync API
        try {
            await fetch('/api/kanban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "UPDATE_BOARD_ORDER",
                    payload: { boards: newCardOrder.map((id, index) => ({ id, order: index })) }
                })
            });
        } catch (e) {
            console.error("Failed to sync board order", e);
        }
    };

    const reorderTasksWithinCard = async (
        card,
        sourceIdx,
        destinationIdx,
        draggableId
    ) => {
        const newTaskIds = Array.from(card.taskIds);
        newTaskIds.splice(sourceIdx, 1);
        newTaskIds.splice(destinationIdx, 0, draggableId);
        setCards({
            ...cards,
            [card.id]: {
                ...card,
                taskIds: newTaskIds
            }
        });

        // Sync API
        try {
            await fetch('/api/kanban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "UPDATE_TASK_ORDER",
                    payload: {
                        taskId: draggableId,
                        newBoardId: card.id,
                        newOrder: destinationIdx,
                        newBoardTasks: newTaskIds.map(id => ({ id }))
                    }
                })
            });
        } catch (e) {
            console.error("Failed to sync task order", e);
        }
    };

    const moveTask = async (start, finish, sourceIdx, destinationIdx, draggableId) => {
        const startTaskIds = Array.from(start.taskIds);
        startTaskIds.splice(sourceIdx, 1);
        const newStart = {
            ...start,
            taskIds: startTaskIds
        };
        const finishTaskIds = Array.from(finish.taskIds);
        finishTaskIds.splice(destinationIdx, 0, draggableId);
        const newFinish = {
            ...finish,
            taskIds: finishTaskIds
        };
        setCards({
            ...cards,
            [newStart.id]: newStart,
            [newFinish.id]: newFinish
        });

        // Sync API
        try {
            await fetch('/api/kanban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "UPDATE_TASK_ORDER",
                    payload: {
                        taskId: draggableId,
                        newBoardId: finish.id,
                        newOrder: destinationIdx,
                        newBoardTasks: finishTaskIds.map(id => ({ id })),
                        oldBoardTasks: startTaskIds.map(id => ({ id }))
                    }
                })
            });
        } catch (e) {
            console.error("Failed to sync task move", e);
        }
    };

    const onDragEnd = (result) => {
        const { destination, source, draggableId, type } = result;

        if (
            !destination ||
            (destination.droppableId === source.droppableId &&
                destination.index === source.index)
        ) {
            return;
        }

        if (type === "card") {
            reorderCards(source, destination, draggableId);
        } else {
            // type === tasks
            const start = cards[source.droppableId];
            const finish = cards[destination.droppableId];
            if (start.id === finish.id) {
                reorderTasksWithinCard(
                    start,
                    source.index,
                    destination.index,
                    draggableId
                );
            } else {
                moveTask(
                    start,
                    finish,
                    source.index,
                    destination.index,
                    draggableId
                );
            }
        }
    };


    //Board Rename
    const boardRename = (cardID, newTitle) => {
        setCards({ ...cards, [cardID]: { ...cards[cardID], title: newTitle } });
    }

    //Remove Board
    const onRemoveBoard = (cardID) => {
        const newCardOrder = cardOrder.filter((id) => id !== cardID);
        setCardOrder(newCardOrder);
        delete cards[cardID];
        setCards(cards);
    };

    //Clear Tasks from a board
    const clearBoard = (cardID) => {
        setCards({ ...cards, [cardID]: { ...cards[cardID], taskIds: [] } });
    };

    //Add new task 
    const onAddNewTask = async (cardID, taskName) => {
        if (!taskName.trim()) return;

        try {
            const res = await fetch('/api/kanban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: "ADD_TASK",
                    payload: { title: taskName, boardId: cardID, order: cards[cardID].taskIds.length }
                })
            });
            
            if (res.ok) {
                const newTaskData = await res.json();
                const newTask = {
                    id: newTaskData.id,
                    Task_Name: newTaskData.title,
                    Footer: false,
                };
                
                setTasks(prev => ({
                    ...prev,
                    [newTask.id]: newTask
                }));
                
                setCards(prevCards => {
                    const newTaskIds = Array.from(prevCards[cardID].taskIds);
                    newTaskIds.push(newTask.id);
                    return { ...prevCards, [cardID]: { ...prevCards[cardID], taskIds: newTaskIds } };
                });
            } else {
                alert("Failed to create task in DB");
            }
        } catch (e) {
            console.error("ADD TASK ERROR", e);
        }
    };

    //Remove a task from a board
    const onRemoveTask = (taskID, cardID) => {
        const newTaskIds = cards[cardID].taskIds.filter((id) => id !== taskID);
        setCards({ ...cards, [cardID]: { ...cards[cardID], taskIds: newTaskIds } });
        delete tasks[taskID];
        setTasks(tasks);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="all-cards" direction="horizontal" type="card">
                {(provided) => (
                    <div className="tasklist-wrap" {...provided.droppableProps} ref={provided.innerRef}>
                        {cardOrder.map((id, index) => {
                            const card = cards[id];
                            const cardTasks = card.taskIds.map((taskId) => tasks[taskId]);
                            return (
                                <Cards
                                    key={card.id}
                                    card={card}
                                    tasks={cardTasks}
                                    index={index}
                                    renameBoard={boardRename}
                                    onRemoveBoard={onRemoveBoard}
                                    clearBoard={clearBoard}
                                    onRemoveTask={onRemoveTask}
                                    onAddNewTask={onAddNewTask}
                                />
                            );
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DragDropCards;