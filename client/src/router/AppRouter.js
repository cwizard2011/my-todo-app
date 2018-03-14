import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import createHistory from 'history/createBrowserHistory';
import Dashboard from '../components/DashboardPage';
import NotFoundPage from '../components/NotFound';
import LoginPage from '../components/LoginPage';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute'

export const history = createHistory();

const AppRouter = () => (
    <Router history={history}>
      <div>
        <Switch>
        <PublicRoute path= "/" component ={LoginPage} exact={true}/>
        <PrivateRoute path="/dashboard" component={Dashboard} />
        <Route component={NotFoundPage} />
       </Switch>
      </div>
    </Router>
);

export default AppRouter;