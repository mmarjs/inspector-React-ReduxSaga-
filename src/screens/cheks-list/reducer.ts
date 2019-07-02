import {List, Map} from "immutable";
import {
    SET_CHECK_REQUEST,
    SET_CHECKS_DATA, SET_FEATURES_TEMP, SET_SEARCH_VALUE,
    SET_STAGES,
    SetChecksDataAction,
    SetChecksRequestAction, SetFeaturesTempAction, SetSearchValueAction,
    SetStagesAction, TOGGLE_NETWORK_MODE, UPDATE_FEATURES, UpdateFeaturesAction,
    TOGGLE_DRAWER
} from "./actions";
import {ActionWithPayload} from "../../reducer";
import {
    RequestUpdateCheckAction,
    RequestUpdateCheckPayload,
    UPDATE_CHECK,
    UPDATE_CHECK_OFFLINE
} from "../product/actions";
import {UPDATE_PRODUCT, UpdateProductAction, UpdateProductPayload} from "../check/action";
import {Mode} from "../../actions";

export interface Criteria {
    title: string;
}

export interface Photo {
    uid: string,
    path?: string
}

export interface LocalPhoto extends Photo {
    rotate: number;
    source?: string;
}

export interface RequestFeature {
    feature_id: string;
    status: string;
    note?: string;
    mode?: Mode;
    photos: List<LocalPhoto | Photo>;
}

export interface Feature {
    feature_id: string;
    title: string;
    note: string;
    status: string;
    photos: Photo[];
}

export interface Method {
    id: string;
    title: string;
}

export interface Operation {
    operation_id: string;
    discrepancy: boolean;
    group: string;
    title: string;
    frequency: number;
    method: Method[];
    criterias: Criteria[];
    docs: string;
    features: Feature[];
}

export interface Check {
    check_id: string;
    stage_title: string;
    product_id: string;
    contract_code: string;
    contract_annex: string;
    product_number: string;
    product_position: string;
    product_title: string;
    date_stage_start: string;
    date_stage_end: string;
    date_actual_start: string;
    date_actual_end: string;
    date_cargo: string;
    date_last_check: string;
    date_end: string;
    operations: Operation[];
    note: string;
    progress: string;
    complite: boolean;
}

export interface Stage {
    stage_id: string;
    title: string;
}

export interface ChecksState {
    isFetch: boolean;
    list: List<Check>;
    stages: List<Stage>;
    features: Map<string, RequestFeature>;
    search: string;
    isNetwork:boolean;
    drawerOpen: boolean;
}

const init: ChecksState = {
    isFetch: false,
    list: List(),
    stages: List(),
    features: Map(),
    search: "",
    isNetwork:false,
    drawerOpen: false,
};

export default (state = init, action: ActionWithPayload<any>): ChecksState => {
    switch (action.type) {
        case SET_CHECKS_DATA:
            if ((action as SetChecksDataAction).payload.length === 0) {
                return {...state, list: List()}
            }
            const checks = resetFeaturesData((action as SetChecksDataAction).payload);
            return {...state, list: List(checks)};
        case SET_CHECK_REQUEST:
            return {...state, isFetch: (action as SetChecksRequestAction).payload};
        case SET_STAGES:
            return {...state, stages: List((action as SetStagesAction).payload)};
        case UPDATE_PRODUCT:
            return {...state, list: updateCheckByProductData(state, (action as UpdateProductAction).payload)};
        case UPDATE_CHECK:
            return {...state, list: updateCheck(state, (action as RequestUpdateCheckAction).payload)};
        case UPDATE_CHECK_OFFLINE:
            return {...state, list: updateCheck(state, (action as RequestUpdateCheckAction).payload)};
        case UPDATE_FEATURES:
            return {...state, list: updateCheckFeatures(state, action)};
        case SET_FEATURES_TEMP:
            return {...state, features: (action as SetFeaturesTempAction).payload};
        case SET_SEARCH_VALUE:
            return {...state, search: (action as SetSearchValueAction).payload};
        case TOGGLE_NETWORK_MODE:
            return {...state, isNetwork: action.payload};
        case TOGGLE_DRAWER:
            return {...state, drawerOpen: action.payload};
        default:
            return state;
    }
}

const updateCheckByProductData = (state: ChecksState, productPayload: UpdateProductPayload) => {
    return state.list.map(check => {
        if (check.product_id === productPayload.product_id) {
            check.product_number = productPayload.number;
        }
        return check;
    });
};

const updateCheck = (state: ChecksState, payload: RequestUpdateCheckPayload): List<Check> => {
    return state.list.map(check => {
        if (check.check_id === payload.check_id) {
            if (payload.progress !== undefined) {
                check.progress = String(payload.progress);
            }
            if (payload.stage_id !== undefined) {
                check.stage_title = getStageTitle(state, payload.stage_id);
            }
            if (payload.note !== undefined) {
                check.note = payload.note;
            }
            if (payload.complite !== undefined) {
                check.complite = payload.complite
            }
            if (payload.date_start) {
                check.date_actual_start = payload.date_start;
                check.date_actual_end = "0"
            }
            if (payload.date_actual_end) {
                check.date_actual_end = payload.date_actual_end;
            }
            if (payload.date_actual_start) {
                check.date_actual_start = payload.date_actual_start;
            }
        }
        return check;
    });
};

const getStageTitle = (state: ChecksState, stageId: string): string => {
    let title = "";
    state.stages.forEach(stage => {
        if (stage.stage_id === stageId) {
            title = stage.title;
        }
    });
    return title;
};

const resetFeaturesData = (checks: Check[]) => {
    for (const check of checks) {
        if (!check.operations) continue;
        for (const operation of check.operations) {
            if (!operation.features) continue;
            for (const feature of operation.features) {
                feature.note = "";
                feature.photos = [];
                feature.status = "0";
            }
        }
    }
    return checks;
};

const updateCheckFeatures = (state: ChecksState, action: UpdateFeaturesAction): List<Check> => {
    const {checkId, operationId, features} = action.payload;
    return state.list.map(check => {
        if (check.check_id !== checkId) {
            return check;
        }
        const operationIndex = List(check.operations).findIndex(operation => operation.operation_id === operationId);
        if (operationIndex === -1 && check.operations[operationIndex]) {
            return check;
        }
        check.operations[operationIndex].features = check.operations[operationIndex].features.map(oldFeature => {
            const newFeature = List(features).find(feature => feature.feature_id === oldFeature.feature_id);
            if (!newFeature) {
                return oldFeature;
            }
            if (newFeature.note) {
                oldFeature.note = newFeature.note;
            }
            if (newFeature.status) {
                oldFeature.status = newFeature.status;
            }
            if (newFeature.photos) {
                oldFeature.photos = newFeature.photos.toArray();
            }
            return oldFeature;
        });
        return check;
    });
};
