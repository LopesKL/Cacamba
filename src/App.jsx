import React from 'react';
import { ConfigProvider } from 'antd';
import AppProvider from './hooks/index';
import RoutesList from './routes';
import GlobalStyle from './styles/global';

import ptBR from 'antd/es/locale/pt_BR';
import { colors } from './styles/colors';

function App() {
    return (
        <ConfigProvider
            locale={ptBR}
            theme={{
                token: {
                    colorPrimary: colors.primary, // Define a cor primária aqui
                    colorPrimaryBg: colors.background
                },
            }}
        >
            <AppProvider>
                <RoutesList forceRefresh={true} />
            </AppProvider>
            <GlobalStyle />
        </ConfigProvider>
    );
}

export default App;
