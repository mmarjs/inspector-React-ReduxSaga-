import React, {Component} from 'react';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import './App.css';
import LoginScreen from "./screens/login/LoginScreen";
import {connect} from "react-redux";
import ChecksListScreen from "./screens/cheks-list/ChecksListScreen";
import ProductScreen from "./screens/product/ProductScreen";
import CheckScreen from "./screens/check/CheckScreen";
import WizardScreen from "./screens/wizard/WizardScreen";
import FinalScreen from "./screens/final/FinalScreen";
import KnotsListScreen from "./screens/knots-list/KnotsListScreen";
import WizardKnotScreen from "./screens/wizard-knot/WizardKnotScreen"
import SupportScreen from "./screens/support/SupportScreen";
import QuestionScreen from "./screens/question/QuestionScreen";
import QuestionCreateScreen from "./screens/question-create/QuestionCreateScreen";
import {RootState} from "./reducer";
import {
    checkPage,
    finalPage,
    knotsCheckPage,
    knotsListPage,
    loginPage, networkPage,
    productPage,
    rootPage, supportPage,
    supportArchivePage,
    questionPage,
    questionCreatePage,
    wizardKnotPage,
    wizardPage
} from "./constants/config";
import CheckKnotScreen from "./screens/check-knot/CheckKnotScreen";

const PrivateRoute = ({component, isAuthenticated, ...rest}: any) => {
    const routeComponent = (props: any) => (
        isAuthenticated
            ? React.createElement(component, props)
            : <Redirect to={{pathname: loginPage}}/>
    );
    return <Route {...rest} render={routeComponent}/>;
};

class Routs extends Component<any, { isOpen: boolean }> {
    render() {
        const isAuthenticated = this.props.token != '' && this.props.token != undefined;
        return (
            <Router>
                <Switch>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={rootPage} exact
                                  component={ChecksListScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={networkPage} exact
                                  component={ChecksListScreen}/>
                    <Route path={loginPage} exact component={LoginScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={productPage} exact
                                  component={ProductScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={checkPage} exact component={CheckScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={wizardPage} exact
                                  component={WizardScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={finalPage} exact component={FinalScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={knotsListPage} exact
                                  component={KnotsListScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={knotsCheckPage} exact
                                  component={CheckKnotScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={wizardKnotPage} exact
                                  component={WizardKnotScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={supportPage} exact
                                  component={SupportScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={supportArchivePage} exact
                                  component={SupportScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={questionPage} exact
                                  component={QuestionScreen}/>
                    <PrivateRoute isAuthenticated={isAuthenticated} path={questionCreatePage} exact
                                  component={QuestionCreateScreen}/>
                    <Redirect to={rootPage}/>
                </Switch>
            </Router>
        )
    }
}

const mapStateToProps = (state: RootState): any => {
    return {
        token: state.app.token
    }
};

export default connect(mapStateToProps)(Routs)
