import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {fetchTicketsAction} from "./actions";
import {History} from "history";
import {networkPage, questionCreatePage, questionPage, rootPage, supportPage} from "../../constants/config";
import {RootState} from "../../reducer";
import {Ticket} from "./types";
import {formatDate} from "../../utils";
// import {toggleNetworkMode} from "../cheks-list/actions";

interface StateProps {
    isFetch: boolean;
    tickets: Ticket[];
    isSending: boolean;
    ticketsClosed: Ticket[];
    // isArchive: boolean;
}

interface Props {
    dispatch: Dispatch;
    history: History;
}

// // interface ITicket {
// //     ticket:Ticket;
// //     onClick:any
// // }
// const TicketCard = ({ticket:Ticket, onClick:any})=>( <div className="card-wrapper" onClick={onClick}>
//     <Paper className="card support" key={ticket.uid}>
//         <div className="df">
//             <h2>{ticket.subject}</h2>
//         </div>
//         <div className="card-section">
//             <div className="product-title">{ticket.subject}</div>
//             <div className="item-info">
//                 <span className="title">Вопрос задан</span>
//                 <span className="value">{formatDate(ticket.created)}</span>
//             </div>
//             <div className="item-info">
//                 <span className="title">Статус</span>
//                 <span className="value support-await">Ожидает ответа службы поддержки</span>
//             </div>
//         </div>
//     </Paper>
// </div>)

class SupportScreen extends React.PureComponent<Props & StateProps> {

    goCreateQuestion = () => {
        this.props.history.push(questionCreatePage);
    };

    goBack = () => {
        this.props.history.goBack();
    };

    async componentDidMount() {
        this.props.dispatch(fetchTicketsAction());
    }

    goToQuestion = (ticket: Ticket) => {
        this.props.history.push(questionPage, {ticket});
    };

    getStatus = (status: number) => {
        switch (status) {
            case 0:
                return <span className="value support-await">Ожидает ответа службы поддержки</span>;
            case 1:
                return <span className="value user-await">Ожидает ответа пользователя </span>;
            case 2:
                return <span className="value user-await">Ожидает подтв. закрытия от пользователя </span>;
            case 3:
                return <span className="value closed">Закрыт</span>
        }
    };

    renderQuestion = () => {
        let tickets;
        if (this.props.history.location.pathname == supportPage)
            tickets = this.props.tickets;
        else
            tickets = this.props.ticketsClosed;

        return tickets.map(ticket => {
            // if (this.props.isArchive && !ticket.isArchived || !this.props.isArchive && ticket.isArchived)
            //     return null;
            return(
                <div className="card-wrapper" onClick={() => this.goToQuestion(ticket)} key={ticket.uid}>
                    <Paper className="card support">
                        <div>
                            <h2>{ticket.subject}</h2>
                            <p>{ticket.annotation}</p>
                        </div>
                        <div className="card-section">
                            <div className="product-title"/>
                            <div className="item-info">
                                <span className="title">Вопрос задан</span>
                                <span
                                    className="value">{formatDate(ticket.created, 'HH:mm')}&nbsp;&nbsp;&nbsp;{formatDate(ticket.created)}</span>
                            </div>
                            <div className="item-info">
                                <span className="title">Статус</span>
                                {this.getStatus(ticket.status)}
                            </div>
                        </div>
                    </Paper>
                </div>
            );
        })
    };

    render() {
        return (
            <>
                <AppBar position="static" className="nav-bar support"
                        style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Link onClick={this.goBack} style={{width: "100%"}}>
                        <span>Назад</span>
                    </Link>
                    <Link onClick={this.goCreateQuestion} style={{width: "100%"}}>
                        <span>Задать вопрос</span>
                    </Link>
                </AppBar>

                <div className="main-wrapper scroll-container support">
                    <div className="cards-list-wrapper">
                        <div className="cards-list support">
                            {this.renderQuestion()}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        isFetch: state.tickets.isFetch,
        tickets: state.tickets.tickets,
        ticketsClosed: state.tickets.ticketsClosed,
        isSending: state.tickets.isSending,
        // isArchive: state.tickets.isArchive,
    }
};

export default connect(mapStateToProps)(SupportScreen);
