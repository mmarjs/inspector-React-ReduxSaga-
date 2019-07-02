import * as React from "react";
import "./check-list.css";
import {withStyles, WithStyles} from '@material-ui/core/styles';
import styles from './styles'
import {History} from "history";
import {Dispatch} from "redux";
import {connect} from "react-redux";
import {fetchChecksAsapAction, setSearchValueAction, toggleNetworkMode, toggleDrawer} from "./actions";
import {Profile, RootState} from "../../reducer";
import {List} from "immutable";
import {Check} from "./reducer";
import moment from "moment";
import {setCheckAction} from "../check/action";
import {ChangeEvent} from "react";
import Paper from "@material-ui/core/Paper";
import {
    formatDate,
    sortByDateStart,
    sortByValues
} from "../../utils";
import {fetchStagesAction} from "../product/actions";
import Button from "@material-ui/core/Button";
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import {FormControlLabel, PropTypes} from "@material-ui/core";
import Link from "@material-ui/core/Link";
import {networkPage, productPage, rootPage} from "../../constants/config";
import SyncBar from "../../components/SyncBar";
import Typography from "@material-ui/core/Typography";
import IconButton from '@material-ui/core/IconButton';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ArrowDropDown';
import CircularProgress from "@material-ui/core/CircularProgress";
import MenuDrawer from '../../components/MenuDrawer';
import style from './style.module.scss';

interface StateProps {
    checks: List<Check>;
    isFetch: boolean;
    search: string;
    isNetwork: boolean;
    login: string | null;
    profile: Profile | null;
    drawerOpen: boolean;
}

enum SortType {StageTitle, ProductNumber, ProductTitle, LastDateCheck, ContractCode, ProductPosition, ContractAnnex, DateStart, DateEnd}

interface State {
    searchString: string;
    disableFilter: boolean
    sortType: SortType;
    filter: boolean;
    expanded: string;
    drawer: boolean;
}

interface Props extends StateProps, WithStyles<typeof styles> {
    history: History;
    dispatch: Dispatch;
    location: Location
}

class ChecksListScreen extends React.PureComponent<Props, State> {
    state = {
        searchString: "",
        disableFilter: false,
        sortType: SortType.StageTitle,
        filter: false,
        expanded: '',
        drawer: false,
    };

    goToProduct = (check: Check) => {
        this.props.dispatch(setCheckAction(check));
        this.props.history.push(productPage, {check})
    };

    componentDidMount(): void {
        if (this.props.location.pathname === networkPage) {
            this.props.dispatch(toggleNetworkMode(true))
        } else {
            this.props.dispatch(toggleNetworkMode(false))
        }

        this.props.dispatch(fetchChecksAsapAction());
        this.props.dispatch(fetchStagesAction());
        this.setState({searchString: this.props.search})
    }

    search = (text: ChangeEvent<HTMLInputElement>) => {
        this.setState({searchString: text.target.value});
    };

    renderRow = (check: Check) => {
        const startDate = formatDate(check.date_stage_start);
        const endDate = formatDate(check.date_stage_end);
        const cargoDate = formatDate(check.date_cargo);
        const factStartDate = formatDate(check.date_actual_start);
        const factEndDate = formatDate(check.date_actual_end);
        const lastCheck = formatDate(check.date_last_check, "DD.MM.YYYY HH:mm");
        const contractCode = check.contract_code ? check.contract_code : '-';
        const contractAnnex = check.contract_annex ? check.contract_annex : '-';

        return (
            <div
                // className="card-wrapper"
                className={style.cardWrapper}
                onClick={() => this.goToProduct(check)} key={check.check_id}>
                <Paper
                    // className={check.progress == '100' ? "card check-list complete" : "card check-list"}
                    className={check.progress == '100' ? `${style.card} ${style.complete}` : style.card}
                >
                    <div
                        // className="df"
                        className={style.df}
                    >
                        {check.product_number ? <h2>№{check.product_number}</h2> : <h2>Создать зав. номер</h2>}
                        <div
                            // className="progress"
                            className={style.progress}
                        >{check.progress}%</div>
                    </div>
                    <div
                        // className="bold"
                        className={style.bold}
                    >{check.stage_title}</div>
                    <div
                        // className="card-section"
                        className={style.cardSection}
                    >
                        <span
                            // className="product-title"
                            className={style.productTitle}
                        >{contractCode} прил. {contractAnnex}</span>
                        <span
                            // className="product-title"
                            className={style.productTitle}
                        >{check.product_title} (позиция {check.product_position})</span>
                        <div className="info-row">
                            <div
                                // className="item-info"
                                className={style.itemInfo}
                            >
                                <span className="title">Плановые даты этапа:</span>
                                <span
                                    // className="value"
                                    className={style.value}
                                >
                                    <span className="value1">{startDate}</span>
                                    -
                                    <span className="value2">{endDate}</span>
                                </span>
                            </div>
                            <div
                                // className="item-info"
                                className={style.itemInfo}
                            >
                                <span className="title">Фактические даты этапа:</span>
                                <span
                                    // className="value"
                                    className={style.value}
                                >
                                    <span className="value1">{factStartDate}</span>
                                    -
                                    <span className="value2">{factEndDate}</span>
                                </span>
                            </div>
                            <div
                                // className="item-info"
                                className={style.itemInfo}
                            >
                                <span className="title">Плановая дата поставки:</span>
                                <span
                                    // className="value"
                                    className={style.value}
                                >{cargoDate}</span>
                            </div>
                            <div
                                // className="item-info"
                                className={style.itemInfo}
                            >
                                <span className="title">Дата последнего прохождения:</span>
                                <span
                                    // className="value"
                                    className={style.value}
                                >{lastCheck}</span>
                            </div>
                        </div>
                    </div>
                </Paper>
            </div>
        );
    };

