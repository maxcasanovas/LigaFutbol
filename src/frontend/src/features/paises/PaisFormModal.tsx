import { useEffect, useState } from 'react';
import { Alert, Avatar, Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ApiError } from '../../api/errors';
import type { PaisDto } from '../../api/types';
import { useCreatePais, useUpdatePais, type PaisFormValues } from './mutations';
import { CountryFlagSearch } from './CountryFlagSearch';

interface PaisFormModalProps {
  opened: boolean;
  onClose: () => void;
  pais: PaisDto | null;
}

export function PaisFormModal({ opened, onClose, pais }: PaisFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const createPais = useCreatePais();
  const updatePais = useUpdatePais();

  const form = useForm<PaisFormValues>({
    initialValues: { nombre: '', urlBandera: '' },
    validate: {
      nombre: (value) => (value.trim().length === 0 ? 'El nombre es obligatorio.' : null),
      urlBandera: (value) => (value.trim().length === 0 ? 'La URL de la bandera es obligatoria.' : null),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(pais ? { nombre: pais.nombre, urlBandera: pais.urlBandera } : { nombre: '', urlBandera: '' });
    form.clearErrors();
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, pais]);

  const submitting = createPais.isPending || updatePais.isPending;

  const handleSubmit = async (values: PaisFormValues) => {
    setFormError(null);
    try {
      if (pais) {
        await updatePais.mutateAsync({ id: pais.id, values });
      } else {
        await createPais.mutateAsync(values);
      }
      onClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Probá de nuevo.');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={pais ? 'Editar país' : 'Nuevo país'} radius="sm">
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="sm">
          {formError && (
            <Alert color="danger" variant="light" radius="sm">
              {formError}
            </Alert>
          )}
          <TextInput label="Nombre" placeholder="Argentina" {...form.getInputProps('nombre')} />

          <CountryFlagSearch
            nombre={form.values.nombre}
            onSelect={(urlBandera) => form.setFieldValue('urlBandera', urlBandera)}
          />

          <Group align="flex-end" gap="xs" wrap="nowrap">
            <TextInput
              label="URL de la bandera"
              placeholder="https://flagcdn.com/ar.svg"
              style={{ flex: 1 }}
              {...form.getInputProps('urlBandera')}
            />
            <Avatar src={form.values.urlBandera || null} size="lg" radius="xs">
              🏳
            </Avatar>
          </Group>
          <Group justify="flex-end" mt="xs">
            <Button variant="default" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
