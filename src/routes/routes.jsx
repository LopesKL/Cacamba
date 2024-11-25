import React from "react";
import { AiFillHome, AiOutlineAudit, AiOutlineForm, AiOutlinePieChart, AiOutlineWindows } from 'react-icons/ai';
import { roles } from '../helpers/roles';

// Carregamento preguiçoso (lazy loading) das páginas
const Home = React.lazy(() => import('../pages/Home'));
const Table = React.lazy(() => import('../pages/Table'));


// Rotas dinâmicas (pode ser carregado de uma API)
export const defaultRoutes = [
    { key: '/', icon: <AiFillHome />, label: 'Home', element: Home, roles: [roles.roleAdmin] },
    { key: '/table', icon: <AiOutlineAudit />, label: 'Crud - Exemplo', element: Table, roles: [roles.roleAdmin] },
];