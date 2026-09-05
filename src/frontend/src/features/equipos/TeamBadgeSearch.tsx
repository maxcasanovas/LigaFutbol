import { useState } from 'react';
import { Avatar, Card, Group, Loader, Stack, Text, UnstyledButton } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { searchTeamsByName } from '../../api/sportsDb';

interface TeamBadgeSearchProps {
  nombre: string;
  onSelect: (urlEscudo: string) => void;
}

const MIN_LENGTH = 2;
const MAX_RESULTS = 5;

export function TeamBadgeSearch({ nombre, onSelect }: TeamBadgeSearchProps) {
  const [debounced] = useDebouncedValue(nombre, 450);
  // "Descartado" se guarda atado al termino buscado: si el nombre cambia (y por
  // lo tanto el debounce produce un termino nuevo), las sugerencias reaparecen solas.
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  const enabled = debounced.trim().length >= MIN_LENGTH && dismissedFor !== debounced;

  const { data: teams, isFetching } = useQuery({
    queryKey: ['sportsdb-search-teams', debounced],
    queryFn: () => searchTeamsByName(debounced),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!enabled) return null;
  if (!isFetching && (!teams || teams.length === 0)) return null;

  return (
    <Stack gap={4}>
      <Text size="xs" c="dimmed">
        Sugerencias de escudo (TheSportsDB)
      </Text>
      <Card withBorder radius="sm" p={0}>
        {isFetching ? (
          <Group p="xs" justify="center">
            <Loader size="xs" color="navy" />
          </Group>
        ) : (
          teams?.slice(0, MAX_RESULTS).map((team) => (
            <UnstyledButton
              key={team.idTeam}
              type="button"
              p="xs"
              w="100%"
              onClick={() => {
                if (team.strBadge) onSelect(team.strBadge);
                setDismissedFor(debounced);
              }}
            >
              <Group gap="sm" wrap="nowrap">
                <Avatar src={team.strBadge} size="sm" radius="xs">
                  🛡
                </Avatar>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text size="sm" fw={500} truncate>
                    {team.strTeam}
                  </Text>
                  <Group gap="sm" wrap="nowrap">
                    <Text size="xs" fw={500} c="navy" truncate>
                      {team.strCountry ?? 'País desconocido'}
                    </Text>
                    <Text size="xs" c="dimmed" truncate>
                      {team.strLeague ?? ''}
                    </Text>
                  </Group>
                </div>
              </Group>
            </UnstyledButton>
          ))
        )}
      </Card>
    </Stack>
  );
}
