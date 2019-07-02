import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import {connect} from "react-redux";
import {RootState} from "../../reducer";
import {Check, Feature, Photo, Operation, RequestFeature, LocalPhoto} from "../cheks-list/reducer";
import {Dispatch} from "redux";
import {History, Location} from "history";
import {Redirect} from "react-router";
import uuid from "react-native-uuid";
import {List, Map} from "immutable";
import {deletePhotoAction, sendPhotoAction} from "../../actions";
import {finalPage, PHOTO_PATH, rootPage} from "../../constants/config";
import Paper from "@material-ui/core/Paper";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import IconButton from '@material-ui/core/IconButton';
import Slider from "react-slick";
import {setFeaturesTempAction} from "../cheks-list/actions";
import {DialogContentText} from "@material-ui/core";
import {Autorenew} from "@material-ui/icons";

interface LocationState {
    operation: Operation;
}

interface StateProps {
    check: Check | null;
    features: Map<string, RequestFeature>;
}

interface OwnProps {
    dispatch: Dispatch;
    location: Location<LocationState>;
    history: History;
}

interface State {
    operation: Operation;
    position: number;
    feature: Feature;
    featuresData: Map<string, RequestFeature>;
    camera: boolean;
    openDocs: boolean;
    openCrits: boolean;
    openComments: boolean;
    statusDialogVisible: boolean;
    rotate: number;
    processedPhoto: string | null;
    isProcessed: boolean;
    editPhotoDialogVisible: boolean;
}

interface Target extends EventTarget {
    result: string
}

interface Props extends OwnProps, StateProps {
}

class WizardScreen extends React.PureComponent<Props, State> {

    constructor(props: Props) {
        super(props);

        let featuresData = Map<string, RequestFeature>();
        const {features: _tmpFeatures} = this.props;
        const {operation} = props.location.state;
        const features = operation.features;
        const feature = features[0];
        if (_tmpFeatures && _tmpFeatures.count() > 0) {
            featuresData = _tmpFeatures;
        } else {
            for (const _feature of features) {
                featuresData = featuresData.set(_feature.feature_id, {
                    feature_id: _feature.feature_id,
                    status: _feature.status,
                    photos: List(_feature.photos)
                })
            }
        }

        this.state = {
            operation,
            feature,
            featuresData,
            position: 0,
            camera: false,
            openDocs: false,
            openCrits: false,
            openComments: false,
            statusDialogVisible: false,
            rotate: 0,
            processedPhoto: null,
            isProcessed: false,
            editPhotoDialogVisible: false,
        }
    }

    static getDerivedStateFromProps(props: Props, state: State): Object | null {
        if (!props.check) {
            return null;
        }

        for (const operation of props.check.operations) {
            if (operation.operation_id === state.operation.operation_id) {
                return {
                    operation: operation
                }
            }
        }

        return null;
    }

    handleClickOpenDocs = (/*e: React.SyntheticEvent*/): void => {
        this.setState({openDocs: true});
    };

    handleCloseDocs = (): void => {
        this.setState({openDocs: false});
    };

    handleClickOpenCrits = (/*e: React.SyntheticEvent*/): void => {
        this.setState({openCrits: true});
    };

    handleCloseCrits = (): void => {
        this.setState({openCrits: false});
    };

    handleClickOpenComments = (/*e: React.SyntheticEvent*/): void => {
        this.setState({openComments: true});
    };

    handleCloseComments = (): void => {
        this.setState({openComments: false});
    };

    uploader: HTMLInputElement | null = null;

    setNote = (el: React.ChangeEvent<HTMLInputElement>): void => {
        const {feature} = this.state;
        const value = el.target.value;
        this.setState(state => {
            const featuresData = state.featuresData.update(feature.feature_id, (_feature: RequestFeature) => {
                _feature.note = value;
                return _feature;
            });
            return {
                featuresData
            }
        }, () => {
            this.forceUpdate();
        })
    };

    setStatus = (status: number): void => {
        const {feature} = this.state;
        this.setState(state => {
            const featuresData = state.featuresData.update(feature.feature_id, (_feature: RequestFeature) => {
                _feature.status = String(status);
                return _feature;
            });
            return {
                featuresData
            }
        }, () => {
            this.forceUpdate();
        })
    };

