import {Ticket} from "../types";
import {FC} from "react";
import Paper from "@material-ui/core/Paper";
import {formatDate} from "../../../utils";
import React from "react";


const AWAIT_ANSWER_USER = <span className="value user-await">Ожидает ответа пользователя </span>;
const AWAIT_ANSWER_SUPPORT = <span className="value support-await">Ожидает ответа службы поддержки</span>;
const AWAIT_CLOSE = <span className="value user-await">Ожидает подтв. закрытия от пользователя </span>;
const CLOSED = <span className="value closed">Закрыт</span>;

interface ITicket {
    ticket:Ticket;
    onClick:any
}
const Tiket:FC<ITicket> = ({ticket, onClick})=>( <div className="card-wrapper" onClick={onClick}>
    <Paper className="card support" key={ticket.uid}>
        <div className="df">
            <h2>{ticket.subject}</h2>
        </div>
        <div className="card-section">
            <div className="product-title">{ticket.subject}</div>
            <div className="item-info">
                <span className="title">Вопрос задан</span>
                <span className="value">{formatDate(ticket.created)}</span>
            </div>
            <div className="item-info">
                <span className="title">Статус</span>
                <span className="value support-await">Ожидает ответа службы поддержки</span>
            </div>
        </div>
    </Paper>
</div>)

export  default  Ticket