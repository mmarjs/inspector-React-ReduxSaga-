import {Action} from "redux";

export const FETCH_STAGES = "FETCH_STAGES";
export const fetchStagesAction = (): Action => {
    return {type: FETCH_STAGES}
};

export interface RequestUpdateCheckPayload {
    check_id: string;
    stage_id?: string;
    product_number?: string;
    date_start?: string;
    note?: string;
    progress?: number;
    complite?: boolean;
    date_actual_start?: string;
    date_actual_end?: string;
}

export interface RequestUpdateCheckAction extends Action {
    payload: RequestUpdateCheckPayload;
    taskId: number;
}

export const UPDATE_CHECK = "UPDATE_CHECK";
export const updateCheckAction = (data: RequestUpdateCheckPayload): RequestUpdateCheckAction => {
    const taskId = Date.now();
    return {type: UPDATE_CHECK, payload: data, taskId}
};

export interface RequestUpdateCheckOfflineAction extends Action {
    payload: RequestUpdateCheckPayload;
}
export const UPDATE_CHECK_OFFLINE = "UPDATE_CHECK_OFFLINE";
export const updateCheckOfflineAction = (data: RequestUpdateCheckPayload): RequestUpdateCheckOfflineAction => {
    return {type: UPDATE_CHECK_OFFLINE, payload: data}
};
