import React, { Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';
import Layout from '../pages/Layouts/Authorized';
import SignIn from '../pages/SignIn';
import RouteWrapper from './route';
import { defaultRoutes } from './routes';

const NotFound = React.lazy(() => import('../pages/Layouts/Authorized/notFound'));

// Componente responsável por rolar a página para o topo sempre que o caminho mudar
const ScrollToTop = ({ children }) => {
    const location = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [location.pathname]);

    return children;
};

// Componente que aplica o Layout e o Suspense com fallback para uma tela de loading
const LayoutWithSuspense = ({ children }) => (
    <Layout>
        <Suspense fallback={<Loading />}>
            <ScrollToTop>
                {children}
            </ScrollToTop>
        </Suspense>
    </Layout>
);

// Função para gerar as rotas dinamicamente
const generateRoutes = (routes) => {
    return routes.flatMap((route) => {
        if (route.children) {
            return [
                {
                    path: route.key,
                    element: (
                        <LayoutWithSuspense>
                            <RouteWrapper element={route.element} auth />
                        </LayoutWithSuspense>
                    ),
                },
                ...route.children.map((childRoute) => ({
                    path: childRoute.key,
                    element: (
                        <LayoutWithSuspense>
                            <RouteWrapper element={childRoute.element} auth />
                        </LayoutWithSuspense>
                    ),
                })),
            ];
        }
        return {
            path: route.key,
            element: (
                <LayoutWithSuspense>
                    <RouteWrapper element={route.element} auth />
                </LayoutWithSuspense>
            ),
        };
    });
};

// Definição das rotas do aplicativo
const RoutesList = () => {
    const dynamicRoutes = generateRoutes(defaultRoutes);

    const router = createBrowserRouter([
        {
            path: "/signIn",
            element: <RouteWrapper element={SignIn} />
        },
        ...dynamicRoutes, // Adiciona as rotas dinâmicas geradas
        {
            path: "*",
            element: <LayoutWithSuspense><RouteWrapper element={NotFound} /></LayoutWithSuspense>
        },
    ]);

    return (
        <RouterProvider router={router} />
    );
};

export default RoutesList;
