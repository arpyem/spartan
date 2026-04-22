import { Navigate, Route, Routes } from 'react-router-dom';
import { RootLayout } from '@/components/RootLayout';
import { HomeScreen } from '@/screens/HomeScreen';
import { LogScreen } from '@/screens/LogScreen';

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

