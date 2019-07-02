import moment from "moment";
import {Check} from "../screens/cheks-list/reducer";

export const formatDate = (date: string | number, format: string = "DD.MM.YYYY", ifNot = "—"): string => {
    if (date === "0" || date === 0) {
        return ifNot
    }

    if (typeof date === "string") {
        return moment.unix(parseInt(date)).format(format);
    }

    if (typeof date === "number") {
        return moment.unix(date as number).format(format);
    }

    return "error";
};

export const sortByDateStart = (a: Check, b: Check): number => {
    if (a.date_stage_start < b.date_stage_start) {
        return -1;
    }
    if (a.date_stage_start > b.date_stage_start) {
        return 1;
    }
    if (a.date_stage_start === b.date_stage_start) {
        return 0;
    }
    return 0;
};

export const sortByValues = (a: any, b: any): number => {
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    if (a === b) {
        return 0;
    }
    return 0;
};
