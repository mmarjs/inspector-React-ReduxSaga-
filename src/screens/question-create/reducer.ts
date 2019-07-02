import {Action} from "redux";
import {SEND_EMAIL, SEND_MAIL_SUCCESS, SEND_MAIL_FAILED} from "./action";

interface ActionWithPayload<T> extends Action {
    payload: T;
}

export interface MailState {
    subject: string;
    text: string,
    loading: boolean;
    errMessage: string;
}

const init: MailState = {
    subject: '',
    text: '',
    loading: false,
    errMessage: '',
};

export default (state = init, action: ActionWithPayload<any>) => {
    switch (action.type) {
        case SEND_EMAIL:
            return {
                ...state,
                loading: true,
                errMessage: '',
                subject: action.payload.subject,
                text: action.payload.text,
            };
        case SEND_MAIL_SUCCESS:
            return {
                ...state,
                loading: false,
                errMessage: '',
                subject: '',
                text: '',
            };
        case SEND_MAIL_FAILED:
            return {
                ...state,
                loading: false,
                errMessage: action.payload,
            };
        default:
            return state;
    }
}