    getCurrentFeatureDate = (): RequestFeature => {
        const {feature} = this.state;
        return this.state.featuresData.get(feature.feature_id) as RequestFeature
    };

    goPrevFeature = (): void => {
        if (this.state.position === 0) {
            return;
        } else {
            const position = this.state.position - 1;
            const {operation} = this.state;
            const features = operation.features;
            const feature = features[position];

            window.scroll(0, 0);

            this.setState({
                position,
                feature
            }, () => {
                this.forceUpdate();
            });
        }
    };

    goNextFeature = (): void => {
        const {featuresData} = this.state;
        if (this.getCurrentFeatureDate().status === "-1") {
            return this.setState({statusDialogVisible: true})
        }
        this.props.dispatch(setFeaturesTempAction(featuresData));
        if (this.state.position + 1 === this.state.featuresData.count()) {
            return this.props.history.push(finalPage, {operation: this.state.operation, featuresData})
        }

        const position = this.state.position + 1;
        const {operation} = this.state;
        const features = operation.features;
        const feature = features[position];

        window.scroll(0, 0);

        this.setState({
            position,
            feature
        }, () => {
            this.forceUpdate();
        })
    };

    getButtonClassName = (val: string, current: string): string => {
        if (val === current) {
            return "btn"
        } else {
            return "btn btn-disabled"
        }
    };

    addFile = (result: string): void => {
        const {feature} = this.state;
        const featureData = this.state.featuresData.get(feature.feature_id) as RequestFeature;
        if (featureData.status === "0") {
            this.setStatus(-1);
        }
        this.setState(state => {
            const featuresData = state.featuresData.update(feature.feature_id, (_feature: RequestFeature) => {
                const photo: LocalPhoto = {
                    rotate: this.state.rotate,
                    uid: uuid.v4(),
                    source: result
                };
                _feature.photos = _feature.photos.push(photo);
                this.props.dispatch(sendPhotoAction(this.state.feature.feature_id, photo));
                return _feature;
            });
            return {
                featuresData
            }
        }, () => {
            this.resetImageProcessing();
            this.forceUpdate();
        })
    };

    editPhoto = (photoBase64: string): void => {
        this.setState({
            processedPhoto: photoBase64,
            editPhotoDialogVisible: true
        }, () => {
            this.forceUpdate();
        });
    };

    fileSelected = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const fileReader = new FileReader();