    renderNetworkRow = (check: Check) => {
        const {checks} = this.props;
        const expanded = this.state.expanded === check.check_id;

        return (
            <ExpansionPanel className="list-element" key={`NetworkRow-${check.check_id}`}
                            expanded={expanded}
                            onChange={() => this.setState({expanded: expanded ? '' : check.check_id})}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                    <Typography>{`${check.product_number} ${check.product_title} (поз. ${check.product_position}) ${check.contract_code} ${check.contract_annex}`}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div className="table">
                        {expanded && checks.sort(sortByDateStart)
                            .map((row: Check) => this.renderNetworkRow2(check, row))}
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    };

    renderNetworkRow2 = (product: Check, check: Check) => {
        const name1 = `${product.product_number} ${product.product_title} (поз ${product.product_position}) ${product.contract_code}`;
        const name2 = `${check.product_number} ${check.product_title} (поз ${check.product_position}) ${check.contract_code}`;

        return (
            <div key={check.check_id}>
                {name1 == name2 ? (
                    <div
                        className={moment().isBetween(moment.unix(parseInt(check.date_actual_start)), moment.unix(parseInt(check.date_actual_end))) ? "row-wrapper active" : "row-wrapper"}
                        onClick={() => this.goToProduct(check)}>
                        <div className="step-circle">
                            <div className="circle"/>
                            <div className="vert-line"/>
                        </div>
                        <div className="row">
                            <div>{`${check.stage_title}`}</div>
                            <div>{check.progress}%</div>
                            <div className="table-dates">
                                <span>{formatDate(check.date_stage_start)}</span>
                                <span>{formatDate(check.date_actual_start)}</span>
                            </div>
                            <div className="table-dates">
                                <span>{formatDate(check.date_stage_end)}</span>
                                <span>{formatDate(check.date_actual_end)}</span>
                            </div>
                            <div className={check.progress == '100' ? "row-back complete" : "row-back"}
                                 style={{width: `${check.progress}%`}}/>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    };

    searchByField(check: Check) {
        const {search} = this.props;

        if (search === "") {
            return true;
        }

        const contract_code = check.contract_code ? check.contract_code.toLowerCase() : "";
        const product_number = check.product_number ? check.product_number.toLowerCase() : "";
        const product_title = check.product_title ? check.product_title.toLowerCase() : "";
        const stage_title = check.stage_title ? check.stage_title.toLowerCase() : "";
        const contract_annex = check.contract_annex ? check.contract_annex.toLowerCase() : "";

        return contract_code.includes(search.toLowerCase()) || product_number.includes(search.toLocaleLowerCase())
            || product_title.includes(search.toLocaleLowerCase())
            || stage_title.includes(search.toLocaleLowerCase())
            || contract_annex.includes(search.toLocaleLowerCase())
    }

    filterByComplete(check: Check) {
        if (this.state.disableFilter) {
            return true;
        }
        const start = check.date_stage_start;
        const end = check.date_stage_end;

        return moment().isBetween(moment.unix(parseInt(start)), moment.unix(parseInt(end)))
            || moment().isBetween(moment.unix(parseInt(check.date_actual_start)), moment.unix(parseInt(check.date_actual_end)))
            && check.progress !== "100";
    };

    changeSort(sortType: SortType) {
        this.setState({sortType})
    }

    keyPressed = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.charCode === 13) {
            this.doSearch();
        }
    };

    doSearch() {
        this.props.dispatch(setSearchValueAction(this.state.searchString));
    }

    toggleViewMode(value: boolean) {
        if (value === false) {
            this.props.dispatch(toggleNetworkMode(false));
            this.props.history.push(rootPage);
        }
        if (value === true) {
            this.props.dispatch(toggleNetworkMode(true));
            this.props.history.push(networkPage);
        }
    }

    getSortStyle = (it: SortType, current: SortType): string => {
        return (it === current) ? "btn-change active" : "btn-change"
    };

    sortChecks = (a: Check, b: Check): number => {
        switch (this.state.sortType) {
            case SortType.StageTitle:
                return sortByValues(a.stage_title, b.stage_title);
            case SortType.ProductNumber:
                return sortByValues(a.product_number, b.product_number);
            case SortType.ProductTitle:
                return sortByValues(a.product_title, b.product_title);
            case SortType.LastDateCheck:
                return sortByValues(a.date_last_check, b.date_last_check);
            case SortType.ContractCode:
                return sortByValues(a.contract_code, b.contract_code);
            case SortType.ProductPosition:
                return sortByValues(a.product_position, b.product_position);
            case SortType.ContractAnnex:
                return sortByValues(a.contract_annex, b.contract_annex);
            case SortType.DateStart:
                return sortByValues(a.date_stage_start, b.date_stage_start);
            case SortType.DateEnd:
                return sortByValues(a.date_stage_end, b.date_stage_end);
            default:
                return 0;
        }
    };

    renderFetchIndicator = () => {
        return (
            <div style={{display: "flex", flex: 1, justifyContent: "center", alignItems: "center"}}>
                <CircularProgress size={20} disableShrink/>
            </div>
        );
    };

    render() {
        const {checks} = this.props;

        let networkCheck: { [key: string]: Check } = {};
        checks.filter(check => this.props.search ? this.searchByField(check) : this.filterByComplete(check)).forEach(el => {
            // console.log(`${el.product_id}_${el.product_position}`,networkCheck[`${el.product_id}_${el.product_position}`])
            if (!networkCheck[`${el.product_id}_${el.product_position}`]) {
                networkCheck[`${el.product_id}_${el.product_position}`] = el
                // console.log(`${el.product_id}_${el.product_position}`, networkCheck[`${el.product_id}_${el.product_position}`])
            }
        });

        //  console.log('nl',Object.keys(networkCheck) )
        //  console.log('nl',Object.keys(networkCheck).length )
        // console.log( Object.keys(networkCheck).map(k => networkCheck[k])
        //      .filter(check =>this.filterByComplete(check)).length)
        //  console.table( checks.filter(check => this.props.search ? this.searchByField(check) : this.filterByComplete(check)).map(el=>{
        //      let logV:any =  {check_id:el.check_id,  product_id:el.product_id, product_position:el.product_position, product_title:el.product_title}
        //      return logV
        //  }).toArray()  )

        const toggledDrawer = (open: boolean) => () => {
            this.props.dispatch(toggleDrawer(open));
        };

        return (
            <>
                <div className={!this.props.isNetwork ? "in-cards" : "in-list"}>
                    <div className="main-wrapper check-list scroll-container">
                        <div className="df">
                            <div className="search-wrapper">
                                <TextField className="search-box" id="time" type="string"
                                           placeholder="Поиск по заводскому номеру или наименованию"
                                           onChange={this.search}
                                           value={this.state.searchString}
                                           onKeyPress={this.keyPressed}/>
                                <Button variant="contained" color="primary"
                                        className="btn-primary"
                                        onClick={() => this.doSearch()}>
                                    Искать</Button>
                            </div>

                            <div className="user-info-wrapper">
                                <h1>План на сегодня,&nbsp;&nbsp;<span>{moment().format("DD.MM.YYYY")}</span></h1>
                                <SyncBar position="relative" color={"primary" as PropTypes.Color}/>
                            </div>

                            <div className="view-btns">
                                <IconButton onClick={toggledDrawer(true)}>
                                    <div className="icon-burger" color="white"/>
                                </IconButton>

                                <MenuDrawer open={this.props.drawerOpen} onClose={toggledDrawer(false)} />
                            </div>
                        </div>

                        <div className="search-wrapper">
                            <TextField className="search-box" id="time" type="string"
                                       placeholder="Поиск по заводскому номеру или наименованию" onChange={this.search}
                                       value={this.state.searchString}
                                       onKeyPress={this.keyPressed}/>
                            <Button variant="contained" color="primary"
                                    className="btn-primary"
                                    onClick={() => this.doSearch()}>
                                Искать</Button>
                        </div>

                        {process.env.NODE_ENV === 'development' ? <FormControlLabel
                            control={
                                <Checkbox
                                    onChange={() => this.setState(state => ({disableFilter: !state.disableFilter}))}
                                    checked={this.state.disableFilter}
                                    color="primary"
                                />
                            }
                            className="notif"
                            label="Показывать все (DEV)"
                        /> : null}

                        <div className="sort-wrapper">
                            <div className="sort-btns">
                                <span className="sort-title">Сортировать по:</span>

                                <Link href="#" className={this.getSortStyle(SortType.StageTitle, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.StageTitle)}>Текущему этапу</Link>
                                <Link href="#"
                                      className={this.getSortStyle(SortType.ProductNumber, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.ProductNumber)}>Зав. номеру</Link>
                                <Link href="#" className={this.getSortStyle(SortType.ProductTitle, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.ProductTitle)}>Наименованию изделия</Link>
                                <Link href="#"
                                      className={this.getSortStyle(SortType.LastDateCheck, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.LastDateCheck)}>Дате последнего прохождения</Link>

                                <Link href="#" className={this.getSortStyle(SortType.ContractCode, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.ContractCode)}>Номер договора</Link>
                                <Link href="#"
                                      className={this.getSortStyle(SortType.ContractAnnex, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.ContractAnnex)}>Номер приложения</Link>
                                <Link href="#"
                                      className={this.getSortStyle(SortType.ProductPosition, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.ProductPosition)}>Позиция</Link>
                                <Link href="#" className={this.getSortStyle(SortType.DateStart, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.DateStart)}>Дата начала этапа</Link>
                                <Link href="#" className={this.getSortStyle(SortType.DateEnd, this.state.sortType)}
                                      onClick={() => this.changeSort(SortType.DateEnd)}>Дата окончания этапа</Link>
                            </div>
                        </div>

                        <div className="cards-list">
                            {checks.filter(check => this.props.search ? this.searchByField(check) : this.filterByComplete(check))
                                .sort(this.sortChecks)
                                .map(row => this.renderRow(row))}
                            {this.props.isFetch && checks.count() === 0
                                ? this.renderFetchIndicator()
                                : checks.filter(check => this.props.search ? this.searchByField(check) : this.filterByComplete(check))
                                    .sort(this.sortChecks)
                                    .map(row => this.renderRow(row))}
                        </div>

                        <div className={this.state.filter ? "view-list filter" : "view-list"}>
                            <div className="sort-back"/>
                            <div className="sort-wrapper">
                                <div className="sort-btns">
                                    <span className="sort-title">Сортировать по:</span>

                                    <Link href="#"
                                          className={this.getSortStyle(SortType.ContractCode, this.state.sortType)}
                                          onClick={() => this.changeSort(SortType.ContractCode)}>Номер договора</Link>
                                    <Link href="#"
                                          className={this.getSortStyle(SortType.ContractAnnex, this.state.sortType)}
                                          onClick={() => this.changeSort(SortType.ContractAnnex)}>Номер приложения</Link>
                                    <Link href="#"
                                          className={this.getSortStyle(SortType.ProductNumber, this.state.sortType)}
                                          onClick={() => this.changeSort(SortType.ProductNumber)}>Зав. номеру</Link>
                                    <Link href="#"
                                          className={this.getSortStyle(SortType.ProductTitle, this.state.sortType)}
                                          onClick={() => this.changeSort(SortType.ProductTitle)}>Наименованию изделия</Link>
                                </div>
                            </div>
                            <Button color="primary" className="filter-btn"
                                    onClick={() => this.setState(state => ({filter: !state.filter}))}>{""}</Button>

                            <div className="elements">
                                {Object.keys(networkCheck).map(k => networkCheck[k])
                                    .filter(check => this.props.search ? this.searchByField(check) : this.filterByComplete(check))
                                    .sort(this.sortChecks)
                                    .map((row) => this.renderNetworkRow(row))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        isFetch: state.checks.isFetch,
        checks: state.checks.list,
        search: state.checks.search,
        isNetwork: state.checks.isNetwork,
        login: state.login.login,
        profile: state.app.profile,
        drawerOpen: state.checks.drawerOpen,
    }
};

export default connect(mapStateToProps)(withStyles(styles)(ChecksListScreen));
