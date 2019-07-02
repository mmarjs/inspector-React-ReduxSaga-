import {Action} from "redux";
import {Check, RequestFeature, Stage} from "./reducer";
import {Map} from "immutable";

export interface SetChecksDataAction extends Action {
    payload: Check[];
    saveInDb: boolean;
}

export interface SetStagesAction extends Action {
    payload: Stage[],
    saveInDb: boolean;
}

export const SET_STAGES = "SET_STAGES";
export const setStagesAction = (stages: Stage[], saveInDb = true): SetStagesAction => {
    return {type: SET_STAGES, payload: stages, saveInDb}
};

export const SET_CHECKS_DATA = "SET_CHECKS_DATA";
export const setChecksData = (list: Check[], saveInDb = true): SetChecksDataAction => {
    return {type: SET_CHECKS_DATA, payload: list, saveInDb}
};

export interface SetCheckDataAction extends Action {
    payload: string;
}

export const STORE_CHECK_DATA = "STORE_CHECK_DATA";
export const storeCheckByIdAction = (checkId: string): SetCheckDataAction => {
    return {type: STORE_CHECK_DATA, payload: checkId}
};

export interface SetChecksRequestAction extends Action {
    payload: boolean
}

export const SET_CHECK_REQUEST = "SET_CHECK_REQUEST";
export const setChecksRequestAction = (status: boolean): SetChecksRequestAction => {
    return {type: SET_CHECK_REQUEST, payload: status}
};

export const FETCH_CHECKS = "FETCH_CHECKS";
export const fetchChecksAction = () => {
    return {type: FETCH_CHECKS}
};

export const FETCH_CHECKS_ASAP = "FETCH_CHECKS_ASAP";
export const fetchChecksAsapAction = () => {
    return {type: FETCH_CHECKS_ASAP}
};

export interface UpdateFeaturesPayload {
    checkId: string;
    operationId: string;
    features: RequestFeature[];
}

export interface UpdateFeaturesAction extends Action {
    payload: UpdateFeaturesPayload
}

export const UPDATE_FEATURES = "UPDATE_FEATURES";
export const updateFeaturesAction = (checkId: string, operationId: string, features: RequestFeature[]): UpdateFeaturesAction => {
    return {type: UPDATE_FEATURES, payload: {checkId, operationId, features}}
};


export const UPDATE_DISCREPANCY_REQUEST = 'UPDATE_DISCREPANCY_REQUEST';

export interface UpdateDiscrepancyPayload {
    operation_id: string;
    discrepancy: boolean;
}

export interface UpdateDiscrepancyAction extends Action {
    taskId: number;
    payload: UpdateDiscrepancyPayload
}

export const updateDiscrepancyAction = (payload: UpdateDiscrepancyPayload): UpdateDiscrepancyAction => ({
    taskId: Date.now(),
    type: UPDATE_DISCREPANCY_REQUEST,
    payload
});

export interface SetFeaturesTempAction extends Action {
    payload: Map<string, RequestFeature>;
}

export const SET_FEATURES_TEMP = "SET_FEATURES_TEMP";
export const setFeaturesTempAction = (features: Map<string, RequestFeature>): SetFeaturesTempAction => {
    return {type: SET_FEATURES_TEMP, payload: features}
};

export interface SetSearchValueAction extends Action {
    payload: string;
}

export const SET_SEARCH_VALUE = "SET_SEARCH_VALUE";
export const setSearchValueAction = (payload: string): SetSearchValueAction => {
    return {type: SET_SEARCH_VALUE, payload}
};

export const TOGGLE_NETWORK_MODE = "TOGGLE_NETWORK_MODE";
export const toggleNetworkMode = (value:boolean)=>({type:TOGGLE_NETWORK_MODE, payload:value});

export const TOGGLE_DRAWER = "TOGGLE_DRAWER";
export const toggleDrawer = (payload: boolean) => ({ type: TOGGLE_DRAWER, payload});