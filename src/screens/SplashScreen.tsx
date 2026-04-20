// src/screens/SplashScreen.tsx
import { useEffect, useState } from "react";
import smacLogo from "../assets/SmacLogo.png";

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 4;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      width:"100%", height:"100%", backgroundColor:"#fff",
    }}>
      <div style={{ position:"relative", width:144, height:144,
                    display:"flex", alignItems:"center", justifyContent:"center" }}>
        <svg style={{ position:"absolute", inset:0, transform:"rotate(-90deg)" }}
             width="144" height="144" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="6" />
          <circle cx="72" cy="72" r={radius} fill="none" stroke="#E3000F" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition:"stroke-dashoffset 0.08s linear" }}
          />
        </svg>
        <div style={{ zIndex:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <img
            src={smacLogo}
            alt="SMAC"
            style={{ width:72, height:"auto", objectFit:"contain" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;