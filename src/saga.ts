import {fork, takeLeading, put, select, call, putResolve, delay, takeEvery} from "redux-saga/effects";
import {checksSaga} from "./screens/cheks-list/saga";
import {loginFlow, logoutFlow} from './screens/login/saga'
import {
    ADD_TASK, addTaskAction, AddTaskAction,
    DELETE_PHOTO, DELETE_TASK,
    DeletePhotoAction, deleteTaskAction, DeleteTaskAction, INIT_CHECKS, INIT_STAGES,
    INIT_APP, onlineAction, requestErrorAction, resetSyncedTasksAction, RUN_PING_LOOP, RUN_SYNC_PROCESSING,
    SEND_FEATURES,
    SEND_PHOTO, SendFeatureActions,
    SendPhotoAction, setNeedUpdateAfterSyncAction, diffSyncedTasksAction, setTasksCountAction,
    setTokenAction, setProfileAction, FETCH_PROFILE
} from "./actions";
import {Profile, RootState} from "./reducer";
import * as Sentry from "@sentry/browser";
import {API_VERSION, FEATURE_API, FEATURES_API, PHOTO_API, PING_API, PROFILE_API} from "./constants/config";
import {fetchChecksAction, setChecksData, setStagesAction} from "./screens/cheks-list/actions";
import {Check, Stage} from "./screens/cheks-list/reducer";
import {setLoginAction} from "./screens/login/action";
import {knotsSaga} from "./screens/knots-list/saga";
import {ticketsSaga} from "./screens/support/saga";
import {mailGunSaga} from "./screens/question-create/saga";

function* initApp() {
    const token = localStorage.getItem('token');
    const login = localStorage.getItem("login");
    const profile = localStorage.getItem("profile");

    if (token) {
        yield put(setTokenAction(token))
    }
    if (login) {
        yield put(setLoginAction(login));
    }

    if (profile) {
        try {
            const parsedProfile = JSON.parse(profile);
            if (parsedProfile) {
                yield put(setProfileAction(parsedProfile as Profile));
            }
        } catch (e) {
            console.log(e);
        }
    }
}

function* initChecks() {
    const db = yield select((state: RootState) => state.app.dexie);
    const data: { id: string, check: Check }[] = yield db.table("checks2").toArray();
    const values = data.map(value => value.check);
    yield put(setChecksData(values as Check[], false));
}

function* initStages() {
    const db = yield select((state: RootState) => state.app.dexie);
    const data: { id: string, stage: Stage }[] = yield db.table("stages").toArray();
    if (!data || data.length === 0) return;
    const values = data.map(value => value.stage);
    if (!values) return;
    yield put(setStagesAction(values as Stage[], false));
}

function* sendFeatures(action: SendFeatureActions) {
    if (yield select((state: RootState) => state.app.isOffline)) {
        return yield put(addTaskAction(action, 0));
    }
    try {
        const token = yield select((state: RootState) => state.app.token);
        if (!token) {
            return yield;
        }

        for (const feature of action.payload) {
            delete feature.photos;
        }

        yield fetch(FEATURES_API, {
            method: 'POST',
            headers: {token: token, v: API_VERSION},
            body: JSON.stringify(action.payload)
        });
        yield put(deleteTaskAction(action.taskId));
    } catch (error) {
        console.log(error);
        yield put(addTaskAction(action, 0));
        yield put(requestErrorAction(action.taskId));
    }
}

function* sendPhoto(action: SendPhotoAction) {
    if (yield select((state: RootState) => state.app.isOffline)) {
        return yield put(addTaskAction(action, 0));
    }
    try {
        const token = yield select((state: RootState) => state.app.token);
        if (!token) {
            return yield;
        }
        const data = {
            feature_id: action.payload.feature_id,
            type: 1,
            uid: action.payload.photo.uid,
            rotate: action.payload.photo.rotate,
            content: action.payload.photo.source ? action.payload.photo.source.replace('data:image/jpeg;base64,', '') : action.payload.photo.source,
            mode: action.mode
        };
        yield fetch(PHOTO_API, {
            method: 'POST',
            headers: {token: token, v: API_VERSION},
            body: JSON.stringify(data)
        });
        yield put(deleteTaskAction(action.taskId));
    } catch (error) {
        yield put(addTaskAction(action, 0));
        yield put(requestErrorAction(action.taskId));
    }
}

