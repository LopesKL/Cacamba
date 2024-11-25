import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";

// Componente RouteWrapper que recebe um componente "element" e verifica os papéis (roles) do usuário
const RouteWrapper = ({ element: Element, auth = false, roles = [], ...props }) => {
    const { user } = useAuth(); // Obtém o usuário autenticado através do hook useAuth
    const navigate = useNavigate(); // Hook do React Router para redirecionamento de navegação

    useEffect(() => {
        // Se o usuário estiver autenticado e os papéis forem fornecidos (não nulos)
        if (user && roles.length > 0) {
            // Verifica se o usuário tem algum dos papéis exigidos (roles)
            const hasRole = user.roles?.some(role => roles.includes(role.name));

            // Se o usuário não tiver um dos papéis exigidos, redireciona para a página inicial
            if (!hasRole) {
                navigate("/", { replace: true });
            }
        }

        // Se o usuário não estiver autenticado e roles estiverem definidos para a rota, redireciona para a página inicial
        if (!user && auth) {
            navigate("/signIn", { replace: true });
        }
    }, [user, roles, navigate]); // Executa o efeito quando user, roles ou navigate mudarem

    // Renderiza o componente passado como 'Element' com todas as props adicionais
    return <Element {...props} />;
};

export default RouteWrapper;
