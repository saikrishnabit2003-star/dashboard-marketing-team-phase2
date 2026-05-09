import Style from './Userdashboardpage.module.css'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import Amounticon from '../assets/amounticon.png'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useState } from 'react';

export function Userdashboardpage(){

        const pieData = [
  { name: 'India', value: 1000 },
  { name: 'USA', value: 350 },
  { name: 'UK', value: 34 },
  { name: 'DUBAI', value: 3400 },
  { name: 'PAK', value: 546 },
];

// Matching your brand: Purple, Teal, and a neutral Grey
const COLORS = ['#791bbe', '#00b5b2', '#a5224e','#2d79c4','#181921']; 

// const DateRangePicker = () => {
//     const [startDate, setStartDate] = useState(new Date());
//     const [endDate, setEndDate] = useState(null);

//     const onChange = (dates) => {
//         const [start, end] = dates;
//         setStartDate(start);
//         setEndDate(end);
//     };

//     const handleBackendSync = () => {
//         if (startDate && endDate) {
//             const data = {
//                 start: startDate.toISOString().split('T')[0],
//                 end: endDate.toISOString().split('T')[0]
//             };
//             console.log("Sending to backend:", data);
//             // Add your fetch call here
//         }
//     };

    return(
        <div className={Style.contentpage}>

            {/* analysis data */}
            <div className={Style.analysiscontainer}>
                <div id={Style.analysissubcontainer1}>

                    {/* amountbox1 */}
                    <div className={Style.amountbox1}>
                        <div id={Style.amountcontainer}>
                        <div id={Style.analaysisimg1}>
                            <h1>80%</h1>
                            {/* <img src={Amounticon} alt="" /> */}
                        </div>
                        <div id={Style.analaysistext}>
                            <p>0000</p>
                            <p>overall amount</p>
                        </div>
                        
                    </div>

                    <div id={Style.amountcontainer}>
                        <div id={Style.analaysisimg2}>
                            <h1>90%</h1>
                            {/* <img src={Amounticon} alt="" /> */}
                        </div>
                        <div id={Style.analaysistext}>
                            <p>0000</p>
                            <p>Pending count</p>
                        </div>
                    </div>
                    </div>

                    {/* amount box 2 */}
                    <div className={Style.amountbox1}>
                        <div id={Style.amountcontainer}>
                        <div id={Style.analaysisimg3}>
                            <h1>50%</h1>
                            {/* <img src={Amounticon} alt="" /> */}
                        </div>
                       <div id={Style.analaysistext}>
                            <p>0000</p>
                            <p>total clients</p>
                        </div>
                    </div>
                    <div id={Style.amountcontainer}>
                        <div id={Style.analaysisimg4}>
                            <h1>70%</h1>
                            {/* <img src={Amounticon} alt="" /> */}
                        </div>
                        <div id={Style.analaysistext}>
                            <p>0000</p>
                            <p>total countries</p>
                        </div>
                    </div>
                    </div>
                    
                    
                </div>

                {/*  piechart */}
                
            </div>


            {/* map and calender */}
            <div className={Style.mapcalendercontainer}>

                {/* map */}
                <div className={Style.map}>
                    <MapContainer
                            center={[12.9716, 79.1591]} // Example: Vellore
                            zoom={2}
                            style={{ height: "99%", width: "99%" }}
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

                {/* calendar */}
                <div className={Style.calender}>
                    {/* <div className={Style.calendarContainer}>
            <h4 style={{ marginBottom: '20px' }}>Select Range</h4>
            
            <DatePicker
                selected={startDate}
                onChange={onChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                monthsShown={2}
            />

            <button className={Style.sendBtn} onClick={handleBackendSync}>
                Submit Range
            </button>
        </div> */}
                </div>



            </div>


            {/* Table */}
            <div></div>


        </div>
    )
}