import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Style from './AmountTable.module.css';

const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; 
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (error) {
        return dateString;
    }
};

export function AmountTable({ searchTerm }) {
    const [tableData, setTableData] = useState([]);

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get("https://email-marketing-dashboard-phase-1.vercel.app/payments/history", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.data?.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }

                if (response.data?.data) {
                    setTableData(response.data.data);
                } else if (Array.isArray(response.data)) {
                    setTableData(response.data);
                }
            } catch (error) {
                console.error("Error fetching amount table data:", error);
            }
        };

        fetchTableData();
    }, []);

    const filteredData = tableData.filter(row => {
        if (!searchTerm) return true;
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className={Style.page}>
            <div className={Style.tablecontainer}>
                <div className={Style.tableheader}>
                    <h2>Amount table</h2>
                </div>
                <div className={Style.tablecontainerdata}>
                    <table className={Style.tabledata}>
                        <thead>
                            <tr>
                                <th>Client ID</th>
                                <th>Payment 1</th>
                                <th>Date 1</th>
                                {/* <th>Phase 1 Payment Reason</th> */}
                                <th>Payment 2</th>
                                <th>Date 2</th>
                                {/* <th>Phase 2 Payment Reason</th> */}
                                <th>Payment 3</th>
                                <th>Date 3</th>
                                {/* <th>Phase 3 Payment Reason</th> */}
                                {/* <th>Total Paid Amount</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.client_id || 'N/A'}</td>
                                        <td>{row.phase_1_payment || 0}</td>
                                        <td>{formatDate(row.phase_1_payment_date)}</td>
                                        {/* <td>{row.phase_1_payment_details || '-'}</td> */}
                                        <td>{row.phase_2_payment || 0}</td>
                                        <td>{formatDate(row.phase_2_payment_date)}</td>
                                        {/* <td>{row.phase_2_payment_details || '-'}</td> */}
                                        <td>{row.phase_3_payment || 0}</td>
                                        <td>{formatDate(row.phase_3_payment_date)}</td>
                                        {/* <td>{row.phase_3_payment_details || '-'}</td> */}
                                        {/* <td>{row.paid_amount || 0}</td> */}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}