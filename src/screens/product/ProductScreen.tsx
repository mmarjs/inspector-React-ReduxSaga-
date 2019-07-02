import * as React from "react";
import AppBar from '@material-ui/core/AppBar';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import {InlineDatePicker} from "material-ui-pickers";
import {InlineWrapper} from "material-ui-pickers/wrappers/InlineWrapper";
import {Location, History} from "history";
import {Dispatch} from "redux";
import {Check, Stage} from "../cheks-list/reducer";
import moment, {Moment} from "moment";
import {RootState} from "../../reducer";
import {connect} from "react-redux";
import {Redirect} from "react-router";
import {updateCheckAction, updateCheckOfflineAction} from "./actions";
import {List} from "immutable";
import Slider from "@material-ui/lab/Slider";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import {updateProductAction} from "../check/action";
import {formatDate} from "../../utils";
import {checkPage, rootPage} from "../../constants/config";
import {storeCheckByIdAction} from "../cheks-list/actions";
import {DialogContentText} from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";

interface LocationState {
    check: Check;
}

interface StateProps {
    checks: List<Check>;
    stages: List<Stage>;
    login: string | null;
}

interface OwnProps {
    dispatch: Dispatch;
    location: Location<LocationState>;
    history: History<LocationState>;
}

interface Props extends OwnProps, StateProps {
}

interface State {
    check: Check;
    open: boolean;
    openChangeNumber: boolean;
    newProductNumber: string;
    selectedDate: string;
    selectedStage: string;
    value: number;
    beforeValue: number;
    progressDialogShow: boolean;
}

