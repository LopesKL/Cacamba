import { Col, Layout, Row, Typography } from 'antd';
import React from 'react';

const { Content } = Layout;
const { Title } = Typography;

const NotFound = () => {
    return (
        <Layout>
            <Content>
                <Row gutter={[8, 8]}>
                    <Col span={8}>
                        <Title>Página não encontrada</Title>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default NotFound;
