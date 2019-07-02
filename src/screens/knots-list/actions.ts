import {Action} from "redux";
import {Knot, Product} from "./reducer";

export const FETCH_KNOTS = "FETCH_KNOTS";

export const fetchKnotAction = (): Action => {
    return {type: FETCH_KNOTS}
};

export interface SetKnotsAction extends Action {
    payload: Knot[];
}

export const SET_KNOTS = "SET_KNOTS";
export const setKnotsAction = (knots: Knot[]): SetKnotsAction => {
    return {type: SET_KNOTS, payload: knots}
};

export interface FetchProductsAction extends Action {
    payload: Product[];
}

export interface PostKnotActionPayload {
    knot_id?: number;
    knot_group_id?: string;
    note?: string;
    position?: string;
    number?: string;
    product_id?: string;
}

export interface PostKnotAction extends Action {
    taskId: number;
    payload: PostKnotActionPayload;
}

export const POST_KNOT = "POST_KNOT";
export const postKnotAction = (data: PostKnotActionPayload): PostKnotAction => {
    return {taskId: Date.now(), type: POST_KNOT, payload: data}
};

export const FETCH_PRODUCTS = "FETCH_PRODUCTS";
export const fetchProductsAction = (products: Product[]): FetchProductsAction => {
    return {type: FETCH_PRODUCTS, payload: products}
};

export interface setKnotSearchAction extends Action {
    payload: string
}

export const SET_KNOT_SEARCH = "SET_KNOT_SEARCH";
export const setKnotSearchAction = (search: string): setKnotSearchAction => {
    return {type: SET_KNOT_SEARCH, payload: search}
};
