import React, {Component} from "react";
import IconButton from "@material-ui/core/IconButton";
import moment from "moment";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import SyncBar from "../../components/SyncBar";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import {Knot} from "./reducer";
import {connect} from "react-redux";
import {Profile, RootState} from "../../reducer";
import {Dispatch} from "redux";
import {fetchKnotAction, postKnotAction, PostKnotActionPayload, setKnotSearchAction} from "./actions";
import { toggleDrawer } from "../cheks-list/actions";
import {
    formatDate,
    sortByValues
} from "../../utils";
import {Dialog} from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import {History} from "history";
import MenuDrawer from "../../components/MenuDrawer";

interface StateProps {
    knots: Knot[];
    profile: Profile | null;
    search: string;
    drawerOpen: boolean;
}

interface Props extends StateProps {
    dispatch: Dispatch;
    history: History;
}

interface State {
    showDialogAttach: boolean;
    dialogAttachTitle: string;
    knotGroupIdSender: string;
    newProductNumber: string;
    sort: SortKnotType;
    search: string;
    drawer: boolean;
}

enum SortKnotType {None, KnotNumber, KnotTitle, ProductNumber, ProductTitle, DateLastCheck}

class KnotsListScreen extends Component<Props, State> {

    state = {
        showDialogAttach: false,
        dialogAttachTitle: "",
        newProductNumber: "",
        knotGroupIdSender: "",
        sort: SortKnotType.None,
        search: "",
        drawer: false,
    };

    async componentDidMount(): Promise<void> {
        const {dispatch} = this.props;
        dispatch(fetchKnotAction());
    }

    filterSearchHandler = (knot: Knot) => {
        const {search} = this.props;
        return (knot.knot_title.toLowerCase().includes(search.toLowerCase())
            || knot.knot_number.toLowerCase().includes(search.toLowerCase())
            || knot.product_title.toLowerCase().includes(search.toLowerCase()))
    };

    renderAttachedKnots = (): JSX.Element[] => {
        const {knots} = this.props;
        const knotsOut: JSX.Element[] = [];
        knots.sort(this.sortKnot).filter(this.filterSearchHandler).map(knot => {
            if (knot.knot_number !== "") {
                knotsOut.push(this.renderAttachedKnot(knot));
            }
        });

        return knotsOut;
    };

    renderAttachedKnot = (knot: Knot) => {
        return (
            <div className="card-wrapper" key={`${knot.knot_id}-${knot.knot_group_id}`}>
                <Paper className="card check-list knot" onClick={() => this.goToKnot(knot)}>
                    <div className="df">
                        <h2>№{knot.knot_number}</h2>
                    </div>
                    <div className="df">
                        <div className="bold">{knot.knot_title}</div>
                    </div>

                    <div className="card-section">
                        <span className="product-title">{knot.product_title}</span>
                        <div className="item-info final-screen">
                            <span className="title">Дата последнего прохождения:</span>
                            <span className="value">{formatDate(knot.date_last_check, "DD.MM.YYYY HH:mm")}</span>
                        </div>
                    </div>
                </Paper>
            </div>
        )
    };

    renderUnattachedKnots = (): JSX.Element[] => {
        const {knots} = this.props;
        const knotsOut: JSX.Element[] = [];
        knots.sort(this.sortKnot).filter(this.filterSearchHandler).map(knot => {
            if (knot.knot_number === "") {
                knotsOut.push(this.renderUnattachedKnot(knot));
            }
        });

        return knotsOut;
    };

    renderUnattachedKnot = (knot: Knot) => {
        return (
            <div className="card-wrapper" key={`${knot.knot_id}-${knot.knot_group_id}`}>
                <Paper className="card check-list knot knot-group">
                    <div className="df">
                        <div className="bold">{knot.knot_title}</div>
                        <div className="knots-remain">остаток {knot.knot_count} шт.</div>
                    </div>

                    <div className="card-section">
                        <Button variant="contained" color="primary" className="btn-primary" onClick={() => {
                            this.setState({
                                showDialogAttach: true,
                                dialogAttachTitle: knot.knot_title,
                                knotGroupIdSender: knot.knot_group_id
                            });
                        }}>Взять в работу</Button>
                    </div>
                </Paper>
            </div>
        );
    };

    goToKnot = (knot: Knot) => {
        this.props.history.push('check-knot', {knot});
    };

    attachNumber = () => {
        const {dispatch} = this.props;
        if (this.state.newProductNumber.length === 0) return;
        if (this.state.knotGroupIdSender.length === 0) return;
        const postKnotPayload: PostKnotActionPayload = {
            knot_group_id: this.state.knotGroupIdSender,
            number: this.state.newProductNumber
        };
        dispatch(postKnotAction(postKnotPayload));
        this.setState({knotGroupIdSender: "", newProductNumber: ""})
    };

