// App.tsx
import { BrowserRouter } from "react-router-dom";
import AppNavigator from "./navigation/AppNavigator";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="phone-shell">
        <div className="phone-screen">
          <AppNavigator />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;