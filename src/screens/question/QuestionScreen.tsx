import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import InputBase from '@material-ui/core/InputBase';
import photo from "../../img/photo1.png";
import file from "../../img/file.png"
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import ReactMarkdown from "react-markdown";
import {Dispatch} from "redux";
import {History, Location} from "history";
import {Message, Ticket} from "../support/types";
import {connect} from "react-redux";
import {fetchTicketAction, resetTicketAction, sendMessageAction, setTicketStatusAction} from "../support/actions";
import {Profile, RootState} from "../../reducer";
import moment from "moment";


interface LocationState {
    ticket: Ticket;
}

interface ownProps {
    dispatch: Dispatch;
    history: History;
    location: Location<LocationState>;
}

interface Props extends ownProps, PropsState {

}

interface PropsState {
    ticket: Ticket | null;
    messages: Message[];
    profile: Profile | null;
}

interface State {
    ticket: Ticket,
    comment: string;
}

class SupportScreen extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            ticket: this.props.location.state.ticket,
            comment: ""
        }
    }

    componentDidMount(): void {
        this.props.dispatch(fetchTicketAction(this.state.ticket.uid));
    }

    static getDerivedStateFromProps(props: Props) {
        if (props.ticket !== null) {
            return {ticket: props.ticket}
        }
        return null;
    }

    goBack = () => {
        this.props.dispatch(resetTicketAction());
        this.props.history.goBack();
    };

    renderFiles = () => {
        return (
            <div className="chat-docs">
                <div className="photos-question">
                    <div className="file photo">
                        <img className="photo" src={photo} alt="photo"/>
                        <IconButton className="delete-photo">
                            <div className="delete-ico"/>
                        </IconButton>
                    </div>

                    <div className="file photo">
                        <img className="photo" src={photo} alt="photo"/>
                        <IconButton className="delete-photo">
                            <div className="delete-ico"/>
                        </IconButton>
                    </div>

                    <div className="file photo">
                        <img className="photo" src={photo} alt="photo"/>
                        <IconButton className="delete-photo">
                            <div className="delete-ico"/>
                        </IconButton>
                    </div>

                    <div className="file doc">
                        <div className="doc">
                            <img src={file} alt="File"/>
                            <span>Перечень узлов подлежащих обязательной проверке</span>
                        </div>
                        <IconButton className="delete-photo">
                            <div className="delete-ico"/>
                        </IconButton>
                    </div>
                </div>
            </div>
        )
    };

    renderMessage = (message: Message) => {
        const {uid, full_name} = this.props.profile as Profile;
        if (uid === String(message.authorId)) {
            return (
                <div className="message user" key={message.id}>
                    <div className="sender-wrapper">
                        <div className="sender">{full_name}</div>
                        <span>{moment.unix(message.created).format("HH:mm DD.MM.YYYY")}</span>
                    </div>
                    <ReactMarkdown className="message-content" source={message.text}/>
                </div>
            )
        } else {
            return (
                <div className="message support" key={message.id}>
                    <div className="sender-wrapper">
                        <div className="sender">Служба поддержки</div>
                        <span>{moment.unix(message.created).format("HH:mm DD.MM.YYYY")}</span>
                    </div>
                    <ReactMarkdown className="message-content" source={message.text}/>
                </div>
            )
        }
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

    onMessageInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({comment: event.target.value})
    };

    sendMessage = () => {
        this.props.dispatch(sendMessageAction(this.state.comment, this.state.ticket.uid));
        this.setState({comment: ""})
    };

    resolveStatus = () => {
        this.props.dispatch(setTicketStatusAction(this.state.ticket.uid, 3));
        this.props.history.goBack();
    };

    render() {
        const {status} = this.state.ticket;
        return (
            <>
                <AppBar position="static" className="nav-bar"
                        style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Link onClick={this.goBack} style={{width: "100%"}}>
                        <span>Назад</span>
                    </Link>
                </AppBar>

                <div className="main-wrapper">
                    <div className="cards-list-wrapper">
                        <div className="cards-list support question">
                            <div className="card-wrapper">
                                <Paper className="card support">
                                    <div className="df">
                                        <h2>{this.state.ticket.subject}</h2>
                                        <span>{moment.unix(this.state.ticket.created).format("DD.MM.YYYY")}</span>
                                    </div>
                                    <div className="card-section">
                                        <div className="product-title">{this.state.ticket.annotation}
                                        </div>
                                        <div className="item-info">
                                            <span className="title">Последний ответ</span>
                                            <span
                                                className="value">{moment.unix(this.state.ticket.updated).format("HH:mm DD.MM.YYYY")}</span>
                                        </div>
                                        <div className="item-info">
                                            <span className="title">Статус</span>
                                            {this.getStatus(this.state.ticket.status)}
                                        </div>
                                    </div>
                                </Paper>
                            </div>
                        </div>
                    </div>

                    <div className="chat-wrapper">
                        <h3>Все ответы ({this.props.messages.length})</h3>
                        <Paper className="card">
                            <div className="chat">
                                {this.props.messages.map(this.renderMessage)}
                                {status !== 2 && status !== 3 ?
                                    <div className="add-message">
                                        <InputBase placeholder="Комментировать...." multiline rows="4" fullWidth
                                                   style={{fontSize: 30}} value={this.state.comment}
                                                   onChange={this.onMessageInputChange}/>
                                    </div> : null}
                            </div>

                            {status !== 2 && status !== 3 ?
                                <div className="df question">
                                    {/*<div className="btn-files">
                                    <div className="add-photo"/>
                                    <div className="add-file"/>
                                </div>*/}

                                    <div className="btn-result">
                                        <Button variant="contained"
                                                onClick={this.resolveStatus}
                                                className="btn-primary">Вопрос решён</Button>
                                        <Button variant="contained" color="primary"
                                                className="btn-primary" onClick={this.sendMessage}>Отправить</Button>
                                    </div>
                                </div> : null}
                        </Paper>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: RootState): PropsState => {
    return {
        ticket: state.tickets.ticket,
        messages: state.tickets.messages,
        profile: state.app.profile,
    }
};

export default connect(mapStateToProps)(SupportScreen);
