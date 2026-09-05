import { Alert, Avatar, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { useCiudades, useEquipos, useLigas, usePaises } from '../api/queries';

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <Stack gap={0} align="center">
      <Text
        fw={700}
        fz={40}
        ff='"Space Grotesk", system-ui, sans-serif'
        style={{ borderBottom: '3px solid var(--mantine-color-amber-6)', paddingBottom: 4 }}
      >
        {value}
      </Text>
      <Text c="dimmed" size="sm" mt={4}>
        {label}
      </Text>
    </Stack>
  );
}

export function DashboardPage() {
  const paises = usePaises();
  const ciudades = useCiudades();
  const ligas = useLigas();
  const equipos = useEquipos();

  const isLoading = paises.isLoading || ciudades.isLoading || ligas.isLoading || equipos.isLoading;
  const error = paises.error ?? ciudades.error ?? ligas.error ?? equipos.error;

  if (isLoading) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="navy" />
      </Group>
    );
  }

  if (error) {
    return (
      <Alert color="danger" variant="light" radius="sm">
        No se pudo cargar la información del dashboard. Probá de nuevo más tarde.
      </Alert>
    );
  }

  const flagByPaisId = new Map((paises.data ?? []).map((pais) => [pais.id, pais.urlBandera]));

  return (
    <Stack gap="xl">
      <Title order={2}>Dashboard</Title>

      <Card withBorder radius="sm" padding="lg">
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <StatBlock label="Países" value={paises.data?.length ?? 0} />
          <StatBlock label="Ligas" value={ligas.data?.length ?? 0} />
          <StatBlock label="Equipos" value={equipos.data?.length ?? 0} />
          <StatBlock label="Ciudades" value={ciudades.data?.length ?? 0} />
        </SimpleGrid>
      </Card>

      <Stack gap="xs">
        <Title order={4}>Ligas activas</Title>
        {ligas.data?.length === 0 && (
          <Text c="dimmed" size="sm">
            Todavía no hay ligas cargadas.
          </Text>
        )}
        {ligas.data?.map((liga) => (
          <Group
            key={liga.id}
            justify="space-between"
            py="xs"
            style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
          >
            <Group gap="sm">
              <Avatar src={flagByPaisId.get(liga.paisId)} size="sm" radius="xs" />
              <Text fw={500}>{liga.pais}</Text>
              <Text c="dimmed">{liga.nombre}</Text>
            </Group>
            <Text size="sm" c="dimmed">
              {liga.equipos.length} equipos
            </Text>
          </Group>
        ))}
      </Stack>
    </Stack>
  );
}
