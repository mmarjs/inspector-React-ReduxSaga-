import * as React from "react";
import Link from "@material-ui/core/Link";
import AppBar from "@material-ui/core/AppBar";
import {Dispatch} from "redux";
import {History, Location} from "history";
import {Check, Operation} from "../cheks-list/reducer";
import {List} from "immutable";
import {connect} from "react-redux";
import {RootState} from "../../reducer";
import {Redirect} from "react-router";
import Paper from "@material-ui/core/Paper";
import {formatDate} from "../../utils";
import {rootPage, wizardPage} from "../../constants/config";

interface State {
    open: boolean;
    check: Check;
    productId: string;
}

interface StateProps {
    checks: List<Check>;
    login: string | null;
}

interface OwnProps {
    dispatch: Dispatch;
    location: Location;
    history: History;
}

interface Props extends OwnProps, StateProps {
}

class CheckScreen extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        if (!props.location.state) {
            this.props.history.replace(rootPage);
            return;
        }

        const {check} = props.location.state;

        if (!check) {
            this.props.history.replace(rootPage);
            return;
        }

        this.state = {
            check: check as Check,
            open: false,
            productId: "",
        };
    }

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

    goBack = () => {
        this.props.history.goBack();
    };

    goToWizard = (operation: Operation) => {
        this.props.history.push(wizardPage, {operation})
    };

    renderOperationNew = (row: Operation) => {
        const methods = row.method.map(method => {
            return <span key={method.id}>{method.title}</span>
        });

        const {check} = this.state;
        const lastDateCheck = formatDate(check.date_last_check, "DD.MM.YYYY HH:mm");

        return (
            <div className="card-wrapper" key={row.operation_id} onClick={() => this.goToWizard(row)}>
                <Paper className="card">
                    <div className="card-head">
                        <h2>{row.group}</h2>
                        <div className="bold">{row.title}</div>
                    </div>
                    <div className="frequency-and-method">
                        <span>Частота и метод проверки:</span>
                        <div className="frequency-and-method-values">{methods}</div>
                    </div>
                    <div className="lastcheck-datetime">
                        <span>Дата и время последней проверки:</span>
                        <div className="datetime">
                            {lastDateCheck}
                        </div>
                    </div>
                </Paper>
            </div>
        )
    };

    render() {
        if (this.state === null) {
            return <Redirect to={rootPage}/>;
        }

        const {check} = this.state;
        const startDate = formatDate(check.date_stage_start);
        const endDate = formatDate(check.date_stage_end);
        const factStartDate = formatDate(check.date_actual_start);
        const factEndDate = formatDate(check.date_actual_end, "DD.MM.YYYY");
        const lastDateCheck = formatDate(check.date_last_check, "DD.MM.YYYY HH:mm");
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

                <div className="main-wrapper scroll-container check">
                    <Paper className="paper prod-info-and-curr-stage">
                        <div className="product-info">
                            <h2>№ {check.product_number}</h2>
                            <span
                                className="product-title">{check.product_title} (поз.{check.product_position})</span><br/>
                            <span className="product-title">{contractCode} прил. {contractAnnex}</span>

                        </div>
                        <div className="current-stage">
                            <h4>Текущий этап</h4>
                            <div className="bold">{check.stage_title}</div>
                            <div className="info-rows">
                                <div className="item-info final-screen">
                                    <span className="title">Плановые даты этапа:</span>
                                    <span className="value"><span className="value1">{startDate}</span> - <span
                                        className="value2">{endDate}</span></span>
                                </div>
                                <div className="item-info final-screen">
                                    <span className="title">Фактические даты этапа:</span>
                                    {(factStartDate === "-" || factEndDate === "—") ?
                                        <span className="value">Ожидание от сервера...</span> :
                                        <span>
                                        <span className="value"><span className="value1">{factStartDate}</span> - <span
                                            className="value2">{factEndDate}</span></span>
                                            </span>}
                                </div>
                                <div className="item-info final-screen">
                                    <span className="title">Дата последнего прохождения:</span>
                                    <span className="value">{lastDateCheck}</span>
                                </div>
                            </div>
                        </div>
                    </Paper>
                    <div className="cards-list">
                        {check.operations.map(this.renderOperationNew)}
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        checks: state.checks.list,
        login: state.login.login
    }
};

export default connect(mapStateToProps)(CheckScreen);
