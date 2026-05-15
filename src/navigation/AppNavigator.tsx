// src/navigation/AppNavigator.tsx
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Splash
import SplashScreen from "../screens/SplashScreen";

// Portal
import PortalHomeScreen  from "../portal/PortalHomeScreen";
import AppsScreen        from "../portal/AppsScreen";
import StatsScreen       from "../portal/StatsScreen";

// PV Béton module
import PvBetonHomeScreen   from "../modules/pv-beton/screens/HomeScreen";
import PvDetailScreen      from "../modules/pv-beton/screens/PvDetailScreen";
import PvFormLayout        from "../modules/pv-beton/screens/pv/PvFormLayout";
import PvHistoryScreen     from "../modules/pv-beton/screens/pv/PvHistoryScreen";
import PvReservesScreen    from "../modules/pv-beton/screens/pv/PvReservesScreen";

const AppNavigator = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <Routes>
      {/* Portal */}
      <Route path="/"      element={<PortalHomeScreen />} />
      <Route path="/apps"  element={<AppsScreen />} />
      <Route path="/stats" element={<StatsScreen />} />

      {/* PV Béton module */}
      <Route path="/apps/pv-beton"                  element={<PvBetonHomeScreen />} />
      <Route path="/apps/pv-beton/pv/:id"           element={<PvDetailScreen />} />
      <Route path="/apps/pv-beton/pv/:id/history"   element={<PvHistoryScreen />} />
      <Route path="/apps/pv-beton/pv/:id/reserves"  element={<PvReservesScreen />} />
      <Route path="/apps/pv-beton/form/*"            element={<PvFormLayout />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppNavigator;
