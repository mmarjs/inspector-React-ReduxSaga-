import React from "react";
import Link from "@material-ui/core/Link";
import AppBar from "@material-ui/core/AppBar";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";
import {formatDate} from "../../utils";
import {History, Location} from "history";
import {Knot, KnotOperation, Product} from "../knots-list/reducer";
import {API_VERSION, PRODUCTS_API} from "../../constants/config";
import {connect} from "react-redux";
import {RootState} from "../../reducer";
import {postKnotAction, PostKnotActionPayload} from "../knots-list/actions";
import {Dispatch} from "redux";

interface StateProps {
    token: string;
}

interface LocationState {
    knot: Knot;
}

interface State {
    showProductDialog: boolean;
    knot: Knot;
    products: Product[];
    position: string;
    product: Product | null;
    search: string;
}

interface Props extends StateProps {
    history: History;
    dispatch: Dispatch;
    location: Location<LocationState>;
}

class CheckKnotScreen extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const {knot} = this.props.location.state;

        this.state = {
            showProductDialog: false,
            knot: knot,
            products: [],
            position: String(knot.position),
            product: null,
            search: ""
        };
    }

    async componentDidMount(): Promise<void> {
        await this.fetchProduct();
    }

    goBack = () => {
        this.props.history.goBack();
    };

    handleClickOpen = () => {
        this.setState({showProductDialog: true});
    };

    handleClose = () => {
        this.setState({showProductDialog: false});
    };

    attachProduct = () => {
        const {knot, product} = this.state;
        const {dispatch} = this.props;
        if (product === null) return;
        const payload: PostKnotActionPayload = {
            knot_id: knot.knot_id,
            product_id: product.number,
            position: product.position
        };
        dispatch(postKnotAction(payload));
        this.setState({showProductDialog: false});
    };

    fetchProduct = async () => {
        const {knot} = this.state;
        const {token} = this.props;
        try {
            const result: { success: string, response: Product[] } = await fetch(`${PRODUCTS_API}?product_id=${knot.product_id}`, {
                method: 'GET',
                headers: {token: token, v: API_VERSION},
            }).then(res => res.json());
            for (const product of result.response as Product[]) {
                if (String(product.position) === String(knot.position)) {
                    this.setState({product: product})
                }
            }
            this.setState({products: result.response as Product[]})
        } catch (error) {
            console.log(error);
        }
    };

    renderOperation = (operation: KnotOperation) => {
        const methods = operation.method.map(method => {
            return <span key={method.id}>{method.title}</span>
        });

        const {knot} = this.state;
        const lastDateCheck = formatDate(knot.date_last_check, "DD.MM.YYYY HH:mm");

        return (
            <div className="card-wrapper" key={operation.operation_id} onClick={() => this.goToWizard(operation)}>
                <Paper className="card">
                    <div className="card-head">
                        <h2>{operation.group}</h2>
                        <div className="bold">{operation.title}</div>
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

    goToWizard = (operation: KnotOperation) => {
        this.props.history.push("wizard-knot", {
            knot: this.state.knot,
            operation: operation
        })
    };

    selectProduct = (product: Product) => {
        this.setState({position: product.position, product});
    };

    renderProduct = (product: Product) => {
        const style = (String(this.state.position) === String(product.position)) ? "row selected" : "row";
        return (
            <div className={style} key={product.position} onClick={() => this.selectProduct(product)}>
                <div>{`${product.title} поз. ${product.position}`}</div>
                <div className="binded"/>
            </div>
        )
    };

    filterProducts = (product: Product) => {
        return product.title.includes(this.state.search);
    };

    render() {
        const {knot} = this.state;
        return (
            <>
                <AppBar position="static" className="nav-bar"
                        style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Link onClick={this.goBack} style={{width: "100%"}}>
                        <span>Назад</span>
                    </Link>
                </AppBar>

                <div className="main-wrapper scroll-container check knot">
                    <div className="df">
                        <div className="f2">
                            <Paper className="paper knot-info">
                                <div className="df">
                                    <h2>№ {knot.knot_number}</h2>
                                </div>
                                <div className="bold">{knot.knot_title}</div>
                                <span className="product-title">{knot.product_title}</span>
                            </Paper>
                        </div>
                        <div className="f2 bind-to-product">
                            <Button className="btn" onClick={this.handleClickOpen}>Привязать к
                                изделию</Button>
                            <div className="item-info">
                                <span className="title">Дата последнего прохождения:</span>
                                <span className="value">{formatDate(knot.date_last_check, "DD.MM.YYYY HH:mm")}</span>
                            </div>
                        </div>
                    </div>
                    <div className="df operation-group">
                        <h2>Группа операций:</h2>
                        <span>Контроль разрешительной документации</span>
                    </div>
                    <div className="cards-list">
                        {knot.operations.map(this.renderOperation)}
                    </div>
                </div>

                <Dialog
                    className="dialog-bind-product"
                    open={this.state.showProductDialog}
                    onClose={this.handleClose}
                    fullWidth={true}
                    maxWidth="lg"
                >
                    <DialogTitle className="dialog-title">{knot.knot_title}</DialogTitle>
                    <DialogContent>
                        <div className="search-wrapper">
                            <TextField className="search-box" id="time" type="string"
                                       placeholder="Поиск по заводскому номеру или наименованию"
                                       onChange={(el: React.ChangeEvent<HTMLInputElement>) => this.setState({search: el.target.value})}
                                       value={this.state.search}/>
                        </div>
                        <div className="row-wrapper">
                            {this.state.products.filter(this.filterProducts).map(this.renderProduct)}
                        </div>
                    </DialogContent>
                    <DialogActions className="dialog-actions">
                        <Button onClick={this.handleClose} color="primary">Отмена</Button>
                        <Button onClick={this.attachProduct} color="primary">Сохранить</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        token: state.app.token
    }
};

export default connect(mapStateToProps)(CheckKnotScreen);
