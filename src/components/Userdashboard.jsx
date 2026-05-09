import Style from './Userdashboard.module.css'
import Faceicon from '../assets/faceicon.png';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';


export function Userdashboard() {
    const pieData = [
  { name: 'India', value: 1000 },
  { name: 'USA', value: 350 },
  { name: 'UK', value: 34 },
  { name: 'DUBAI', value: 3400 },
  { name: 'PAK', value: 546 },
];

// Matching your brand: Purple, Teal, and a neutral Grey
const COLORS = ['#791bbe', '#00b5b2', '#d3e0ed','#2d79c4','#181921']; 

    return(
        <div className={Style.page}>
            {/* Header */}
            <div className={Style.header}>
                <div>
                   <img src={Faceicon} alt="profile" />
                </div>
                <h3>User name</h3>
                <p>user role</p>
                
            </div>

            {/* body */}
            <div className={Style.body}>

                <div className={Style.container1}>

                    {/* calendar */}
                    <div className={Style.calendar}>
                        <Calendar />
                </div>

                    {/* map */}
                    <div className={Style.map}>
                        <MapContainer
        center={[12.9716, 79.1591]} // Example: Vellore
        zoom={2}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[12.9716, 79.1591]}>
          <Popup>My Location 📍</Popup>
        </Marker>
      </MapContainer>
                    </div>
                </div>

                <div className={Style.container2}>
                    {/* data analysis */}
                    <div className={Style.dataAnalysis}>
                        {/* total amount */}
                        <div className={Style.amountdata}>
                            <div id={Style.amountdataicon}>
                                <img src="https://cdn-icons-png.freepik.com/512/10617/10617488.png" alt="" />
                            </div>
                            <div id={Style.amountdatacontent}>
                                <h4>Overall Amount</h4>
                                <p>$ 1234.00</p>
                            </div>
                        </div>

                        <div className={Style.amountdatabycountry}>
                            <div id={Style.amountchartbar}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%" /* Centers horizontally */
                                                cy="48%" /* Centers vertically */
                                                innerRadius={40} /* This makes it a Donut Chart. Set to 0 for a full circle */
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            {/* Legend helps users identify which color is which country on mobile */}
                                            {/* <Legend verticalAlign="bottom" height={28}/> */}
                                        </PieChart>
                                        
                                    </ResponsiveContainer>

                            </div>

                            <div id={Style.topamountdata}>
                                <h4>Top 5 countries</h4>
                                <p>India:<span>$ 1000.00</span> </p>
                                <p>USA: <span>$ 350.00</span></p>
                                <p>UK: <span>$ 34.00</span></p>
                                <p>PAK: <span>$ 3400.00</span></p>
                                <p>DUBAI: <span> $ 546.00</span></p>

                            </div>

                            

                        </div>
                    </div>

                    {/* table */}
                    <div className={Style.tablecontainer}>
                        <div className={Style.tablecontainerdata}>
                            <table className={Style.tabledata}>
                                <thead>
                                    <tr>
                                        <th>S.no</th>
                                        <th>Column 1</th>
                                        <th>Column 2</th>
                                        <th>column 3</th>
                                        <th>column 4</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>john.doe@example.com</td>
                                        <td>Admin</td>
                                        <td>Active</td>
                                        <td>2024-01-01</td>
                                    </tr>
                                    <tr>
                                        <td>1</td>
                                        <td>john.doe@example.com</td>
                                        <td>Admin</td>
                                        <td>Active</td>
                                        <td>2024-01-01</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>john.doe@example.com</td>
                                        <td>Admin</td>
                                        <td>Active</td>
                                        <td>2024-01-01</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>john.doe@example.com</td>
                                        <td>Admin</td>
                                        <td>Active</td>
                                        <td>2024-01-01</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>john.doe@example.com</td>
                                        <td>Admin</td>
                                        <td>Active</td>
                                        <td>2024-01-01</td>
                                    </tr><tr>
                                        <td>1</td>
                                        <td>john.doe@example.com</td>
                                        <td>Admin</td>
                                        <td>Active</td>
                                        <td>2024-01-01</td>
                                    </tr>
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}