class ProductScreen extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        if (!this.props.location.state) {
            this.props.history.replace(rootPage);
            return;
        }

        const {check} = this.props.location.state;

        if (!check) {
            this.props.history.replace(rootPage);
            return;
        }

        this.state = {
            check,
            open: false,
            openChangeNumber: false,
            selectedDate: moment().toISOString(),
            selectedStage: this.selectStage(check.stage_title),
            newProductNumber: "",
            value: parseInt(check.progress),
            beforeValue: parseInt(check.progress),
            progressDialogShow: false
        };
    }

    selectStage = (title: string): string => {
        for (const stage of this.props.stages.toArray()) {
            if (stage.title === title) {
                return stage.stage_id
            }
        }
        return "";
    };

    static getDerivedStateFromProps(props: Props) {
        if (!props.location.state) {
            props.history.replace(rootPage);
            return null;
        }
        const {check} = props.location.state;
        const newCheck = props.checks.find(_check => _check.check_id === check.check_id);
        if (!newCheck) {
            props.history.replace(rootPage);
            return null;
        }
        return {check: newCheck}
    }

    progressBarHandleChange = (event: any, value: number): void => {
        this.setState({value});
    };

    sendProgressBarValue = () => {
        this.setState(state => ({progressDialogShow: false, beforeValue: state.value}));
        const {check} = this.state;
        const {dispatch} = this.props;
        dispatch(updateCheckAction({check_id: check.check_id, progress: this.state.value}));
        dispatch(storeCheckByIdAction(check.check_id));
        dispatch(updateCheckOfflineAction({check_id: check.check_id, date_actual_start: "0", date_actual_end: "0"}));
        this.forceUpdate();
    };

    progressBarDragEnd = () => {
        if (this.state.value === 100) {
            return this.setState({progressDialogShow: true});
        }
        this.sendProgressBarValue();
    };

    picker: InlineWrapper | null = null;

    handleClickOpen = (/*e: React.SyntheticEvent*/) => {
        this.setState({open: true});
    };

    handleClose = () => {
        this.setState({open: false});
    };

    closeProgressAlert = () => {
        this.setState(state => ({progressDialogShow: false, value: state.beforeValue}));
    };

    stageAccept = (e: React.SyntheticEvent) => {
        if (!this.state.check) {
            return;
        }
        const {check} = this.state;
        const {dispatch} = this.props;
        dispatch(updateCheckAction({check_id: check.check_id, stage_id: this.state.selectedStage, progress: 0}));
        dispatch(storeCheckByIdAction(check.check_id));
        this.handleClose();
        this.openPicker(e);
        this.setState({value: 0});
    };

    handleDateChange = (date: Moment) => {
        if (this.state.selectedDate !== date.toISOString()) {
            this.setState({selectedDate: date.toISOString()});
            if (this.state.check) {
                this.props.dispatch(updateCheckAction({
                    check_id: this.state.check.check_id,
                    date_start: moment(date).format("X")
                }));
                this.props.dispatch(storeCheckByIdAction(this.state.check.check_id));
            }
        }
    };

    openPicker = (e: React.SyntheticEvent) => {
        if (this.picker !== null) {
            this.picker.open(e);
        }
    };
    openChangeNumberDialog = (/*e: React.SyntheticEvent*/) => {
        this.setState({openChangeNumber: true});

    };
    closeChangeNumberDialog = (/*e: React.SyntheticEvent*/) => {
        this.setState({openChangeNumber: false});
    };

    productNumberUpdate = () => {
        const {check} = this.state;
        if (check) {
            this.props.dispatch(updateProductAction({
                product_id: check.product_id,
                number: this.state.newProductNumber,
                position: check.product_position
            }));
            this.props.dispatch(storeCheckByIdAction(check.check_id));
        }
        this.setState({openChangeNumber: false});
    };

    goBack = () => {
        this.props.history.goBack();
    };

    renderStageSelectItem = (stage: Stage) => {
        return <FormControlLabel className="item-stage" key={stage.stage_id} value={stage.stage_id}
                                 control={<Radio color="primary"/>} label={stage.title} labelPlacement="start"/>
    };

    stageOnChange = (event: object, value: string) => {
        this.setState({
            selectedStage: value
        });
    };

    goToCheck = () => {
        const {check} = this.state;
        if (check) {
            this.props.history.push(checkPage, {check})
        }
    };

    render() {
        if (this.state === null) {
            return <Redirect to="/"/>;
        }

        const {check} = this.state;
        if (!check) {
            return <Redirect to="/"/>;
        }

        const startDate = formatDate(check.date_stage_start);
        const endDate = formatDate(check.date_stage_end);
        const factStartDate = formatDate(check.date_actual_start);
        const factEndDate = formatDate(check.date_actual_end, "DD.MM.YYYY");
        const lastCheck = formatDate(check.date_last_check, "DD.MM.YYYY HH:mm");
        const contractCode = check.contract_code ? check.contract_code : '-';
        const contractAnnex = check.contract_annex ? check.contract_annex : '-';
        return (
            <>
                <AppBar position="static" className="nav-bar"
                        style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Link onClick={this.goBack} style={{width: "100%"}}>
                        <span>Назад</span>
                    </Link>
                    <span style={{position: "absolute", right: 25}}>{this.props.login}</span>
                </AppBar>

                <Dialog
                    open={this.state.progressDialogShow}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{"Внимание"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Этап будет завершён, отменить действие будет невозможно. Подтверждаете выполнение этапа?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeProgressAlert} color="primary">
                            Нет
                        </Button>
                        <Button onClick={this.sendProgressBarValue} color="primary" autoFocus>
                            Да
                        </Button>
                    </DialogActions>
                </Dialog>

                <div className="main-wrapper product">
                    <div className="df">
                        <div className="f2">
                            <Paper className="paper product-info-only">
                                <div className="df">
                                    <h2>№ {check.product_number}</h2>
                                    <Button className="btn-change"
                                            onClick={this.openChangeNumberDialog}>{check.product_number ? "Изменить" : "Создать"}</Button>
                                </div>
                                <span
                                    className="product-title">{check.product_title} (поз.{check.product_position})</span><br/>
                                <span className="product-title">{contractCode} прил. {contractAnnex}</span>

                            </Paper>

                            <Paper className="paper current-stage-only">
                                <h4>Текущий этап</h4>
                                <div className="bold">{check.stage_title}</div>
                                <div className="info-rows">
                                    <div className="item-info">
                                        <span className="title">Плановые даты этапа:</span>
                                        <span className="value">
                                            <span className="value1">{startDate}</span>
                                                -
                                            <span className="value2">{endDate}</span>
                                        </span>
                                    </div>
                                    <div className="item-info">
                                        <span className="title">Фактические даты этапа:</span>
                                        {(factStartDate === "-" || factEndDate === "—") ?
                                            <div className="row">
                                                <span className="value">Ожидание от сервера <CircularProgress
                                                    className="indicator"
                                                    size={15} disableShrink/>
                                                </span>
                                            </div> :
                                            <span>
                                                <span className="value">
                                                    <span className="value1">{factStartDate}</span>
                                                        -
                                                    <span className="value2">{factEndDate}</span>
                                                </span>
                                            </span>
                                        }
                                    </div>
                                    <div className="item-info">
                                        <span className="title">Дата последнего прохождения:</span>
                                        <span className="value">{lastCheck}</span>
                                    </div>
                                </div>
                            </Paper>
                        </div>
                        <div className="f2 df">
                            <div className="btns-panel">
                                <div className="btn-wrapper">
                                    <Button className="btn" onClick={this.goToCheck}>Текущий этап указан верно.
                                        Приступить к контролю
                                    </Button>
                                </div>
                                <div className="btn-wrapper">
                                    <Button className="btn" onClick={this.openPicker}>Текущий этап указан верно.
                                        Изменить дату начала
                                    </Button>
                                </div>
                                <div className="btn-wrapper">
                                    <Button className="btn" onClick={this.handleClickOpen}
                                            disabled={!this.state.selectedStage}>Текущий этап указан неверно
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Paper className="paper product-progress">
                        <div className="progress-info">
                            <h1>ЗАВЕРШЕННОСТЬ ЭТАПА, %</h1>
                            <span className="progress-value">{this.state.value}%</span>
                        </div>
                        <Slider
                            className="progress-slider"
                            step={10}
                            value={this.state.value}
                            onDragEnd={this.progressBarDragEnd}
                            onChange={this.progressBarHandleChange}
                        />
                    </Paper>
                </div>

                <InlineDatePicker
                    className="date-picker"
                    onlyCalendar
                    value={this.state.selectedDate}
                    onChange={this.handleDateChange}
                    ref={(el: InlineWrapper) => {
                        this.picker = el;
                    }}
                />

                <Dialog className="dialog-select-stage" open={this.state.open} onClose={this.handleClose}>
                    <DialogTitle className="dialog-title">Выберите этап</DialogTitle>
                    <DialogContent>
                        <RadioGroup name="product-stage" onChange={this.stageOnChange} value={this.state.selectedStage}>
                            {this.props.stages.map(this.renderStageSelectItem)}
                        </RadioGroup>
                    </DialogContent>
                    <DialogActions className="dialog-actions">
                        <Button onClick={this.handleClose} color="primary">Отмена</Button>
                        <Button onClick={this.stageAccept} color="primary">Ок</Button>
                    </DialogActions>
                </Dialog>

                <Dialog className="dialog-select-stage" open={this.state.openChangeNumber} onClose={this.handleClose}>
                    <DialogTitle className="dialog-title">Введите заводской номер</DialogTitle>
                    <DialogContent>
                        <TextField className="input-product-id" defaultValue={check.product_number}
                                   onChange={(el: React.ChangeEvent<HTMLInputElement>) => {
                                       this.setState({newProductNumber: el.target.value})
                                   }}/>
                    </DialogContent>
                    <DialogActions className="dialog-actions">
                        <Button onClick={this.closeChangeNumberDialog} color="primary">Отмена </Button>
                        <Button onClick={this.productNumberUpdate} color="primary">Ок</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        checks: state.checks.list,
        stages: state.checks.stages,
        login: state.login.login
    }
};

export default connect(mapStateToProps)(ProductScreen);
