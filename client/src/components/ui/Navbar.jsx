import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Code2, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
export default function Navbar() {
  const { user, userRole, signOut } = useAuth();
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };
  return (
    <div className="navbar bg-base-200 shadow-lg sticky top-0 z-50">
      <div className="navbar-start">
        <Link to="/dashboard" className="btn btn-ghost text-xl"><Code2 className="w-6 h-6 mr-2" />Inter-Watch</Link>
      </div>
      <div className="navbar-center">{userRole && <div className="badge badge-primary">{userRole}</div>}</div>
      <div className="navbar-end gap-2">
        <button onClick={toggleTheme} className="btn btn-ghost btn-circle">{theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</button>
        {user && (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar"><div className="w-10 rounded-full"><img src={user.imageUrl} alt="User" /></div></label>
            <ul tabIndex={0} className="menu dropdown-content mt-3 p-2 shadow bg-base-200 rounded-box w-52">
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><a onClick={signOut}>Logout</a></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
