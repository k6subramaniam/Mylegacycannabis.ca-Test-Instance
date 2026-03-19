import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Package, ShoppingCart, ShieldCheck, Truck,
  Mail, BarChart3, Users, ChevronLeft, ChevronRight, LogOut,
  Menu, X, Settings,
} from "lucide-react";
import { useState, useEffect } from "react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/86973655/5wgxseZemq4jvbSSj7t6zG/myLegacy-logo_1c4faece.png";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Package, label: "Products", path: "/admin/products" },
  { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
  { icon: ShieldCheck, label: "ID Verification", path: "/admin/verifications" },
  { icon: Truck, label: "Shipping", path: "/admin/shipping" },
  { icon: Mail, label: "Email Templates", path: "/admin/emails" },
  { icon: BarChart3, label: "Reports", path: "/admin/reports" },
  { icon: Users, label: "Customers", path: "/admin/customers" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-10 h-10 border-4 border-[#4B2D8E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4B2D8E] to-[#2d1a54]">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
          <img src={LOGO_URL} alt="My Legacy Cannabis" className="h-14 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-[#333] mb-2">Admin Dashboard</h1>
          <p className="text-gray-500 mb-6">Sign in to access the admin panel.</p>
          <button
            onClick={() => { window.location.href = getLoginUrl(); }}
            className="w-full bg-[#4B2D8E] hover:bg-[#3a2270] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-lg text-center">
          <ShieldCheck size={48} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#333] mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">You do not have admin privileges. Contact the site owner to request access.</p>
          <Link href="/" className="inline-block bg-[#4B2D8E] text-white py-2 px-6 rounded-xl">
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === "/admin") return location === "/admin";
    return location.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-20"}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {sidebarOpen && <img src={LOGO_URL} alt="My Legacy" className="h-9" />}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link key={item.path} href={item.path}
              className={`flex items-center gap-3 mx-3 my-1 px-3 py-2.5 rounded-xl transition-all ${
                isActive(item.path)
                  ? "bg-[#4B2D8E] text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}>
              <item.icon size={20} className="shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4B2D8E] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {user.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.name || "Admin"}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
              <button onClick={logout} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={logout} className="w-full flex justify-center p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors" title="Sign out">
              <LogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header + Menu */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <img src={LOGO_URL} alt="My Legacy" className="h-8" />
          </div>
          <span className="text-xs font-semibold text-[#4B2D8E] bg-[#4B2D8E]/10 px-3 py-1 rounded-full">ADMIN</span>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[57px] bg-white z-50 overflow-y-auto">
            <nav className="p-4">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 ${
                    isActive(item.path) ? "bg-[#4B2D8E] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}>
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
              <hr className="my-4" />
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-[#4B2D8E] flex items-center justify-center text-white font-semibold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl w-full">
                <LogOut size={20} />
                <span className="font-medium">Sign Out</span>
              </button>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
