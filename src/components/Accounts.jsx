import { useState, useEffect } from "react";
import styles from "./Accounts.module.css";
import { ClientForm } from "./ClientForm";
import { EmployeeForm } from "./EmployeeForm";
import { AdminForm } from "./AdminForm";

export function Accounts({ searchTerm }) {
    const [activeTab, setActiveTab] = useState("client");
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("client");
    const [formValues, setFormValues] = useState({
        order_date: "",
        client_id: "",
        reference_id: "",
        client_name: "",
        profile_name: "",
        location: "",
        email: "",
        whatsapp: "",
        client_handler: "",
        title: "",
        client_ref_no: "",
        client_details: "",
        order_type: "",
        index_option: "",
        cli_rank: "",
        journal: "",
        writing_start_date: "",
        publish_start_date: "",
        client_drive_link: "",
        currency: "",
        payment_status: "",
        bank_account: "",
        orders: "",
        name: "",
        password: "",
        branch: "",
        profile_name: "",
    });

    const [sampleData, setSampleData] = useState([]);
    const [client_handlers, setclient_handlers] = useState([]);
    const [profile_names, setprofile_names] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    const fetchClients = () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        fetch("https://email-marketing-dashboard-v1.vercel.app/clients", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log('Clients response:', data);
                if (data.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }
                // API may return array directly or nested under data/clients
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.data) ? data.data
                        : Array.isArray(data?.clients) ? data.clients
                            : [];
                setSampleData(list);
                setclient_handlers(data?.details?.employee_names || data?.detail?.employee_names || []);
                setprofile_names(data?.details?.profile_names || data?.detail?.profile_names || []);
            })
            .catch(err => console.error("Failed to fetch clients:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const [empData, setEmpData] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);

    const fetchEmployees = () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setEmpLoading(true);
        fetch("https://email-marketing-dashboard-v1.vercel.app/users", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                if (data.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }
                // API may return array directly or nested under data/users
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.data) ? data.data
                        : Array.isArray(data?.data?.users) ? data.data.users
                            : [];
                setEmpData(list);
            })
            .catch(err => console.error("Failed to fetch employees:", err))
            .finally(() => setEmpLoading(false));
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const [adminData, setAdminData] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);

    const fetchAdmins = () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setAdminLoading(true);
        fetch("https://email-marketing-dashboard-v1.vercel.app/admins", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log('Admins response:', data);
                if (data.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.data) ? data.data
                        : Array.isArray(data?.data?.admins) ? data.data.admins
                            : [];
                setAdminData(list);
            })
            .catch(err => console.error("Failed to fetch admins:", err))
            .finally(() => setAdminLoading(false));
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const openAddPopup = (type) => {
        setPopupType(type);
        setShowPopup(true);
        setFormValues({
            order_date: "",
            client_id: "",
            reference_id: "",
            client_name: "",
            profile_name: "",
            location: "",
            email: "",
            whatsapp: "",
            client_handler: "",
            title: "",
            client_ref_no: "",
            client_details: "",
            order_type: "",
            index_option: "",
            cli_rank: "",
            journal: "",
            writing_start_date: "",
            publish_start_date: "",
            client_drive_link: "",
            currency: "",
            payment_status: "",
            bank_account: "",
            orders: "",
            name: "",
            password: "",
            branch: "",
            payment: true
        });
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            showNotification('No authentication token found. Please login first.', 'error');
            return;
        }

        let endpoint = '';
        let payload = {};

        if (popupType === 'client') {
            endpoint = 'https://email-marketing-dashboard-v1.vercel.app/unified/create';
            payload = {
                client_id: formValues.client_id.toUpperCase(),
                client_name: formValues.client_name.toUpperCase(),
                client_country: formValues.location.toUpperCase(),
                client_email: formValues.email,
                client_whatsapp_no: formValues.whatsapp,
                client_ref_no: formValues.client_ref_no.toUpperCase(),
                clients_details: formValues.client_details,
                client_drive_link: formValues.client_drive_link,
                reference_id: formValues.reference_id.toUpperCase(),
                profile_name: formValues.profile_name,
                title: formValues.title,
                order_type: formValues.order_type,
                index: formValues.index_option,
                rank: formValues.cli_rank,
                journal_name: formValues.journal,
                write_start_date: formValues.writing_start_date,
                profile_start_date: formValues.publish_start_date,
                currency: formValues.currency,
                payment_status: formValues.payment_status,
                order_date: formValues.order_date,
                client_handler: formValues.client_handler,
                client_bank_account: formValues.bank_account,
                order_status: "Active"
            };
        } else if (popupType === 'employee') {
            endpoint = 'https://email-marketing-dashboard-v1.vercel.app/users';
            payload = {
                full_name: formValues.name.toUpperCase(),
                email: formValues.email,
                password: formValues.password,
                phone_number: formValues.whatsapp,
                branch: formValues.branch.toUpperCase(),
                profile_names: formValues.profile_name ? formValues.profile_name.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "") : [],
                role: "employee"
            };
        } else if (popupType === 'manager' || popupType === 'admin') {
            endpoint = 'https://email-marketing-dashboard-v1.vercel.app/managers';
            payload = {
                full_name: formValues.name.toUpperCase(),
                email: formValues.email,
                password: formValues.password,
                phone_number: formValues.whatsapp,
                branch: formValues.branch.toUpperCase(),
                role: "manager"
            };
        }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });
            console.log(payload);
            const data = await response.json();

            if (response.ok) {
                console.log('Success:', data);
                showNotification(`${popupType.charAt(0).toUpperCase() + popupType.slice(1)} added successfully!`, 'success');
                closePopup();
                // Refresh list after successful add
                if (popupType === 'client') {
                    fetchClients();
                } else if (popupType === 'employee') {
                    fetchEmployees();
                } else if (popupType === 'admin') {
                    fetchAdmins();
                }
            } else {
                console.error('Error:', data);
                showNotification(data.message || `Failed to add ${popupType}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('Error submitting form. Please try again.', 'error');
        }
    };

    const userRole = localStorage.getItem('user_role') || '';

    return (
        <div className={styles.page}>
            {notification.visible && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    <div className={styles.notificationIcon}>
                        {notification.type === 'success' ? '✓' : '✕'}
                    </div>
                    <p>{notification.message}</p>
                </div>
            )}
            <div className={styles.headers}>
                <button type="button" onClick={() => setActiveTab("client")}>client</button>
                {(userRole === 'admin' || userRole === 'manager') && (
                    <button type="button" onClick={() => setActiveTab("employee")}>Employee</button>
                )}
                {userRole === 'admin' && (
                    <button type="button" onClick={() => setActiveTab("admin")}>admin</button>
                )}
            </div>
            {showPopup && (
                <div className={styles.popupcontainer}>
                    <div className={`${styles.mainpopupbox} ${popupType !== 'client' ? styles.smallPopup : ''}`}>
                        <div className={styles.header}>
                            <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{popupType} add</h3>
                            <button type="button" onClick={closePopup} style={{ border: 'none', background: 'transparent', color: 'red', fontSize: '28px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.popupform}>
                            {popupType === 'client' && <ClientForm formValues={formValues} handleChange={handleChange} profile_names={profile_names} client_handlers={client_handlers} />}
                            {popupType === 'employee' && <EmployeeForm formValues={formValues} handleChange={handleChange} />}
                            {popupType === 'admin' && <AdminForm formValues={formValues} handleChange={handleChange} profile_names={profile_names} />}
                            <div className={styles.footerpopup}>
                                <button type="button" onClick={closePopup} id={styles.cancelbtn} >Cancel</button>
                                <button type="submit" id={styles.submitbtn} >Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === "client" && (
                <div className={styles.container}>
                    <div id={styles.subcontainer1}>
                        <p>Client</p>
                        <button type="button" onClick={() => openAddPopup('client')}>Add Client</button>
                    </div>
                    <div className={styles.subcontainer2}>
                        <table>
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Client ID</th>
                                    <th>Client Name</th>
                                    <th>Location</th>
                                    <th>Email</th>
                                    <th>Whatsapp</th>
                                    <th>Client Handler</th>
                                    <th>Client Ref no</th>
                                    {/* <th>Link</th> */}
                                    <th>Bank account</th>
                                    <th>Orders</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '16px' }}>Loading...</td></tr>
                                ) : sampleData.filter(client => {
                                    if (!searchTerm) return true;
                                    return Object.values(client).some(val =>
                                        String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                }).length === 0 ? (
                                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '16px' }}>No clients found.</td></tr>
                                ) : sampleData
                                    .filter(client => {
                                        if (!searchTerm) return true;
                                        return Object.values(client).some(val =>
                                            String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((client, index) => (
                                        <tr key={client._id || client.client_id}>
                                            <td>{index + 1}</td>
                                            <td>{client.client_id}</td>
                                            <td>{client.name}</td>
                                            <td>{client.country}</td>
                                            <td>{client.email}</td>
                                            <td>{client.whatsapp_no}</td>
                                            <td>{client.client_handler_name}</td>
                                            <td>{client.client_ref_no}</td>
                                            {/* <td>
                                        {client.client_link
                                            ? <a href={client.client_link} target="_blank" rel="noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>View</a>
                                            : 'N/A'}
                                    </td> */}
                                            <td>{client.bank_account}</td>
                                            <td>{client.total_orders}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "employee" && (userRole === 'admin' || userRole === 'manager') && (
                <div className={styles.container}>
                    <div id={styles.subcontainer1}>
                        <p>Employee</p>
                        <button type="button" onClick={() => openAddPopup('employee')}>Add Employee</button>
                    </div>
                    <div className={styles.tablecontainer2}>
                        <table>
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Password</th>
                                    <th>Whatsapp</th>
                                    <th>Profile Holder</th>
                                    <th>Branch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empLoading ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>Loading...</td></tr>
                                ) : empData.filter(e => {
                                    if (!searchTerm) return true;
                                    return Object.values(e).some(val =>
                                        String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                }).length === 0 ? (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>No employees found.</td></tr>
                                ) : empData
                                    .filter(e => {
                                        if (!searchTerm) return true;
                                        return Object.values(e).some(val =>
                                            String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((e, index) => (
                                        <tr key={e._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{e.full_name}</td>
                                            <td>{e.email}</td>
                                            <td>{e.password}</td>
                                            <td>{e.phone_number}</td>
                                            <td>
                                                <div className={styles.scrollableCell}>
                                                    {Array.isArray(e.profile_names) ? e.profile_names.join(',\n') || 'N/A' : e.profile_names}
                                                </div>
                                            </td>
                                            <td>{e.branch}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}

            {activeTab === "admin" && userRole === 'admin' && (
                <div className={styles.container}>
                    <div id={styles.subcontainer1}>
                        <p>Admin</p>
                        <button type="button" onClick={() => openAddPopup('admin')}>Add Admin</button>
                    </div>
                    <div className={styles.tablecontainer2}>
                        <table>
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Password</th>
                                    <th>Whatsapp</th>
                                    <th>Branch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminLoading ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>Loading...</td></tr>
                                ) : adminData.filter(e => {
                                    if (!searchTerm) return true;
                                    return Object.values(e).some(val =>
                                        String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                }).length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>No admins found.</td></tr>
                                ) : adminData
                                    .filter(e => {
                                        if (!searchTerm) return true;
                                        return Object.values(e).some(val =>
                                            String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((e, index) => (
                                        <tr key={e._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{e.full_name || e.name}</td>
                                            <td>{e.email}</td>
                                            <td>{e.password}</td>
                                            <td>{e.phone_number}</td>
                                            <td>{e.branch}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}
        </div>
    );
}