import { useState, useEffect } from 'react';
import { Nav, Tab, Spinner, Alert } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';
import { columns } from '@/data/file-manager/fmListData';
import HkDataTable from '@/components/@hk-data-table';

const FmList = ({ toggleInfo }) => {

    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const res = await fetch('/api/files');
                if (!res.ok) throw new Error("Failed to fetch files");
                const data = await res.json();
                
                // Format DB schema into Jampack's DataTable structure
                const formattedFiles = data.map(file => ({
                    id: file.id,
                    starred: false,
                    name: [{
                        icons: file.type === "FOLDER" ? "folder" : "file", 
                        iconBg: file.type === "FOLDER" ? "primary" : "info", 
                        fileName: file.name, 
                        link: file.url || "#"
                    }],
                    sharing: [{ title: "Only you" }], // Dummy sharing
                    modified: new Date(file.updatedAt).toLocaleDateString(),
                    size: file.type === "FOLDER" ? "-" : `${(file.size / 1024).toFixed(2)} KB`,
                    actions: [{ archiveLink: "#", editLink: "#", deleteLink: "#" }]
                }));

                setFiles(formattedFiles);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    return (
        <div className="fm-body">
            <SimpleBar className="nicescroll-bar">
                <div className="file-list-view">
                    <Tab.Container defaultActiveKey="cloud_doc" >
                        <Nav as="ul" variant="tabs" className="nav-line nav-icon nav-light">
                            <Nav.Item as="li">
                                <Nav.Link eventKey="cloud_doc">
                                    <span className="nav-link-text">Cloud Documents</span>
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                        <Tab.Content>
                            <Tab.Pane eventKey="cloud_doc">
                                {loading ? (
                                    <div className="text-center p-5">
                                        <Spinner animation="border" variant="primary" />
                                    </div>
                                ) : error ? (
                                    <Alert variant="danger">{error}</Alert>
                                ) : (
                                    <HkDataTable
                                        column={columns}
                                        rowData={files}
                                        rowSelection={true}
                                        markStarred={true}
                                        classes="nowrap w-100 mb-5"
                                        responsive
                                    />
                                )}
                            </Tab.Pane>
                        </Tab.Content>
                    </Tab.Container>
                </div>
            </SimpleBar>
        </div>
    )
}

export default FmList;