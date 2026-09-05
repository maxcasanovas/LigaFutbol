import { Drawer } from '@mantine/core';
import type { ReactNode } from 'react';

interface DetailDrawerProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function DetailDrawer({ opened, onClose, title, children }: DetailDrawerProps) {
  return (
    <Drawer opened={opened} onClose={onClose} title={title} position="right" size="sm">
      {children}
    </Drawer>
  );
}
