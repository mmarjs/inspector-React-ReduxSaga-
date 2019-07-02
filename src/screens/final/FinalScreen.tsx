import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import Link from "@material-ui/core/Link";
import Paper from '@material-ui/core/Paper';
import Slider from '@material-ui/lab/Slider';
import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import CheckIcon from '@material-ui/icons/Check';
import {Dispatch} from "redux";
import {History, Location} from "history";
import {connect} from "react-redux";
import {RootState} from "../../reducer";
import {Check, Operation, RequestFeature} from "../cheks-list/reducer";
import {Redirect} from "react-router";
import {Map} from "immutable";
import {RequestUpdateCheckPayload, updateCheckAction} from "../product/actions";
import {DialogContentText, TextField} from "@material-ui/core";
import {resetCheckAction} from "../check/action";
import {sendFeatureActions} from "../../actions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import {
    fetchChecksAction,
    setFeaturesTempAction, storeCheckByIdAction,
    updateDiscrepancyAction,
    updateFeaturesAction
} from "../cheks-list/actions";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {formatDate} from "../../utils";
import {rootPage} from "../../constants/config";

interface OwnProps {
    dispatch: Dispatch;
    location: Location<LocationState>;
    history: History;
}

interface LocationState {
    operation: Operation;
    featuresData: Map<string, RequestFeature>;
}

interface StateProps {
    check: Check | null;
}

interface Props extends OwnProps, StateProps {
}

interface State {
    value: number;
    comment: string;
    showCommentModal: boolean;
    discrepancy: boolean;
    beforeValue: number;
    progressDialogShow: boolean;
}

