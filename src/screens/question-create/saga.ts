import {takeLeading, select, put} from "@redux-saga/core/effects";
import {API_VERSION, TICKETS_API} from "../../constants/config";
import {SEND_EMAIL, SendEmailAction, sendMailError, sendMailSuccess} from "./action";
import {addTaskAction, deleteTaskAction, requestErrorAction} from "../../actions";
import uuid from "react-native-uuid";
import {RootState} from "../../reducer";

//
function* sendEmail(action: SendEmailAction) {
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    try {
        let response = yield fetch(TICKETS_API, {
            method: 'POST',
            headers: {
                v: API_VERSION,
                token: token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                    subject: action.payload.subject,
                    annotation: action.payload.text,
                    uid: uuid.v4()
                }
            )
        });

        yield put(deleteTaskAction(action.taskId));
        yield put(sendMailSuccess());
    } catch (error) {
        yield put(addTaskAction(action, 0));
        yield put(requestErrorAction(action.taskId));
        yield put(sendMailError("Error sending your message!"));
        console.log(error);
    }
}

export function* mailGunSaga() {
    yield takeLeading(SEND_EMAIL, sendEmail);
}
