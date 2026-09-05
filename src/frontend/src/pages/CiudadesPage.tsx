import { useState } from 'react';
import { ActionIcon, Alert, Avatar, Button, Group, Loader, Modal, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../auth/useAuth';
import { useCiudades } from '../api/queries';
import { ApiError } from '../api/errors';
import type { CiudadDto } from '../api/types';
import { useDeleteCiudad } from '../features/ciudades/mutations';
import { CiudadFormModal } from '../features/ciudades/CiudadFormModal';
import { DetailDrawer } from '../components/DetailDrawer';

export function CiudadesPage() {
  const { user } = useAuth();
  const canWrite = user?.rol === 'Admin' || user?.rol === 'Editor';

  const ciudades = useCiudades();
  const deleteCiudad = useDeleteCiudad();

  const [formOpened, setFormOpened] = useState(false);
  const [editingCiudad, setEditingCiudad] = useState<CiudadDto | null>(null);
  const [deletingCiudad, setDeletingCiudad] = useState<CiudadDto | null>(null);
  const [viewingCiudad, setViewingCiudad] = useState<CiudadDto | null>(null);

  const openCreateModal = () => {
    setEditingCiudad(null);
    setFormOpened(true);
  };

  const openEditModal = (ciudad: CiudadDto) => {
    setEditingCiudad(ciudad);
    setFormOpened(true);
  };

  const handleDelete = async () => {
    if (!deletingCiudad) return;
    try {
      await deleteCiudad.mutateAsync(deletingCiudad.id);
      notifications.show({ color: 'navy', message: `"${deletingCiudad.nombre}" se eliminó correctamente.` });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo eliminar la ciudad.';
      notifications.show({ color: 'danger', message });
    } finally {
      setDeletingCiudad(null);
    }
  };

  if (ciudades.isLoading) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="navy" />
      </Group>
    );
  }

  if (ciudades.error) {
    return (
      <Alert color="danger" variant="light" radius="sm">
        No se pudieron cargar las ciudades.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Ciudades</Title>
        {canWrite && <Button onClick={openCreateModal}>Nueva ciudad</Button>}
      </Group>

      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>País</Table.Th>
            <Table.Th>Equipos</Table.Th>
            {canWrite && <Table.Th />}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ciudades.data?.map((ciudad) => (
            <Table.Tr key={ciudad.id} onClick={() => setViewingCiudad(ciudad)} style={{ cursor: 'pointer' }}>
              <Table.Td>{ciudad.nombre}</Table.Td>
              <Table.Td>{ciudad.pais}</Table.Td>
              <Table.Td>{ciudad.equipos.length}</Table.Td>
              {canWrite && (
                <Table.Td onClick={(event) => event.stopPropagation()}>
                  <Group gap="xs" justify="flex-end">
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="navy"
                        aria-label={`Editar ${ciudad.nombre}`}
                        onClick={() => openEditModal(ciudad)}
                      >
                        ✎
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="danger"
                        aria-label={`Eliminar ${ciudad.nombre}`}
                        onClick={() => setDeletingCiudad(ciudad)}
                      >
                        🗑
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
          {ciudades.data?.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={canWrite ? 4 : 3}>
                <Text c="dimmed" ta="center" py="md">
                  Todavía no hay ciudades cargadas.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <CiudadFormModal opened={formOpened} onClose={() => setFormOpened(false)} ciudad={editingCiudad} />

      <DetailDrawer
        opened={viewingCiudad !== null}
        onClose={() => setViewingCiudad(null)}
        title={`Equipos de ${viewingCiudad?.nombre ?? ''}`}
      >
        <Stack gap={0}>
          {viewingCiudad?.equipos.length === 0 && (
            <Text c="dimmed" size="sm">
              Esta ciudad todavía no tiene equipos cargados.
            </Text>
          )}
          {viewingCiudad?.equipos.map((equipo, index) => (
            <Group
              key={equipo.id}
              py="xs"
              gap="sm"
              style={{
                borderBottom:
                  viewingCiudad.equipos.length - 1 === index ? undefined : '1px solid var(--mantine-color-gray-2)',
              }}
            >
              <Avatar src={equipo.urlEscudo || null} size="sm" radius="xs">
                🛡
              </Avatar>
              <Text size="sm">{equipo.nombre}</Text>
            </Group>
          ))}
        </Stack>
      </DetailDrawer>

      <Modal opened={deletingCiudad !== null} onClose={() => setDeletingCiudad(null)} title="Eliminar ciudad" radius="sm">
        <Stack gap="md">
          <Text>
            ¿Seguro que querés eliminar <strong>{deletingCiudad?.nombre}</strong>? Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingCiudad(null)}>
              Cancelar
            </Button>
            <Button color="danger" loading={deleteCiudad.isPending} onClick={handleDelete}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
