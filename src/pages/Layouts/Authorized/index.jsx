import { DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Dropdown, Layout, Menu, Row, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import CustomModal from '../../../components/Modal';
import { useAuth } from '../../../hooks/auth';
import { defaultRoutes } from '../../../routes/routes';
import { colors } from '../../../styles/colors';

const { Header, Content, Sider } = Layout;
const { Text, Title } = Typography;

// Componente para o Card de Perfil do Usuário
const UserProfileCard = ({ userName, userRole, appVersion = '1.0.0' }) => {
    const { signOut } = useAuth();

    return (
        <Card
            style={{
                width: 300,
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
        >
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
                <Avatar size={64} icon={<UserOutlined />} />
                <Title level={4}>{userName}</Title>
                <Text type="secondary">{userRole}</Text>
                <Text type="secondary">v{appVersion}</Text>

                <Button type="primary" onClick={() => signOut()}>
                    Sair
                </Button>
            </Space>
        </Card>
    );
};

// Função para gerar itens do Menu dinamicamente
const generateMenuItems = (routes) => {
    return routes.map((route) => {
        if (route.children) {
            return {
                key: route.key,
                icon: route.icon,
                label: route.label,
                children: generateMenuItems(route.children), // Gera os submenus recursivamente
            };
        }
        return {
            key: route.key,
            icon: route.icon,
            label: route.label,
        };
    });
};

// Componente Principal Autorizado
const Authorized = ({ children, userName }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [openKeys, setOpenKeys] = useState([]);
    const [routes] = useState(defaultRoutes); // Estado inicial com rotas dinâmicas
    const [collapsed, setCollapsed] = useState(true); // Estado para controlar o collapse
    const [openConfirmModal, setOpenConfirmModal] = useState(false); // Estado para controlar a visibilidade do modal de confirmação

    // Efeito para determinar quais submenus devem estar abertos com base na rota atual
    useEffect(() => {
        const segments = location.pathname.split('/').filter(Boolean);
        const rootSubmenuKeys = defaultRoutes.map((x) => x.key);
        let newOpenKeys = [];

        if (segments.length === 0) {
            newOpenKeys = ['/main'];
        } else {
            const firstSegment = `/${segments[0]}`;
            if (rootSubmenuKeys.includes(firstSegment)) {
                newOpenKeys = [firstSegment];
            } else {
                newOpenKeys = ['/main'];
            }
        }

        setOpenKeys(newOpenKeys);
    }, [location]);

    // Função para lidar com mudanças nos submenus abertos
    const handleOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    // Função para alternar o estado de colapso
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };

    // Função para lidar com cliques no menu e verificar se é a mesma rota
    const handleMenuClick = ({ key }) => {
        if (key === location.pathname) {
            setOpenConfirmModal(true); // Abre o modal de confirmação se a rota for a mesma
        } else {
            navigate(key);
        }
    };

    // Função de confirmação para recarregar a página
    const handleConfirm = () => {
        setOpenConfirmModal(false); // Fecha o modal
        navigate(0); // Recarrega a página
    };

    // Definição dos itens do menu lateral
    const sidebarMenu = (
        <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            style={{ height: '100%', borderRight: 0 }}
            onClick={handleMenuClick} // Adiciona a lógica de clique no menu
            items={generateMenuItems(routes)} // Gera os itens do menu dinamicamente
        />
    );

    // Definição do menu dropdown do usuário
    const userDropdownMenu = (
        <div style={{ padding: '16px' }}>
            <UserProfileCard userName={'Teste'} userRole={'Admin'} appVersion={'1.0.0'} />
        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ backgroundColor: colors.primary, position: 'sticky', top: 0, zIndex: 1, padding: '0 16px', height: 75 }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Row align="middle" gutter={16}>
                            <Col>
                                <Button
                                    type="text"
                                    onClick={toggleCollapsed}
                                    style={{
                                        color: '#fff',
                                        fontSize: '16px',
                                        marginRight: '16px',
                                    }}
                                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                />
                            </Col>
                            {/* Logo e Título */}
                            <Col onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <img src={logo} alt="Logo" style={{ width: "50%", height: 80 }} />
                                <Text style={{ color: '#fff', fontSize: '20px', marginLeft: '8px' }}>Meu Caçambas</Text>
                            </Col>
                        </Row>
                    </Col>

                    {/* Seção Direita do Header */}
                    <Col>
                        <Dropdown overlay={userDropdownMenu} trigger={['click']} placement="bottomRight">
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <Avatar size={24} icon={<UserOutlined />} />
                                    {!collapsed && <Text style={{ color: '#fff' }}>Admin</Text>}
                                    <DownOutlined style={{ color: '#fff' }} />
                                </Space>
                            </a>
                        </Dropdown>
                    </Col>
                </Row>
            </Header>

            {/* Layout Principal com Sider e Conteúdo */}
            <Layout>
                {/* Barra Lateral (Sider) */}
               <Sider
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    width={200}
                    style={{
                        backgroundColor: '#fff',
                        position: 'sticky',
                        top: 66,
                        height: '92vh',
                        overflow: 'auto', // Permite rolar o conteúdo do Sider caso ele seja maior que a tela
                    }}
                >
                    {sidebarMenu}
                </Sider>

                {/* Conteúdo Principal */}
                <Layout>
                    <Content style={{ padding: '24px', margin: 0, minHeight: 280 }}>
                        <main role="main">{children}</main>
                    </Content>
                </Layout>
            </Layout>

            {/* Modal de confirmação para recarregar a página */}
            <CustomModal
                title="Recarregar Página"
                content="Você já está nesta página. Deseja recarregar?"
                open={openConfirmModal}
                confirmFunction={handleConfirm} // Função de confirmação
                confirmButtonText="Recarregar"
                onCancel={() => setOpenConfirmModal(false)} // Fecha o modal ao cancelar
            />
        </Layout>
    );
};

export default Authorized;
