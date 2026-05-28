import React, { createContext, useContext, useState } from 'react';

const StoreSettingsContext = createContext();

export function StoreSettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        storeName: 'متجر وردة',
        announcement: 'توصيل لجميع الولايات الدفع عند الاستلام'
    });

    return (
        <StoreSettingsContext.Provider value={{ settings, setSettings }}>
            {children}
        </StoreSettingsContext.Provider>
    );
}

export const useStoreSettings = () => useContext(StoreSettingsContext);
