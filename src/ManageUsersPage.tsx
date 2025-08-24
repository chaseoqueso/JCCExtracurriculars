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
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");

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
          username,  // ✅ renamed
          email,
          password,
          role: "general"
        })
      });

      const text = await res.text();
      const result = text ? JSON.parse(text) : {};
      console.log(result);
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
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };


  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Manage Users</h2>
      <form onSubmit={handleCreate}>
        <input value={username} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" required />
        <button type="submit">Create User</button>
      </form>

      <input
        placeholder="Search users..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginTop: "1rem" }}
      />

      <ul>
        {filteredUsers.map(u => (
          <li key={u.id}>
            {u.username} — {u.email} ({u.role})
            <button onClick={() => handleDelete(u.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
