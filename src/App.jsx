import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css';
import './App.css'
import { UserPage } from './components/UserPage'
import Loginpage2 from './components/Loginpage2'
import { AmountTable } from './components/AmountTable'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tablepage } from './components/Tablepage';
import { Accounts } from './components/Accounts';
import { useEffect } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import Profilepage from './components/Profilepage';
import MagentaLogo from './assets/Magenta data visualisation on monitor.png';
import Faceicon from './assets/faceicon.png';
import DownArrowIcon from './assets/downarrow.png';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
// Dashboard layout: sidebar + header + the routed page content
function DashboardLayout() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const handleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  const navigate = useNavigate();
  const [username, setusername] = useState("User name")
  const [themeColor, setThemeColor] = useState(localStorage.getItem('themeColor') || '#0d1b3e');

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', themeColor);
    document.documentElement.style.setProperty('--navy', themeColor);
    document.documentElement.style.setProperty('--navy-mid', themeColor);
    localStorage.setItem('themeColor', themeColor);
  }, [themeColor]);

  useEffect(() => {

    const token = localStorage.getItem('token');
    console.log(token)
    if (token) {
      fetch("https://email-marketing-dashboard-v1.vercel.app/users/me/details", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(data => {
          if (data.status_code === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            window.location.reload();
            return;
          }
          setusername(data?.data.full_name)
          if (data?.data.role) {
            localStorage.setItem('user_role', data.data.role);
          }
        })
        .catch(error => console.error(error));
    }
  }, []);
  return (
    <div className="fullpage">
      <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <div id="navtitle">
          <div>
            <DotLottieReact
              src="https://lottie.host/903d518c-7432-4619-a861-77f077140680/gkrDPQG92O.lottie"
              loop
              autoplay
            />
          </div>
          <h3>Dashboard</h3>
          <button id='sidebar-close-btn' onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>

        <div id='navBtn'>
          <NavLink to="/dashboard" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)} end>
            <button>Overall Dashboard</button>
          </NavLink>
          <NavLink to="/table" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)}>
            <button>Table</button>
          </NavLink>
          <NavLink to="/accounts" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)}>
            <button>Accounts</button>
          </NavLink>
          <NavLink to="/AmountTable" style={{ textDecoration: "none" }} onClick={() => setIsSidebarOpen(false)}>
            <button>Amount table</button>
          </NavLink>
        </div>

        {/* <div className='navfooter'>
           <DotLottieReact
      src="https://lottie.host/bf461d9f-d99a-4c23-b496-f5a915a00e42/xFMNTCu2FH.lottie"
      loop
      autoplay
    />
        </div> */}
      </div>

      <div className="pages">
        <div id='pageheader'>
          <button id='mobile-toggle' onClick={() => setIsSidebarOpen(!isSidebarOpen)}>⋮</button>
          <div id='header-search'>
            <span style={{ color: '#ccc', marginRight: '10px' }}>🔍</span>
            <input
              type="search"
              placeholder='Search Here'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

          </div>
          <div id='userprofile'>
            <img src={Faceicon} alt="profile" />
            <h3>{username}</h3>
            <button id='dropdown-btn' onClick={handleDropdown}><img src={DownArrowIcon} alt="" /></button>
            {
              showDropdown && (
                <div className='dropdown'>
                  <div style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="themePicker" style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>Theme:</label>
                    <input
                      type="color"
                      id="themePicker"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      style={{ border: 'none', width: '30px', height: '30px', cursor: 'pointer', padding: 0, background: 'transparent' }}
                      title="Change Theme Color"
                    />
                  </div>
                  <hr style={{ border: 'none', borderBottom: '1px solid #eee', margin: '5px 0' }} />
                  <button onClick={() => navigate('/profile')}>My Profile</button>

                  <button id='logout-btn' onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    navigate('/');
                  }}>Logout</button>
                </div>
              )
            }
          </div>
        </div>

        <div className='otherpages'>
          <Routes>
            <Route path="/dashboard" element={<UserPage searchTerm={searchTerm} />} />
            <Route path="table" element={<Tablepage searchTerm={searchTerm} />} />
            <Route path="accounts" element={<Accounts searchTerm={searchTerm} />} />
            <Route path="profile" element={<Profilepage />} />
            <Route path="amounttable" element={<AmountTable searchTerm={searchTerm} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      {/* Login page — no sidebar/header */}
      <Route path="/" element={<Loginpage2 />} />

      {/* Dashboard and its nested pages protected by login */}
      <Route path="/*" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      } />

      {/* Catch-all → redirect to login */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </Routes>
  );
}

export default App
