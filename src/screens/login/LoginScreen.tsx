import * as React from "react";
import logo from '../../img/logo.svg';
import TextField from '@material-ui/core/TextField';
import Button from "@material-ui/core/Button";
import {connect} from "react-redux";
import {loginAction,} from './action'
import {LoginState,} from './reducer'
import {RootState} from "../../reducer";
import {History, Location} from "history";
import {Dispatch} from "redux";
import {withStyles} from "@material-ui/core/styles";
import styles from "../cheks-list/styles";
import {rootPage} from "../../constants/config";

interface OwnProps {
    dispatch: Dispatch;
    location: Location;
    history: History;
}

interface Props extends OwnProps, LoginState {
}

interface State {
    login: string;
    password: string
}

class LoginScreen extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        if (process.env.NODE_ENV === 'production') {
            this.state = {
                login: '',
                password: ''
            }
        } else {
            this.state = {
                login: 'korvet@gazprom.tech',
                password: '1923'
            }
        }

    }

    componentDidUpdate(prevProps: Props) {
        // Typical usage (don't forget to compare props):
        if (this.props.isFetch == false && prevProps.isFetch == true && this.props.token != undefined) {
            this.props.history.replace(rootPage, {});
        }
    }

    render() {
        return (
            <>
                <div className="login-wrapper">
                    <div className="main-wrapper login">
                        <div className="login-inner">
                            <img src={logo} alt="Logo"/>
                            <TextField className="login-input"
                                       value={this.state.login}
                                       label="Логин" onChange={(el: React.ChangeEvent<HTMLInputElement>) => {
                                this.setState({login: el.target.value})
                            }}/>
                            <TextField className="pass-input" label="Пароль" type="password"
                                       value={this.state.password}
                                       autoComplete="current-password"
                                       onChange={(el: React.ChangeEvent<HTMLInputElement>) => {
                                           this.setState({password: el.target.value})
                                       }}/>
                            <Button disabled={!(this.state.login && this.state.password)} className="btn-primary login"
                                    onClick={() => {
                                        return this.props.dispatch(loginAction(this.state.login, this.state.password))
                                    }}>{!this.props.isFetch ? 'Войти' : '...'}</Button>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}


const mapStateToProps = (state: RootState): LoginState => {
    return {
        isFetch: state.login.isFetch,
        token: state.login.token,
        login: state.login.login
    }
};

export default connect(mapStateToProps)(withStyles(styles)(LoginScreen));
