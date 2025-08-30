import SiteHeader from "./SiteHeader";

export default function Layout({
  children,
  role,
  onLogout,
}: {
  children: React.ReactNode;
  role: "admin" | "general" | null;
  onLogout?: () => void;
}) {
  return (
    <div className="min-h-screen bg-blue-400">
      {/* Header */}
      <SiteHeader isAdmin={role === "admin"} onLogout={onLogout} />

      {/* Page content inside gray card */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-gray-800 text-white rounded-2xl shadow-xl p-10">
          {children}
        </div>
      </main>
    </div>
  );
}