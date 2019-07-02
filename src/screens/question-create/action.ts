import {Action} from "redux";

export interface SendEmailAction extends Action {
    taskId: number;
    payload: {
        subject: string,
        text: string
    }
}

export const SEND_EMAIL = "SEND_EMAIL";
export const sendMail = (subject: string, text: string): SendEmailAction => ({
    taskId: Date.now(),
    type: SEND_EMAIL,
    payload: {subject, text}
});

export const SEND_MAIL_SUCCESS = "SEND_MAIL_SUCCESS";
export const sendMailSuccess = () => ({type: SEND_MAIL_SUCCESS});

export const SEND_MAIL_FAILED = "SEND_MAIL_FAILED";
export const sendMailError = (error: string) => ({type: SEND_MAIL_FAILED, payload: error});
