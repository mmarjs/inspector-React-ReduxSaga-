import {put, select, takeLeading} from "@redux-saga/core/effects";
import {RootState} from "../../reducer";
import {API_VERSION, MESSAGE_API, TICKET_API, TICKET_STATUS_API} from "../../constants/config";
import {
    setTickets,
    setTicketsClosed,
    FETCH_TICKETS,
    FETCH_TICKET,
    FetchTicketAction,
    setTicketAction,
    SendMessageAction,
    SEND_MESSAGE,
    fetchTicketAction,
    SetTicketStatusAction, SET_TICKET_STATUS, fetchTicketsAction
} from "./actions";
import {ResponseTicketPayload} from "./types";
import {fetchChecksAction} from "../cheks-list/actions";
import {delay} from "q";

function* getTickets() {
    const token = yield select((state: RootState) => state.app.token);

    if (!token) {
        return;
    }

    const uid = yield select((state: RootState) => state.app.profile ? state.app.profile.uid : '0');

    if (!uid) {
        return;
    }

    try {
        const result = yield fetch(`${TICKET_API}?active=true`, {
            method: 'GET',
            headers: {
                v: API_VERSION,
                token,
            },
        }).then(res => res.json());

        if (result.ok) {
            yield put(setTickets(result.payload));
        }
    } catch (error) {
        console.log(error);
    }

    try {
        const result = yield fetch(`${TICKET_API}?active=false`, {
            method: 'GET',
            headers: {
                v: API_VERSION,
                token,
            },
        }).then(res => res.json());

        if (result.ok) {
            yield put(setTicketsClosed(result.payload));
        }
    } catch (error) {
        console.log(error);
    }
}

function* getTicket(action: FetchTicketAction) {
    const token = yield select((state: RootState) => state.app.token);

    if (!token) {
        return;
    }

    const uid = yield select((state: RootState) => state.app.profile ? state.app.profile.uid : '0');

    if (!uid) {
        return;
    }

    const payload = action.payload.startsWith('"') ? action.payload.substr(1) : action.payload;
    const target = `${TICKET_API}/${payload}`;
    try {
        const result: { ok: boolean, payload: ResponseTicketPayload } = yield fetch(target, {
            method: 'GET',
            headers: {
                v: API_VERSION,
                "author-id": token,
                token,
            },
        }).then(res => res.json());

        console.log(result.payload);
        if (result.ok) {
            yield put(setTicketAction(result.payload));
        }
    } catch (error) {
        console.log(error);
    }
}

function* sendMessage(action: SendMessageAction) {
    const token = yield select((state: RootState) => state.app.token);
    const uid = yield select((state: RootState) => state.app.profile ? state.app.profile.uid : '0');
    if (!uid || !token) return;
    try {
        yield fetch(MESSAGE_API, {
            method: 'POST',
            headers: {
                "v": API_VERSION,
                "Content-Type": "application/json",
                token,
            },
            body: JSON.stringify({
                text: action.payload,
                ticketId: action.ticketId
            })
        });
        yield put(fetchTicketAction(action.ticketId));
    } catch (error) {
        console.log(error);
    }
}

function* updateTicket(action: SetTicketStatusAction) {
    const token = yield select((state: RootState) => state.app.token);
    if (!token) return;
    try {
        yield fetch(`${TICKET_STATUS_API}/${action.ticketId}`, {
            method: 'PATCH',
            headers: {
                "v": API_VERSION,
                "Content-Type": "application/json",
                token,
            },
            body: JSON.stringify({
                status: action.payload
            })
        });
        yield delay(3000);
        yield put(fetchTicketsAction());
    } catch (error) {
        console.log(error);
    }
}

export function* ticketsSaga() {
    yield takeLeading(FETCH_TICKETS, getTickets);
    yield takeLeading(FETCH_TICKET, getTicket);
    yield takeLeading(SEND_MESSAGE, sendMessage);
    yield takeLeading(SET_TICKET_STATUS, updateTicket);
}
