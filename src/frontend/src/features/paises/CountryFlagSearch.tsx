import { useMemo, useState } from 'react';
import { Avatar, Card, Group, Loader, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { fetchFlagCdnCountries, flagCdnUrl } from '../../api/flagCdn';

interface CountryFlagSearchProps {
  nombre: string;
  onSelect: (urlBandera: string) => void;
}

const MIN_LENGTH = 2;
const MAX_RESULTS = 5;

export function CountryFlagSearch({ nombre, onSelect }: CountryFlagSearchProps) {
  const [debounced] = useDebouncedValue(nombre, 300);
  // "Descartado" se guarda atado al termino buscado: si el nombre cambia (y por
  // lo tanto el debounce produce un termino nuevo), las sugerencias reaparecen solas.
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  // El listado completo se trae una sola vez (staleTime infinito) y se filtra
  // localmente en cada tecleo: flagcdn no tiene un endpoint de búsqueda por nombre.
  const { data: countries, isFetching } = useQuery({
    queryKey: ['flagcdn-countries'],
    queryFn: fetchFlagCdnCountries,
    staleTime: Infinity,
    retry: false,
  });

  const enabled = debounced.trim().length >= MIN_LENGTH && dismissedFor !== debounced;

  const matches = useMemo(() => {
    if (!enabled || !countries) return [];
    const query = debounced.trim().toLowerCase();
    return countries.filter((country) => country.nombre.toLowerCase().includes(query)).slice(0, MAX_RESULTS);
  }, [countries, debounced, enabled]);

  if (!enabled) return null;
  if (!isFetching && matches.length === 0) return null;

  return (
    <Stack gap={4}>
      <Text size="xs" c="dimmed">
        Sugerencias de bandera (flagcdn)
      </Text>
      <Card withBorder radius="sm" p={0}>
        {isFetching ? (
          <Group p="xs" justify="center">
            <Loader size="xs" color="navy" />
          </Group>
        ) : (
          matches.map((country) => (
            <UnstyledButton
              key={country.code}
              type="button"
              p="xs"
              w="100%"
              onClick={() => {
                onSelect(flagCdnUrl(country.code));
                setDismissedFor(debounced);
              }}
            >
              <Group gap="sm" wrap="nowrap">
                <Avatar src={flagCdnUrl(country.code)} size="sm" radius="xs">
                  🏳
                </Avatar>
                <Text size="sm" fw={500} truncate>
                  {country.nombre}
                </Text>
              </Group>
            </UnstyledButton>
          ))
        )}
      </Card>
    </Stack>
  );
}
