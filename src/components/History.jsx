import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Style from './History.module.css';
import { BASE_URL } from '../config';

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

export function History({ searchTerm = '' }) {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientFilter, setClientFilter] = useState('');
    const [appliedFilter, setAppliedFilter] = useState('');
    const [recordsInput, setRecordsInput] = useState('');
    const [numberOfRecords, setNumberOfRecords] = useState(20); 
    useEffect(() => {
        const fetchHistoryData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${BASE_URL}/payments/history`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                console.log(response.data);
                if (response.data?.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }

                if (response.data?.data) {
                    setHistoryData(response.data.data);
                } else if (Array.isArray(response.data)) {
                    setHistoryData(response.data);
                }
            } catch (error) {
                console.error("Error fetching history data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryData();
    }, []);


    // Stage 1: apply global search term
    const searchFiltered = historyData.filter(row => {
        if (!searchTerm) return true;
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Stage 2: apply client ID filter OR limit to first 50
    const displayData = appliedFilter
        ? searchFiltered.filter(row =>
            String(row.client_id || '').toLowerCase().includes(appliedFilter.toLowerCase())
          )
        : searchFiltered.slice(0, numberOfRecords);

    const handleApplyFilter = () => {
        setAppliedFilter(clientFilter.trim());
    };

    const handleClearFilter = () => {
        setClientFilter('');
        setAppliedFilter('');
    };

    const handleLoadRecords = () => {
        const num = parseInt(recordsInput);
        if (!num || num <= 0) {
            setNumberOfRecords(20);
        } else {
            setNumberOfRecords(num);
        }
        setAppliedFilter('');
    };

    return (
        <div className={Style.page}>
            <div className={Style.header}>
                <div>
                    <h2>Payment History</h2>
                    <p>
                        {appliedFilter
                            ? `Showing all ${displayData.length} records for client "${appliedFilter}"`
                            : `Showing first ${displayData.length} of ${searchFiltered.length} records`
                        }
                    </p>
                </div>
                <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                    <input type="number" style={{width:"150px",height:"40px"}} className={Style.filterInput} placeholder="No. of records" value={recordsInput} onChange={(e) => setRecordsInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLoadRecords()} />
                    <button className={Style.filterBtn} onClick={handleLoadRecords} >Load</button>
                </div>
                <div className={Style.filterBar}>
                    <input
                        type="text"
                        className={Style.filterInput}
                        placeholder="Filter by Client ID..."
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                    />
                    <button className={Style.filterBtn} onClick={handleApplyFilter}>
                        Search
                    </button>
                    {appliedFilter && (
                        <button className={Style.clearBtn} onClick={handleClearFilter}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading history...</div>
            ) : (
                <div className={Style.cardGrid}>
                    {displayData.length > 0 ? (
                        displayData.map((record, index) => (
                            <div key={index} className={Style.historyCard}>
                                <div className={Style.cardHeader}>
                                    <span className={Style.clientBadge}>
                                        {record.client_id || 'Unknown Client'}
                                    </span>
                                    <span className={Style.totalPaid}>
                                        Total: {record.paid_amount || 0}
                                    </span>
                                </div>
                                
                                <div className={Style.orderInfo}>
                                    <div>
                                        <span className={Style.infoLabel}>Ref ID</span>
                                        <span className={Style.infoValue}>{record.reference_id || record.ref_no || 'N/A'}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={Style.infoLabel}>Order ID</span>
                                        <span className={Style.infoValue}>{record.order_id || record.order_db_id || record.manuscript_id || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className={Style.phasesContainer}>
                                    {/* Phase 1 */}
                                    <div className={Style.phaseBlock}>
                                        <div className={Style.phaseHeader}>
                                            <span className={Style.phaseTitle}>Phase 1</span>
                                            <span className={Style.phaseAmount}>{record.phase_1_payment || 0}</span>
                                        </div>
                                        <span className={Style.phaseDate}>Date: {formatDate(record.phase_1_payment_date)}</span>
                                        <p className={Style.phaseReason}>
                                            {record.phase_1_payment_details || 'No details provided'}
                                        </p>
                                    </div>

                                    {/* Phase 2 */}
                                    <div className={Style.phaseBlock}>
                                        <div className={Style.phaseHeader}>
                                            <span className={Style.phaseTitle}>Phase 2</span>
                                            <span className={Style.phaseAmount}>{record.phase_2_payment || 0}</span>
                                        </div>
                                        <span className={Style.phaseDate}>Date: {formatDate(record.phase_2_payment_date)}</span>
                                        <p className={Style.phaseReason}>
                                            {record.phase_2_payment_details || 'No details provided'}
                                        </p>
                                    </div>

                                    {/* Phase 3 */}
                                    <div className={Style.phaseBlock}>
                                        <div className={Style.phaseHeader}>
                                            <span className={Style.phaseTitle}>Phase 3</span>
                                            <span className={Style.phaseAmount}>{record.phase_3_payment || 0}</span>
                                        </div>
                                        <span className={Style.phaseDate}>Date: {formatDate(record.phase_3_payment_date)}</span>
                                        <p className={Style.phaseReason}>
                                            {record.phase_3_payment_details || 'No details provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={Style.noData}>
                                {appliedFilter
                                    ? `No records found for client "${appliedFilter}"`
                                    : 'No history records found'
                                }
                            </div>
                    )}
                </div>
            )}
        </div>
    );
}