import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Link from "@material-ui/core/Link";
import TextField from '@material-ui/core/TextField';
import photo from "../../img/photo1.png";
import IconButton from "@material-ui/core/IconButton";
import file from "../../img/file.png";
import Button from "@material-ui/core/Button";
import InputBase from "@material-ui/core/InputBase";
import {connect} from "react-redux";
import {sendMail} from "./action";
import {RootState} from "../../reducer";
import {MailState} from './reducer'
import {Dispatch} from "redux";
import {History} from "history";
import {withStyles} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import ErrorIcon from '@material-ui/icons/Error';
import CloseIcon from '@material-ui/icons/Close';

import styles from "../cheks-list/styles";

interface OwnProps {
    dispatch: Dispatch;
    history: History;
}

interface Props extends OwnProps, MailState {
    loading: boolean;
    errMessage: string;
}

interface State {
    success: boolean;
    subject: string;
    text: string;
    openAlert: boolean;
    loading: boolean;
}

class SupportScreen extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            success: false,
            subject: '',
            text: '',
            openAlert: false,
            loading: false,
        }
    }

    goBack = () => {
        this.props.history.goBack();
    };

    componentWillReceiveProps(nextProps: Readonly<Props>): void {
        if (!nextProps.loading && this.props.loading && nextProps.errMessage == '') {
            this.setState({
                success: true,
            });
        } else if (!nextProps.loading && this.props.loading && nextProps.errMessage != '') {
            this.setState({openAlert: true})
        } else {}
    }

    handleClose = () => {
        this.setState({openAlert: false})
    };

    render() {
        return (
            <>
                <Snackbar
                    style={{width: '200'}}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center'}}
                    open={this.state.openAlert}
                    onClose={this.handleClose}
                    autoHideDuration={5000}
                    className="error-mail"
                    message={<span id="message-id"><ErrorIcon />{this.props.errMessage}</span>}
                    action={[
                        <IconButton key="close" aria-label="Close" color="inherit" onClick={this.handleClose}>
                            <CloseIcon/>
                        </IconButton>,
                    ]}
                />

                <AppBar position="static" className="nav-bar create-question"
                        style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Link onClick={this.goBack} style={{width: "100%"}}>
                        <span>Назад</span>
                    </Link>
                </AppBar>

                <div className="main-wrapper create-question">
                    <div className={!this.state.success ? "active" : ""}>
                        <TextField
                            className="question-theme"
                            placeholder="Введите тему вопроса"
                            value={this.state.subject}
                            onChange={(el: React.ChangeEvent<HTMLInputElement>) => {
                                this.setState({subject: el.target.value})
                            }}
                        />

                        <div className="add-message">
                            <InputBase
                                placeholder="Текст вопроса..."
                                multiline rows="4"
                                fullWidth style={{fontSize: 30}}
                                value={this.state.text}
                                onChange={(el: React.ChangeEvent<HTMLInputElement>) => {
                                    this.setState({text: el.target.value})
                                }}
                            />
                        </div>

                        {/*{this.renderFiles()}*/}

                        <div className="df question">
                            <div className="btn-files">
                                <div className="add-photo" hidden={true}/>
                                <div className="add-file" hidden={true}/>
                            </div>

                            <div className="btn-result">
                                {this.props.loading
                                    ?
                                    <CircularProgress disableShrink />
                                    :
                                    <Button variant="contained" color="primary"
                                            onClick={() => {
                                                return this.props.dispatch(sendMail(this.state.subject, this.state.text))
                                            }}
                                            className={!this.state.subject || !this.state.text ? "btn-primary disabled" : "btn-primary"}
                                            disabled={!this.state.subject || !this.state.text} >Отправить</Button>}
                            </div>
                        </div>
                    </div>

                    <div className={!this.state.success ? "question-create-success" : "question-create-success active"}>
                        <h1>Ваш вопрос упешно добавлен!</h1>
                        <Button variant="contained" color="primary" className="btn-primary" onClick={() => {
                            this.setState({success: false, subject:'', text:''
                            })
                        }}>Спасибо!</Button>
                    </div>
                </div>
            </>
        );
    }

     renderFiles() {
        return (<div className="chat-docs">
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
        </div>)
    }
}

const mapStateToProps = (state: RootState): MailState => {
    return {
        loading: state.mail.loading,
        errMessage: state.mail.errMessage,
        subject: state.mail.subject,
        text: state.mail.text,
    }
};

export default connect(mapStateToProps)(withStyles(styles)(SupportScreen));
