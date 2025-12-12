import { Button, Input, Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/react'
import React from 'react'
import Logo from '@/assets/logo2.png'
import { SearchIcon } from 'lucide-react'


const NavbarComponent = () => {
  return (
    <Navbar maxWidth="xl">
      <NavbarBrand>
        <img src={Logo} alt="Mojies" width={40} />
        <p className="font-bold text-inherit ml-2 text-success-600">InBiz</p>
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
          placeholder="Cari di InBiz..."
          size="sm"
          startContent={<SearchIcon size={18} />}
          type="search"
        />
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  )
}

export default NavbarComponent