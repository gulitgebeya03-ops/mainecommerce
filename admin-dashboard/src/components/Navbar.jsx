import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminContext } from '../context/AdminContext';
import { LogOut, Menu } from 'lucide-react';

export default function Navbar() {
  const { admin, adminLogout } = useContext(AdminContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-border-light sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-dark tracking-tight">GULIT</h1>
          <span className="text-gold text-xs font-semibold tracking-widest uppercase">Admin</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-text-muted">Welcome back</p>
            <p className="text-dark font-semibold text-sm">{admin?.name || 'Admin'}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-dark hover:bg-gray-800 text-white rounded-lg transition text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
