import {Action} from "redux";
import {LocalPhoto, RequestFeature} from "./screens/cheks-list/reducer";
import Dexie from "dexie";
import {Profile} from "./reducer";
export enum Mode {Product = "product", Knot = "knot"}

// Inits
export const INIT_APP = "INIT_APP";
export const initApp = (): Action => {
    return {type: INIT_APP}
};

export const INIT_CHECKS = "INIT_CHECKS";
export const initCheckAction = (): Action => {
    return {type: INIT_CHECKS}
};

export const INIT_STAGES = "INIT_STAGES";
export const initStagesAction = (): Action => {
    return {type: INIT_STAGES}
};

export const INIT_PROFILE = "INIT_PROFILE";
export const initProfileAction = (): Action => {
    return {type: INIT_PROFILE}
};

// ------

export interface SetTokenAction extends Action {
    payload: string;
}

export interface SetDexieAction extends Action {
    payload: Dexie
}

export const SET_DEXIE = "SET_DEXIE";
export const setDexieAction = (db: Dexie): SetDexieAction => {
    return {type: SET_DEXIE, payload: db}
};

export const SET_TOKEN = "SET_TOKEN";
export const setTokenAction = (token: string): SetTokenAction => {
    return {type: SET_TOKEN, payload: token}
};

export interface SendFeatureActions extends Action {
    taskId: number;
    mode: Mode;
    payload: RequestFeature[]
}

export const SEND_FEATURES = "SEND_FEATURES";
export const sendFeatureActions = (features: RequestFeature[], mode: Mode = Mode.Product): SendFeatureActions => {
    const taskId = Date.now();
    return {type: SEND_FEATURES, payload: features, taskId, mode}
};

export interface SendPhotoAction extends Action {
    taskId: number;
    mode: Mode;
    payload: {
        feature_id: string;
        photo: LocalPhoto
    }
}

export const SEND_PHOTO = "SEND_PHOTO";
export const sendPhotoAction = (feature_id: string, photo: LocalPhoto, mode: Mode = Mode.Product): SendPhotoAction => {
    const taskId = Date.now();
    return {type: SEND_PHOTO, payload: {feature_id, photo}, taskId, mode}
};

export interface DeletePhotoAction extends Action {
    taskId: number;
    payload: string;
}

export const DELETE_PHOTO = "DELETE_PHOTO";
export const deletePhotoAction = (uid: string): DeletePhotoAction => {
    const taskId = Date.now();
    return {type: DELETE_PHOTO, payload: uid, taskId}
};

export interface AddTaskAction extends Action {
    payload: OfflineAction;
    priority: number;
}

export interface OfflineAction extends Action {
    taskId: number;
}

export const ADD_TASK = "ADD_TASK";
export const addTaskAction = (action: OfflineAction, priority: number): AddTaskAction => {
    return {type: ADD_TASK, payload: action, priority}
};

export const RUN_SYNC_PROCESSING = "RUN_SYNC_PROCESSING";
export const runSyncLoop = (): Action => {
    return {type: RUN_SYNC_PROCESSING}
};

export const RUN_PING_LOOP = "RUN_PING_LOOP";
export const runPingLoop = (): Action => {
    return {type: RUN_PING_LOOP}
};

export interface DeleteTaskAction extends Action {
    payload: number;
}

export const DELETE_TASK = "DELETE_TASK";
export const deleteTaskAction = (id: number): DeleteTaskAction => {
    return {type: DELETE_TASK, payload: id}
};

export interface SyncErrorAction extends Action {
    payload: number;
}

export const REQUEST_ERROR = "REQUEST_ERROR";
export const requestErrorAction = (id: number): SyncErrorAction => {
    return {type: REQUEST_ERROR, payload: id}
};

export const ONLINE = "ONLINE";
export const onlineAction = (): Action => {
    return {type: ONLINE}
};

export interface SetNeedUpdateAfterSyncAction extends Action {
    payload: boolean;
}

export const SET_NEED_UPDATE_AFTER_SYNC = "SET_NEED_UPDATE_AFTER_SYNC";
export const setNeedUpdateAfterSyncAction = (status: boolean): SetNeedUpdateAfterSyncAction => {
    return {type: SET_NEED_UPDATE_AFTER_SYNC, payload: status}
};

export interface SetTasksCountAction extends Action {
    payload: number
}

export const SET_TASKS_COUNT = "SET_TASKS_COUNT";
export const setTasksCountAction = (count: number): SetTasksCountAction => {
    return {type: SET_TASKS_COUNT, payload: count}
};

export interface DiffSyncedTasksAction extends Action {
    payload: number
}

export const DIFF_SYNCED_TASK = " DIFF_SYNCED_TASK";
export const diffSyncedTasksAction = (tasksCount: number): DiffSyncedTasksAction => {
    return {type: DIFF_SYNCED_TASK, payload: tasksCount}
};

export const RESET_SYNCED_TASKS = "RESET_SYNCED_TASKS";
export const resetSyncedTasksAction = (): Action => {
    return {type: RESET_SYNCED_TASKS}
};

export const FETCH_PROFILE = "FETCH_PROFILE";
export const fetchProfileAction = (): Action => {
    return {type: FETCH_PROFILE}
};

export interface SetProfileAction extends Action {
    payload: Profile
}

export const SET_PROFILE = "SET_PROFILE";
export const setProfileAction = (profile: Profile): SetProfileAction => {
    return {type: SET_PROFILE, payload: profile}
};
