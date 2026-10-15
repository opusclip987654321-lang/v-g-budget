import type { ComponentProps } from 'react';
import { PageHeader, Screen } from '@/ui';
import { SyncBanner } from './SyncBanner';

// Page de l'appli : la page standard avec le bandeau de synchronisation.
export const AppScreen = (props: Omit<ComponentProps<typeof Screen>, 'banner'>) => <Screen {...props} banner={<SyncBanner />} />;
export const AppPageHeader = (props: Omit<ComponentProps<typeof PageHeader>, 'banner'>) => <PageHeader {...props} banner={<SyncBanner />} />;
