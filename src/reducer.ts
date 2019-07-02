import {Action, applyMiddleware, combineReducers, createStore} from "redux";
import loginReducer, {LoginState} from "./screens/login/reducer";
import checksReducer, {ChecksState} from "./screens/cheks-list/reducer";
import createSagaMiddleware from 'redux-saga'
import {composeWithDevTools} from 'redux-devtools-extension';
import root from "./saga";
import checkReducer, {CheckState} from "./screens/check/reducer";
import productReducer, {ProductState} from "./screens/product/reducer";
import knotsReducer, {KnotsState} from "./screens/knots-list/reducer";
import mailReducer, {MailState} from "./screens/question-create/reducer";
import ticketReducer, {TicketsState} from "./screens/support/reducer";
import {
    SET_DEXIE,
    SET_TOKEN,
    SetDexieAction,
    SetTokenAction,
    REQUEST_ERROR,
    ONLINE,
    SET_NEED_UPDATE_AFTER_SYNC,
    SetNeedUpdateAfterSyncAction,
    SET_TASKS_COUNT,
    SetTasksCountAction,
    RESET_SYNCED_TASKS, DIFF_SYNCED_TASK, DiffSyncedTasksAction, SET_PROFILE, SetProfileAction
} from "./actions";
import Dexie from "dexie";

const sagaMiddleware = createSagaMiddleware();

export interface RootState {
    app: AppState;
    checks: ChecksState;
    check: CheckState;
    product: ProductState;
    login: LoginState;
    knots: KnotsState;
    mail: MailState;
    tickets: TicketsState;
}

interface AppState {
    token: string;
    dexie: Dexie | null;
    isOffline: boolean;
    needFetchAfterSync: boolean;
    tasksCount: number;
    syncedTasks: number;
    profile: Profile | null;
}

export interface    Profile {
    uid: string;
    access: string;
    type: string;
    contractor_id: string;
    contractor_code: string;
    contractor_name: string;
    first_name: string;
    last_name: string;
    middle_name: string;
    full_name: string;
    email: string;
    phone: string;
    phone_raw: string;
    blocked: string;
}

const init: AppState = {
    token: "",
    dexie: null,
    isOffline: false,
    needFetchAfterSync: false,
    tasksCount: 0,
    syncedTasks: 0,
    profile: null
};

export interface ActionWithPayload<T> extends Action {
    payload: T;
}

const appReducer = (state = init, action: ActionWithPayload<any>) => {
    switch (action.type) {
        case SET_TOKEN:
            return {...state, token: (action as SetTokenAction).payload};
        case SET_DEXIE :
            return {...state, dexie: (action as SetDexieAction).payload};
        case REQUEST_ERROR:
            return {...state, isOffline: true};
        case ONLINE:
            return {...state, isOffline: false};
        case SET_NEED_UPDATE_AFTER_SYNC:
            return {...state, needFetchAfterSync: (action as SetNeedUpdateAfterSyncAction).payload};
        case SET_TASKS_COUNT:
            return {...state, tasksCount: (action as SetTasksCountAction).payload};
        case DIFF_SYNCED_TASK:
            return {...state, syncedTasks: state.tasksCount - (action as DiffSyncedTasksAction).payload};
        case RESET_SYNCED_TASKS:
            return {...state, syncedTasks: 0};
        case SET_PROFILE:
            return {...state, profile: (action as SetProfileAction).payload};
        default:
            return state;
    }
};

const reducer = combineReducers({
    app: appReducer,
    login: loginReducer,
    checks: checksReducer,
    check: checkReducer,
    product: productReducer,
    knots: knotsReducer,
    mail: mailReducer,
    tickets: ticketReducer,
});

const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(root);

export const configureStore = () => {
    return store;
};
