import {Action} from "redux";

export const LOGIN_REQUEST = 'LOGIN_REQUEST';

export interface LoginAction extends Action {
    payload: { login: string, password: string };
}

export const loginAction = (login: string, password: string): LoginAction => ({
    type: LOGIN_REQUEST,
    payload: {login, password}
});

export const LOGIN_RESPONSE = 'LOGIN_RESPONSE';

export interface LoginResponseAction extends Action {
    payload: { token: string };
}

export const loginSuccessAction = (token: string): LoginResponseAction => ({type: LOGIN_RESPONSE, payload: {token}});

export const LOGIN_ERROR = 'LOGIN_ERROR';
export const loginWithError = (): Action => ({type: LOGIN_ERROR});
export const LOGOUT = 'LOGOUT';
export const logoutAction = (): Action => ({type: LOGOUT});

export interface SetLoginAction extends Action {
    payload: string;
}

export const SET_LOGIN = "SET_LOGIN";
export const setLoginAction = (login: string): SetLoginAction => ({type: SET_LOGIN, payload: login});
