import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SplashScreen    from "../screens/SplashScreen";
import HomeScreen      from "../screens/HomeScreen";
import PvFormLayout    from "../screens/pv/PvFormLayout";
import PvDetailScreen  from "../screens/PvDetailScreen";
import PvHistoryScreen  from "../screens/pv/PvHistoryScreen";
import PvReservesScreen from "../screens/pv/PvReservesScreen";

const AppNavigator = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  return (
    <Routes>
      <Route path="/"                element={<HomeScreen />} />
      <Route path="/pv/:id"          element={<PvDetailScreen />} />
      <Route path="/pv/:id/history"   element={<PvHistoryScreen />} />
      <Route path="/pv/:id/reserves" element={<PvReservesScreen />} />
      <Route path="/pv-form/*"       element={<PvFormLayout />} />
      <Route path="*"                element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppNavigator;