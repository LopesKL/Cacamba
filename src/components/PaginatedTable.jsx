import { Button, message, Space, Table } from 'antd';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';

/**
 * Componente de Tabela Paginada Personalizada
 *
 * @param {function} fetchData - Função assíncrona para buscar dados do backend. Recebe (page, pageSize, sorterField, sortOrder).
 * @param {number} initialPageSize - Define o tamanho inicial da página. Default: 5.
 * @param {boolean} disabled - Desativa a tabela e suas interações. Default: false.
 * @param {array} columns - Array de colunas da tabela no formato [{ title: 'Nome', dataIndex: 'nome', key: 'nome' }].
 * @param {array} actions - Array de objetos para botões de ação na tabela. Exemplo: [{ label: 'Editar', onClick: (record) => {} }].
 * @param {string} rowKey - Chave única para cada linha. Default: 'id'.
 * @param {object} rowSelection - Configurações para seleção de linhas. Exemplo: { selectedRowKeys, onChange: (keys) => {} }.
 * @param {object} expandable - Configurações para linhas expansíveis. Exemplo: { expandedRowRender: (record) => <p>{record.description}</p> }.
 * @param {object} scroll - Define o scroll da tabela para tornar responsiva. Default: { x: 'max-content' }.
 * @param {object} restProps - Outras propriedades padrão para a tabela do Ant Design.
 */
const PaginatedTable = forwardRef(
    (
        {
            fetchData,
            initialPageSize = 5,
            disabled = false,
            columns,
            actions = [],
            rowKey = 'id',
            rowSelection = null, // Adiciona suporte para seleção de linhas
            expandable = null, // Suporte para linhas expansíveis
            scroll = { x: 'max-content' }, // Responsividade
            ...restProps // Permite passar outras propriedades para a tabela
        },
        ref
    ) => {
        const [data, setData] = useState([]);
        const [pagination, setPagination] = useState({
            current: 1,
            pageSize: initialPageSize,
            total: 0,
            showSizeChanger: true, // Adiciona o seletor de tamanho de página
            pageSizeOptions: ['1', '2', '5', '10', '20', '50'],
            showTotal: (total, range) => `Mostrando ${range[0]}-${range[1]} de ${total} itens`, // Exibe total de itens
        });
        const [loading, setLoading] = useState(false);
        const [sorter, setSorter] = useState({ field: null, order: null }); // Estado para manter a ordenação atual
        const [selectedRowKeys, setSelectedRowKeys] = useState([]); // Estado para linhas selecionadas

        // Função para buscar dados do backend
        const getData = async (page, pageSize, sorterField, sortOrder) => {
            setLoading(true);
            try {
                // Passa sorterField e sortOrder para a requisição ao backend
                const response = await fetchData(page, pageSize, sorterField, sortOrder);
                setData(response.data); // Dados retornados para a tabela
                setPagination((prev) => ({
                    ...prev,
                    current: page,
                    pageSize: pageSize,
                    total: response.total,
                }));
            } catch (error) {
                message.error('Erro ao carregar os dados.');
            } finally {
                setLoading(false);
            }
        };

        // Função chamada ao mudar a página, tamanho da página ou a ordenação
        const handleTableChange = (newPagination, filters, newSorter) => {
            if (disabled) return; // Bloqueia mudanças na tabela se `disabled` for true

            const { current, pageSize } = newPagination;
            const sorterField = newSorter?.field || null;
            const sortOrder = newSorter?.order || null;

            setSorter({ field: sorterField, order: sortOrder }); // Atualiza o estado de ordenação
            getData(current, pageSize, sorterField, sortOrder);
        };

        // Expor a função `reloadTable` para recarregar os dados de fora do componente
        useImperativeHandle(ref, () => ({
            reloadTable() {
                getData(pagination.current, pagination.pageSize, sorter?.field, sorter?.order); // Recarregar a tabela
            },
        }));

        useEffect(() => {
            getData(pagination.current, pagination.pageSize, sorter?.field, sorter?.order);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // Adicionar a coluna de ações, se existirem botões de ação
        const actionColumn = actions.length
            ? [
                {
                    title: 'Ações',
                    key: 'actions',
                    fixed: 'right',
                    width: 150,
                    render: (text, record) => (
                        <Space wrap>
                            {actions.map((action, index) => (
                                <Button
                                    key={index}
                                    type={action.type || 'default'}
                                    onClick={() => action.onClick(record)}
                                    loading={action.loading}
                                    disabled={disabled || action.disabled}
                                    danger={action.danger || false}
                                >
                                    {action.label}
                                </Button>
                            ))}
                        </Space>
                    ),
                },
            ]
            : [];

        // Mapear colunas e adicionar `sorter` apenas onde for necessário
        const combinedColumns = columns.map((column) => ({
            ...column,
            sorter: column.dataIndex && column.dataIndex !== 'actions', // Adiciona `sorter: true` apenas se `dataIndex` estiver presente e não for a coluna de ações
            sortOrder: sorter.field === column.dataIndex ? sorter.order : null, // Define a ordenação atual com base no estado
        })).concat(actionColumn);

        return (
            <Table
                dataSource={data}
                columns={combinedColumns}
                pagination={{
                    ...pagination,
                    disabled: disabled, // Desativa a paginação quando `disabled` for true
                }}
                loading={loading}
                onChange={handleTableChange} // Função chamada ao mudar página, ordenação, etc.
                rowKey={rowKey} // Usar rowKey configurável
                scroll={scroll} // Adiciona scroll horizontal para evitar layout quebrado com muitas colunas
                rowSelection={
                    rowSelection
                        ? {
                            selectedRowKeys,
                            onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
                            ...rowSelection,
                        }
                        : null
                }
                expandable={expandable} // Suporte para linhas expansíveis
                {...restProps} // Permite passar outras propriedades para a tabela
            />
        );
    }
);

export default PaginatedTable;
