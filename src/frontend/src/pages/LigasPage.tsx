import { useState } from 'react';
import { ActionIcon, Alert, Button, Group, Loader, Modal, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../auth/useAuth';
import { useLigas } from '../api/queries';
import { ApiError } from '../api/errors';
import type { LigaDto } from '../api/types';
import { useDeleteLiga } from '../features/ligas/mutations';
import { LigaFormModal } from '../features/ligas/LigaFormModal';

export function LigasPage() {
  const { user } = useAuth();
  const canWrite = user?.rol === 'Admin' || user?.rol === 'Editor';

  const ligas = useLigas();
  const deleteLiga = useDeleteLiga();

  const [formOpened, setFormOpened] = useState(false);
  const [editingLiga, setEditingLiga] = useState<LigaDto | null>(null);
  const [deletingLiga, setDeletingLiga] = useState<LigaDto | null>(null);

  const openCreateModal = () => {
    setEditingLiga(null);
    setFormOpened(true);
  };

  const openEditModal = (liga: LigaDto) => {
    setEditingLiga(liga);
    setFormOpened(true);
  };

  const handleDelete = async () => {
    if (!deletingLiga) return;
    try {
      await deleteLiga.mutateAsync(deletingLiga.id);
      notifications.show({ color: 'navy', message: `"${deletingLiga.nombre}" se eliminó correctamente.` });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo eliminar la liga.';
      notifications.show({ color: 'danger', message });
    } finally {
      setDeletingLiga(null);
    }
  };

  if (ligas.isLoading) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="navy" />
      </Group>
    );
  }

  if (ligas.error) {
    return (
      <Alert color="danger" variant="light" radius="sm">
        No se pudieron cargar las ligas.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Ligas</Title>
        {canWrite && <Button onClick={openCreateModal}>Nueva liga</Button>}
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
          {ligas.data?.map((liga) => (
            <Table.Tr key={liga.id}>
              <Table.Td>{liga.nombre}</Table.Td>
              <Table.Td>{liga.pais}</Table.Td>
              <Table.Td>{liga.equipos.length}</Table.Td>
              {canWrite && (
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="navy"
                        aria-label={`Editar ${liga.nombre}`}
                        onClick={() => openEditModal(liga)}
                      >
                        ✎
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="danger"
                        aria-label={`Eliminar ${liga.nombre}`}
                        onClick={() => setDeletingLiga(liga)}
                      >
                        🗑
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
          {ligas.data?.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={canWrite ? 4 : 3}>
                <Text c="dimmed" ta="center" py="md">
                  Todavía no hay ligas cargadas.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <LigaFormModal opened={formOpened} onClose={() => setFormOpened(false)} liga={editingLiga} />

      <Modal opened={deletingLiga !== null} onClose={() => setDeletingLiga(null)} title="Eliminar liga" radius="sm">
        <Stack gap="md">
          <Text>
            ¿Seguro que querés eliminar <strong>{deletingLiga?.nombre}</strong>? Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingLiga(null)}>
              Cancelar
            </Button>
            <Button color="danger" loading={deleteLiga.isPending} onClick={handleDelete}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
