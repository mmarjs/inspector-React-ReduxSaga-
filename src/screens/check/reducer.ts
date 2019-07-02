import {Action} from "redux";
import {Check} from "../cheks-list/reducer";
import {RESET_CHECK, SET_CHECK, SetCheckAction} from "./action";

interface ActionWithPayload<T> extends Action {
    payload: T;
}

export interface CheckState {
    isFetch: boolean;
    check: Check | null;
}

const init: CheckState = {
    isFetch: false,
    check: null
};

export default (state = init, action: ActionWithPayload<any>): CheckState => {
    switch (action.type) {
        case SET_CHECK:
            return {...state, check: (action as SetCheckAction).payload};
        case RESET_CHECK:
            return {...state, check: null};
        default:
            return state;
    }
}
