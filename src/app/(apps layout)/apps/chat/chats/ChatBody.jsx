import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import { ArrowDown, CornerUpRight, MoreHorizontal } from 'react-feather';
import SimpleBar from 'simplebar-react';
import { useGlobalStateContext } from '@/context/GolobalStateProvider';

//Images
import giphy from '@/assets/img/giphy.gif'
import { useSession } from 'next-auth/react';

const ChatBody = () => {
    const { states } = useGlobalStateContext();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();

    // Fetch Database Messages
    const fetchChats = async () => {
        try {
            const res = await fetch('/api/chat');
            if (res.ok) {
                const data = await res.json();
                
                const mappedMessages = data.map(msg => ({
                    text: msg.content,
                    time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    types: msg.senderId === session?.user?.id ? "sent" : "received",
                    senderName: msg.sender.name || msg.sender.email
                }));
                
                // Merge DB messages with temporary context messages (if any)
                setMessages([...mappedMessages, ...states.chatState.msg.filter(m => !mappedMessages.some(dbm => dbm.text === m.text && dbm.time === m.time))]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchChats();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, states.chatState.msg]);

    // 👇️ scroll to bottom every time messages change
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100%" }}>
                <Spinner animation="border" variant="primary" />
            </div>
        )
    }

    return (
        <SimpleBar style={{ height: "100%" }} id="chat_body" className="chat-body">
            <ul id="dummy_avatar" className="list-unstyled chat-single-list">
                {
                    messages.map((elem, index) => (
                        <li className={classNames("media", { "sent": elem.types === "sent" }, { "received": elem.types === "received" })} key={index} >
                            {elem.types === "received" && (
                                <div className="avatar avatar-xs avatar-rounded">
                                    <div className={`avatar avatar-xs avatar-soft-primary avatar-rounded`}>
                                        <span className="initial-wrap">{elem.senderName?.charAt(0).toUpperCase() || "U"}</span>
                                    </div>
                                </div>
                            )}
                            <div className="media-body">
                                <div className="msg-box" id={`msg-${index}`} >
                                    <div>
                                        <p>{elem.text}</p>
                                        <span className="chat-time">{elem.time}</span>
                                    </div>
                                    <div className="msg-action">
                                        <Button className="btn-icon btn-flush-dark btn-rounded flush-soft-hover no-caret">
                                            <span className="icon">
                                                <span className="feather-icon">
                                                    <CornerUpRight />
                                                </span>
                                            </span>
                                        </Button>
                                        <Dropdown>
                                            <Dropdown.Toggle variant="flush-dark" className="btn-icon btn-rounded flush-soft-hover dropdown-toggle no-caret">
                                                <span className="icon">
                                                    <span className="feather-icon">
                                                        <MoreHorizontal />
                                                    </span>
                                                </span>
                                            </Dropdown.Toggle>
                                            <Dropdown.Menu align="end">
                                                <Dropdown.Item href="#forward">Forward</Dropdown.Item>
                                                <Dropdown.Item href="#copy">Copy</Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))
                }
            </ul>
            <div ref={bottomRef} />
        </SimpleBar>
    )
}

export default ChatBody;