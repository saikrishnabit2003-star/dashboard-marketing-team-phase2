import React, { useState, useEffect } from 'react';
import styles from './Profilepage.module.css';
import closeeye from '../assets/closeeye.png';
import openeye from '../assets/openeye.png';

const Profilepage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ new: '', confirm: '' });
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    
    // New states for profile names
    const [newProfileName, setNewProfileName] = useState('');
    const [isAppending, setIsAppending] = useState(false);

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    const fetchUserDetails = () => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoading(true);
            fetch(`${BASE_URL}/users/me/details`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    if (data?.data) {
                        setUserData(data.data);
                    }
                })
                .catch(error => console.error("Error fetching user details:", error))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const handleAppendProfile = async (e) => {
        e.preventDefault();
        if (!newProfileName.trim()) {
            showNotification("Please enter a profile name", "error");
            return;
        }

        const token = localStorage.getItem('token');
        setIsAppending(true);

        try {
            const response = await fetch(`${BASE_URL}/users/profiles/append`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: userData.email,
                    profile_name: newProfileName.trim().toUpperCase()
                })
            });

            if (response.ok) {
                showNotification("Profile appended successfully", "success");
                setNewProfileName('');
                fetchUserDetails(); // Refresh dat
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to append profile", "error");
            }
        } catch (error) {
            console.error("Error appending profile:", error);
            showNotification("Error connecting to server", "error");
        } finally {
            setIsAppending(false);
        }
    };
    

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            showNotification("New passwords do not match", "error");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/me/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_password: passwordData.new
                })
            });

            if (response.ok) {
                showNotification("Password updated successfully", "success");
                setIsModalOpen(false);
                setPasswordData({ new: '', confirm: '' });
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to update password", "error");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    // if (loading) {
    //     return (
    //         <div className={styles.profilePage}>
    //             <div className={styles.loading}>
    //                 <div className={styles.spinner}></div>
    //                 <p>Loading profile details...</p>
    //             </div>
    //         </div>
    //     );
    // }

    // if (!userData) {
    //     return (
    //         <div className={styles.profilePage}>
    //             <div className={styles.profileCard}>
    //                 <p>Failed to load profile data. Please try logging in again.</p>
    //             </div>
    //         </div>
    //     );
    // }

    const { full_name, email, role, phone_number, branch, profile_names } = userData || {};

    return (
        <div className={styles.profilePage}>
            {notification.visible && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    <div className={styles.notificationIcon}>
                        {notification.type === 'success' ? '✓' : '✕'}
                    </div>
                    <p>{notification.message}</p>
                </div>
            )}

            <div className={styles.profileContainer}>
                {/* Left Sidebar - Identity */}
                <div className={styles.sidebar}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            {full_name ? full_name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className={styles.roleBadge}>{role || 'Employee'}</div>
                    </div>
                    <h2 className={styles.userName}>{full_name || 'User Name'}</h2>
                    <p className={styles.userSubtitle}>{email || 'email@example.com'}</p>
                    
                    <div className={styles.sidebarActions}>
                        <button className={styles.updatePasswordBtn} onClick={() => setIsModalOpen(true)}>
                            Update Password
                        </button>
                    </div>
                </div>

                {/* Right Content - Sections */}
                <div className={styles.mainContent}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Personal Information</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Full Name</label>
                                <p>{full_name || 'N/A'}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Email Address</label>
                                <p>{email || 'N/A'}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Phone Number</label>
                                <p>{phone_number || 'N/A'}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Branch</label>
                                <p>{branch || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Profile Management</h3>
                        <div className={styles.profilesWrapper}>
                            <label>Current Profiles</label>
                            <div className={styles.profileTags}>
                                {profile_names && profile_names.length > 0 ? (
                                    profile_names.map((profile, index) => (
                                        <span key={index} className={styles.profileTag}>{profile}</span>
                                    ))
                                ) : (
                                    <p className={styles.noData}>No profiles associated.</p>
                                )}
                            </div>
                            
                            <div className={styles.appendBox}>
                                <label>Add New Profile</label>
                                <form className={styles.appendForm} onSubmit={handleAppendProfile}>
                                    <input 
                                        type="text" 
                                        placeholder="Enter profile name..."
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                        disabled={isAppending}
                                    />
                                    <button type="submit" disabled={isAppending || !newProfileName.trim()}>
                                        {isAppending ? '...' : 'Append'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Security</h3>
                        <div className={styles.securityBox}>
                            <div className={styles.passwordDisplay}>
                                <label>Current Password</label>
                                <div className={styles.passwordField}>
                                    <span>{showPassword ? (userData?.password || "••••••••") : "••••••••"}</span>
                                    <button 
                                        className={styles.eyeBtn} 
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <img src={showPassword ? closeeye : openeye} alt="Toggle" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.modalHeader}>
                            <h3>Change Password</h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form className={styles.modalForm} onSubmit={handleChangePassword}>
                            <div className={styles.modalInputGroup}>
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter new password"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className={styles.modalInputGroup}>
                                <label>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    placeholder="Enter new password again"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                                    required 
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profilepage;
