import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

function AppLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const openMobileMenu = () => {
        setIsMobileMenuOpen(true)
    }

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-white">
            {/* Sidebar */}
            <Sidebar
                isMobileOpen={isMobileMenuOpen}
                onClose={closeMobileMenu}
            />

            {/* Main Area */}
            <div className="min-h-screen lg:pl-72">
                <Header onMenuClick={openMobileMenu} />

                <main className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-8">
                    <div className="mx-auto w-full max-w-[1600px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AppLayout