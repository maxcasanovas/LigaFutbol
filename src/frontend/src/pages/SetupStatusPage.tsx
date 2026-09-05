import { Badge, Button, Stack, Text, Title } from '@mantine/core';

export function SetupStatusPage() {
  return (
    <Stack align="center" justify="center" mih="100vh" gap="xs" px="md">
      <Badge color="amber" variant="light" radius="sm">
        LigaFutbol
      </Badge>
      <Title order={1} ta="center">
        El Registro
      </Title>
      <Text c="dimmed" ta="center" maw={480}>
        Sistema de administración de países, ligas, ciudades y equipos. El scaffold del
        frontend está listo — login y dashboard llegan en los próximos features.
      </Text>
      <Button mt="md">Botón primario de ejemplo</Button>
    </Stack>
  );
}
