import {
    FETCH_CHECKS_ASAP,
    FETCH_CHECKS, fetchChecksAction,
    SET_CHECKS_DATA, SET_STAGES,
    setChecksData,
    SetChecksDataAction,
    setChecksRequestAction, SetStagesAction, setStagesAction,
    UPDATE_DISCREPANCY_REQUEST, UpdateDiscrepancyAction, SetCheckDataAction, STORE_CHECK_DATA
} from "./actions";
import {takeLeading, put, select, takeEvery, debounce, call} from "redux-saga/effects";
import {Check, Stage} from "./reducer";
import {API_VERSION, CHECK_API, CHECKS_API, PRODUCT_API, STAGES_API, OPERATION_API} from "../../constants/config";
import {RootState} from "../../reducer";
import {setCheckAction, UPDATE_PRODUCT, UpdateProductAction} from "../check/action";
import {FETCH_STAGES, RequestUpdateCheckAction, UPDATE_CHECK} from "../product/actions";
import {addTaskAction, deleteTaskAction, requestErrorAction} from "../../actions";

function* storeChecks(action: SetChecksDataAction) {
    if (action.saveInDb == false) {
        return;
    }
    const db = yield select((state: RootState) => state.app.dexie);
    yield db.table('checks2').clear();
    for (const check of action.payload) {
        try {
            yield db.table('checks2').put({
                check_id: check.check_id,
                check
            });
        } catch (error) {
            console.log(error);
        }
    }
}

function* storeCheck(action: SetCheckDataAction) {
    const db = yield select((state: RootState) => state.app.dexie);
    const checks: Check[] = yield select((state: RootState) => state.checks.list);
    const check: Check | undefined = checks.find(check => check.check_id === action.payload);
    if (!check) return;
    try {
        yield db.table('checks2').put({
            check_id: check.check_id,
            check
        });
    } catch (error) {
        console.log(error);
    }
}

function* getChecks() {
    yield put(setChecksRequestAction(true));
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    try {
        const result = yield fetch(CHECKS_API, {
            method: 'GET',
            headers: {token: token, v: API_VERSION},
        }).then(res => res.json());

        if (result.success !== "true") return;

        yield put(setChecksData(result.response as Check[]));
        yield put(setChecksRequestAction(false));

        const check: Check = yield select((state: RootState) => state.check.check);
        if (check !== null) {
            const checkId = check.check_id;
            for (const _check of result.response as Check[]) {
                if (_check.check_id === checkId) {
                    yield put(setCheckAction(_check));
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}

function* fetchStages() {
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    try {
        const result = yield fetch(STAGES_API, {
            method: 'GET',
            headers: {token, v: API_VERSION},
        }).then(res => res.json());
        if(result.response) {
            yield put(setStagesAction(result.response as Stage[]));
        }
    } catch (error) {
        console.log(error);
    }
}

function* setStages(action: SetStagesAction) {
    if (action.saveInDb == false) {
        return;
    }

    // if(!action.payload ){
    //     return
    // }
    const db = yield select((state: RootState) => state.app.dexie);
    for (const stage of action.payload) {
        try {
            yield db.table('stages').put({
                id: stage.stage_id,
                stage
            });
        } catch (error) {
            console.log(error);
        }
    }
}

function* updateCheck(action: RequestUpdateCheckAction) {
    let requestDone = false;
    // yield call(saveCheckToDb, action);
    if (yield select((state: RootState) => state.app.isOffline)) {
        return yield put(addTaskAction(action, 0));
    }
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    try {
        yield fetch(CHECK_API, {
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
        yield put(fetchChecksAction());
    }
}

function* updateProduct(action: UpdateProductAction) {
    let requestDone = false;
    yield call(updateCheckByProductData, action);
    if (yield select((state: RootState) => state.app.isOffline)) {
        return yield put(addTaskAction(action, 0));
    }
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    try {
        yield fetch(PRODUCT_API, {
            method: 'POST',
            headers: {token: token, v: API_VERSION},
            body: JSON.stringify(action.payload)
        }).then(res => res.json());
        yield put(deleteTaskAction(action.taskId));
        requestDone = true;
    } catch (error) {
        yield put(addTaskAction(action, 0));
        yield put(requestErrorAction(action.taskId));
    }
    if (requestDone) {
        yield put(fetchChecksAction());
    }
}

function* updateCheckByProductData(action: UpdateProductAction) {
    const db = yield select((state: RootState) => state.app.dexie);
    const records: { id: string, check: Check }[] = yield db.table("checks2").filter((check: any) => {
        return check.check.product_id === action.payload.product_id;
    }).toArray();
    for (const checkRecord of records) {
        const {check} = checkRecord;
        check.product_number = action.payload.number;
        yield db.table("checks2").where({check_id: check.check_id}).modify({check});
    }
}

function* updateDiscrepancy(action: UpdateDiscrepancyAction) {
    const token = yield select((state: RootState) => state.app.token);
    if (!token) {
        return;
    }
    if (yield select((state: RootState) => state.app.isOffline)) {
        return yield put(addTaskAction(action, 0));
    }
    try {
        yield fetch(OPERATION_API, {
            method: 'POST',
            headers: {token: token, v: API_VERSION},
            body: JSON.stringify(action.payload)
        }).then(res => res.json());
        yield put(deleteTaskAction(action.taskId));
    } catch (error) {
        yield put(addTaskAction(action, 0));
        yield put(requestErrorAction(action.taskId));
    }
}

export function* checksSaga() {
    yield takeLeading(SET_STAGES, setStages);
    yield takeLeading(FETCH_STAGES, fetchStages);
    yield takeLeading(SET_CHECKS_DATA, storeChecks);
    yield takeLeading(STORE_CHECK_DATA, storeCheck);
    yield takeLeading(FETCH_CHECKS_ASAP, getChecks);
    yield debounce(500, FETCH_CHECKS, getChecks);
    yield takeLeading(UPDATE_PRODUCT, updateProduct);
    yield takeEvery(UPDATE_CHECK, updateCheck);
    yield takeEvery(UPDATE_DISCREPANCY_REQUEST, updateDiscrepancy);
}