    getSortStyle = (it: SortKnotType, current: SortKnotType | null): string => {
        if (current === null) return "btn-change";
        return (it === current) ? "btn-change active" : "btn-change"
    };

    changeSort = (sort: SortKnotType) => {
        this.setState({sort});
    };

    sortKnot = (a: Knot, b: Knot): number => {
        switch (this.state.sort) {
            case SortKnotType.KnotNumber:
                return sortByValues(a.knot_group_id, b.knot_group_id);
            case SortKnotType.KnotTitle:
                return sortByValues(a.knot_title, b.knot_title);
            case SortKnotType.ProductNumber:
                return sortByValues(a.knot_number, b.knot_number);
            case SortKnotType.DateLastCheck:
                return sortByValues(a.date_last_check, b.date_last_check);
            case SortKnotType.None:
                return 0;
            default:
                return 0;
        }
    };

    onSearchChange = (el: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({search: el.target.value})
    };

    doSearch = () => {
        const {dispatch} = this.props;
        dispatch(setKnotSearchAction(this.state.search))
    };

    render() {
        const {profile} = this.props;

        const toggledDrawer = (open: boolean) => () => {
            this.props.dispatch(toggleDrawer(open));
        };

        return (
            <div className="in-cards knots">
                <Dialog
                    className="dialog-select-stage"
                    open={this.state.showDialogAttach}
                    maxWidth="xs" fullWidth={true} onClose={() => {
                }}>
                    <DialogTitle className="dialog-title">{this.state.dialogAttachTitle}</DialogTitle>
                    <DialogContent>
                        <TextField autoFocus margin="dense" id="number" label="Номер узла" type="text" fullWidth
                                   value={this.state.newProductNumber}
                                   onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                       this.setState({newProductNumber: event.target.value})
                                   }}/>
                    </DialogContent>
                    <DialogActions className="dialog-actions">
                        <Button onClick={() => {
                            this.setState({showDialogAttach: false, newProductNumber: "", knotGroupIdSender: ""})
                        }} color="primary">
                            Отмена
                        </Button>
                        <Button onClick={() => {
                            this.setState({showDialogAttach: false});
                            this.attachNumber();
                        }} color="primary">
                            Сохранить
                        </Button>
                    </DialogActions>
                </Dialog>

                <div className="main-wrapper check-list scroll-container">
                    <div className="df">
                        <div className="user-info-wrapper">
                            <h1>План на сегодня,&nbsp;&nbsp;<span>{moment().format("DD.MM.YYYY")}</span></h1>
                            <SyncBar  position="relative"
                                // color={"primary" as PropTypes.Color}
                            />
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
                                   placeholder="Поиск по заводскому номеру или наименованию"
                                   onChange={this.onSearchChange}
                                   value={this.state.search}
                            //onKeyPress={this.keyPressed}
                        />
                        <Button variant="contained" color="primary"
                                className="btn-primary" onClick={() => this.doSearch()}>
                            Искать</Button>
                    </div>

                    <div className="sort-wrapper">
                        <div className="sort-btns">
                            <span className="sort-title">Сортировать по:</span>

                            <Link
                                className={this.getSortStyle(SortKnotType.KnotNumber, this.state.sort)}
                                onClick={() => this.changeSort(SortKnotType.KnotNumber)}
                            >№ узла</Link>
                            <Link
                                className={this.getSortStyle(SortKnotType.KnotTitle, this.state.sort)}
                                onClick={() => this.changeSort(SortKnotType.KnotTitle)}
                            >Наимен. узла</Link>
                            <Link
                                className={this.getSortStyle(SortKnotType.ProductNumber, this.state.sort)}
                                onClick={() => this.changeSort(SortKnotType.ProductNumber)}
                            >№ изделия</Link>
                            <Link
                                className={this.getSortStyle(SortKnotType.ProductTitle, this.state.sort)}
                                onClick={() => this.changeSort(SortKnotType.ProductTitle)}
                            >Наимен. изделия</Link>

                            <Link
                                className={this.getSortStyle(SortKnotType.DateLastCheck, this.state.sort)}
                                onClick={() => this.changeSort(SortKnotType.DateLastCheck)}
                            >Дате послед. прохождения</Link>
                        </div>
                    </div>

                    <div className="cards-list-wrapper">
                        <div className="cards-list knots">
                            {this.renderUnattachedKnots()}
                        </div>
                        <div className="cards-list knots">
                            {this.renderAttachedKnots()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        knots: state.knots.knots,
        profile: state.app.profile,
        search: state.knots.search,
        drawerOpen: state.checks.drawerOpen,
    }
};

export default connect(mapStateToProps)(KnotsListScreen);
