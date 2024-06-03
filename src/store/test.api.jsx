import {createApi, fetchBaseQuery, retry} from "@reduxjs/toolkit/query/react";

const fetch = retry(fetchBaseQuery({
        baseUrl: '',
        //credentials: "include",
        //mode: "no-cors"
    }),
    {
        maxRetries: 0
    }
)

export const testApi = createApi({
    // адрес стора с закешированными данными
    reducerPath: 'items',
    baseQuery: fetch,
    endpoints: build => ({
        getId: build.query({
            query: (params) => {
                /*let data = {'action': 'get_ids'};
                if (params) data['params'] = params;*/
                let url = 'https://www.fuzzwork.co.uk/api/typeid.php?typename=' + params['name']

                return {
                    url: url,
                    method: 'GET',
                    //body: data
                }
            }
        }),
        getName: build.query({
            query: (params) => {
                let url = 'https://www.fuzzwork.co.uk/api/typeid.php?typeid=' + params['id']
                return {
                    url: url,
                    method: 'GET',
                }
            }
        }),
        getPriceWeek: build.query({
            query: (params) => {
                let url = 'https://market.fuzzwork.co.uk/aggregates/?region=' + params['region'] + '&types=' + params['id']

                return {
                    url: url,
                    method: 'GET',
                }
            }
        }),
        getPricesWeek: build.query({
            query: (params) => {
                let url = 'https://market.fuzzwork.co.uk/aggregates/?region=' + params['region'] + '&types=' + params['ids'].join(',')

                return {
                    url: url,
                    method: 'GET',
                }
            }
        }),
        getBluePrints: build.query({
            query: (params) => {
                let url = 'https://sde.hoboleaks.space/tq/blueprints.json'

                return {
                    url: url,
                    method: 'GET',
                }
            }
        }),
    })
})

export const {useGetIdQuery} = testApi
export const {useGetNameQuery} = testApi
export const {useGetPriceWeekQuery} = testApi
export const {useGetPricesWeekQuery} = testApi
export const {useGetBluePrintsQuery} = testApi