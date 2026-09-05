import { useState } from 'react';
import { ActionIcon, Alert, Avatar, Button, Group, Loader, Modal, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../auth/useAuth';
import { usePaises } from '../api/queries';
import { ApiError } from '../api/errors';
import type { PaisDto } from '../api/types';
import { useDeletePais } from '../features/paises/mutations';
import { PaisFormModal } from '../features/paises/PaisFormModal';

export function PaisesPage() {
  const { user } = useAuth();
  const canWrite = user?.rol === 'Admin' || user?.rol === 'Editor';

  const paises = usePaises();
  const deletePais = useDeletePais();

  const [formOpened, setFormOpened] = useState(false);
  const [editingPais, setEditingPais] = useState<PaisDto | null>(null);
  const [deletingPais, setDeletingPais] = useState<PaisDto | null>(null);

  const openCreateModal = () => {
    setEditingPais(null);
    setFormOpened(true);
  };

  const openEditModal = (pais: PaisDto) => {
    setEditingPais(pais);
    setFormOpened(true);
  };

  const handleDelete = async () => {
    if (!deletingPais) return;
    try {
      await deletePais.mutateAsync(deletingPais.id);
      notifications.show({ color: 'navy', message: `"${deletingPais.nombre}" se eliminó correctamente.` });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo eliminar el país.';
      notifications.show({ color: 'danger', message });
    } finally {
      setDeletingPais(null);
    }
  };

  if (paises.isLoading) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="navy" />
      </Group>
    );
  }

  if (paises.error) {
    return (
      <Alert color="danger" variant="light" radius="sm">
        No se pudieron cargar los países.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>Países</Title>
        {canWrite && <Button onClick={openCreateModal}>Nuevo país</Button>}
      </Group>

      <Table verticalSpacing="sm" highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th />
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Ciudades</Table.Th>
            {canWrite && <Table.Th />}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {paises.data?.map((pais) => (
            <Table.Tr key={pais.id}>
              <Table.Td w={40}>
                <Avatar src={pais.urlBandera} size="sm" radius="xs" />
              </Table.Td>
              <Table.Td>{pais.nombre}</Table.Td>
              <Table.Td>{pais.ciudades.length}</Table.Td>
              {canWrite && (
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Tooltip label="Editar">
                      <ActionIcon
                        variant="subtle"
                        color="navy"
                        aria-label={`Editar ${pais.nombre}`}
                        onClick={() => openEditModal(pais)}
                      >
                        ✎
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar">
                      <ActionIcon
                        variant="subtle"
                        color="danger"
                        aria-label={`Eliminar ${pais.nombre}`}
                        onClick={() => setDeletingPais(pais)}
                      >
                        🗑
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
          {paises.data?.length === 0 && (
            <Table.Tr>
              <Table.Td colSpan={canWrite ? 4 : 3}>
                <Text c="dimmed" ta="center" py="md">
                  Todavía no hay países cargados.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <PaisFormModal opened={formOpened} onClose={() => setFormOpened(false)} pais={editingPais} />

      <Modal opened={deletingPais !== null} onClose={() => setDeletingPais(null)} title="Eliminar país" radius="sm">
        <Stack gap="md">
          <Text>
            ¿Seguro que querés eliminar <strong>{deletingPais?.nombre}</strong>? Esta acción no se puede deshacer.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeletingPais(null)}>
              Cancelar
            </Button>
            <Button color="danger" loading={deletePais.isPending} onClick={handleDelete}>
              Eliminar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
