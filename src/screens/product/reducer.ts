import {Action} from "redux";

interface ActionWithPayload<T> extends Action {
    payload: T;
}

export interface ProductState {
    isFetch: boolean;
}

const init: ProductState = {
    isFetch: false,
};

export default (state = init, action: ActionWithPayload<any>): ProductState => {
    switch (action.type) {
        default:
            return state;
    }
}
