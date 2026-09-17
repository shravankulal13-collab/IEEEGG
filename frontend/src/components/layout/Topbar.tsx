import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

import {
  ShieldAlert,
  User,
  LogOut,
  ChevronDown,
  Zap,
  Ambulance,
  LayoutDashboard,
  Building2,
  Menu,
  X,
  FileText,
  Activity,
  Layers3,
  ShieldCheck,
  Bell,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, switchDemoRole } = useAuthStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isOperationsOpen, setIsOperationsOpen] = useState(false);

  const isDispatcher = location.pathname.startsWith('/dispatcher');
  const isHospital = location.pathname.startsWith('/hospital');
  const isAmbulance = location.pathname.startsWith('/ambulance');
  const isCitizen = location.pathname.startsWith('/citizen');
  const isAdmin = location.pathname.startsWith('/admin');

  /*
   * Main Command Center navigation
   */
  const mainNav = [
    {
      label: 'Command Center',
      path: '/dispatcher',
    },
    {
      label: 'Ambulances',
      path: '/dispatcher/fleet',
    },
    {
      label: 'Hospitals',
      path: '/dispatcher/hospitals',
    },
    {
      label: 'Incidents',
      path: '/dispatcher/incidents',
    },
  ];

  /*
   * Secondary operational navigation
   */
  const operationsNav = [
    {
      label: 'Emergency Corridors',
      path: '/dispatcher/routes',
    },
    {
      label: 'Traffic Control',
      path: '/dispatcher/traffic',
    },
    {
      label: 'Response Analytics',
      path: '/dispatcher/analytics',
    },
    {
      label: 'Activity Logs',
      path: '/dispatcher/audit',
    },
    {
      label: 'Dispatch Alerts',
      path: '/dispatcher/notifications',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/dispatcher') {
      return location.pathname === '/dispatcher';
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const isOperationsActive = operationsNav.some((item) =>
    isActive(item.path)
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="
        h-[68px]
        min-h-[68px]
        w-full
        bg-[#081A33]
        text-white
        border-b border-white/10
        px-4
        xl:px-6
        flex
        items-center
        z-40
        shrink-0
        relative
      "
    >

      {/* =========================================================
    LEFT — LOGO
    ========================================================= */}

      <div className="flex items-center shrink-0">

        {/* Mobile menu */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="
      lg:hidden
      mr-3
      p-2
      rounded-lg
      text-slate-300
      hover:text-white
      hover:bg-white/10
      border border-white/10
    "
          aria-label="Open navigation"
        >
          {isMobileNavOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Logo — EXACT same design as Landing Page */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >

          {/* Three dots */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#38BDF8',
                display: 'inline-block',
              }}
            />

            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#E50914',
                display: 'inline-block',
              }}
            />

            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                display: 'inline-block',
              }}
            />
          </div>

          {/* ResQGrid */}
          <div
            style={{
              fontWeight: 900,
              fontSize: '22px',
              letterSpacing: '-0.5px',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#FFFFFF' }}>ResQ</span>
            <span style={{ color: '#E50914' }}>Grid</span>
          </div>

        </div>

      </div >


      {/* =========================================================
          DISPATCHER NAVIGATION
          ========================================================= */}

      {isDispatcher ? (

        <nav
          className="
      hidden
      lg:flex
      flex-1
      items-center
      justify-center
      min-w-0
      mx-8
      gap-2
    "
        >

          {/* Command Center */}
          {mainNav.map((item) => {
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  px-4
                  py-2
                    rounded-md
                  whitespace-nowrap
                  text-[15px]
                  font-medium
                  tracking-[-0.2px]
                  transition-all
                  duration-200
                  ${active
                    ? 'text-white'
                    : 'text-white/90 hover:text-white'
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}


          {/* Operations Dropdown */}
          <div className="relative">

            <button
              onClick={() =>
                setIsOperationsOpen(!isOperationsOpen)
              }
              className={`
                flex
                items-center
                gap-1.5
                px-4
                py-2
                rounded-md
                whitespace-nowrap
                text-[15px]
                font-medium
                tracking-[-0.2px]
                transition-all
                ${isOperationsActive
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
                }
              `}
            >
              Operations

              <ChevronDown
                className={`
                  w-3.5
                  h-3.5
                  transition-transform
                  ${isOperationsOpen ? 'rotate-180' : ''}
                `}
              />
            </button>


            {/* Operations Menu */}
            {isOperationsOpen && (
              <div
                className="
                absolute
                top-full
                left-1/2
                -translate-x-1/2
                mt-2
                w-48
                bg-[#0B1F3A]
                border
                border-white/10
                rounded-lg
                shadow-xl
                p-1
                z-50
              "
              >
                {operationsNav.map((item) => {
                  const active = isActive(item.path);

                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsOperationsOpen(false);
                      }}
                      className={`
                      w-full
                      flex
                      items-center
                      px-3
                      py-2
                      rounded-md
                      text-left
                      text-[13px]
                      font-medium
                      transition
                      ${active
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }
                    `}
                    >

                      {item.label}
                    </button>
                  );
                })}
              </div>
            )}

          </div>

        </nav>

      ) : (

        /* =========================================================
           OTHER PORTALS
           ========================================================= */

        isCitizen ? (

          <nav
            className="
      hidden
      lg:flex
      flex-1
      items-center
      justify-center
      min-w-0
      mx-8
      gap-2
    "
          >
            {[
              { label: 'Emergency Home', path: '/citizen' },
              { label: 'Report Incident', path: '/citizen/report' },
              { label: 'Live Tracking', path: '/citizen/tracking' },
              { label: 'Incident History', path: '/citizen/history' },
              { label: 'Medical ID', path: '/citizen/profile' },
            ].map((item) => {
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
            px-4
            py-2
            rounded-md
            whitespace-nowrap
            text-[15px]
            font-medium
            tracking-[-0.2px]
            transition-all
            duration-200
            ${active
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                    }
          `}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

        ) : isAmbulance ? (

          <nav
            className="
      hidden
      lg:flex
      flex-1
      items-center
      justify-center
      min-w-0
      mx-8
      gap-2
    "
          >
            {[
              { label: 'Driver Cockpit', path: '/ambulance' },
              { label: 'Active Emergency', path: '/ambulance/active' },
              { label: 'Dispatch Request', path: '/ambulance/dispatch' },
              { label: 'Turn-by-Turn GPS', path: '/ambulance/navigation' },
              { label: 'Vehicle Readiness', path: '/ambulance/status' },
              { label: 'Trip Response Logs', path: '/ambulance/history' },
            ].map((item) => {
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
            px-4
            py-2
            rounded-md
            whitespace-nowrap
            text-[15px]
            font-medium
            tracking-[-0.2px]
            transition-all
            duration-200
            ${active
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                    }
          `}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

        ) : isHospital ? (

          <nav
            className="
      hidden
      lg:flex
      flex-1
      items-center
      justify-center
      min-w-0
      mx-8
      gap-2
    "
          >
            {[
              { label: 'Emergency Dashboard', path: '/hospital' },
              { label: 'Incoming Patients', path: '/hospital/emergency' },
              { label: 'Beds & ICU', path: '/hospital/resources' },
              { label: 'Doctors', path: '/hospital/doctors' },
              { label: 'Patient History', path: '/hospital/history' },
            ].map((item) => {
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
            px-4
            py-2
            rounded-md
            whitespace-nowrap
            text-[15px]
            font-medium
            tracking-[-0.2px]
            transition-all
            duration-200
            ${active
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                    }
          `}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

        ) : isAdmin ? (

          /* =========================================================
             ADMIN NAVIGATION — SAME DISPATCHER TOPBAR STYLE
             ========================================================= */

          <nav
            className="
      hidden
      lg:flex
      flex-1
      items-center
      justify-center
      min-w-0
      mx-8
      gap-2
    "
          >
            {[
              { label: 'System Overview', path: '/admin' },
              { label: 'Citizen Management', path: '/citizen' },
              { label: 'Dispatch Management', path: '/dispatcher' },
              { label: 'Ambulance Management', path: '/ambulance' },
              { label: 'Hospital Management', path: '/hospital' },
            ].map((item) => {
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
            px-4
            py-2
            rounded-md
            whitespace-nowrap
            text-[15px]
            font-medium
            tracking-[-0.2px]
            transition-all
            duration-200
            ${active
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                    }
          `}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

        ) : (
          <div />
        )


      )}


      {/* =========================================================
          RIGHT — ONLY PROFILE FOR DISPATCHER
          ========================================================= */}

      {
        isDispatcher ? (

          <div className="relative shrink-0">

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="
                flex
                items-center
                justify-center
                p-1
                rounded-full
                hover:bg-white/5
                transition
              "
              aria-label="Open profile"
            >
              <div
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-[#123A78]
                  border
                  border-blue-400/40
                  flex
                  items-center
                  justify-center
                  text-white
                "
              >
                <User className="w-4.5 h-4.5" />
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            </button>

            {/* Profile Dropdown */}
            {isMenuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  mt-2
                  w-56
                  bg-white
                  text-slate-800
                  rounded-xl
                  shadow-2xl
                  border
                  border-slate-200
                  py-1.5
                  z-50
                "
              >

                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-black">
                    {user?.fullName || 'Chief Dispatcher Sarah Jenkins'}
                  </p>

                  <p className="text-[10px] text-slate-500 truncate">
                    {user?.email || 'dispatcher@resqgrid.com'}
                  </p>
                </div>

                <div className="p-1.5">

                  <button
                    onClick={() => {
                      navigate('/citizen/profile');
                      setIsMenuOpen(false);
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-xs
                      font-bold
                      hover:bg-slate-100
                      rounded-lg
                    "
                  >
                    My Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsMenuOpen(false);
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-xs
                      font-bold
                      hover:bg-slate-100
                      rounded-lg
                    "
                  >
                    Platform Diagnostics
                  </button>

                  <button
                    onClick={() => {
                      navigate('/');
                      setIsMenuOpen(false);
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-xs
                      font-bold
                      hover:bg-slate-100
                      rounded-lg
                    "
                  >
                    Landing Page
                  </button>

                </div>

                <div className="border-t border-slate-100 my-1" />

                <div className="p-1.5">

                  <button
                    onClick={handleLogout}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-red-600
                      hover:bg-red-50
                      rounded-lg
                    "
                  >
                    Sign Out
                  </button>

                </div>

              </div>
            )}

          </div>

        ) : (

          /* =========================================================
             OTHER PORTAL RIGHT SIDE
             ========================================================= */

          <div className="relative shrink-0">

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="
                flex
                items-center
                justify-center
                p-1
                rounded-full
                hover:bg-white/5
                transition
              "
              aria-label="Open profile"
            >
              <div
                className="
                  w-9
                  h-9
                  rounded-full
                  bg-[#123A78]
                  border
                  border-blue-400/40
                  flex
                  items-center
                  justify-center
                  text-white
                "
              >
                <User className="w-4.5 h-4.5" />
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            </button>

            {/* Profile Dropdown */}
            {isMenuOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-full
                  mt-2
                  w-56
                  bg-white
                  text-slate-800
                  rounded-xl
                  shadow-2xl
                  border
                  border-slate-200
                  py-1.5
                  z-50
                "
              >

                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-black">
                    {user?.fullName || 'Citizen'}
                  </p>

                  <p className="text-[10px] text-slate-500 truncate">
                    {user?.email || 'Citizen Account'}
                  </p>
                </div>

                <div className="p-1.5">

                  <button
                    onClick={() => {
                      navigate('/citizen/profile');
                      setIsMenuOpen(false);
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-xs
                      font-bold
                      hover:bg-slate-100
                      rounded-lg
                    "
                  >
                    Medical ID Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate('/');
                      setIsMenuOpen(false);
                    }}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-xs
                      font-bold
                      hover:bg-slate-100
                      rounded-lg
                    "
                  >
                    Landing Page
                  </button>

                </div>

                <div className="border-t border-slate-100 my-1" />

                <div className="p-1.5">

                  <button
                    onClick={handleLogout}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-red-600
                      hover:bg-red-50
                      rounded-lg
                    "
                  >
                    Sign Out
                  </button>

                </div>

              </div>
            )}

          </div>

        )
      }



      {/* =========================================================
          MOBILE NAVIGATION
          ========================================================= */}

      {
        isMobileNavOpen && (
          <div
            className="
            lg:hidden
            fixed
            inset-0
            top-[68px]
            z-50
            bg-[#060D1E]/95
            backdrop-blur-xl
            p-5
            overflow-y-auto
          "
            onClick={() => setIsMobileNavOpen(false)}
          >

            <div
              className="max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >

              {isDispatcher ? (

                <div>

                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                    Command Center
                  </p>

                  <div className="space-y-1.5">

                    {mainNav.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileNavOpen(false);
                        }}
                        className={`
                        w-full
                        flex
                        items-center
                        p-3
                        rounded-xl
                        border
                        text-left
                        text-xs
                        font-bold
                        ${isActive(item.path)
                            ? 'bg-red-600/20 border-red-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                          }
                      `}
                      >
                        {item.label}
                      </button>
                    ))}

                    <div className="pt-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                        Operations
                      </p>

                      <div className="space-y-1.5">

                        {operationsNav.map((item) => {

                          return (
                            <button
                              key={item.path}
                              onClick={() => {
                                navigate(item.path);
                                setIsMobileNavOpen(false);
                              }}
                              className="
                              w-full
                              flex
                              items-center
                              gap-3
                              p-3
                              rounded-xl
                              bg-slate-900
                              border
                              border-slate-800
                              text-slate-300
                              text-xs
                              font-bold
                            "
                            >
                              {item.label}
                            </button>
                          );
                        })}

                      </div>
                    </div>

                  </div>

                </div>

              ) : (

                <div className="space-y-6">

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
                      Operational Portals
                    </p>

                    <div className="grid grid-cols-2 gap-2">

                      <button
                        onClick={() => {
                          const path = switchDemoRole('citizen');
                          navigate(path);
                          setIsMobileNavOpen(false);
                        }}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left"
                      >
                        <p className="text-xs font-bold">Citizen SOS</p>
                      </button>

                      <button
                        onClick={() => {
                          const path = switchDemoRole('ambulance_driver');
                          navigate(path);
                          setIsMobileNavOpen(false);
                        }}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left"
                      >
                        <p className="text-xs font-bold">Driver Fleet</p>
                      </button>

                      <button
                        onClick={() => {
                          const path = switchDemoRole('dispatcher');
                          navigate(path);
                          setIsMobileNavOpen(false);
                        }}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left"
                      >
                        <p className="text-xs font-bold">Dispatch Hub</p>
                      </button>

                      <button
                        onClick={() => {
                          const path = switchDemoRole('hospital_admin');
                          navigate(path);
                          setIsMobileNavOpen(false);
                        }}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left"
                      >
                        <p className="text-xs font-bold">Trauma Unit</p>
                      </button>

                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>
        )
      }

    </header >
  );
};

export default Topbar;