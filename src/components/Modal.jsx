import React from 'react';
import { Modal, Button, Space } from 'antd';

/**
 * Custom Modal Component
 * @param {string} title - Título do modal.
 * @param {string} content - Conteúdo ou texto principal do modal.
 * @param {boolean} open - Controla a visibilidade do modal.
 * @param {function} confirmFunction - Função executada ao clicar no botão de confirmação.
 * @param {string} confirmButtonText - Texto exibido no botão de confirmação.
 * @param {function} onCancel - Função executada ao clicar no botão de fechar ou cancelar.
 */
const CustomModal = ({ title, content, open, confirmFunction, confirmButtonText, onCancel, ...rest }) => {
    // Função de confirmação (internamente chama a função passada por parâmetro)
    const handleConfirm = () => {
        if (confirmFunction) confirmFunction();
    };

    return (
        <Modal
            title={title} // Título passado como prop
            open={open} // Controle de visibilidade passado como prop
            onCancel={onCancel} // Função de fechamento passada como prop
            footer={null} // Rodapé personalizado com botões internos
            {...rest}
        >
            <p>{content}</p> {/* Conteúdo principal do modal definido externamente */}
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="primary" onClick={handleConfirm}>
                    {confirmButtonText || 'Confirmar'} {/* Texto do botão de confirmação */}
                </Button>
                <Button onClick={onCancel} type="default">
                    Fechar
                </Button>
            </Space>
        </Modal>
    );
};

export default CustomModal;