import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { MuiThemeProvider } from "@material-ui/core/styles";
import theme from "./components/theme.js";
import Dashboard from "./components/pages/dashboard/DashboardPage";
import CrisisMap from "./components/pages/map/CrisisMapPage";
import { BrowserRouter, Route } from "react-router-dom";

function App() {
  return (
    <MuiThemeProvider theme={theme}>
      <div className="App">
        <BrowserRouter>
          <div>
            <Route exact path="/" component={Dashboard} />
            <Route exact path="/dashboard" component={Dashboard} />
            <Route exact path="/map" component={CrisisMap} />
            <Route exact path="/about" component={Dashboard} />
          </div>
        </BrowserRouter>
      </div>
    </MuiThemeProvider>
  );
}

export default App;
