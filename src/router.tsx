import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RootLayout } from '@/components/RootLayout';

const HomeScreen = lazy(async () => {
  const module = await import('@/screens/HomeScreen');
  return { default: module.HomeScreen };
});

const LogScreen = lazy(async () => {
  const module = await import('@/screens/LogScreen');
  return { default: module.LogScreen };
});

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<HomeScreen />} />
        <Route path="log/:track" element={<LogScreen />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
