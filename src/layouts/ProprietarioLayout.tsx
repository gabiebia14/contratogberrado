import { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, 
  SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { Bell, Menu, Home, FileText, Users } from 'lucide-react';
import { Link, Outlet, useLocation } from "react-router-dom";

export default function ProprietarioLayout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex-1 min-w-0 overflow-auto">
        <button 
          className="mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
          <Sidebar className="flex border-r bg-background h-full" variant="sidebar">
            <SidebarHeader className="p-4">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-cyan-400">▲</span> Proprietário
              </h1>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/proprietario'}>
                        <Link to="/proprietario">
                          <Menu className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/proprietario/imoveis'}>
                        <Link to="/proprietario/imoveis">
                          <Home className="w-4 h-4" />
                          <span>Imóveis</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/proprietario/contratos'}>
                        <Link to="/proprietario/contratos">
                          <FileText className="w-4 h-4" />
                          <span>Contratos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={location.pathname === '/proprietario/inquilinos'}>
                        <Link to="/proprietario/inquilinos">
                          <Users className="w-4 h-4" />
                          <span>Inquilinos</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </div>

        <main className="main-content bg-gray-50">
          <div className="p-4 md:p-8">
            <div className="flex justify-end items-center mb-4 md:mb-8">
              <div className="flex items-center gap-4">
                <Bell className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
            <div className="w-full max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
