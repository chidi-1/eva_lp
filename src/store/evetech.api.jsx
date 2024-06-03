import {createApi, fetchBaseQuery, retry} from "@reduxjs/toolkit/query/react";

const fetch = retry(fetchBaseQuery({
        baseUrl: '',
    }),
    {
        maxRetries: 0
    }
)

export const evetechApi = createApi({
    // адрес стора с закешированными данными
    reducerPath: 'sdf',
    baseQuery: fetch,
    endpoints: build => ({
        getCorps: build.query({
            query: () => {
                let url = 'https://esi.evetech.net/latest/corporations/npccorps/?datasource=tranquility'

                return {
                    url: url,
                    method: 'GET',
                }
            }
        }),
        getCorpsNames: build.query({
            query: (params) => {
                let url = `https://esi.evetech.net/dev/corporations/${params.corpsId}`

                return {
                    url: url,
                    method: 'GET',
                }
            }
        }),
        getCorpsLoyalityOffers: build.query({
            query: (params) => {
                let url = `https://esi.evetech.net/latest/loyalty/stores/${params.corpsId}/offers/?datasource=tranquility`

                return {
                    url: url,
                    method: 'GET',
                }
            }
        }),
    })
})


export const {useGetCorpsQuery} = evetechApi
export const {useGetCorpsNamesQuery} = evetechApi
export const {useGetCorpsLoyalityOffersQuery} = evetechApi