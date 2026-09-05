import { useEffect, useState } from 'react';
import { Alert, Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ApiError } from '../../api/errors';
import { useCiudades, useLigas } from '../../api/queries';
import type { EquipoDto } from '../../api/types';
import { useCreateEquipo, useUpdateEquipo } from './mutations';

interface EquipoFormValues {
  nombre: string;
  urlEscudo: string;
  ciudadId: string;
  ligaId: string;
}

interface EquipoFormModalProps {
  opened: boolean;
  onClose: () => void;
  equipo: EquipoDto | null;
}

export function EquipoFormModal({ opened, onClose, equipo }: EquipoFormModalProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const ciudades = useCiudades();
  const ligas = useLigas();
  const createEquipo = useCreateEquipo();
  const updateEquipo = useUpdateEquipo();

  const form = useForm<EquipoFormValues>({
    initialValues: { nombre: '', urlEscudo: '', ciudadId: '', ligaId: '' },
    validate: {
      nombre: (value) => (value.trim().length === 0 ? 'El nombre es obligatorio.' : null),
      urlEscudo: (value) => (value.trim().length === 0 ? 'La URL del escudo es obligatoria.' : null),
      ciudadId: (value) => (value.length === 0 ? 'La ciudad es obligatoria.' : null),
      ligaId: (value) => (value.length === 0 ? 'La liga es obligatoria.' : null),
    },
  });

  useEffect(() => {
    if (!opened) return;
    form.setValues(
      equipo
        ? {
            nombre: equipo.nombre,
            urlEscudo: equipo.urlEscudo,
            ciudadId: String(equipo.ciudadId),
            ligaId: String(equipo.ligaId),
          }
        : { nombre: '', urlEscudo: '', ciudadId: '', ligaId: '' },
    );
    form.clearErrors();
    setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, equipo]);

  const submitting = createEquipo.isPending || updateEquipo.isPending;
  const ciudadOptions = (ciudades.data ?? []).map((ciudad) => ({
    value: String(ciudad.id),
    label: `${ciudad.nombre} (${ciudad.pais})`,
  }));
  const ligaOptions = (ligas.data ?? []).map((liga) => ({
    value: String(liga.id),
    label: `${liga.nombre} (${liga.pais})`,
  }));

  const handleSubmit = async (values: EquipoFormValues) => {
    if (values.ciudadId.length === 0 || values.ligaId.length === 0) return;
    setFormError(null);
    const payload = {
      nombre: values.nombre,
      urlEscudo: values.urlEscudo,
      ciudadId: Number(values.ciudadId),
      ligaId: Number(values.ligaId),
    };
    try {
      if (equipo) {
        await updateEquipo.mutateAsync({ id: equipo.id, values: payload });
      } else {
        await createEquipo.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Probá de nuevo.');
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={equipo ? 'Editar equipo' : 'Nuevo equipo'} radius="sm">
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="sm">
          {formError && (
            <Alert color="danger" variant="light" radius="sm">
              {formError}
            </Alert>
          )}
          <TextInput label="Nombre" placeholder="Boca Juniors" {...form.getInputProps('nombre')} />
          <TextInput
            label="URL del escudo"
            placeholder="https://x.com/boca.png"
            {...form.getInputProps('urlEscudo')}
          />
          <Select
            label="Ciudad"
            placeholder="Seleccioná una ciudad"
            data={ciudadOptions}
            searchable
            {...form.getInputProps('ciudadId')}
          />
          <Select
            label="Liga"
            placeholder="Seleccioná una liga"
            data={ligaOptions}
            searchable
            {...form.getInputProps('ligaId')}
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
