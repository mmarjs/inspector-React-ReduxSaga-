import {Action} from "redux";
import * as types from './action';
import {SET_LOGIN, SetLoginAction} from "./action";

interface ActionWithPayload<T> extends Action {
    payload: T;
}

export interface LoginState {
    isFetch: boolean;
    token?: string;
    login: string | null;
}

const init: LoginState = {
    isFetch: false,
    token: undefined,
    login: null,
};

export default (state = init, action: ActionWithPayload<any>) => {
    switch (action.type) {
        case types.LOGIN_REQUEST:
            return {...state, isFetch: true};
        case types.LOGIN_RESPONSE:
            return {...state, isFetch: false, token: action.payload.token};
        case types.LOGIN_ERROR:
            return {...state, isFetch: false, token: undefined};
        case SET_LOGIN:
            return {...state, login: (action as SetLoginAction).payload};
        default:
            return state;
    }
}
