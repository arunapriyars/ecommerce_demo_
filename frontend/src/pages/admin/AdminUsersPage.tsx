import React, { useState, useEffect } from 'react';
import { Users, Mail, MapPin, Sparkles, ShoppingBag } from 'lucide-react';
import { api } from '../../services/api';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await api.getAdminUsers();
        setUsers(res.users);
      } catch (err) {
        console.error('Error fetching admin users:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-extrabold text-white font-display">
          Registered Customer Directory
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Registered users, lifetime order volumes, and personality preferences.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-amber-400 border-t-amber-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading customer directory...</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Favorite Vibe</th>
                  <th className="py-3 px-4 font-semibold">Total Orders</th>
                  <th className="py-3 px-4 font-semibold">Lifetime Spent</th>
                  <th className="py-3 px-4 font-semibold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.name}`}
                        alt={u.name}
                        className="w-9 h-9 rounded-full bg-slate-800 object-cover flex-shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-200">{u.name}</p>
                        <p className="text-[10px] text-slate-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-purple-300 border border-purple-500/20">
                        {u.favorite_vibe || 'Chill Mode'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{u.order_count || 0}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      ₹{Number(u.total_spent || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
