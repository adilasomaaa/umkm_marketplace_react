import { useAuth } from '@/context/AuthContext';
import { Button } from '@heroui/button'
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from '@heroui/react';
import { LogOut, Mail, Menu } from 'lucide-react';
import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import Avatar from '@/assets/avatar.jpg';


const Header = () => {
    const [openMobile, setOpenMobile] = useState(false);
    const { user, logout } = useAuth();
    
  return (
    <header className="h-16 border-b border-gray-200 flex items-center px-4 gap-3">
        <Button
            isIconOnly
            variant="light"
            className="md:hidden"
            onPress={() => setOpenMobile(true)}
            aria-label="Open menu"
        >
            <Menu className="h-5 w-5" />
        </Button>

        <Link to="/dashboard" className="font-semibold hidden md:inline">
            Dashboard
        </Link>

        <div className="ml-auto flex items-center gap-2 p-4">
            <Dropdown>
                <DropdownTrigger>
                    <User
                        as="button"
                        avatarProps={{
                        isBordered: true,
                        src: Avatar,
                        }}
                        className="transition-transform"
                        description={user?.email}
                        name={user?.username ?? user?.email}
                    />
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                    <DropdownItem
                        startContent={<Mail />}
                        key="email" 
                        isReadOnly 
                        className="text-xs flex items-center gap-2">
                        {user?.email}
                    </DropdownItem>
                    <DropdownItem 
                        startContent={<LogOut />}
                        key="logout" 
                        color="primary" 
                        onPress={() => logout()} 
                        className="flex items-center gap-2">
                        Logout
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>
        </div>
    </header>
  )
}

export default Header