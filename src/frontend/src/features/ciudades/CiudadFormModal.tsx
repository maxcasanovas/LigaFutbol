import { useEffect, useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ApiError } from '../../api/errors';
import { usePaises } from '../../api/queries';
import type { CiudadDto } from '../../api/types';
import { useCreateCiudad, useUpdateCiudad } from './mutations';

interface CiudadFormValues {
  nombre: string;
  paisId: string;
}

interface CiudadFormModalProps {
  opened: boolean;
  onClose: () => void;
  ciudad: CiudadDto | null;
}

export function CiudadFormModal({ opened, onClose, ciudad }: CiudadFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const paises = usePaises();
  const createCiudad = useCreateCiudad();
  const updateCiudad = useUpdateCiudad();

  const form = useForm<CiudadFormValues>({
    initialValues: { nombre: '', paisId: '' },
    validate: {
      nombre: (value) => (value.trim().length === 0 ? 'El nombre es obligatorio.' : null),
      paisId: (value) => (value.length === 0 ? 'El país es obligatorio.' : null),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(ciudad ? { nombre: ciudad.nombre, paisId: String(ciudad.paisId) } : { nombre: '', paisId: '' });
    form.clearErrors();
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, ciudad]);

  const submitting = createCiudad.isPending || updateCiudad.isPending;
  const paisOptions = (paises.data ?? []).map((pais) => ({ value: String(pais.id), label: pais.nombre }));

  const handleSubmit = async (values: CiudadFormValues) => {
    if (values.paisId.length === 0) return;
    setFormError(null);
    const payload = { nombre: values.nombre, paisId: Number(values.paisId) };
    try {
      if (ciudad) {
        await updateCiudad.mutateAsync({ id: ciudad.id, values: payload });
      } else {
        await createCiudad.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Probá de nuevo.');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={ciudad ? 'Editar ciudad' : 'Nueva ciudad'} radius="sm">
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="sm">
          {formError && (
            <Alert color="danger" variant="light" radius="sm">
              {formError}
            </Alert>
          )}
          <TextInput label="Nombre" placeholder="Buenos Aires" {...form.getInputProps('nombre')} />
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
