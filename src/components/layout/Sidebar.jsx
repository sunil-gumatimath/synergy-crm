import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Home01Icon,
  LayoutDashboard,
  UserGroupIcon,
  Task01Icon,
  Time01Icon,
  CalendarMinus01Icon,
  Message01Icon,
  LifebuoyIcon,
  Calendar01Icon,
  Rocket01Icon,
  Target01Icon,
  DocumentValidationIcon,
  Settings01Icon,
  Logout01Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "../../contexts/AuthContext";
import SynergyLogo from "../common/SynergyLogo";
import HugeIcon from "../common/HugeIcon";
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
          icon: Home01Icon,
          label: "Dashboard",
          id: "dashboard",
          path: "/dashboard",
          roles: ["Employee", "Admin", "Manager"],
        },
        {
          icon: LayoutDashboard,
          label: "Analytics",
          id: "analytics",
          path: "/analytics",
          roles: ["Admin", "Manager"],
        },
        {
          icon: UserGroupIcon,
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
          icon: Task01Icon,
          label: "Tasks",
          id: "tasks",
          path: "/tasks",
          roles: ["Admin", "Manager", "Employee"],
          badge: notifications.tasks,
        },
        {
          icon: Time01Icon,
          label: "Time Tracking",
          id: "timetracking",
          path: "/timetracking",
          roles: ["Admin", "Manager", "Employee"],
        },
        {
          icon: CalendarMinus01Icon,
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
          icon: Message01Icon,
          label: "Team Chat",
          id: "chat",
          path: "/chat",
          roles: ["Admin", "Manager", "Employee"],
        },
        {
          icon: LifebuoyIcon,
          label: "Help Desk",
          id: "support",
          path: "/support",
          roles: ["Admin", "Manager", "Employee"],
          badge: notifications.support,
        },
        {
          icon: Calendar01Icon,
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
          icon: Rocket01Icon,
          label: "Onboarding",
          id: "onboarding",
          path: "/onboarding",
          roles: ["Admin", "Manager"],
        },
        {
          icon: Target01Icon,
          label: "Performance",
          id: "performance",
          path: "/performance",
          roles: ["Admin", "Manager", "Employee"],
        },
        {
          icon: DocumentValidationIcon,
          label: "Reports",
          id: "reports",
          path: "/reports",
          roles: ["Admin", "Manager"],
        },
        {
          icon: Settings01Icon,
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

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen, setMobileMenuOpen]);

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
        >
          <span className="sidebar-collapse-toggle-icon" aria-hidden="true">
            {isCollapsed ? <HugeIcon icon={ChevronRightIcon} size={16} /> : <HugeIcon icon={ChevronLeftIcon} size={16} />}
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
            <Link to="/dashboard">
              <SynergyLogo size={isCollapsed ? 24 : 32} />
              {!isCollapsed && (
                <p className="brand-name">
                  Synergy<span className="brand-dot">.</span>
                </p>
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
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                      data-tooltip={item.label}
                      aria-current={activeTab === item.id ? "page" : undefined}
                    >
                      <span className="nav-item-icon">
                        <HugeIcon icon={item.icon} size={20} strokeWidth={2} />
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="nav-item-label">{item.label}</span>
                          {item.badge > 0 && (
                            <span className="nav-badge">{item.badge > 9 ? '9+' : item.badge}</span>
                          )}
                          {activeTab === item.id && !item.badge && (
                            <HugeIcon
                              icon={ChevronRightIcon}
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
              <HugeIcon icon={Logout01Icon} size={20} />
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
