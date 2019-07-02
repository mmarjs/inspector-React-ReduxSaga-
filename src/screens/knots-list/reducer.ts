import {ActionWithPayload} from "../../reducer";
import {SET_KNOT_SEARCH, SET_KNOTS, SetKnotsAction, setKnotSearchAction} from "./actions";

export interface Knot {
    knot_id: number;
    knot_group_id: string;
    knot_number: string;
    knot_title: string;
    knot_count: number | string;
    date_last_check: number | string;
    product_id: number;
    operations: KnotOperation[];
    product_title: string;
    position: number;
}

export interface KnotOperation {
    operation_id: number;
    group: string;
    title: string;
    docs?: string;
    discrepancy?: boolean;
    method: KnotMethod[];
    features: KnotFeatures[];
    criterias: KnotCriteria[];
}

export interface KnotMethod {
    id: number;
    title: string;
}

export interface KnotFeatures {
    feature_id: number;
    title: string;
    photos: KnotPhoto[];
}

export interface KnotPhoto {
    uid: string;
    path: string;
}

export interface KnotCriteria {
    title: string;
}

export interface Product {
    number: string;
    position: string;
    title: string;
}

export interface KnotsState {
    knots: Knot[],
    products: Product[],
    search: string,
    drawerOpen: boolean,
}

const init: KnotsState = {
    knots: [],
    products: [],
    search: "",
    drawerOpen: false,
};

export default (state = init, action: ActionWithPayload<any>): KnotsState => {
    switch (action.type) {
        case SET_KNOTS:
            return {...state, knots: (action as SetKnotsAction).payload};
        case SET_KNOT_SEARCH:
            return {...state, search: (action as setKnotSearchAction).payload};
        default:
            return state;
    }
}
