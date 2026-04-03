import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  HiOutlineBars3 as Menu,
  HiOutlineMagnifyingGlass as Search,
  HiOutlineXMark as X,
  HiOutlineSun as Sun,
  HiOutlineMoon as Moon,
} from "react-icons/hi2";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { employeeService } from "../../services/employeeService";
import { isAdminOrManagerRole } from "../../utils/roles";
import NotificationPanel from "../NotificationPanel";
import Avatar from "../common/Avatar";
import PropTypes from "prop-types";
import { useUIStore } from "../../store/uiStore";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const Header = () => {
  const toggleMobileMenu = useUIStore((state) => state.toggleMobileMenu);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { effectiveTheme, updateTheme } = useTheme();
  const canUseEmployeeSearch = isAdminOrManagerRole(user?.role);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleTheme = () => {
    updateTheme(effectiveTheme === "dark" ? "light" : "dark");
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (!canUseEmployeeSearch) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // In a real app, you might have a specific search endpoint
        // Here we'll fetch all and filter client-side for simplicity
        const { data } = await employeeService.getAll();
        if (data) {
          const filtered = data.filter(emp =>
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.role.toLowerCase().includes(searchQuery.toLowerCase())
          ).slice(0, 5); // Limit to 5 results
          setSearchResults(filtered);
          setShowResults(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, canUseEmployeeSearch]);

  const handleResultClick = (employeeId) => {
    navigate(`/employees/${employeeId}`);
    setSearchQuery("");
    setShowResults(false);
  };

  // Determine active tab from current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) return "dashboard";
    if (path.startsWith("/employees")) return "employees";
    if (path.startsWith("/tasks")) return "tasks";
    if (path.startsWith("/support")) return "support";
    if (path.startsWith("/analytics")) return "analytics";
    if (path.startsWith("/calendar")) return "calendar";
    if (path.startsWith("/settings")) return "settings";
    return "dashboard"; // Default fallback
  };

  // Get page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    const activeTab = getActiveTab();

    if (path.startsWith("/employees/") && path !== "/employees") {
      return "Employee Details";
    }

    // Special case for Help Desk
    if (activeTab === "support") return "Help Desk";

    return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  // Get user display name from auth metadata or email
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  };



  return (
    <header className="app-header">
      <div className="header-left">
        {/* Mobile Menu Button - Only visible on mobile */}
        <button
          className="mobile-menu-btn-header"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        <div className="header-title-container">
          <h2 className="page-title">{getPageTitle()}</h2>
          <p className="page-subtitle">Welcome back, {getUserName()}</p>
        </div>
      </div>

      {/* Global Search */}
      {canUseEmployeeSearch && (
        <div className="header-search-container" ref={searchRef}>
          <div className="header-search-input-wrapper">
            <Search size={18} className="header-search-icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 10 }} />
            <input
              type="text"
              placeholder="Search employees..."
              className="header-search-input" style={{ paddingLeft: '4rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery) setShowResults(true);
              }}
            />
            {searchQuery && (
              <button
                className="header-search-clear"
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className="header-search-results">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-muted">Searching...</div>
              ) : searchResults.length > 0 ? (
                <ul>
                  {searchResults.map(result => (
                    <li key={result.id}>
                      <button
                        className="header-search-result-item"
                        onClick={() => handleResultClick(result.id)}
                      >
                        <div className="header-search-avatar">
                          {result.name.charAt(0)}
                        </div>
                        <div className="header-search-info">
                          <p className="header-search-name">{result.name}</p>
                          <p className="header-search-role">{result.role}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-muted">No results found</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="header-actions">
        <button
          onClick={toggleTheme}
          className="icon-btn"
          aria-label="Toggle theme"
        >
          {effectiveTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <NotificationPanel />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="user-profile cursor-pointer hover:bg-[var(--bg-body)] rounded-lg transition-colors border-none bg-transparent flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-main">{getUserName()}</p>
                <p className="text-xs text-muted">{user?.email}</p>
              </div>
              <Avatar
                src={user?.avatar}
                name={user?.name || getUserName()}
                gender={user?.gender}
                size="sm"
                className="user-avatar"
              />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={`dropdown-content w-[240px] overflow-hidden rounded-2xl shadow-xl border p-3 space-y-1.5 z-50 animate-in fade-in zoom-in-95 ${effectiveTheme === "dark"
                ? "bg-[#131a28] border-[#1e293b]"
                : "bg-white border-gray-200"
                }`}
              style={{ borderRadius: '20px', padding: '12px', width: '240px' }}
              sideOffset={8}
              collisionPadding={8}
              align="end"
            >
              <DropdownMenu.Label className={`px-4 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider ${effectiveTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                My Account
              </DropdownMenu.Label>

              <DropdownMenu.Item className={`dropdown-item flex items-center gap-2 px-4 py-2.5 outline-none cursor-pointer select-none rounded-xl w-full text-left transition-colors ${effectiveTheme === 'dark' ? 'text-gray-200 hover:bg-[#1e293b] data-[highlighted]:bg-[#1e293b]' : 'text-gray-900 hover:bg-gray-100 data-[highlighted]:bg-gray-100'}`} style={{ borderRadius: '14px', padding: '10px 16px' }} onSelect={() => navigate('/profile')}>
                Profile Settings
              </DropdownMenu.Item>

              <DropdownMenu.Separator className={`h-[1px] my-1 mx-1 ${effectiveTheme === 'dark' ? 'bg-[#1e293b]' : 'bg-gray-200'}`} />

              <DropdownMenu.Item
                className={`dropdown-item flex items-center gap-2 px-4 py-2.5 outline-none cursor-pointer select-none rounded-xl w-full text-left font-medium transition-colors ${effectiveTheme === 'dark' ? 'text-red-400 hover:bg-red-950/30 data-[highlighted]:bg-red-950/30' : 'text-red-600 hover:bg-red-50 data-[highlighted]:bg-red-50'}`}
                style={{ borderRadius: '14px', padding: '10px 16px' }}
                onSelect={handleSignOut}
              >
                Sign Out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
};

Header.propTypes = {};

export default Header;

