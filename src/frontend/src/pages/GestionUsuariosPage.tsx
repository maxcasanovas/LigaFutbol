import { useState } from 'react';
import { Alert, Button, Paper, PasswordInput, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { ApiError } from '../api/errors';
import type { Rol } from '../api/types';
import { useCreateUsuario } from '../features/usuarios/mutations';

interface UsuarioFormValues {
  email: string;
  password: string;
  rol: Rol | '';
}

const ROL_OPTIONS: { value: Rol; label: string }[] = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Editor', label: 'Editor' },
  { value: 'Lector', label: 'Lector' },
];

export function GestionUsuariosPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);
  const createUsuario = useCreateUsuario();

  const form = useForm<UsuarioFormValues>({
    initialValues: { email: '', password: '', rol: '' },
    validate: {
      email: (value) => (value.trim().length === 0 ? 'El email es obligatorio.' : null),
      password: (value) => (value.length < 6 ? 'La contraseña debe tener al menos 6 caracteres.' : null),
      rol: (value) => (value.length === 0 ? 'El rol es obligatorio.' : null),
    },
  });

  const handleSubmit = async (values: UsuarioFormValues) => {
    if (values.rol === '') return;
    setFormError(null);
    try {
      const usuario = await createUsuario.mutateAsync({
        email: values.email,
        password: values.password,
        rol: values.rol,
      });
      notifications.show({ color: 'navy', message: `Usuario "${usuario.email}" creado con rol ${usuario.rol}.` });
      form.reset();
      // Mantine Select no sincroniza su texto visible con form.reset() (queda mostrando
      // la ultima opcion elegida aunque el value ya volvio a ''); forzamos el remonte.
      setFormKey((key) => key + 1);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Ocurrió un error inesperado. Probá de nuevo.');
    }
  };

  return (
    <Stack gap="md" maw={480}>
      <div>
        <Title order={2}>Usuarios</Title>
        <Text c="dimmed" size="sm">
          Creá cuentas con cualquier rol. El autoregistro público solo permite crear cuentas Lector.
        </Text>
      </div>

      <Paper withBorder radius="sm" p="lg">
        <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
          <Stack gap="sm">
            {formError && (
              <Alert color="danger" variant="light" radius="sm">
                {formError}
              </Alert>
            )}
            <TextInput label="Email" placeholder="editor@ligafutbol.com" {...form.getInputProps('email')} />
            <PasswordInput label="Contraseña" {...form.getInputProps('password')} />
            <Select
              key={formKey}
              label="Rol"
              placeholder="Seleccioná un rol"
              data={ROL_OPTIONS}
              {...form.getInputProps('rol')}
            />
            <Button type="submit" loading={createUsuario.isPending} mt="xs">
              Crear usuario
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}