        fileReader.onload = async (event: ProgressEvent) => {
            this.editPhoto((event.target as Target).result);
        };
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsDataURL(e.target.files[0]);
        }
    };

    /*arrayBufferToBase64 = (buffer: ArrayBuffer) => {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };*/

    renderImages = (photos: Photo[]): JSX.Element[] | null => {
        const renderedImages = photos.map((photo: Photo, index: number) => {
            if ((photo as LocalPhoto).source) {
                return (
                    <div className="img-wrapper" key={photo.uid}>
                        <div className="img-inner">
                            <img className="photo" src={`${(photo as LocalPhoto).source}`}
                                 alt="photo" style={{transform: `rotate(${(photo as LocalPhoto).rotate}deg)`}}/>
                            <IconButton className="delete-photo" onClick={() => this.deletePhoto(photo.uid)}>
                                <div className="delete-ico"/>
                            </IconButton>
                        </div>
                        <div className="photo-index">
                            <span>{index + 1}</span> из <span>{photos.length}</span>
                        </div>
                    </div>
                );
            }
            if (photo.path) {
                return (
                    <div className="img-wrapper" key={photo.uid}>
                        <div className="img-inner">
                            <img className="photo" src={`${PHOTO_PATH}${photo.path}`} alt="photo"/>
                            <IconButton className="delete-photo" onClick={() => this.deletePhoto(photo.uid)}>
                                <div className="delete-ico"/>
                            </IconButton>
                        </div>
                        <div className="photo-index">
                            <span>{index + 1}</span> из <span>{photos.length}</span>
                        </div>
                    </div>
                );
            }

        }) as JSX.Element[];
        if (photos.length === 0) {
            return null
        }
        return renderedImages
    };

    deletePhoto = (uid: string): void => {
        const {feature} = this.state;
        this.setState(state => {
            const featuresData = state.featuresData.update(feature.feature_id, (_feature: RequestFeature) => {
                _feature.photos = _feature.photos.filter(photo => photo.uid !== uid);
                return _feature;
            });
            return {
                featuresData
            }
        }, () => {
            this.forceUpdate();
            this.props.dispatch(deletePhotoAction(uid));
        });
    };

    componentDidMount(): void {
        window.scroll(0, 0);
    }

    resetImageProcessing = (): void => {
        this.setState({
            editPhotoDialogVisible: false,
            processedPhoto: null,
            rotate: 0
        })
    };

    renderStatusDialog = (): JSX.Element => {
        return (
            <Dialog
                open={this.state.statusDialogVisible}
                onClose={() => {
                }}
            >
                <DialogTitle id="alert-dialog-title">{"Внимание"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Нужно выбрать статус для перехода в следующую характеристику.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary" autoFocus onClick={() => this.setState({statusDialogVisible: false})}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        )
    };

    renderImageDialog = (): JSX.Element => {
        return (
            <Dialog
                open={this.state.editPhotoDialogVisible}
                onClose={() => {
                }}
            >
                <DialogTitle id="alert-dialog-title">{"Редактирование фото"}</DialogTitle>
                <DialogContent style={{flex: 1}}>
                    {this.state.processedPhoto ?
                        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                            <img
                                style={{width: "100%", height: "100%", transform: `rotate(${this.state.rotate}deg)`}}
                                className="photo"
                                src={this.state.processedPhoto}
                                alt="photo"/>
                        </div> : null}
                </DialogContent>
                <DialogActions style={{marginLeft: 15}}>
                    <span style={{flex: 1}}>
                    <Button color="primary" disabled={this.state.isProcessed} autoFocus
                            onClick={() => this.setState(state => ({rotate: state.rotate + 90}))}>
                        <Autorenew/>
                        Поворот
                    </Button>
                    </span>
                    <Button color="primary" autoFocus
                            onClick={() => this.resetImageProcessing()}>
                        Отмена
                    </Button>
                    <Button color="primary" autoFocus
                            disabled={this.state.processedPhoto === null}
                            onClick={() => {
                                this.addFile(this.state.processedPhoto as string);
                                this.resetImageProcessing();
                            }}>
                        Ok
                    </Button>
                </DialogActions>
            </Dialog>
        )
    };

    render() {
        const {check} = this.props;
        const {operation, feature} = this.state;
        if (!check) {
            return <Redirect to={rootPage}/>;
        }
        const featureData = this.state.featuresData.get(feature.feature_id) as RequestFeature;
        const photos = featureData.photos.toArray();

        const note = featureData.note || this.state.feature.note;

        const contractCode = check.contract_code ? check.contract_code : '-';
        const contractAnnex = check.contract_annex ? check.contract_annex : '-';
        // const productPosition = check.product_position?check.product_position:'-';

        const sliderSettings = {
            speed: 500,
            slidesToShow: 2,
            slidesToScroll: 1,
            infinite: false,
            responsive: [
                {
                    breakpoint: 960,
                    settings: {
                        slidesToShow: 3,
                        slidesToScroll: 3
                    }
                }
            ]
        };

        return (
            <>
                <AppBar position="static" className="nav-bar">
                    <div className="stage-info">
                        Проверяемая
                        характеристика <span>{this.state.position + 1}</span> из <span>{operation.features.length}</span>
                    </div>
                </AppBar>
                {this.renderStatusDialog()}
                {this.renderImageDialog()}
                <div className="main-wrapper wizard">
                    <div className="df">
                        <div className="f2">
                            <Paper className="paper product-info-only">
                                <h2>№ {check.product_number}</h2>
                                <span
                                    className="product-title">{check.product_title} (поз.{check.product_position})</span><br/>
                                <span className="product-title">{contractCode} прил. {contractAnnex}</span>

                            </Paper>
                        </div>
                        <div className="f2">
                            <Paper className="paper documents-and-criterions">
                                <div className="documents">
                                    Ссылочные документы
                                    <Button variant="contained" color="primary" className="btn-primary"
                                            onClick={this.handleClickOpenDocs}>
                                        Посмотреть</Button>
                                </div>
                                <div className="divider"/>
                                <div className="criterions">
                                    Критерии приемки
                                    <Button variant="contained" color="primary" className="btn-primary"
                                            onClick={this.handleClickOpenCrits}>Посмотреть</Button>
                                </div>
                            </Paper>
                        </div>
                    </div>

                    <div className="verification-info">
                        <h4>Операция</h4>
                        <h2>{operation.title}</h2>
                        <h4>Характеристика</h4>
                        <h2>{feature.title}</h2>
                    </div>

                    <div className="df">
                        <div className="f2">
                            <Paper className="paper verification-status">
                                <h2>Статус проверки</h2>
                                <div className="btns-panel">
                                    <div className="btn-wrapper">
                                        <Button className={this.getButtonClassName("1", featureData.status)}
                                                onClick={() => this.setStatus(1)}>Проверка пройдена успешно</Button>
                                    </div>
                                    <div className="btn-wrapper">
                                        <Button className={this.getButtonClassName("2", featureData.status)}
                                                onClick={() => this.setStatus(2)}>Выявлены несоответствия</Button>
                                    </div>
                                    <div className="btn-wrapper">
                                        <Button className={this.getButtonClassName("0", featureData.status)}
                                                onClick={() => this.setStatus(0)}>Проверка не проводилась</Button>
                                    </div>
                                </div>
                            </Paper>
                        </div>
                        <div className="f2">
                            <Paper className="paper verification-comment">
                                <h2>Комментарий</h2>
                                <div className="paper-content">{note}</div>
                                <Button variant="contained" color="primary" className="btn-primary"
                                        onClick={this.handleClickOpenComments}>Изменить</Button>
                            </Paper>
                        </div>
                    </div>

                    <div className="photos-wrapper">
                        <Link className="upload-photo" onClick={() => {
                            if (this.uploader) {
                                this.uploader.click()
                            }
                        }}>Добавить фото</Link>
                        <input type="file" accept="image/*" capture id="file"
                               ref={(el: HTMLInputElement) => this.uploader = el}
                               style={{display: "none"}} onChange={e => this.fileSelected(e)}/>
                        <Slider className="photos-gallery" {...sliderSettings}>
                            {this.renderImages(photos)}
                        </Slider>
                    </div>

                    <div className="footer-btns">
                        <Button className="btn-primary" onClick={this.goPrevFeature}><ArrowBackIcon
                            className="back-icon"/>Предыдущая характеристика</Button>
                        <Button className="btn-primary" onClick={this.goNextFeature}>Следующая
                            характеристика<ArrowForwardIcon className="forward-icon"/></Button>
                        {/*<Button className="btn-primary"><CheckIcon className="back-icon"/>Завершить проверку</Button>*/}
                    </div>
                </div>
                <Dialog className="dialog-documents" open={this.state.openDocs} onClose={this.handleCloseDocs}>
                    <DialogTitle className="dialog-title">Ссылочные документы</DialogTitle>
                    <DialogContent className="dialog-content">
                        {operation.docs}
                    </DialogContent>
                    <DialogActions className="dialog-actions">
                        <Button onClick={this.handleCloseDocs} color="primary">Ок</Button>
                    </DialogActions>
                </Dialog>

                <Dialog className="dialog-crits" open={this.state.openCrits} onClose={this.handleCloseCrits}>
                    <DialogTitle className="dialog-title">Критерии приемки</DialogTitle>
                    <DialogContent className="dialog-content">
                        {operation.criterias.map(item => {
                            return <Link key={item.title}>{item.title}</Link>
                        })}
                    </DialogContent>
                    <DialogActions className="dialog-actions">
                        <Button onClick={this.handleCloseCrits} color="primary">Ок</Button>
                    </DialogActions>
                </Dialog>

                <Dialog className="dialog-comment" open={this.state.openComments}
                        onClose={this.handleCloseComments}>
                    <DialogTitle className="dialog-title">Комментарий</DialogTitle>
                    <DialogContent className="dialog-content">
                        <TextField multiline rowsMax="4" fullWidth value={note || ""}
                                   onChange={(el: React.ChangeEvent<HTMLInputElement>) => {
                                       this.setNote(el)
                                   }}/>
                    </DialogContent>
                    <DialogActions className="dialog-actions">
                        <Button onClick={this.handleCloseComments} color="primary">Ок</Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        check: state.check.check,
        features: state.checks.features
    }
};

export default connect(mapStateToProps)(WizardScreen);