function* deletePhoto(action: DeletePhotoAction) {
    if (yield select((state: RootState) => state.app.isOffline)) {
        return yield put(addTaskAction(action, 0));
    }
    try {
        const token = yield select((state: RootState) => state.app.token);
        if (!token) {
            Sentry.captureException(new Error("No token provided"));
            return yield;
        }
        const data = {
            uid: action.payload
        };
        yield fetch(PHOTO_API, {
            method: 'DELETE',
            headers: {token: token, v: API_VERSION},
            body: JSON.stringify(data)
        });
        yield put(deleteTaskAction(action.taskId));
        yield put(fetchChecksAction());
    } catch (error) {
        yield put(addTaskAction(action, 0));
        yield put(requestErrorAction(action.taskId));
    }
}

function* addTask(action: AddTaskAction) {
    const db = yield select((state: RootState) => state.app.dexie);
    if (yield db.table("tasks").get(action.payload.taskId)) {
        return;
    }
    try {
        yield db.table("tasks").put({
            id: action.payload.taskId,
            task: action.payload,
            priority: action.priority
        });
        const tasksCount: number = yield db.table("tasks").count();
        yield put(setTasksCountAction(tasksCount));
        yield put(resetSyncedTasksAction());
    } catch (error) {
        console.log(error);
    }
}

function* syncLoop() {
    const db = yield select((state: RootState) => state.app.dexie);
    while (true) {
        if (yield select((state: RootState) => state.app.isOffline)) {
            yield delay(1000);
            continue;
        }
        const first = yield db.table("tasks").toCollection().first();
        if (first) {
            yield putResolve(first.task);
            yield put(setNeedUpdateAfterSyncAction(true));
            yield put(diffSyncedTasksAction(yield db.table("tasks").count()));
        } else {
            if (yield select((state: RootState) => state.app.needFetchAfterSync)) {
                yield putResolve(setNeedUpdateAfterSyncAction(false));
                yield putResolve(fetchChecksAction());
                yield put(setTasksCountAction(0));
                yield put(resetSyncedTasksAction())
            }
        }
        yield delay(200);
    }
}

function* pingLoop() {
    while (true) {
        if (yield select((state: RootState) => state.app.isOffline)) {
            yield call(ping);
        }
        yield delay(1000);
    }
}

function* deleteTask(action: DeleteTaskAction) {
    const db = yield select((state: RootState) => state.app.dexie);
    yield db.table("tasks").delete(action.payload);
}

function* ping() {
    try {
        const token = yield select((state: RootState) => state.app.token);
        if (!token) {
            Sentry.captureException(new Error("No token provided"));
            return yield;
        }
        yield fetch(PING_API, {
            method: 'GET',
            headers: {token: token, v: API_VERSION},
        });
        yield putResolve(onlineAction())
    } catch (error) {
        console.log(error);
    }
}

function* fetchProfile() {
    try {
        const token = yield select((state: RootState) => state.app.token);
        if (!token) {
            return yield;
        }
        const response: { success: string, response: Profile } = yield fetch(PROFILE_API, {
            method: 'GET',
            headers: {token: token, v: API_VERSION},
        }).then(res => res.json());

        if (response.success === "true") {
            yield put(setProfileAction(response.response));
            localStorage.setItem("profile", JSON.stringify(response.response));
        }

    } catch (error) {
        console.log(error);
    }
}

export default function* root() {
    yield fork(checksSaga);
    yield fork(loginFlow);
    yield fork(logoutFlow);
    yield fork(knotsSaga);
    yield fork(ticketsSaga);
    yield fork(mailGunSaga);
    yield takeLeading(INIT_APP, initApp);
    yield takeLeading(INIT_CHECKS, initChecks);
    yield takeLeading(INIT_STAGES, initStages);
    yield takeLeading(FETCH_PROFILE, fetchProfile);
    yield takeLeading(SEND_FEATURES, sendFeatures);
    yield takeLeading(SEND_PHOTO, sendPhoto);
    yield takeLeading(DELETE_PHOTO, deletePhoto);
    yield takeEvery(ADD_TASK, addTask);
    yield takeLeading(RUN_SYNC_PROCESSING, syncLoop);
    yield takeLeading(DELETE_TASK, deleteTask);
    yield takeLeading(RUN_PING_LOOP, pingLoop);
}
