import Style from './UserPage.module.css'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import amounticon from "../assets/amounticon.png";
import amounticon2 from "../assets/amount2.png";
import { BASE_URL } from '../config';

export function UserPage({ searchTerm }) {
    const navigate = useNavigate();

    const [totalamount, settotalamount] = useState(0)
    const [totalUsdAmount, setTotalUsdAmount] = useState(0)
    const [totalclient, settotalclient] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [pendingcount, setpendingcount] = useState(0)
    const [rejcount, settrejcount] = useState(0)
    const [table, settable] = useState([])
    const [ordersData, setOrdersData] = useState([])

    // percentage states
    const [amountPct, setAmountPct] = useState(0)
    const [clientPct, setClientPct] = useState(0)
    const [pendingPct, setPendingPct] = useState(0)
    const [rejPct, setRejPct] = useState(0)

    // per-client aggregated payment stats (Monthly - Row 2)
    const [monthAmount, setMonthAmount] = useState(0)
    const [monthClients, setMonthClients] = useState(0)
    const [monthOrders, setMonthOrders] = useState(0)
    const [monthPending, setMonthPending] = useState(0)
    const [monthRej, setMonthRej] = useState(0)

    // monthly percentage states
    const [monthAmountPct, setMonthAmountPct] = useState(0)
    const [monthClientPct, setMonthClientPct] = useState(0)
    const [monthPendingPct, setMonthPendingPct] = useState(0)
    const [monthRejPct, setMonthRejPct] = useState(0)

    // user info
    const [userInfo, setUserInfo] = useState({ full_name: '', role: '' })

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}--${year}`;
        } catch (error) {
            return 'N/A';
        }
    };

    // rawData is now driven from API (country_split); kept as state
    const [rawData, setRawData] = useState([]);

    // const COLORS = ['#f14337', '#7300b5', '#a5224e', '#3ac982', '#0964da', '#076c79', '#6591e4', '#a89a15', '#074279', '#66468f', '#a8157c', '#074279', '#0c9287'];
   const COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // teal
  '#45B7D1', // blue
  '#FFA726', // orange
  '#AB47BC', // purple
  '#66BB6A', // green
  '#EF5350', // soft red
  '#29B6F6', // light blue
  '#FFCA28', // yellow
  '#7E57C2', // violet
  '#26A69A', // aqua
  '#EC407A', // pink
  '#5C6BC0', // indigo
  '#8D6E63', // brown
  '#26C6DA', // cyan
  '#9CCC65', // lime green
  '#FF7043', // deep orange
  '#D4E157', // lime
  '#42A5F5', // bright blue
  '#EC7063', // salmon
  '#AF7AC5', // lavender
  '#48C9B0', // mint
  '#F5B041', // amber
  '#5DADE2', // sky blue
  '#58D68D', // emerald
  '#F1948A', // rose
  '#BB8FCE', // soft purple
  '#73C6B6', // sea green
  '#F7DC6F', // gold
  '#85929E'  // gray
];
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [pieData, setPieData] = useState([]);
    const [isDateFilterActive, setIsDateFilterActive] = useState(false);

    const onChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    // Function to aggregate data by country from client list
    const aggregateFromClients = (clientsList) => {
        const aggregated = {};
        clientsList.forEach(c => {
            const country = c.country || c.client_country || 'Unknown';
            if (aggregated[country]) {
                aggregated[country] += 1;
            } else {
                aggregated[country] = 1;
            }
        });
        return Object.keys(aggregated).map(name => ({ name, value: aggregated[name] }));
    };

    // Fetch GET method
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${BASE_URL}/users/me/details`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    if (data.status_code === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user_role');
                        window.location.reload();
                        return;
                    }
                    const d = data?.data;
                    if (!d) return;

                    // user info
                    setUserInfo({ full_name: d.full_name || '', role: d.role || '' });
                    if (d.role) {
                        localStorage.setItem('user_role', d.role);
                    }

                    // clients table (Source of truth for reactive stats)
                    const clients = d.country_based_details || [];
                    settable(clients);

                    const clientdetail = d.order_status_details || [];
                    setOrdersData(clientdetail);
                    // Overall analysis can be calculated here or reactively. 
                    // Let's keep it here for simplicity since it's "static" overall data.
                    const overallAmt = clientdetail.reduce((s, c) => s + (c.paid_amount || 0), 0);
                    const totalClt = new Set(clientdetail.map(c => c.client_id)).size;
                    const totalOrd = clientdetail.length;
                    const pendingClt = clientdetail.filter(c => {
                        const status = (c.payment_status || "").toLowerCase();
                        return status === "pending" || status === "not yet" || status === "partial paid";
                    }).length;
                    const partialClt = clientdetail.filter(c => {
                        const status = (c.order_status || "").toLowerCase();
                        return status === "inactive";
                    }).length;

                    settotalamount(overallAmt);
                    settotalclient(totalClt);
                    setTotalOrders(totalOrd);
                    setpendingcount(pendingClt);
                    settrejcount(partialClt);

                    const pPct = totalOrd > 0 ? (pendingClt / totalOrd) * 100 : 0;
                    const rPct = totalOrd > 0 ? (partialClt / totalOrd) * 100 : 0;

                    setAmountPct(100);
                    setClientPct(100);
                    setPendingPct(pPct.toFixed(1));
                    setRejPct(rPct.toFixed(1));

                    // Store raw country data from API for default pie view
                    const countrySplit = d.country_split || {};
                    const countryData = Object.entries(countrySplit).map(([name, value]) => ({ name, value }));
                    setRawData(countryData);

                    // // Convert all country_split amounts to USD and set total
                    // const usdTotal = convertCountrySplitToUSD(countrySplit);
                    // setTotalUsdAmount(usdTotal);
                })
                .catch(error => console.error(error));
        }
    }, []);

    // Reactive filtering logic for specialized analysis and Pie Chart
    useEffect(() => {
        let filteredList = [];

        if (isDateFilterActive && startDate && endDate) {
            // Filter by selected range
            const startOfDay = new Date(startDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);

            filteredList = ordersData.filter(c => {
                const dateStr = c.created_at || c.order_date;
                if (!dateStr) return false;
                const itemDate = new Date(dateStr);
                return itemDate >= startOfDay && itemDate <= endOfDay;
            });

            // Update Pie Chart from filtered items
            setPieData(aggregateFromClients(filteredList));
        } else {
            // Default: Filter by current month
            const now = new Date();
            const curMonth = now.getMonth();
            const curYear = now.getFullYear();

            filteredList = ordersData.filter(c => {
                const dateStr = c.created_at || c.order_date;
                if (!dateStr) return false;
                const d = new Date(dateStr);
                return d.getMonth() === curMonth && d.getFullYear() === curYear;
            });

            // Pie Chart default (use rawData from API or aggregate from table)
            setPieData(rawData.length > 0 ? rawData : aggregateFromClients(ordersData));
        }

        // Calculate stats for the filtered list
        const mAmount = filteredList.reduce((s, c) => s + (c.paid_amount || 0), 0);
        const mTotal = new Set(filteredList.map(c => c.client_id)).size;
        const mTotalOrders = filteredList.length;
        const mPendingCount = filteredList.filter(c => {
            const status = (c.payment_status || "").toLowerCase();
            return status === "pending" || status === "partial paid" || status === "not yet";
        }).length;
        const mRejCount = filteredList.filter(c => {
            const status = (c.order_status || "").toLowerCase();
            return status === "inactive";
        }).length;

        setMonthAmount(mAmount);
        setMonthClients(mTotal);
        setMonthOrders(mTotalOrders);
        setMonthPending(mPendingCount);
        setMonthRej(mRejCount);

        const mPPct = mTotalOrders > 0 ? (mPendingCount / mTotalOrders) * 100 : 0;
        const mRPct = mTotalOrders > 0 ? (mRejCount / mTotalOrders) * 100 : 0;

        setMonthAmountPct(100);
        setMonthClientPct(100);
        setMonthPendingPct(mPPct.toFixed(1));
        setMonthRejPct(mRPct.toFixed(1));

    }, [ordersData, isDateFilterActive, startDate, endDate, rawData]);

    return (
        <div className={Style.contentpage}>

            {/* analysis data */}
            <div className={Style.analysiscontainer}>
                {userInfo.role === 'admin' && (
                    <div id={Style.overalldetails}>
                        <p className={Style.overalldetailstitle}>overall analysis</p>
                        <div className={Style.container2}>

                            <div id={Style.amountcontainer} onDoubleClick={() => navigate('/history')} style={{ cursor: 'pointer' }}>
                                <div id={Style.analaysisimg1}>
                                    <img src={amounticon} alt="" />
                                </div>
                                <div id={Style.analaysistext}>
                                    {/* <p title=" Converted from country_split values to USD\>${totalUsdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p> */}
                                    <p>$ {Math.round(totalamount * 100) / 100}</p>
                                    <p>overall amount</p>
                                </div>
                            </div>

                            <div id={Style.amountcontainer}>
                                <div id={Style.analaysisimg2}>
                                    <h1>{clientPct}%</h1>
                                </div>
                                <div id={Style.analaysistext}>
                                    <p>{totalclient}</p>
                                    <p>Total Clients</p>
                                </div>
                            </div>
                            <div id={Style.amountcontainer}>
                                <div id={Style.analaysisimg2}>
                                    <h1>{clientPct}%</h1>
                                </div>
                                <div id={Style.analaysistext}>
                                    <p>{totalOrders}</p>
                                    <p>Total Orders</p>
                                </div>
                            </div>

                            <div id={Style.amountcontainer}>
                                <div id={Style.analaysisimg3}>
                                    <h1>{pendingPct}%</h1>
                                </div>
                                <div id={Style.analaysistext}>
                                    <p>{pendingcount}</p>
                                    <p>Pending count</p>
                                </div>
                            </div>

                            <div id={Style.amountcontainer}>
                                <div id={Style.analaysisimg4}>
                                    <h1>{rejPct}%</h1>
                                </div>
                                <div id={Style.analaysistext}>
                                    <p>{rejcount}</p>
                                    <p>Reject count</p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                <div id={Style.overalldetails}>
                    <p className={Style.overalldetailstitle}>{isDateFilterActive ? 'analysis (selected range)' : 'analysis (current month)'}</p>
                    <div className={Style.container2}>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg12}>
                                <img src={amounticon2} alt="" />
                            </div>
                            <div id={Style.analaysistext}>
                                <p>$ {Math.round(monthAmount * 100) / 100}</p>
                                <p>Total amount</p>
                            </div>
                        </div>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg22}>
                                <h1>{monthClientPct}%</h1>
                            </div>
                            <div id={Style.analaysistext}>
                                <p>{monthClients}</p>
                                <p>Total Clients</p>
                            </div>
                        </div>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg22}>
                                <h1>{monthClientPct}%</h1>
                            </div>
                            <div id={Style.analaysistext}>
                                <p>{monthOrders}</p>
                                <p>Total Orders</p>
                            </div>
                        </div>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg32}>
                                <h1>{monthPendingPct}%</h1>
                            </div>
                            <div id={Style.analaysistext}>
                                <p>{monthPending}</p>
                                <p>Pending count</p>
                            </div>
                        </div>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg42}>
                                <h1>{monthRejPct}%</h1>
                            </div>
                            <div id={Style.analaysistext}>
                                <p>{monthRej}</p>
                                <p>Reject count</p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className={Style.container3}>
                    {/* box 1 */}
                    <div id={Style.box1}>
                        <h3>Select Date Range
                            <input
                                type="checkbox"
                                className={Style.calendercheckbox}
                                checked={isDateFilterActive}
                                onChange={(e) => setIsDateFilterActive(e.target.checked)}
                            />
                        </h3>
                        <DatePicker
                            selected={startDate}
                            onChange={onChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                            className={Style.fullCalendar}
                        />
                        {/* {startDate && endDate && (
                            <p>Selected Range: {formatDate(startDate)} - {formatDate(endDate)}</p>
                        )} */}
                    </div>

                    {/* box 2 */}
                    <div id={Style.box2}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart style={{ outline: 'none' }}>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={90}
                                    outerRadius={172}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    label={({ name, value, percent }) => percent > 0 ? `${name} \u2014 ${(percent * 100).toFixed(2)}%` : ''}
                                    labelPosition="outside"
                                    style={{ outline: 'none' }}
                                >
                                    {pieData.map((entry, index) => {
                                        const color = COLORS[index % COLORS.length];
                                        return (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={color}
                                                stroke={color}
                                                strokeWidth={2}
                                                style={{ outline: 'none' }}
                                            />
                                        );
                                    })}
                                </Pie>
                                <Tooltip formatter={(value) => `${value}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* container 5 */}
                <div className={Style.tablecontainer}>
                    <div id={Style.tableheader}><p>Table Data</p></div>
                    <div className={Style.tablecontainerdata}>
                        <table className={Style.tabledata}>
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Country</th>
                                    <th>Total Clients</th>
                                    <th>Total Orders</th>
                                    <th>Paid count</th>
                                    <th>Pending count</th>
                                    <th>Rejected count</th>
                                    {/* <th>Paid amount</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {table
                                    .filter(item => {
                                        if (!searchTerm) return true;
                                        return Object.values(item).some(val =>
                                            String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.country_name}</td>
                                            <td>{item.client_count}</td>
                                            <td>{item.order_count}</td>
                                            <td>{item.paid_count}</td>
                                            <td>{item.pending_count}</td>
                                            <td>{item.reject_count}</td>
                                            {/* <td>{item.paid_amount}</td> */}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

