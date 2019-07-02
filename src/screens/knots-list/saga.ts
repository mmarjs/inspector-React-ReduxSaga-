import {takeLeading, select, put} from "@redux-saga/core/effects";
import {RootState} from "../../reducer";
import {API_VERSION, KNOT_API, KNOTS_API, PRODUCTS_API} from "../../constants/config";
import {FETCH_KNOTS, FETCH_PRODUCTS, fetchKnotAction, POST_KNOT, PostKnotAction, setKnotsAction} from "./actions";
import {Knot, Product} from "./reducer";
import {addTaskAction, deleteTaskAction, requestErrorAction} from "../../actions";

function* fetchKnots() {
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    try {
        const result: { success: string; response: Knot[] } = yield fetch(KNOTS_API, {
            method: 'GET',
            headers: {token, v: API_VERSION},
        }).then(res => res.json());

        if (result.success === "true") {
            yield put(setKnotsAction(result.response))
        }
    } catch (error) {
        console.log(error);
    }
}

//not used
function* fetchProducts() {
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    try {
        const result: { success: string; response: Product[] } = yield fetch(PRODUCTS_API, {
            method: 'GET',
            headers: {token, v: API_VERSION},
        }).then(res => res.json());

        if (result.success === "true") {
            // yield put(setKnotsAction(result.response))
        }
    } catch (error) {
        console.log(error);
    }
}

function* postKnot(action: PostKnotAction) {
    let requestDone = false;
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    try {
        yield fetch(KNOT_API, {
            method: 'POST',
            headers: {token, v: API_VERSION},
            body: JSON.stringify(action.payload)
        }).then(res => res.json());
        yield put(deleteTaskAction(action.taskId));
        requestDone = true;
    } catch (error) {
        yield put(addTaskAction(action, 0));
        yield put(requestErrorAction(action.taskId));
    }
    if (requestDone) {
        yield put(fetchKnotAction());
    }
}

export function* knotsSaga() {
    yield takeLeading(FETCH_KNOTS, fetchKnots);
    yield takeLeading(FETCH_PRODUCTS, fetchProducts);
    yield takeLeading(POST_KNOT, postKnot);
}
