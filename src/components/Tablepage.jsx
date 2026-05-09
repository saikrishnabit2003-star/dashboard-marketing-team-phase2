import { useEffect, useState } from 'react';
import Style from './Tablepage.module.css'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';

const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid date
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (error) {
        return dateString;
    }
};
export function Tablepage({ searchTerm }) {
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingCell, setEditingCell] = useState(null); // { rowIndex, fieldName }
    const [editValue, setEditValue] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const itemsPerPage = 15;

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    const fetchTableData = () => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch("https://email-marketing-dashboard-v1.vercel.app/dashboard/orders", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.status_code === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user_role');
                        window.location.reload();
                        return;
                    }
                    if (data?.status_code === 200) {
                        setTableData(data.data || []);
                    }
                })
                .catch(error => console.error(error));
        }
    }

    useEffect(() => {
        fetchTableData();
    }, []);

    const handleDoubleClick = (rowIndex, fieldName, currentValue) => {
        setEditingCell({ rowIndex, fieldName });
        setEditValue(currentValue || '');
    };

    const handleBlur = () => {
        saveChanges();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveChanges();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    const saveChanges = async () => {
        if (!editingCell) return;

        const { rowIndex, fieldName } = editingCell;
        const originalValue = tableData[rowIndex][fieldName];

        // Treat empty string as 0 for amount fields to avoid API errors
        const amountFields = ['writing_amount', 'modification_amount', 'po_amount'];
        const phasePaymentFields = ['phase_1_payment', 'phase_2_payment', 'phase_3_payment'];

        let finalEditValue = editValue;

        if (
            (amountFields.includes(fieldName) || phasePaymentFields.includes(fieldName)) &&
            (editValue === '' || editValue === null)
        ) {
            finalEditValue = 0;
        }

        // Normalize country: uppercase + remove all spaces
        const upperCaseFields = ['client_country'];
        if (upperCaseFields.includes(fieldName) && typeof finalEditValue === 'string') {
            finalEditValue = finalEditValue.replace(/\s+/g, '').toUpperCase();
        }


        if (finalEditValue === originalValue) {
            setEditingCell(null);
            return;
        }

        // Optimistic update
        const updatedTableData = [...tableData];
        updatedTableData[rowIndex][fieldName] = finalEditValue;

        // Recalculate total_amount if any sub-amount was changed
        let payload = { [fieldName]: finalEditValue };

        if (amountFields.includes(fieldName)) {
            const row = updatedTableData[rowIndex];
            const writing = parseFloat(row.writing_amount) || 0;
            const modification = parseFloat(row.modification_amount) || 0;
            const po = parseFloat(row.po_amount) || 0;
            const newTotal = writing + modification + po;

            updatedTableData[rowIndex].total_amount = newTotal;
            payload.total_amount = newTotal;
        }

        // Recalculate paid_amount if any phase payment was changed
        if (phasePaymentFields.includes(fieldName)) {
            const row = updatedTableData[rowIndex];
            const phase1 = parseFloat(row.phase_1_payment) || 0;
            const phase2 = parseFloat(row.phase_2_payment) || 0;
            const phase3 = parseFloat(row.phase_3_payment) || 0;
            const newPaid = phase1 + phase2 + phase3;

            updatedTableData[rowIndex].paid_amount = newPaid;
            payload.paid_amount = newPaid;
        }

        setTableData(updatedTableData);
        setEditingCell(null);

        // API Call to update backend
        const token = localStorage.getItem('token');
        const rowToUpdate = updatedTableData[rowIndex];

        try {
            const response = await fetch(`https://email-marketing-dashboard-phase-1.vercel.app/dashboard/orders/${rowToUpdate.order_db_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            console.log(rowToUpdate.order_db_id);
            console.log(payload);
            const result = await response.json();
            if (response.ok) {
                console.log('Update successful:', result);
                showNotification("Dashboard order updated successfully", "success");
            } else {
                console.error('Update failed:', result);
                showNotification("Failed to update dashboard order", "error");
                // Revert changes
                fetchTableData();
            }
        } catch (error) {
            console.error('Error updating backend:', error);
            showNotification("Error connecting to server", "error");
            fetchTableData();
        }
    };

    // Filter data based on search term
    const filteredData = tableData.filter(row => {
        if (!searchTerm) return true;
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset pagination when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Fields that should never be editable inline
    const READ_ONLY_FIELDS = new Set(['total_amount', 'paid_amount']);

    const renderCell = (row, rowIndex, fieldName, displayValue) => {
        // Read-only: just show the value, no double-click editing
        if (READ_ONLY_FIELDS.has(fieldName)) {
            return (
                <td key={fieldName} style={{ cursor: 'default', userSelect: 'text' }} title="Read-only field">
                    {displayValue ?? row[fieldName] ?? 'N/A'}
                </td>
            );
        }

        const isEditing = editingCell && editingCell.rowIndex === rowIndex && editingCell.fieldName === fieldName;
        const dateFields = [
            'order_date', 'writing_start_date', 'writing_end_date', 'modification_start_date',
            'modification_end_date', 'po_start_date', 'po_end_date', 'phase_1_payment_date',
            'phase_2_payment_date', 'phase_3_payment_date'
        ];

        const dropdownFields = {
            payment_status: ['Paid', 'Pending', 'Partial'],
            index: ['SCI', 'Scopus', 'SSCI', 'EI', 'Scopus & SCI', 'SCIE'],
            rank: ['Q1', 'Q2', 'Q3', 'Q4', 'Anything', 'Q1 or Q2', 'Q2 or Q3', 'Q3 or Q4'],
            order_type: ['WO/PO', 'MO/PO', 'WO', 'PO', 'MO/RV', 'MO', 'Thesis writing', 'WO/Implementation/PO', 'Review paper writing', 'WO/Conference', 'Improvement'],
            currency: ['USD', 'INR'],
            order_status: ['Active', 'Inactive']
        };

        const textareaFields = ['title', 'remarks', 'client_affiliations','journal_name'];
        const linkFields = ['client_drive_link', 'clients_details'];

        // --- Status Badge renderer ---
        const getOrderStatusBadge = (value) => {
            const v = (value || '').toLowerCase();
            const style = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                ...(v === 'active'
                    ? { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                    : v === 'inactive'
                    ? { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
                    : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' })
            };
            const dot = {
                width: '7px', height: '7px', borderRadius: '50%',
                background: v === 'active' ? '#16a34a' : v === 'inactive' ? '#dc2626' : '#94a3b8'
            };
            return <span style={style}><span style={dot}></span>{value || 'N/A'}</span>;
        };

        const getPaymentStatusBadge = (value) => {
            const v = (value || '').toLowerCase();
            const style = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                ...(v === 'paid'
                    ? { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                    : v === 'pending'
                    ? { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
                    : v === 'partial'
                    ? { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }
                    : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' })
            };
            const dot = {
                width: '7px', height: '7px', borderRadius: '50%',
                background: v === 'paid' ? '#16a34a' : v === 'pending' ? '#dc2626' : v === 'partial' ? '#ea580c' : '#94a3b8'
            };
            return <span style={style}><span style={dot}></span>{value || 'N/A'}</span>;
        };

        return (
            <td onDoubleClick={() => handleDoubleClick(rowIndex, fieldName, row[fieldName])}>
                {isEditing ? (
                    dateFields.includes(fieldName) ? (
                        <DatePicker
                            selected={editValue && !isNaN(new Date(editValue).getTime()) ? new Date(editValue) : null}
                            onChange={(date) => {
                                if (date) {
                                    setEditValue(date.toISOString());
                                }
                            }}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={Style.editInput}
                        />
                    ) : dropdownFields[fieldName] ? (
                        <select
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={Style.editInput}
                        >
                            <option value="" disabled>Select option</option>
                            {dropdownFields[fieldName].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : textareaFields.includes(fieldName) ? (
                        <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    saveChanges();
                                } else if (e.key === 'Escape') {
                                    setEditingCell(null);
                                }
                            }}
                            autoFocus
                            className={Style.editInput}
                            style={{ resize: 'vertical', minHeight: '80px', width: '250px', whiteSpace: 'pre-wrap', textAlign: 'left' }}
                        />
                    ) : (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={Style.editInput}
                        />
                    )
                ) : fieldName === 'order_status' ? (
                    getOrderStatusBadge(row[fieldName])
                ) : fieldName === 'payment_status' ? (
                    getPaymentStatusBadge(row[fieldName])
                ) : textareaFields.includes(fieldName) ? (
                    <div className={Style.scrollableCellContent}>
                        {displayValue || row[fieldName] || 'N/A'}
                    </div>
                ) : linkFields.includes(fieldName) ? (
                    row[fieldName] ? (
                        <a href={row[fieldName]} target="_blank" rel="noopener noreferrer" className={Style.viewLink}>view</a>
                    ) : ''
                ) : (
                    displayValue || row[fieldName] || 'N/A'
                )}
            </td>
        );
    };

    const handleExport = () => {
        if (!filteredData || filteredData.length === 0) {
            showNotification("No data to export", "error");
            return;
        }

        const data = filteredData.map(row => ({
            "Client ID": String(row.client_id || ''),
            "Country": row.client_country || '',
            "Client Email": row.client_Email || '',
            "Whatsapp No": String(row.client_whatsapp_number || ''),
            "Order Date": formatDate(row.order_date),
            "Order Type": row.order_type || '',
            "Client Ref ID": String(row.ref_no || ''),
            "Manuscript ID": String(row.manuscript_id || ''),
            "Title": row.title || '',
            "Journal Name": row.journal_name || '',
            "Index": row.index || '',
            "Rank": row.rank || '',
            "Total Amount": row.total_amount,
            "Writing Amount": row.writing_amount,
            "Modification Amount": row.modification_amount,
            "PO Amount": row.po_amount,
            "Writing Start Date": formatDate(row.writing_start_date),
            "Writing End Date": formatDate(row.writing_end_date),
            "Modification Start Date": formatDate(row.modification_start_date),
            "Modification End Date": formatDate(row.modification_end_date),
            "PO Start Date": formatDate(row.po_start_date),
            "PO End Date": formatDate(row.po_end_date),
            "Phase 1 Payment": row.phase_1_payment,
            "Phase 1 Payment Date": formatDate(row.phase_1_payment_date),
            "Phase 1 Payment Reason": row.phase_1_payment_details || '',
            "Phase 2 Payment": row.phase_2_payment,
            "Phase 2 Payment Date": formatDate(row.phase_2_payment_date),
            "Phase 2 Payment Reason": row.phase_2_payment_details || '',
            "Phase 3 Payment": row.phase_3_payment,
            "Phase 3 Payment Date": formatDate(row.phase_3_payment_date),
            "Phase 3 Payment Reason": row.phase_3_payment_details || '',
            "Total Paid Amount": row.paid_amount,
            "Currency": row.currency || '',
            "Payment Status": row.payment_status || '',
            "Bank Account": String(row.bank_account || ''),
            "Client Affiliations": row.client_affiliations || '',
            "Remarks": row.remarks || '',
            "Client Drive": row.client_drive_link || '',
            "Client Details": row.client_details || '',
            "Record Status": row.order_status || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Define column widths for better structure in Excel
        const wscols = [
            { wch: 15 }, // Client ID
            { wch: 15 }, // Country
            { wch: 25 }, // Email
            { wch: 18 }, // Whatsapp
            { wch: 12 }, // Order Date
            { wch: 15 }, // Order Type
            { wch: 15 }, // Client Ref ID
            { wch: 15 }, // Manuscript ID
            { wch: 50 }, // Title (wider)
            { wch: 40 }, // Journal Name (wider)
            { wch: 12 }, // Index
            { wch: 10 }, // Rank
            { wch: 12 }, // Total Amount
            { wch: 14 }, // Writing Amount
            { wch: 18 }, // Mod Amount
            { wch: 12 }, // PO Amount
            { wch: 15 }, // Writing Start
            { wch: 15 }, // Writing End
            { wch: 15 }, // Mod Start
            { wch: 15 }, // Mod End
            { wch: 15 }, // PO Start
            { wch: 15 }, // PO End
            { wch: 15 }, // Phase 1
            { wch: 18 }, // Phase 1 Date
            { wch: 25 }, // Phase 1 Reason
            { wch: 15 }, // Phase 2
            { wch: 18 }, // Phase 2 Date
            { wch: 25 }, // Phase 2 Reason
            { wch: 15 }, // Phase 3
            { wch: 18 }, // Phase 3 Date
            { wch: 25 }, // Phase 3 Reason
            { wch: 16 }, // Total Paid
            { wch: 10 }, // Currency
            { wch: 15 }, // Status
            { wch: 20 }, // Bank Account
            { wch: 40 }, // Client Affiliations
            { wch: 40 }, // Remarks
            { wch: 30 }, // Client Drive
            { wch: 20 }, // Client Details
            { wch: 15 }  // Record Status
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Overall_Table");

        XLSX.writeFile(workbook, 'TableData.xlsx');
        showNotification("Export successful", "success");
    };

    return (
        <div className={Style.page}>
            {notification.visible && (
                <div className={`${Style.notification} ${Style[notification.type]}`}>
                    <div className={Style.notificationIcon}>
                        {notification.type === 'success' ? '✓' : '✕'}
                    </div>
                    <p>{notification.message}</p>
                </div>
            )}
            <div className={Style.tablecontainer}>
                {/* table header */}
                <div className={Style.tableheader}>
                    <h2>Overall Table</h2>
                    <p>displaying <span>{currentData.length}</span> of {filteredData.length} records</p>
                    <button className={Style.exportBtn} onClick={handleExport}>Export</button>
                </div>
                {/* table data */}
                <div className={Style.tablecontainerdata}>

                    <table className={Style.tabledata}>
                        <thead>
                            <tr>
                                <th>S.no</th>
                                <th>client Id</th>
                                <th>Country</th>
                                <th>client Email</th>
                                <th>whatsapp no</th>
                                <th>order date</th>
                                <th>order type</th>
                                <th>client ref id</th>
                                <th>manuscript id</th>
                                <th>Title</th>
                                <th>Journal name</th>
                                <th>index</th>
                                <th>rank</th>
                                <th>total amount</th>
                                <th>writing amount</th>
                                <th>modification amount</th>
                                <th>po amount</th>
                                <th>writing start date</th>
                                <th>writing end date</th>
                                <th>modification start date</th>
                                <th>modification end date</th>
                                <th>po start date</th>
                                <th>po end date</th>
                                <th>phase 1 payment</th>
                                <th>phase 1 payment date</th>
                                <th>phase 1 payment reason</th>
                                <th>phase 2 payment</th>
                                <th>phase 2 payment date</th>
                                <th>phase 2 payment reason</th>
                                <th>phase 3 payment</th>
                                <th>phase 3 payment date</th>
                                <th>phase 3 payment reason</th>
                                <th>Total Paid Amount</th>
                                 <th>currency</th>
                                <th>payment status</th>
                                <th>bank account</th>
                                <th>client affiliations</th>
                                <th>remarks</th>
                                <th>Client Drive</th>
                                <th>Client Details</th>
                                <th>Record Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((row, index) => {
                                // Find actual index in tableData for editing
                                const actualIndex = tableData.findIndex(item => item === row);
                                return (
                                    <tr key={startIndex + index}>

                                        <td>{startIndex + index + 1}</td>
                                        {renderCell(row, actualIndex, 'client_id')}
                                        {renderCell(row, actualIndex, 'client_country', row.client_country)}
                                        {renderCell(row, actualIndex, 'client_Email')}
                                        {renderCell(row, actualIndex, 'client_whatsapp_number')}
                                        {renderCell(row, actualIndex, 'order_date', formatDate(row.order_date))}
                                        {renderCell(row, actualIndex, 'order_type')}
                                        {renderCell(row, actualIndex, 'ref_no')}
                                        {renderCell(row, actualIndex, 'manuscript_id')}
                                        {renderCell(row, actualIndex, 'title')}
                                        {renderCell(row, actualIndex, 'journal_name')}
                                        {renderCell(row, actualIndex, 'index')}
                                        {renderCell(row, actualIndex, 'rank')}
                                        {renderCell(row, actualIndex, 'total_amount')}
                                        {renderCell(row, actualIndex, 'writing_amount')}
                                        {renderCell(row, actualIndex, 'modification_amount')}
                                        {renderCell(row, actualIndex, 'po_amount')}
                                        {renderCell(row, actualIndex, 'writing_start_date', formatDate(row.writing_start_date))}
                                        {renderCell(row, actualIndex, 'writing_end_date', formatDate(row.writing_end_date))}
                                        {renderCell(row, actualIndex, 'modification_start_date', formatDate(row.modification_start_date))}
                                        {renderCell(row, actualIndex, 'modification_end_date', formatDate(row.modification_end_date))}
                                        {renderCell(row, actualIndex, 'po_start_date', formatDate(row.po_start_date))}
                                        {renderCell(row, actualIndex, 'po_end_date', formatDate(row.po_end_date))}
                                        {renderCell(row, actualIndex, 'phase_1_payment')}
                                        {renderCell(row, actualIndex, 'phase_1_payment_date', formatDate(row.phase_1_payment_date))}
                                        {renderCell(row, actualIndex, 'phase_1_payment_details')}
                                        {renderCell(row, actualIndex, 'phase_2_payment')}
                                        {renderCell(row, actualIndex, 'phase_2_payment_date', formatDate(row.phase_2_payment_date))}
                                        {renderCell(row, actualIndex, 'phase_2_payment_details')}
                                        {renderCell(row, actualIndex, 'phase_3_payment')}
                                        {renderCell(row, actualIndex, 'phase_3_payment_date', formatDate(row.phase_3_payment_date))}
                                        {renderCell(row, actualIndex, 'phase_3_payment_details')}
                                        {renderCell(row, actualIndex, 'paid_amount')}
                                        {renderCell(row, actualIndex, 'currency')}
                                        {renderCell(row, actualIndex, 'payment_status')}
                                        {renderCell(row, actualIndex, 'bank_account')}
                                        {renderCell(row, actualIndex, 'client_affiliations')}
                                        {renderCell(row, actualIndex, 'remarks')}
                                        {renderCell(row, actualIndex, 'client_drive_link')}
                                        {renderCell(row, actualIndex, 'clients_details')}
                                        {renderCell(row, actualIndex, 'order_status')}
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                </div>

                <div className={Style.tablefooter}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                    <h3>Page {currentPage} of {totalPages}</h3>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>
        </div>
    );
}
