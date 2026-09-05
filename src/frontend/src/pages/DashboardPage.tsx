import { useMemo } from 'react';
import { Alert, Avatar, Card, Group, Loader, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { BarChart, DonutChart } from '@mantine/charts';
import { useCiudades, useEquipos, useLigas, usePaises } from '../api/queries';

// Paleta categórica validada para composición (orden fijo, no ciclar):
// azul, naranja, aqua, amarillo, magenta, verde. "Otros" usa el gris neutro
// del sistema en vez de generar un séptimo tono.
const CATEGORICAL_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];
const OTHER_COLOR = '#898781';
const MAX_DONUT_SLICES = 6;

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

function ChartCard({
  title,
  description,
  isEmpty,
  children,
}: {
  title: string;
  description: string;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card withBorder radius="sm" padding="lg" h="100%">
      <Stack gap={2} mb="md">
        <Title order={4}>{title}</Title>
        <Text c="dimmed" size="sm">
          {description}
        </Text>
      </Stack>
      {isEmpty ? (
        <Text c="dimmed" size="sm">
          Todavía no hay datos suficientes para este gráfico.
        </Text>
      ) : (
        children
      )}
    </Card>
  );
}

function topWithOther(entries: { name: string; value: number }[], max: number) {
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  if (sorted.length <= max) return sorted;
  const top = sorted.slice(0, max);
  const otrosTotal = sorted.slice(max).reduce((acc, entry) => acc + entry.value, 0);
  return otrosTotal > 0 ? [...top, { name: 'Otros', value: otrosTotal }] : top;
}

export function DashboardPage() {
  const paises = usePaises();
  const ciudades = useCiudades();
  const ligas = useLigas();
  const equipos = useEquipos();

  const isLoading = paises.isLoading || ciudades.isLoading || ligas.isLoading || equipos.isLoading;
  const error = paises.error ?? ciudades.error ?? ligas.error ?? equipos.error;

  const equiposPorLiga = useMemo(
    () =>
      [...(ligas.data ?? [])]
        .map((liga) => ({ liga: liga.nombre, pais: liga.pais, equipos: liga.equipos.length }))
        .sort((a, b) => b.equipos - a.equipos)
        .slice(0, 10),
    [ligas.data],
  );

  const equiposPorPais = useMemo(() => {
    const totals = new Map<string, number>();
    for (const liga of ligas.data ?? []) {
      totals.set(liga.pais, (totals.get(liga.pais) ?? 0) + liga.equipos.length);
    }
    const entries = Array.from(totals, ([name, value]) => ({ name, value }));
    return topWithOther(entries, MAX_DONUT_SLICES).map((entry, index) => ({
      ...entry,
      color: entry.name === 'Otros' ? OTHER_COLOR : CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length],
    }));
  }, [ligas.data]);

  const ciudadesPorPais = useMemo(
    () =>
      [...(paises.data ?? [])]
        .map((pais) => ({ pais: pais.nombre, ciudades: pais.ciudades.length }))
        .sort((a, b) => b.ciudades - a.ciudades),
    [paises.data],
  );

  const totalEquiposEnLigas = equiposPorPais.reduce((acc, entry) => acc + entry.value, 0);

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

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <ChartCard
          title="Equipos por país"
          description="Distribución de equipos según el país de su liga."
          isEmpty={equiposPorPais.length === 0}
        >
          <Group justify="center">
            <DonutChart
              data={equiposPorPais}
              size={200}
              thickness={26}
              withTooltip
              withLegend
              chartLabel={String(totalEquiposEnLigas)}
              tooltipDataSource="segment"
              valueFormatter={(value) => `${value} equipo${value === 1 ? '' : 's'}`}
            />
          </Group>
        </ChartCard>

        <ChartCard
          title="Ciudades por país"
          description="Cantidad de ciudades cargadas en cada país."
          isEmpty={ciudadesPorPais.length === 0}
        >
          <BarChart
            h={Math.max(200, ciudadesPorPais.length * 34)}
            data={ciudadesPorPais}
            dataKey="pais"
            orientation="vertical"
            series={[{ name: 'ciudades', color: 'amber.6', label: 'Ciudades' }]}
            withBarValueLabel
            gridAxis="x"
          />
        </ChartCard>
      </SimpleGrid>

      <ChartCard
        title="Equipos por liga"
        description="Top 10 ligas con más equipos cargados."
        isEmpty={equiposPorLiga.length === 0}
      >
        <BarChart
          h={Math.max(220, equiposPorLiga.length * 36)}
          data={equiposPorLiga}
          dataKey="liga"
          orientation="vertical"
          series={[{ name: 'equipos', color: 'navy.6', label: 'Equipos' }]}
          withBarValueLabel
          gridAxis="x"
          yAxisProps={{ width: 160 }}
        />
      </ChartCard>

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