class FinalScreen extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        let value: number = 0;
        let comment = "";

        if (props.check) {
            value = parseInt(props.check.progress);
            comment = props.check.note;
        }

        let discrepancy = false;

        if (props.location && props.location.state && props.location.state.operation) {
            discrepancy = props.location.state.operation.discrepancy;
        }

        this.state = {
            value,
            beforeValue: value,
            showCommentModal: false,
            progressDialogShow: false,
            comment,
            discrepancy
        }
    }

    goBack = () => {
        this.props.history.goBack();
    };

    finish = () => {
        const {dispatch, location} = this.props;
        const features = location.state.featuresData.valueSeq().toArray();
        dispatch(sendFeatureActions(features));
        if (this.props.check) {
            const {operation} = this.props.location.state;
            dispatch(updateFeaturesAction(this.props.check.check_id, operation.operation_id, features));
            dispatch(storeCheckByIdAction(this.props.check.check_id));
            dispatch(updateDiscrepancyAction({
                discrepancy: this.state.discrepancy,
                operation_id: operation.operation_id
            }))
        }

        dispatch(resetCheckAction());
        dispatch(fetchChecksAction());
        dispatch(setFeaturesTempAction(Map()));
        this.forceUpdate();
    };

    progressBarHandleChange = (event: any, value: number) => {
        this.setState({value});
    };

    sendProgressBarValue = () => {
        this.setState(state => ({progressDialogShow: false, beforeValue: state.value}));
        const {check} = this.props;
        if (check) {
            this.props.dispatch(updateCheckAction({check_id: check.check_id, progress: this.state.value}));
            this.props.dispatch(storeCheckByIdAction(check.check_id));
            this.forceUpdate();
        }
    };

    progressBarDragEnd = () => {
        if (this.state.value === 100) {
            return this.setState({progressDialogShow: true});
        }
        this.sendProgressBarValue();
    };

    closeProgressAlert = () => {
        this.setState(state => ({progressDialogShow: false, value: state.beforeValue}));
    };

    sendComment = () => {
        this.setState({showCommentModal: false});
        const {dispatch} = this.props;
        const {check} = this.props;
        if (check) {
            const data: RequestUpdateCheckPayload = {
                check_id: check.check_id,
                progress: this.state.value,
                complite: true
            };
            if (this.state.comment) {
                data.note = this.state.comment;
            }
            dispatch(updateCheckAction(data));
            dispatch(storeCheckByIdAction(check.check_id));
        }
    };

    render() {

        const {check} = this.props;
        const {operation} = this.props.location.state;

        if (!check) {
            return <Redirect to={rootPage}/>;
        }

        const startDate = formatDate(check.date_stage_start);
        const endDate = formatDate(check.date_stage_end);
        const factStartDate = formatDate(check.date_actual_start);
        const factEndDate = formatDate(check.date_actual_end, "DD.MM.YYYY");
        const lastCheck = formatDate(check.date_last_check, "DD.MM.YYYY HH:mm");
        const contractCode = check.contract_code?check.contract_code:'-';
        const contractAnnex = check.contract_annex?check.contract_annex:'-';

        return (
            <>
                <AppBar position="static" className="nav-bar">
                    <Link className="back" onClick={this.goBack} style={{width: "100%"}}>
                        <span>Назад</span>
                    </Link>
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

                <div className="main-wrapper final">
                    <Paper className="paper prod-info-and-curr-stage">
                        <div className="product-info">
                            <h2>№ {check.product_number}</h2>
                            <span className="product-title">{check.product_title} (поз.{check.product_position})</span><br/>
                            <span className="product-title">{contractCode} прил. {contractAnnex}</span>
                        </div>
                        <div className="current-stage">
                            <h4>Текущий этап</h4>
                            <div className="bold">{operation.title}</div>
                            <div className="info-rows">
                                <div className="item-info">
                                    <span className="title">Плановые даты этапа:</span>
                                    <span className="value"><span className="value1">{startDate}</span> - <span
                                        className="value2">{endDate}</span></span>
                                </div>
                                <div className="item-info">
                                    <span className="title">Фактические даты этапа:</span>
                                    {(factStartDate === "-" || factEndDate === "—") ?
                                        <span className="value">Ожидание от сервера...</span> :
                                        <span>
                                            <span className="value">
                                                <span className="value1">{factStartDate}</span>
                                                -
                                                <span className="value2">{factEndDate}</span>
                                            </span>
                                        </span>}
                                </div>
                                <div className="item-info">
                                    <span className="title">Дата последнего прохождения:</span>
                                    <span className="value">{lastCheck}</span>
                                </div>
                            </div>
                        </div>
                    </Paper>

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

                    <div className="item-info final-screen">
                        <span className="title">Ожидаемая дата завершения этапа:&nbsp;&nbsp;</span>
                        <span
                            className="value">{formatDate(check.date_actual_end, "DD.MM.YYYY", "(необходима синхроинзация)")}</span>
                    </div>

                    <Paper className="paper">
                        <div className="paper-title">Общий комментарий</div>
                        <div className="paper-content">
                            {this.state.comment}
                        </div>
                        <Button variant="contained" color="primary" className="btn-primary"
                                onClick={() => {
                                    this.setState({showCommentModal: true});
                                }}>Изменить</Button>
                    </Paper>

                    <FormControlLabel
                        control={
                            <Checkbox
                                onChange={() => this.setState({discrepancy: !this.state.discrepancy})}
                                checked={this.state.discrepancy}
                                color="primary"
                            />
                        }
                        className="notif"
                        label="Выписано Уведомление о несоответствии"
                    />

                    <div className="footer-btns">
                        <Button className="btn-primary" onClick={this.goBack}><ArrowBackIcon className="back-icon"/>Предыдущая
                            характеристика</Button>
                        <Button className="btn-primary" onClick={this.finish}><CheckIcon className="back-icon"/>Завершить
                            проверку</Button>
                    </div>

                    <Dialog className="dialog-comment" open={this.state.showCommentModal} onClose={() => this.setState({showCommentModal: false})}>
                        <DialogTitle className="dialog-title">Комментарий</DialogTitle>
                        <DialogContent className="dialog-content">
                            <TextField multiline rowsMax="4" fullWidth value={this.state.comment || ""}
                                       onChange={(el: React.ChangeEvent<HTMLInputElement>) => {
                                           this.setState({comment: el.target.value})
                                       }}/>
                        </DialogContent>
                        <DialogActions className="dialog-actions">
                            <Button onClick={this.sendComment} color="primary">Ок</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: RootState) => {
    return {
        check: state.check.check
    }
};

export default connect(mapStateToProps)(FinalScreen);
