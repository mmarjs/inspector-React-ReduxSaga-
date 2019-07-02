import React, {Component} from 'react';
import './App.css';
import {Provider} from "react-redux";
import {MuiPickersUtilsProvider} from 'material-ui-pickers';
import MomentUtils from '@date-io/moment';
import * as Sentry from '@sentry/browser';
import {configureStore} from "./reducer";
import {
    initCheckAction,
    initProfileAction,
    initStagesAction,
    initApp,
    runPingLoop,
    runSyncLoop,
    setDexieAction, fetchProfileAction
} from "./actions";
import Dexie from "dexie";
import Routs from "./Routs";
import {Dialog} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

export const store = configureStore();

interface State {
    ready: boolean;
    showModal: boolean;
    error: string;
}

class App extends Component<{}, State> {

    state = {
        ready: false,
        showModal: false,
        error: ""
    };

    constructor(props: any) {
        super(props);

        Sentry.init({
            dsn: "https://cf1cb4f132b844eb831b4f6ad3cb8d7c@sentry.io/1430220"
        });

        store.dispatch(initApp());

        this.initDb().then();
    }

    initDb = async () => {
        const db = new Dexie('Inspector');

        db.version(2).stores({
            checks: 'id, check',
            checks2: '++id, check_id, check',
            stages: 'id, stage',
            tasks: 'id, task, priority, attempt, lastError'
        });

        // Declare tables, IDs and indexes
        db.version(1).stores({
            checks: 'id, check',
            stages: 'id, stage',
            tasks: 'id, task, priority, attempt, lastError'
        });

        try {
            await db.open();
            store.dispatch(setDexieAction(db));
            store.dispatch(initCheckAction());
            store.dispatch(initStagesAction());
            store.dispatch(runSyncLoop());
            store.dispatch(runPingLoop());
            this.setState({
                ready: true
            });
        } catch (error) {
            Sentry.captureException(error);
            location.reload();
        }
    };

    componentDidCatch(error: Error): void {
        Sentry.captureException(error);
        this.setState({showModal: true, error: JSON.stringify(error.message)});
    }

    closeModal = () => {
        this.setState({
            showModal: false,
            error: ""
        })
    };

    async componentDidMount() {
        store.dispatch(fetchProfileAction());
        // @ts-ignore
        if (navigator.webkitTemporaryStorage) {
            // @ts-ignore
            navigator.webkitTemporaryStorage.queryUsageAndQuota((usedBytes: number, grantedBytes: number) => {
                    console.log("usedBytes", usedBytes, "grantedBytes", grantedBytes);
                    if (usedBytes === grantedBytes) {
                        alert("Достигнут лимит на базу данных " + grantedBytes + " байт")
                    }
                    if (grantedBytes < 10000) {
                        //@ts-ignore
                        navigator.webkitTemporaryStorage.requestQuota(10000, (_grantedBytes: number) => {
                                if (_grantedBytes < 10000) {
                                    alert('Выделенно всего ' + _grantedBytes + ' байт');
                                }
                            }, function (error: Error) {
                                console.log('Error', error.message);
                            }
                        );
                    }
                },
                (error: Error) => {
                    console.log('Error', error.message);
                }
            );
        }
    }

    reloadPage = () => {
        location.reload();
    };

    render() {
        if (!this.state.ready) {
            return null;
        }
        return (
            <Provider store={store}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                    <Dialog
                        open={this.state.showModal}
                        onClose={() => {
                        }}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">{"Обнаружена ошибка"}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Скопируйте текст ниже и передайте администратору.
                            </DialogContentText>
                        </DialogContent>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {this.state.error}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={this.closeModal} color="primary">
                                Продолжить работу
                            </Button>
                            <Button onClick={this.reloadPage} color="primary" autoFocus>
                                Перезагрузить
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Routs/>
                </MuiPickersUtilsProvider>
            </Provider>
        );
    }
}

export default App;
