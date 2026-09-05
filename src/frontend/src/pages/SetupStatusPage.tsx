import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { useAuth } from '../auth/AuthContext';

export function SetupStatusPage() {
  const { user, logout } = useAuth();

  return (
    <Stack align="center" justify="center" mih="100vh" gap="xs" px="md">
      <Badge color="amber" variant="light" radius="sm">
        LigaFutbol
      </Badge>
      <Title order={1} ta="center">
        El Registro
      </Title>
      <Text c="dimmed" ta="center" maw={480}>
        Sesión iniciada como <strong>{user?.email}</strong> ({user?.rol}). El dashboard real
        llega en el próximo feature.
      </Text>
      <Group mt="md">
        <Button variant="light" color="danger" onClick={logout}>
          Cerrar sesión
        </Button>
      </Group>
    </Stack>
  );
}
