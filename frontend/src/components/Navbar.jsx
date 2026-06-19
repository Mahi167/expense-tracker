    import React, { useEffect, useRef, useState } from 'react'
    import { navbarStyles } from '../assets/dummyStyle'
    import img1 from '../assets/logo.png'
    import { useNavigate } from 'react-router-dom'
    import { ChevronDown, User , LogOut} from 'lucide-react';
    import axios from 'axios'

    const BASE_URL = 'http://localhost:4000/api'

    const Navbar = ({ user:propUser ,setUser,  onLogout }) => {
        const navigate = useNavigate();
        const menuref = useRef();
        const[menuOpen,setMenuOpen] = useState(false);


        const user = propUser || {
            name : "",
            email : ""
        };
        const togglemenu = () => setMenuOpen((prev) => !prev);
        // to fetch the user data from server

        useEffect(() => {
            const fetchUserData = async() => {
                try{
                    const token = localStorage.getItem("token");
                    if(!token) return;
                    const response = await axios.get(`${BASE_URL}/user/me`,{
                        headers:{Authorization : `Bearer ${token}`},
                    });
                    const userData = response.data.user || response.data;
                    setUser(userData);
                }
                catch(error) {
                    console.log("Failed to Load profile",error);
                }
            };
            if(!propUser){
                fetchUserData();
            }
        },[propUser]);
        const handleLogout = () => {
            setMenuOpen(false);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");

            // Call parent logout function if provided
            if (onLogout) {
                onLogout();
            }
            navigate("/login");
        };
        useEffect(() => {
            const handleClickOutside = (e) => {
            if (menuref.current && !menuref.current.contains(e.target)) {
                setMenuOpen(false);
            }
            };
            
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);
    return (
        <>
            <header className={navbarStyles.header}>
                <div className={navbarStyles.container}>
                    <div onClick={ () => navigate("/") } className={navbarStyles.logoContainer}>
                        <div className={navbarStyles.logoImage}>
                            <img src={img1} alt="logo" />
                        </div>
                        <span className={navbarStyles.logoText}>
                            Expense Tracker
                        </span>
                    </div>
                    {/* {if the user is present} */}
                    {user && (
                        <div className={navbarStyles.userContainer} ref={menuref}>
                            <button onClick={togglemenu} className={navbarStyles.userButton}>
                                <div className='relative'>
                                    <div className={navbarStyles.userAvatar}>
                                        {user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div className={navbarStyles.statusIndicator}></div>
                                </div>
                                <div className={navbarStyles.userTextContainer}>
                                    <p className={navbarStyles.userName}> {user?.name || "User"} </p>
                                    <p className={navbarStyles.userEmail}>
                                        {user?.email || "user@expensetracker.com"}
                                    </p>
                                </div>
                                <ChevronDown className={navbarStyles.chevronIcon(menuOpen)}/>
                            </button>
                            {menuOpen && (
                                <div className={navbarStyles.dropdownMenu}>
                                    <div className={navbarStyles.dropdownHeader}>
                                        <div className='flex items-center gap-2'>
                                            <div className={navbarStyles.dropdownAvatar}>
                                                {user?.name?.[0]?.toUpperCase() || "U"}
                                            </div>
                                            <div style={{display:"flex", flexDirection:"column"}}>
                                                <div>
                                                    <div className={navbarStyles.dropdownName}>
                                                        {user?.name || "User"}
                                                    </div>
                                                </div>
                                                <div className={navbarStyles.dropdownEmail}>
                                                    {user?.email || "user@expensetracker.com"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                <div className={navbarStyles.menuItemContainer}>
                                    <button onClick={() => {
                                        setMenuOpen(false);
                                        navigate("/profile");
                                    }} className={navbarStyles.menuItem}>
                                        <User className= "w-4 h-4"/>
                                        <span>My Profile</span>
                                    </button>
                                </div>
                                <div className={navbarStyles.menuItemBorder}>
                                    <button onClick={handleLogout} className={navbarStyles.logoutButton}>
                                        <LogOut className=" w-4 h-4"/>
                                            <span>LogOut</span>
                                    </button>
                                </div>
                            </div>
                        )}
                        </div>
                    )}
                </div>
            </header>
        </>
    )
    }

    export default Navbar