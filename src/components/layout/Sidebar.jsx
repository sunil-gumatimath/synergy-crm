import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  HiOutlineUsers as Users,
  HiOutlineSquares2X2 as LayoutDashboard,
  HiOutlineCalendarDays as Calendar,
  HiOutlineCog6Tooth as Settings,
  HiArrowRightOnRectangle as LogOut,
  HiChevronRight as ChevronRight,
  HiChevronLeft as ChevronLeft,
  HiOutlineClipboardDocumentList as ClipboardList,
  HiOutlineLifebuoy as LifeBuoy,
  HiOutlineHome as Home,
  HiOutlineClock as Timer,
  HiOutlineDocumentText as FileText,
  HiOutlineChatBubbleLeftEllipsis as MessageCircle,
  HiOutlineCheckBadge as Target,
  HiOutlineSun as LeaveIcon,
} from "react-icons/hi2";

import { useAuth } from "../../contexts/AuthContext";
import SynergyLogo from "../common/SynergyLogo";
import { useNotifications } from "../../contexts/NotificationContext";
import { useUIStore } from "../../store/uiStore";

const Sidebar = ({ activeTab }) => {
  const isMobileMenuOpen = useUIStore((state) => state.isMobileMenuOpen);
  const setMobileMenuOpen = useUIStore((state) => state.setMobileMenuOpen);
  const { user, signOut } = useAuth();
  const { notifications: allNotifications } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // derived state for notification counts
  const notifications = {
    tasks: (allNotifications || []).filter(n => n.type === 'task' && !n.read).length,
    support: (allNotifications || []).filter(n => n.type === 'support' && !n.read).length,
    leave: (allNotifications || []).filter(n => n.type === 'leave' && !n.read).length,
  };

  // Menu items organized by sections
  const menuSections = [
    {
      label: "Main",
      items: [
        {
          icon: Home,
          label: "Dashboard",
          id: "dashboard",
          path: "/dashboard",
          roles: ["Employee"],
        },
        {
          icon: LayoutDashboard,
          label: "Analytics",
          id: "analytics",
          path: "/analytics",
          roles: ["Admin", "Manager"],
        },
        {
          icon: Users,
          label: "Employees",
          id: "employees",
          path: "/employees",
          roles: ["Admin", "Manager"],
        },
      ],
    },
    {
      label: "Work",
      items: [
        {
          icon: ClipboardList,
          label: "Tasks",
          id: "tasks",
          path: "/tasks",
          roles: ["Admin", "Manager", "Employee"],
          badge: notifications.tasks,
        },
        {
          icon: Timer,
          label: "Time Tracking",
          id: "timetracking",
          path: "/timetracking",
          roles: ["Admin", "Manager", "Employee"],
        },
        {
          icon: LeaveIcon,
          label: "Leave",
          id: "leave",
          path: "/leave",
          roles: ["Admin", "Manager", "Employee"],
          badge: user?.role === "Admin" || user?.role === "Manager" ? notifications.leave : 0,
        },
      ],
    },
    {
      label: "Connect",
      items: [
        {
          icon: MessageCircle,
          label: "Team Chat",
          id: "chat",
          path: "/chat",
          roles: ["Admin", "Manager", "Employee"],
        },
        {
          icon: LifeBuoy,
          label: "Help Desk",
          id: "support",
          path: "/support",
          roles: ["Admin", "Manager", "Employee"],
          badge: notifications.support,
        },
        {
          icon: Calendar,
          label: "Calendar",
          id: "calendar",
          path: "/calendar",
          roles: ["Admin", "Manager", "Employee"],
        },
      ],
    },
    {
      label: "Manage",
      items: [
        {
          icon: Target,
          label: "Performance",
          id: "performance",
          path: "/performance",
          roles: ["Admin", "Manager", "Employee"],
        },
        {
          icon: FileText,
          label: "Reports",
          id: "reports",
          path: "/reports",
          roles: ["Admin", "Manager"],
        },
        {
          icon: Settings,
          label: "Settings",
          id: "settings",
          path: "/settings",
          roles: ["Admin", "Manager", "Employee"],
        },
      ],
    },
  ];

  // Filter sections based on user role
  const getFilteredSections = () => {
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item =>
        !item.roles || (user?.role && item.roles.includes(user.role)) || user?.role === 'Admin'
      ),
    })).filter(section => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };



  return (
    <>
      {/* Sidebar Container */}
      <div className="sidebar-container">
        {/* Collapse Toggle Button (Desktop only) */}
        <button
          type="button"
          className="sidebar-collapse-toggle"
          onClick={toggleCollapse}
          aria-controls="app-sidebar"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-collapsed={isCollapsed}
        >
          <span className="sidebar-collapse-toggle-icon" aria-hidden="true">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </span>
          <span className="sr-only">
            {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </button>

        {/* Sidebar */}
        <aside
          id="app-sidebar"
          className={`sidebar ${isMobileMenuOpen ? "mobile-open" : ""} ${isCollapsed ? "collapsed" : ""}`}
        >
          <div className="sidebar-header">
            <Link to="/dashboard" className={`brand-logo ${isCollapsed ? 'short' : ''}`}>
              <SynergyLogo size={isCollapsed ? 24 : 32} />
              {!isCollapsed && (
                <h1 className="brand-name">
                  Synergy<span className="brand-dot">.</span>
                </h1>
              )}
            </Link>
          </div>



          <nav className="sidebar-nav">
            {filteredSections.map((section, sectionIndex) => (
              <div key={section.label} className="nav-section">
                {!isCollapsed && (
                  <div className="nav-section-label">{section.label}</div>
                )}
                {isCollapsed && sectionIndex > 0 && (
                  <div className="nav-section-divider" />
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                      data-tooltip={item.label}
                    >
                      <span className="nav-item-icon">
                        <Icon size={20} strokeWidth={2} />
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="nav-item-label">{item.label}</span>
                          {item.badge > 0 && (
                            <span className="nav-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                          )}
                          {activeTab === item.id && !item.badge && (
                            <ChevronRight
                              size={16}
                              className="nav-item-arrow"
                            />
                          )}
                        </>
                      )}
                      {isCollapsed && item.badge > 0 && (
                        <span className="nav-badge-collapsed">{item.badge > 9 ? '9+' : item.badge}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button
              className="sidebar-logout-btn"
              aria-label="Logout"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={20} />
              {!isCollapsed && <span className="logout-label">Logout</span>}
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile Overlay - Render AFTER sidebar so it's on top */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
};

export default Sidebar;
