import { AppShell, Badge, Burger, Button, Group, NavLink as MantineNavLink, ScrollArea, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

interface NavItem {
  label: string;
  to: string;
}

const BASE_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/' },
  { label: 'Países', to: '/paises' },
  { label: 'Ciudades', to: '/ciudades' },
  { label: 'Ligas', to: '/ligas' },
  { label: 'Equipos', to: '/equipos' },
];

export function AppLayout() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems =
    user?.rol === 'Admin' ? [...BASE_NAV_ITEMS, { label: 'Usuarios', to: '/usuarios' }] : BASE_NAV_ITEMS;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !mobileOpened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
            <Text fw={700} size="lg" ff='"Space Grotesk", system-ui, sans-serif'>
              LigaFutbol
            </Text>
          </Group>
          <Group gap="sm">
            {user && (
              <Badge color="navy" variant="light" radius="sm">
                {user.rol}
              </Badge>
            )}
            <Button variant="subtle" color="navy" size="xs" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <AppShell.Section grow component={ScrollArea}>
          {navItems.map((item) => (
            <MantineNavLink
              key={item.to}
              component={Link}
              to={item.to}
              label={item.label}
              active={location.pathname === item.to}
              variant="light"
              color="navy"
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
