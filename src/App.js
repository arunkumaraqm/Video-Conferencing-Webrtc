import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import JoinRoomPage from "./JoinRoomPage/JoinRoomPage";
import RoomPage from "./RoomPage/RoomPage";
import IntroductionPage from "./IntroductionPage/IntroductionPage";

import "./App.css";

function App() {
  return (
    <Router>
      <Switch>
        {/* <Route path="/">
          <IntroductionPage />
        </Route> */}
        {/* <Route path="/join-room">
          <JoinRoomPage />
        </Route> */}
        <Route path="/room">
          <RoomPage />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
