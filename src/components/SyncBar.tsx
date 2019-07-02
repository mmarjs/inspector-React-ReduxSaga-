import * as React from "react";
import {connect} from "react-redux";
import {RootState} from "../reducer";
import {PropTypes} from "@material-ui/core";
import CircularProgress from '@material-ui/core/CircularProgress';
import {PositionProperty} from "csstype";

interface MapProps {
    isOffline: boolean,
    tasksCount: number,
    syncedTasks: number
}

interface Props extends MapProps {
    position?: PositionProperty;
    color?: PropTypes.Color;
}

class SyncBar extends React.PureComponent<Props> {

    static defaultProps = {
        position: "absolute" as PositionProperty,
        color: "inherit" as PropTypes.Color
    };

    render() {
        const {syncedTasks, tasksCount} = this.props;
        if (this.props.isOffline) {
            return <div className="sync">Нет соединения с сервером</div>
        } else {
            const syncBlock = {
                position: this.props.position || "absolute" as PositionProperty,
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            };
            if (tasksCount !== 0) {
                return <div
                    className="sync"
                    style={syncBlock}>
                    Загружено {syncedTasks} / {tasksCount} <CircularProgress size={20} style={{marginLeft: 10}}/></div>
            }
            return <div className="sync">Синхронизация завершена</div>;
        }
    }
}

const mapStateToProps = (state: RootState): MapProps => {
    return {
        isOffline: state.app.isOffline,
        tasksCount: state.app.tasksCount,
        syncedTasks: state.app.syncedTasks
    }
};

export default connect(mapStateToProps)(SyncBar);
