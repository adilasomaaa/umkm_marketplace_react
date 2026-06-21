import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Navbar, NavbarBrand, NavbarContent, NavbarItem, User } from '@heroui/react'

import Logo from '@/assets/logo2.png'
import { Home, LogOut, SearchIcon } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import Avatar from '@/assets/avatar.jpg';
import { useState } from 'react';

const NavbarComponent = () => {
  const {user, logout} = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }
  
  return (
    <Navbar maxWidth="xl">
      <NavbarBrand>
        <Link className='flex items-center' to="/">
          <img src={Logo} alt="Mojies" width={40} />
          <p className="font-bold text-inherit ml-2 text-success-600">InBiz</p>
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <Input
          classNames={{
            base: "max-w-full sm:max-w-auto h-10",
            mainWrapper: "h-full",
            input: "text-small",
            inputWrapper:
              "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
          }}
          placeholder="Cari produk atau #hashtag..."
          size="sm"
          startContent={<SearchIcon size={18} />}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </NavbarContent>
      <NavbarContent justify="end">
        {user ? (
          <Dropdown>
            <DropdownTrigger>
                <User
                    as="button"
                    avatarProps={{
                    src: Avatar,
                    }}
                    className="transition-transform"
                    description={user?.email}
                    name={user?.username ?? user?.email}
                />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
                <DropdownItem
                    startContent={<Home />}
                    isReadOnly 
                    key="home" 
                    href={user.roles.name == "admin" ? "/dashboard" : "/dashboard/manage-my-shop"}
                    className="text-xs flex items-center gap-2">
                    Dashboard
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
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link to="/login" className='text-gray-600'>Login</Link>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} color="primary" to="/register" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
        
      </NavbarContent>
    </Navbar>
  )
}

export default NavbarComponent