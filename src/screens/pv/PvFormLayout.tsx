// src/screens/pv/PvFormLayout.tsx
import { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { StepIndicator } from "../../components/shared";
import { ConfirmModal }   from "../../components/shared";
import { usePvFormStore } from "../../store";
import Step1InfoScreen         from "./Step1InfoScreen";
import Step2SurfaceScreen      from "./Step2SurfaceScreen";
import Step3EtancheiteScreen   from "./Step3EtancheiteScreen";
import Step4PointsScreen       from "./Step4PointsScreen";
import Step5ParticipantsScreen from "./Step5ParticipantsScreen";
import Step6SuccessScreen      from "./Step6SuccessScreen";
import ReserveFormScreen       from "./ReserveFormScreen";
import AllReservesScreen       from "./AllReservesScreen";

const TOTAL_STEPS = 6;

const PvFormLayout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { currentStep, prevStep, resetForm } = usePvFormStore();
  const [showConfirm, setShowConfirm] = useState(false);

  // Sur les écrans de réserve on cache le header/stepper principal
  const isReservePage = pathname.includes("/reserve");

  // Scroll to top du contenu à chaque changement de route
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  const handleBack = () => {
    if (currentStep === 1) {
      setShowConfirm(true);
    } else {
      prevStep();
      navigate(-1);
    }
  };

  const handleQuit = () => {
    resetForm();
    navigate("/", { replace: true });
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", position: "relative",
      backgroundColor: "#fff",
    }}>

      {/* ── Header ── */}
      {!isReservePage && (
        <>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "48px 20px 16px", borderBottom: "1px solid #E5E7EB",
            flexShrink: 0,
          }}>
            <button onClick={handleBack} style={{
              width: 36, height: 36, borderRadius: "50%", backgroundColor: "#F3F4F6",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ArrowLeft size={18} color="#111827" />
            </button>
            <h1 style={{ fontSize: 16, fontWeight: 900, color: "#111827" }}>Nouveau PV</h1>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#E3000F" }}>
              Étape {currentStep} sur {TOTAL_STEPS}
            </span>
          </div>
          <div style={{ padding: "12px 20px", flexShrink: 0 }}>
            <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </div>
        </>
      )}

      {/* ── Contenu scrollable ── */}
      {/* minHeight: 0 est indispensable pour que flex-1 puisse réellement
          se contraindre et activer overflow-y: auto */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        <Routes>
          <Route index                   element={<Step1InfoScreen />} />
          <Route path="step2"            element={<Step2SurfaceScreen />} />
          <Route path="step3"            element={<Step3EtancheiteScreen />} />
          <Route path="step4"            element={<Step4PointsScreen />} />
          <Route path="step5"            element={<Step5ParticipantsScreen />} />
          <Route path="step6"            element={<Step6SuccessScreen />} />
          <Route path="reserve"          element={<ReserveFormScreen />} />
          <Route path="reserve/:id"      element={<ReserveFormScreen />} />
          <Route path="reserves"         element={<AllReservesScreen />} />
        </Routes>
      </div>

      {/* ── Bottom nav ── */}
      {!isReservePage && (
        <div style={{
          backgroundColor: "#fff", borderTop: "1px solid #E5E7EB",
          padding: "10px 24px 16px", flexShrink: 0,
          display: "flex", justifyContent: "center", alignItems: "center",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <Home size={20} color="#E3000F" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#E3000F", letterSpacing: "0.08em" }}>
              ACCUEIL PSA
            </span>
          </div>
        </div>
      )}

      {/* ── Modal confirmation quitter ── */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Quitter le formulaire ?"
        message="Souhaitez-vous vraiment quitter ce formulaire ? Cette action est irréversible pour la session en cours."
        confirmLabel="Quitter"
        cancelLabel="Rester"
        onConfirm={handleQuit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default PvFormLayout;