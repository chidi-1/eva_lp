import './App.css'
import React, {useEffect, useState} from "react";
import {useGetCorpsLoyalityOffersQuery, useGetCorpsQuery} from "./store/evetech.api";
import TableLoyalityShop from "./components/tableLoyalityShop";

export const RegionContext = React.createContext(10000002);
export const ItemsListNames = React.createContext({});

function App() {
    const [currentRegion, setCurrentRegion] = useState('10000002');
    const [corps, setCorps] = useState([]);
    const corpsRequest = useGetCorpsQuery();

    useEffect(() => {
        if (corpsRequest.isSuccess) {
            setCorps(corpsRequest.data);
        }
    }, [corpsRequest.data, corpsRequest.isLoading])

    return (
        <>
            <select defaultValue='10000002' onChange={(e) => setCurrentRegion(e.target.value)}>
                <option value='10000043'>Ammar</option>
                <option value='10000002'>Jito</option>
            </select>
            <RegionContext.Provider value={currentRegion}>
                <ItemsListNames.Provider value={{17841: 'aaa', 17843: 'vvv', 17848: 'sf'}}>
                    <TableLoyalityShop corps={corps} />
                </ItemsListNames.Provider>
            </RegionContext.Provider>
        </>
    )
}

export default App
