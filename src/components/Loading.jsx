import React from 'react';
import { Skeleton, Layout } from 'antd';

const { Content } = Layout;

const Loading = ({ small = false }) => {
    return (
        <Content style={{ padding: small ? '8px' : '24px', maxWidth: '1200px', margin: 'auto' }}>
            <Skeleton active paragraph={{ rows: small ? 1 : 4 }} />
        </Content>
    );
}

export default Loading;