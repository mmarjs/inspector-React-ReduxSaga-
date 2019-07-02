import {Action} from "redux";
import {Message, Ticket} from "./types";
import {
    SET_TICKETS,
    FETCH_TICKETS,
    SetTicketsAction,
    SET_TICKET,
    SET_TICKETS_CLOSED,
    SetTicketAction,
    RESET_TICKET,
    SET_SENDING, SetSendingAction,
    TOGGLE_ARCHIVE_MODE
} from "./actions";

export interface ActionWithPayload<T> extends Action {
    payload: T;
}

export interface TicketsState {
    ticket: Ticket | null
    tickets: Ticket[];
    ticketsClosed: Ticket[];
    messages: Message[];
    isFetch: boolean;
    error: object | null;
    isSending: boolean;
    // isArchive: boolean;
}

const init: TicketsState = {
    ticket: null,
    tickets: [],
    ticketsClosed: [],
    messages: [],
    isFetch: false,
    error: null,
    isSending: false,
    // isArchive: false,
};

export default (state = init, action: ActionWithPayload<any>): TicketsState => {
    switch (action.type) {
        case FETCH_TICKETS:
            return {...state, isFetch: true, error: null};
        case SET_TICKETS:
            return {...state, tickets: (action as SetTicketsAction).payload, error: null, isFetch: false};
        case SET_TICKETS_CLOSED:
            return {...state, ticketsClosed: action.payload, error: null, isFetch: false};
        case SET_TICKET: {
            const ticket = (action as SetTicketAction).payload.ticket;
            const messages = (action as SetTicketAction).payload.messages;
            return {...state, ticket, messages};
        }
        case RESET_TICKET:
            return {...state, ticket: null, messages: []};
        case SET_SENDING:
            return {...state, isSending: (action as SetSendingAction).payload};
        // case TOGGLE_ARCHIVE_MODE:
        //     return {...state, isArchive: action.payload};
        default:
            return state;
    }
}
