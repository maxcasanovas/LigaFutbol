import { useEffect, useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ApiError } from '../../api/errors';
import { usePaises } from '../../api/queries';
import type { LigaDto } from '../../api/types';
import { useCreateLiga, useUpdateLiga } from './mutations';

interface LigaFormValues {
  nombre: string;
  paisId: string;
}

interface LigaFormModalProps {
  opened: boolean;
  onClose: () => void;
  liga: LigaDto | null;
}

export function LigaFormModal({ opened, onClose, liga }: LigaFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const paises = usePaises();
  const createLiga = useCreateLiga();
  const updateLiga = useUpdateLiga();

  const form = useForm<LigaFormValues>({
    initialValues: { nombre: '', paisId: '' },
    validate: {
      nombre: (value) => (value.trim().length === 0 ? 'El nombre es obligatorio.' : null),
      paisId: (value) => (value.length === 0 ? 'El país es obligatorio.' : null),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(liga ? { nombre: liga.nombre, paisId: String(liga.paisId) } : { nombre: '', paisId: '' });
    form.clearErrors();
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, liga]);

  const submitting = createLiga.isPending || updateLiga.isPending;
  const paisOptions = (paises.data ?? []).map((pais) => ({ value: String(pais.id), label: pais.nombre }));

  const handleSubmit = async (values: LigaFormValues) => {
    if (values.paisId.length === 0) return;
    setFormError(null);
    const payload = { nombre: values.nombre, paisId: Number(values.paisId) };
    try {
      if (liga) {
        await updateLiga.mutateAsync({ id: liga.id, values: payload });
      } else {
        await createLiga.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Probá de nuevo.');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={liga ? 'Editar liga' : 'Nueva liga'} radius="sm">
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="sm">
          {formError && (
            <Alert color="danger" variant="light" radius="sm">
              {formError}
            </Alert>
          )}
          <TextInput label="Nombre" placeholder="Liga Profesional" {...form.getInputProps('nombre')} />
          <Select
            label="País"
            placeholder="Seleccioná un país"
            data={paisOptions}
            searchable
            {...form.getInputProps('paisId')}
          />
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
