import { BrowserRouter, Switch, Route } from "react-router-dom";
import './App.css';
import Login from "../src/ui/pages/Login";
import Home from "../src/ui/pages/Home";
import NotFound from "../src/ui/pages/NotFound";
import * as ROUTES from "../src/constants/routes";
import { withAuthentication } from './bloc/Session';

function App() {
  return (
    
      <BrowserRouter>
        <Switch>
          <Route exact path={ROUTES.LOGIN} component={Login}/>
          <Route exact path={ROUTES.HOME} component={Home}/>
          <Route component={NotFound}/>
        </Switch>
      </BrowserRouter>
    
  );
}

export default withAuthentication(App);



