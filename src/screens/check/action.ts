import {Check} from "../cheks-list/reducer";
import {Action} from "redux";

export interface SetCheckAction extends Action {
    payload: Check;
}

export const SET_CHECK = "SET_CHECK";
export const setCheckAction = (check: Check): SetCheckAction => {
    return {type: "SET_CHECK", payload: check}
};

export const RESET_CHECK = "RESET_CHECK";
export const resetCheckAction = (): Action => {
    return {type: RESET_CHECK}
};

export interface UpdateProductPayload {
    product_id: string;
    position: string;
    number: string;
}

export interface UpdateProductAction extends Action {
    payload: UpdateProductPayload;
    taskId: number;
}

export const UPDATE_PRODUCT = "UPDATE_PRODUCT";
export const updateProductAction = (data: UpdateProductPayload): UpdateProductAction => {
    const taskId = Date.now();
    return {type: UPDATE_PRODUCT, payload: data, taskId}
};
