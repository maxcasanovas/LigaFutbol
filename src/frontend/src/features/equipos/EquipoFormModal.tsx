import { useEffect, useState } from 'react';
import { Alert, Avatar, Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ApiError } from '../../api/errors';
import { useCiudades, useLigas } from '../../api/queries';
import type { EquipoDto } from '../../api/types';
import { useCreateEquipo, useUpdateEquipo } from './mutations';
import { TeamBadgeSearch } from './TeamBadgeSearch';

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

  const ciudadesData = ciudades.data ?? [];
  const ligasData = ligas.data ?? [];
  const ciudadSeleccionada = ciudadesData.find((ciudad) => String(ciudad.id) === form.values.ciudadId);
  const ligaSeleccionada = ligasData.find((liga) => String(liga.id) === form.values.ligaId);

  // Filtro padre/hijo: elegir una ciudad o una liga acota las opciones del otro
  // select al mismo país, para no poder armar una combinación invalida desde la UI.
  const ciudadOptions = ciudadesData
    .filter((ciudad) => !ligaSeleccionada || ciudad.paisId === ligaSeleccionada.paisId)
    .map((ciudad) => ({ value: String(ciudad.id), label: `${ciudad.nombre} (${ciudad.pais})` }));
  const ligaOptions = ligasData
    .filter((liga) => !ciudadSeleccionada || liga.paisId === ciudadSeleccionada.paisId)
    .map((liga) => ({ value: String(liga.id), label: `${liga.nombre} (${liga.pais})` }));

  // Nota: como cada select ya filtra sus opciones segun el otro (arriba), no hace
  // falta "limpiar" el otro campo ante un cambio: una combinacion de paises distintos
  // nunca queda disponible para elegir en primer lugar. Solo convertimos null -> ''
  // porque el tipo de EquipoFormValues usa string (para el clearable de Select).
  const handleCiudadChange = (value: string | null) => form.setFieldValue('ciudadId', value ?? '');
  const handleLigaChange = (value: string | null) => form.setFieldValue('ligaId', value ?? '');

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

          <TeamBadgeSearch
            nombre={form.values.nombre}
            onSelect={(urlEscudo) => form.setFieldValue('urlEscudo', urlEscudo)}
          />

          <Group align="flex-end" gap="xs" wrap="nowrap">
            <TextInput
              label="URL del escudo"
              placeholder="https://x.com/boca.png"
              style={{ flex: 1 }}
              {...form.getInputProps('urlEscudo')}
            />
            <Avatar src={form.values.urlEscudo || null} size="lg" radius="xs">
              🛡
            </Avatar>
          </Group>
          <Select
            label="Ciudad"
            placeholder="Seleccioná una ciudad"
            data={ciudadOptions}
            searchable
            clearable
            {...form.getInputProps('ciudadId')}
            onChange={handleCiudadChange}
          />
          <Select
            label="Liga"
            placeholder="Seleccioná una liga"
            data={ligaOptions}
            searchable
            clearable
            {...form.getInputProps('ligaId')}
            onChange={handleLigaChange}
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
