import {put, takeLeading} from "redux-saga/effects";
import * as Sentry from "@sentry/browser";
import {API, API_VERSION} from "../../constants/config";
import {fetchProfileAction, setTokenAction} from '../../actions'
import {
    LOGIN_REQUEST,
    LoginAction,
    loginSuccessAction,
    loginWithError,
    LOGOUT,
    logoutAction,
    setLoginAction
} from "./action";

function* authorize({payload}: LoginAction) {
    try {
        const {login, password} = payload;
        console.log("Logins", login);
        console.log("pass", password);
        console.log(JSON.stringify({login, password}));
        const response = yield fetch(`${API}/auth`, {
            method: 'POST',
            headers: {v: API_VERSION},
            body: JSON.stringify({login, password})
        }).then(res => res.json());
        if (response.success == 'false') {
            alert(response.error.error_msg);
            yield put(loginWithError())
        } else {
            const token = response.response.token;
            console.log("token", token);
            // fixme:  rewrite to cookie after deadline
            yield localStorage.setItem('token', token);

            // const owner = yield fetch(`${API}/owner`,
            // {
            //     method: 'GET',
            //       headers: {token, v: API_VERSION},
            //   }
            // ).then(response => response.json()).catch(e=>console.log(e))


            // get  owner
            // wrote to             yield localStorage.setItem('login', "full_name);
            // if(owner.response ){
            //     const name = owner.response.full_name || owner.response.first_name||login
            //     yield localStorage.setItem('login', name);
            //
            // }else {
            //     yield localStorage.setItem('login', login);
            // }

            yield put(setLoginAction(login));
            yield put(setTokenAction(token));
            yield put(loginSuccessAction(token));
            yield put(fetchProfileAction())
        }
    } catch (error) {
        //todo add toast with error
        Sentry.captureException(error);
        console.log(error);
    }
}

function* logout() {
    try {
        yield localStorage.clear();
        yield put(logoutAction());
        yield put(setTokenAction(''))
    } catch (error) {
        //todo add toast with error
        Sentry.captureException(error);
        console.log(error);
    }
}

export function* loginFlow() {
    yield takeLeading(LOGIN_REQUEST, authorize)
}

export function* logoutFlow() {
    yield takeLeading(LOGOUT, logout)
}
