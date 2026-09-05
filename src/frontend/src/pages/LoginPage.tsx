import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/errors';
import { toFormErrors } from '../api/formErrors';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => (value.trim().length === 0 ? 'El email es obligatorio.' : null),
      password: (value) => (value.length === 0 ? 'La contraseña es obligatoria.' : null),
    },
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.kind === 'validation') {
          form.setErrors(toFormErrors(error));
        }
        setFormError(error.message);
      } else {
        setFormError('Ocurrió un error inesperado. Probá de nuevo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack align="center" justify="center" mih="100vh" px="md">
      <Paper withBorder shadow="none" radius="sm" p="xl" w={360}>
        <Stack gap="md">
          <div>
            <Title order={2}>El Registro</Title>
            <Text c="dimmed" size="sm">
              Iniciá sesión para administrar países, ligas, ciudades y equipos.
            </Text>
          </div>
          <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
            <Stack gap="sm">
              {formError && (
                <Alert color="danger" variant="light" radius="sm">
                  {formError}
                </Alert>
              )}
              <TextInput
                label="Email"
                placeholder="admin@ligafutbol.com"
                autoComplete="username"
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Contraseña"
                autoComplete="current-password"
                {...form.getInputProps('password')}
              />
              <Button type="submit" loading={submitting} fullWidth mt="xs">
                Iniciar sesión
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Stack>
  );
}
