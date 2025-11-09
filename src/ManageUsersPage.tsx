import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

interface UserRow {
  id: string;
  username: string;
  email: string;
  role: string;
}

export default function ManageUsersPage() {
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*").eq("role", "general");;
    if (!error) setUsers(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); // prevent page reload

    const { data: { session } } = await supabase.auth.getSession();

    try {
      const res = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          username,
          email,
          role: "general"
        })
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};
      console.log(result);
      
      if (res.ok) {
        // ✅ refresh the page to show new users
        window.location.reload();
      }
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };
  
  const handleDelete = async (userId: string) => {
    if (!window.confirm("Are you sure?")) return;
    const { data: { session } } = await supabase.auth.getSession();
    console.log(userId);

    try {
      const res = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/delete-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId })
      });

      console.log(res);
      const result = await res.json();
      console.log(result);

      if (res.ok) {
        // ✅ refresh the page to show new users
        window.location.reload();
      }
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handlePasswordUpdate = async (newPassword: string) => {
    if (!newPassword) return;
    if (!window.confirm("Are you sure?")) return;
    const { data: { session } } = await supabase.auth.getSession();
    console.log(newPassword);

    try {
      const res = await fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ newPassword })
      });

      console.log(res);
      const result = await res.json();
      console.log(result);

      if (res.ok) {
        // ✅ refresh the page to show new users
        window.location.reload();
      }
    } catch (err) {
      console.error("Error updating passwords:", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2 className="text-2xl font-semibold">Add User</h2>
      <form className="flex flex-col py-4 space-y-4" onSubmit={handleCreate}>
        <div className="flex flex-col space-y-1">
          <label className="font-semibold">
            Username
          </label>
          <input 
            className="w-full px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={username} 
            onChange={e => setName(e.target.value)} 
            placeholder="Username" 
            required 
          />
        </div>
        <div className="flex flex-col space-y-1">
          <label className="font-semibold">
            Email Address
          </label>
          <input 
            className="w-full px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email Address" 
            type="email" 
            required 
          />
        </div>
        <div className="flex pt-6 justify-center">
          <button 
            className="w-1/5 py-2 rounded-lg bg-secondary hover:bg-secondary-hover transition font-medium disabled:opacity-50"
            type="submit"
          >
            Create User
          </button>
        </div>
      </form>
      
      <h2 className="text-2xl font-semibold">Update User Passwords</h2>
      <div 
        className="flex justify-between"
        style={{ marginTop: "1rem",  marginBottom: "3rem" }}>
        <input
          className="w-3/4 px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          placeholder="New Password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
        <button 
          className="w-1/5 py-2 rounded-lg bg-secondary hover:bg-secondary-hover transition font-medium disabled:opacity-50"
          onClick={() => handlePasswordUpdate(newPassword)}
        >
          Update Passwords
        </button>
      </div>

      <h2 className="text-2xl font-semibold">Manage Users</h2>
      <input
        className="w-full px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginTop: "1rem" }}
      />

      <ul className="p-2">
        {filteredUsers.map(u => (
          <li key={u.id} className="flex items-center space-x-4"
              style={{ marginTop: "0.5rem" }}>
            <div>
              {u.username} — {u.email} ({u.role})
            </div>
            <button 
              className="px-2 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover transition font-medium disabled:opacity-50"
              onClick={() => handleDelete(u.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
