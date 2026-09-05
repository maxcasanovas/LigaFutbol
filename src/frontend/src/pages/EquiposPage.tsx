import { useState } from 'react';
import { ActionIcon, Alert, Avatar, Button, Group, Loader, Modal, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../auth/useAuth';
import { useEquipos } from '../api/queries';
import { ApiError } from '../api/errors';
import type { EquipoDto } from '../api/types';
import { useDeleteEquipo } from '../features/equipos/mutations';
import { EquipoFormModal } from '../features/equipos/EquipoFormModal';

export function EquiposPage() {
  const { user } = useAuth();
  const canWrite = user?.rol === 'Admin' || user?.rol === 'Editor';

  const equipos = useEquipos();
  const deleteEquipo = useDeleteEquipo();

  const [formOpened, setFormOpened] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<EquipoDto | null>(null);
  const [deletingEquipo, setDeletingEquipo] = useState<EquipoDto | null>(null);

  const openCreateModal = () => {
    setEditingEquipo(null);
    setFormOpened(true);
  };

  const openEditModal = (equipo: EquipoDto) => {
    setEditingEquipo(equipo);
    setFormOpened(true);
  };

  const handleDelete = async () => {
    if (!deletingEquipo) return;
    try {
      await deleteEquipo.mutateAsync(deletingEquipo.id);
      notifications.show({ color: 'navy', message: `"${deletingEquipo.nombre}" se eliminó correctamente.` });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo eliminar el equipo.';
      notifications.show({ color: 'danger', message });
    } finally {
      setDeletingEquipo(null);
    }
  };

  if (equipos.isLoading) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="navy" />
      </Group>
    );
  }

  if (equipos.error) {
    return (
      <Alert color="danger" variant="light" radius="sm">
        No se pudieron cargar los equipos.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Equipos</Title>
        {canWrite && <Button onClick={openCreateModal}>Nuevo equipo</Button>}
      </Group>

      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Ciudad</Table.Th>
            <Table.Th>Liga</Table.Th>
            {canWrite && <Table.Th />}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {equipos.data?.map((equipo) => (
            <Table.Tr key={equipo.id}>
              <Table.Td w={40}>
                <Avatar src={equipo.urlEscudo} size="sm" radius="xs" />
              </Table.Td>
              <Table.Td>{equipo.nombre}</Table.Td>
              <Table.Td>{equipo.ciudad}</Table.Td>
              <Table.Td>{equipo.liga}</Table.Td>
              {canWrite && (
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="navy"
                        aria-label={`Editar ${equipo.nombre}`}
                        onClick={() => openEditModal(equipo)}
                      >
                        ✎
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="danger"
                        aria-label={`Eliminar ${equipo.nombre}`}
                        onClick={() => setDeletingEquipo(equipo)}
                      >
                        🗑
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
          {equipos.data?.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={canWrite ? 5 : 4}>
                <Text c="dimmed" ta="center" py="md">
                  Todavía no hay equipos cargados.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <EquipoFormModal opened={formOpened} onClose={() => setFormOpened(false)} equipo={editingEquipo} />

      <Modal opened={deletingEquipo !== null} onClose={() => setDeletingEquipo(null)} title="Eliminar equipo" radius="sm">
        <Stack gap="md">
          <Text>
            ¿Seguro que querés eliminar <strong>{deletingEquipo?.nombre}</strong>? Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingEquipo(null)}>
              Cancelar
            </Button>
            <Button color="danger" loading={deleteEquipo.isPending} onClick={handleDelete}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
