import {configureStore} from "@reduxjs/toolkit";
import {testApi} from "./test.api";
import {evetechApi} from "./evetech.api";

export const store = configureStore({
    reducer: {
        [testApi.reducerPath]: testApi.reducer,
        [evetechApi.reducerPath]: evetechApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(testApi.middleware).concat(evetechApi.middleware),
})