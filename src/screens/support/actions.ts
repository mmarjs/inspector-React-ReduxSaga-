import {Action} from "redux";
import {ResponseTicketPayload, Ticket, Message} from "./types";

export const INIT_TICKETS = "INIT_TICKETS";
export const initTickets = (): Action => {
    return {type: INIT_TICKETS}
};

export interface FetchTicketsAction extends Action {
}

export const FETCH_TICKETS = "FETCH_TICKETS";
export const fetchTicketsAction = (): FetchTicketsAction => {
    return {type: FETCH_TICKETS}
};

export interface SetTicketsAction extends Action {
    payload: Ticket[];
}

export const SET_TICKETS = "SET_TICKETS";
export const setTickets = (tickets: Ticket[]): SetTicketsAction => {
    return {type: SET_TICKETS, payload: tickets}
};

export const SET_TICKETS_CLOSED = "SET_TICKETS_CLOSED";
export const setTicketsClosed = (tickets: Ticket[]): SetTicketsAction => {
    return {type: SET_TICKETS_CLOSED, payload: tickets}
};

export const FETCH_MESSAGES = "FETCH_MESSAGES";
export const fetchMessagesAction = (ticket: Ticket, messages: Message): TicketMessageAction => {
    return {type: FETCH_MESSAGES, payload: {ticket, messages}}
};

export interface TicketMessageAction extends Action {
    payload: { ticket: Ticket, messages: Message }
}

export interface FetchTicketAction extends Action {
    payload: string;
}

export interface SetTicketAction extends Action {
    payload: ResponseTicketPayload;
}

export const SET_TICKET = "SET_TICKET";
export const setTicketAction = (payload: ResponseTicketPayload): SetTicketAction => ({type: SET_TICKET, payload});


export const FETCH_TICKET = "FETCH_TICKET";
export const fetchTicketAction = (uuid: string): FetchTicketAction => ({type: FETCH_TICKET, payload: uuid});

export const RESET_TICKET = "RESET_TICKET";
export const resetTicketAction = (): Action => ({type: RESET_TICKET});

export interface SendMessageAction extends Action {
    payload: string;
    ticketId: string;
}

export const SEND_MESSAGE = "SEND_MESSAGE";
export const sendMessageAction = (msg: string, ticketId: string): SendMessageAction => ({
    type: SEND_MESSAGE,
    payload: msg,
    ticketId
});

export interface SetSendingAction extends Action {
    payload: boolean;
}

export const SET_SENDING = "SET_SENDING";
export const setSendingAction = (status: boolean): SetSendingAction => ({type: SET_SENDING, payload: status});

export interface SetTicketStatusAction extends Action {
    ticketId: string;
    payload: number;
}

export const SET_TICKET_STATUS = "SET_TICKET_STATUS";
export const setTicketStatusAction = (ticketId: string, status: number): SetTicketStatusAction => ({
    type: SET_TICKET_STATUS,
    ticketId,
    payload: status
});

export const TOGGLE_ARCHIVE_MODE = "TOGGLE_ARCHIVE_MODE";
export const toggleArchiveMode = (value: boolean) => ({type: TOGGLE_ARCHIVE_MODE, payload: value});
