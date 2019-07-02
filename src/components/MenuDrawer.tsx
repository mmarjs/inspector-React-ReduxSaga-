import {toggleDrawer, toggleNetworkMode} from "../screens/cheks-list/actions";
// import {toggleArchiveMode} from "../screens/support/actions";
import AppBar from "@material-ui/core/AppBar";
import Typography from "@material-ui/core/Typography";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Button from "@material-ui/core/Button";
import {logoutAction} from "../screens/login/action";
import Drawer from "@material-ui/core/Drawer";
import * as React from "react";
import {Profile, RootState} from "../reducer";
import {withStyles, WithStyles} from "@material-ui/core";
import styles from "../screens/cheks-list/styles";
import {History} from "history";
import {Dispatch} from "redux";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {networkPage, rootPage} from "../constants/config";
import { knotsListPage, supportPage, supportArchivePage } from '../constants/config';

interface StateProps {
    isNetwork: boolean;
    // isArchive: boolean;
    profile: Profile | null;
}

interface Props extends StateProps, WithStyles<typeof styles> {
    history: History;
    dispatch: Dispatch;
    location: Location;
    open: boolean;
    onClose(): any;
}

class MenuDrawer extends React.PureComponent<Props> {

    toggleViewMode(value: boolean) {
        if (value === false) {
            this.props.dispatch(toggleNetworkMode(false));
            this.props.history.push(rootPage);
        }
        if (value === true) {
            this.props.dispatch(toggleNetworkMode(true));
            this.props.history.push(networkPage);
        }
    };

    // toggleArchiveMode(value: boolean) {
    //     if (value === false) {
    //         this.props.dispatch(toggleArchiveMode(false));
    //         this.props.history.push(supportPage);
    //     }
    //     if (value === true) {
    //         this.props.dispatch(toggleArchiveMode(true));
    //         this.props.history.push(supportArchivePage);
    //     }
    // };

    render() {
        return (
            <Drawer className="drawer" open={this.props.open} onClose={() => this.props.onClose()}>
                <div
                    className="drawer"
                    role="presentation"
                    onClick={() => toggleDrawer(false)}
                    onKeyDown={() => toggleDrawer(false)}
                >
                    <AppBar position="static" className="user-info">
                        <div>Пользователь</div>
                        <Typography
                            variant="h6">{this.props.profile && this.props.profile.full_name}</Typography>
                    </AppBar>


                    <MenuList className="drawer-menu">
                        <MenuItem
                            className={!this.props.isNetwork && this.props.location.pathname != knotsListPage ? "menu-item active" : " menu-item"}
                            onClick={() => {
                                this.props.onClose();
                                return this.toggleViewMode(false);
                            }}>
                            <ListItemIcon>
                                <div className="icon-cards"/>
                            </ListItemIcon>
                            <Typography variant="inherit" className="menu-text">Этапы</Typography>
                        </MenuItem>

                        <MenuItem
                            className={this.props.isNetwork && this.props.location.pathname != knotsListPage ? "menu-item active" : " menu-item"}
                            onClick={() => {
                                this.props.onClose();
                                return this.toggleViewMode(true)
                            }}>
                            <ListItemIcon>
                                <div className="icon-list"/>
                            </ListItemIcon>
                            <Typography variant="inherit" className="menu-text">План график</Typography>
                        </MenuItem>

                        <MenuItem className={this.props.location.pathname == knotsListPage ? "menu-item active" : "menu-item"}
                            onClick={() => {
                                this.props.onClose();
                                return this.props.history.push("knots")
                            }}
                        >
                            <ListItemIcon>
                                <div className="icon-knots"/>
                            </ListItemIcon>
                            <Typography variant="inherit" className="menu-text">Узлы</Typography>
                        </MenuItem>

                        <MenuItem className="menu-item" onClick={() => {
                            this.props.onClose();
                            // return this.toggleArchiveMode(false);
                            return this.props.history.push(supportPage)
                        }}>
                            <ListItemIcon>
                                <div className="icon-support"/>
                            </ListItemIcon>
                            <Typography variant="inherit"
                                        className="menu-text">Поддержка</Typography>
                        </MenuItem>

                        <MenuItem className="menu-item" onClick={() => {
                            this.props.onClose();
                            return this.props.history.push(supportArchivePage)
                        }}>
                            <ListItemIcon>
                                <div className="icon-support"/>
                            </ListItemIcon>
                            <Typography variant="inherit"
                                        className="menu-text">Архив</Typography>
                        </MenuItem>

                        <MenuItem className="menu-item" onClick={() => {
                            // this.props.history.replace(loginPage, {});
                            this.props.onClose();
                            return this.props.dispatch(logoutAction())
                        }}>
                            <ListItemIcon>
                                <div className="icon-exit"/>
                            </ListItemIcon>
                            Выйти
                        </MenuItem>
                    </MenuList>
                </div>
            </Drawer>
        );
    };
}

const mapStateToProps = (state: RootState): StateProps => {
    return {
        isNetwork: state.checks.isNetwork,
        // isArchive: state.tickets.isArchive,
        profile: state.app.profile,
    }
};

//@ts-ignore
export default withRouter(connect(mapStateToProps)(withStyles(styles)(MenuDrawer)) )
