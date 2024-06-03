import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable
} from "@tanstack/react-table";
import React, {useContext, useEffect, useState} from "react";
import {useGetCorpsLoyalityOffersQuery, useGetCorpsNamesQuery} from "../store/evetech.api";
import {ItemsListNames, RegionContext} from "../App";

const defaultData = []

const columnHelper = createColumnHelper();

const columns = [
        columnHelper.accessor('corp_id', {
            header: 'Corp id',
            filterFn: 'includesString',
        }),
        columnHelper.accessor('isk_cost', {
            header: 'Isk cost'
        }),
        columnHelper.accessor('lp_cost', {
            header: 'Lp cost'
        }),
        columnHelper.accessor('quantity', {
            header: 'Quantity'
        }),
        columnHelper.accessor('required_items', {
            header: 'Required items',
            cell: info => {
                let infoData = info.getValue();
                let string = [];
                for (let i = 0; i < infoData.length; i++) {

                    string.push(<p key={infoData[i].type_id}>{infoData[i].type_id}: {infoData[i].quantity}</p>)
                }
                return string;
            }
        }),
        columnHelper.accessor('type_name', {
            header: 'Type name'
        }),
]

export default function TableLoyalityShop({corps}) {
    const [data, _setData] = React.useState(() => [...defaultData])
    const [columnFilters, setColumnFilters] = useState([{
        id: 'corp_id',
        value: '',
    },])
    const rerender = React.useReducer(() => ({}), {})[1]
    const itemsListNames = useContext(ItemsListNames);
    const currentRegion = useContext(RegionContext);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [activeCorpIndex, setActiveCorpIndex] = useState(-1);
    const [itemsListIds, setItemsListIds] = useState([])
    const [itemsListPrices, setItemsListPrices] = useState({})
    const [corpsLoaded, setCorpsLoaded] = useState(false);

    const offerRequest = useGetCorpsLoyalityOffersQuery({corpsId: corps.length && corps[activeCorpIndex]}, {skip: activeCorpIndex < 0});
    const corpName = useGetCorpsNamesQuery({corpsId: corps.length && corps[activeCorpIndex]}, {skip: activeCorpIndex < 0});

    if (corps.length > 0 && activeCorpIndex < 0) {
        setActiveCorpIndex(0)
    }

    useEffect(() => {
        if (offerRequest.isSuccess && corpName.isSuccess) {
            let newIds = [];

            let offerData = offerRequest.data.map((item) => {
                let required_items = [];
                required_items = item.required_items.map((required_item) => {
                    if(!itemsListIds.includes(required_item.type_id)) {
                        newIds.push(required_item.type_id)
                    }
                    return ({'type_id': itemsListNames[required_item.type_id] ?? required_item.type_id, 'quantity': required_item.quantity})
                })
                if(!itemsListIds.includes(item.type_id)) {
                    newIds.push(item.type_id);
                }
                let sdf = {'corp_id': corpName.data.name, 'type_name': itemsListNames[item.type_id] ?? item.type_id};
                Object.assign(sdf, item, {'required_items': required_items});
                return sdf;
            });

            setItemsListIds(itemsListIds.concat(newIds))

            _setData(data.concat(offerData))
            if (activeCorpIndex < 3) {
                setActiveCorpIndex(activeCorpIndex + 1);
            } else {
                setCorpsLoaded(true);
            }
        }
    }, [offerRequest.data, offerRequest.isLoading, corpName.isLoading, corpName.data])

    /*useEffect(() => {
        if(corpsLoaded) {
            let counter = {counter: 0};
            let prices = {};
            for(let i = 0; i < itemsListIds.length; i = i + 50) {
                counter.counter++;
                let currentIndexes = itemsListIds.slice(i, i+50).join(',');
                let pricesResponse = fetch(`https://market.fuzzwork.co.uk/aggregates/?region=${currentRegion}&types=${currentIndexes}`)
                pricesResponse.then((data)=> data.json().then((data)=> {
                    prices = {...prices, data};
                    counter.counter--;
                }))
            }
            while (counter.counter < 9){
                console.log(counter.counter)
            }
            setItemsListPrices(prices);
            console.log(prices)
        }
    } ,[corpsLoaded])*/

    useEffect(() => {
        if(corpsLoaded) {
            let promises = [];
            let promises2 = [];
            let prices = {};
            for(let i = 0; i < itemsListIds.length; i = i + 50) {
                let currentIndexes = itemsListIds.slice(i, i+50).join(',');
                let pricesResponse = fetch(`https://market.fuzzwork.co.uk/aggregates/?region=${currentRegion}&types=${currentIndexes}`);
                promises.push(pricesResponse);
            }

            Promise.all(promises).then((data) => {
                data.forEach((item) => {
                    promises2.push(item.json());
                })

                Promise.all(promises2).then((data2) => {
                    data2.forEach((item) => {
                        prices = {...prices, ...item};
                    })

                    setItemsListPrices(prices);
                })
            })
        }
    } ,[corpsLoaded])

    useEffect(() => {}, [itemsListPrices])

    const table = useReactTable({
            renderFallbackValue: 'N/A',
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            getSortedRowModel: getSortedRowModel(),
            getFilteredRowModel: getFilteredRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            onPaginationChange: setPagination,
            state: {
                pagination,
                columnFilters,
            },

        }
    )

    return (
        <>
            <input placeholder='title' onChange={(event) => setColumnFilters([{
                id: 'corp_id',
                value: event.target.value,
            }])}/>

            <table>
                <thead>
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    :
                                    <div
                                        {...{
                                            className: header.column.getCanSort()
                                                ? 'cursor-pointer select-none'
                                                : '',
                                            onClick: header.column.getToggleSortingHandler(),
                                        }}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                        {{
                                            asc: ' 🔼',
                                            desc: ' 🔽',
                                        }[header.column.getIsSorted()] ?? null}
                                    </div>
                                }
                            </th>
                        ))}
                    </tr>
                ))}
                </thead>
                <tbody>
                {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                        {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
                <tfoot>
                {table.getFooterGroups().map(footerGroup => (
                    <tr key={footerGroup.id}>
                        {footerGroup.headers.map(header => (
                            <th key={header.id}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(
                                        header.column.columnDef.footer,
                                        header.getContext()
                                    )}
                            </th>
                        ))}
                    </tr>
                ))}
                </tfoot>
            </table>
            <button
                className="border rounded p-1"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                {'<'}
            </button>
            <button
                className="border rounded p-1"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                {'>'}
            </button>
        </>
    )
}