import { Stack, Text, Title } from '@mantine/core';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Stack gap="xs">
      <Title order={2}>{title}</Title>
      <Text c="dimmed">Esta sección todavía no está lista — llega en un próximo feature.</Text>
    </Stack>
  );
}
