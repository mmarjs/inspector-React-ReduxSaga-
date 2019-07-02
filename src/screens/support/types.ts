export interface Ticket {
    uid: string,
    subject: string,
    userId: string,
    annotation: string,
    status: number,
    isArchived: number,
    created: number,
    updated: number,
}

export interface Message {
    id: string;
    authorId: number;
    ticketId: string;
    text: string;
    hidden: number;
    created: number;
}

export interface ResponseTicketPayload {
    ticket: Ticket;
    messages: Message[];
}
