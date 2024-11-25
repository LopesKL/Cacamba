import { Button, Card, Col, Layout, Modal, Row, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { AiFillDelete, AiFillEdit, AiOutlineArrowLeft, AiOutlinePlus } from 'react-icons/ai';
import DynamicForm from '../../components/Form';
import Loading from '../../components/Loading';
import PaginatedTable from '../../components/PaginatedTable';
import Api from '../../services/api';

const { confirm } = Modal;
const { Content } = Layout;

const Table = () => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const [editingRecord, setEditingRecord] = useState(null);

  const [formValues, setFormValues] = useState({});
  const [formConfig] = useState([
    {
      title: "Add",
      columns: 2,
      questions: [
        { type: "text", id: "123123", required: true, placeholder: "Digite um texto", label: "Nome" },
        { type: "integer", id: "integer", required: true, placeholder: "Digite um número inteiro", label: "Número Caçamba" },
      ],
    },
    {
      columns: 1,
      questions: [
        { type: "text", id: "234234", required: true, placeholder: "Digite um texto", label: "Endereço" },
      ],
    },
    {
      columns: 2,
      questions: [
        { type: "select", id: "te234234xt", required: true,  label: "Entrada", options: [{label: "Vazio", value: "vazio"}, {label: "Areia", value: "areia"},{label: "Brita", value: "brita"}] },
        { type: "select", id: "tex23423t", required: true, label: "Saida" , options: [{label: "Vazio", value: "vazio"}, {label: "Entulho", value: "Entulho"}] },
      ],
    },

  ]);

  const [filters, setFilters] = useState({ text: '', integer: '' }); // Estado para armazenar os filtros
  const [filterFormConfig] = useState([
    {
      columns: 2,
      questions: [
        {
          type: "text",
          id: "text",
          required: false,
          placeholder: "Digite um texto para filtrar",
          label: "Filtrar por Texto"
        },
        {
          type: "integer",
          id: "integer",
          required: false,
          placeholder: "Digite um número para filtrar",
          label: "Filtrar por Número"
        },
      ],
    },
  ]);

  const tableRef = useRef(null);

  // Atualiza o fetchData para incluir os filtros
  const fetchData = useCallback(
    async (page, pageSize, sorterField, sortOrder) => {
      setLoading(true);
      try {
        const response = await Api.post('/crud/getAll', {
          page,
          pageSize,
          sorterField,
          sortOrder,
          ...filters, // Inclui os filtros no request
        });
        return { data: response.data.response.data, total: response.data.response.recordsTotal };
      } catch (error) {
        message.error('Erro ao buscar dados.');
        console.error('Erro ao buscar dados:', error);
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const handleAdd = useCallback(() => {
    setEditingRecord(null);
    setFormValues({});
    setView('form');
  }, []);

  const handleEdit = useCallback(async (record) => {
    setLoading(true);
    try {
      const result = await Api.get(`/crud/getById/${record.id}`);
      const fetchedRecord = result.data.response;
      const deserializedRecord = {
        ...fetchedRecord,
        files: fetchedRecord.files ? JSON.parse(fetchedRecord.files) : [],
        multiSelect: fetchedRecord.multiSelect ? JSON.parse(fetchedRecord.multiSelect) : [],
      };
      setEditingRecord(fetchedRecord);
      setFormValues(deserializedRecord);
      setView('form');
    } catch (error) {
      message.error('Erro ao buscar o registro.');
      console.error('Erro ao buscar registro:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = useCallback((record) => {
    confirm({
      title: 'Confirmar exclusão',
      content: 'Tem certeza de que deseja excluir este registro?',
      okText: 'Sim',
      okType: 'danger',
      cancelText: 'Não',
      onOk: async () => {
        setLoading(true);
        try {
          await Api.delete(`/crud/${record.id}`);
          message.success('Registro excluído com sucesso!');
          if (tableRef.current) {
            tableRef.current.reloadTable();
          }
        } catch (error) {
          message.error('Erro ao excluir registro.');
          console.error('Erro ao excluir registro:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  }, []);

  const handleSave = useCallback(
    async (values) => {
      setLoading(true);
      try {
        const serializedValues = {
          ...values,
          files: JSON.stringify(values.files || []),
          multiSelect: JSON.stringify(values.multiSelect || []),
        };

        await Api.post('/crud/upsert', { ...serializedValues, id: editingRecord?.id });
        message.success(editingRecord ? 'Registro atualizado com sucesso!' : 'Registro adicionado com sucesso!');
        setView('list');
        if (tableRef.current) {
          tableRef.current.reloadTable();
        }
      } catch (error) {
        message.error('Erro ao salvar registro.');
        console.error('Erro ao salvar registro:', error);
      } finally {
        setLoading(false);
      }
    },
    [editingRecord]
  );

  const handleCancel = useCallback(() => {
    setView('list');
  }, []);

  // Função para aplicar os filtros e recarregar a tabela
  const handleFilter = (values) => {
    setFilters(values); // Atualiza os filtros
    if (tableRef.current) {
      tableRef.current.reloadTable(); // Recarrega a tabela com os novos filtros
    }
  };

  const columns = [
    { title: 'Texto', dataIndex: 'text', key: 'text' },
    { title: 'Número', dataIndex: 'integer', key: 'integer' },
    {
      title: 'Ações',
      key: 'actions',
      width: 250,
      render: (text, record) => (
        <Row gutter={8}>
          <Col>
            <Button onClick={() => handleEdit(record)} icon={<AiFillEdit />} disabled={loading}>
              Editar
            </Button>
          </Col>
          <Col>
            <Button danger onClick={() => handleDelete(record)} icon={<AiFillDelete />} disabled={loading}>
              Excluir
            </Button>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <Layout>
      <Content>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Card
              title="Crud"
              bordered={false}
              extra={
                view === 'list' ? (
                  <Button type="primary" icon={<AiOutlinePlus />} onClick={handleAdd} disabled={loading}>
                    Adicionar Registro
                  </Button>
                ) : view === 'form' ? (
                  <Button type="primary" icon={<AiOutlineArrowLeft />} onClick={handleCancel} disabled={loading}>
                    Voltar para a Lista
                  </Button>
                ) : null
              }
            >
              {view === 'list' ? (
                <div>
                  <DynamicForm formConfig={filterFormConfig} values={filters} submitOnSide setValues={setFilters} onSubmit={handleFilter} />
                  <PaginatedTable ref={tableRef} disabled={loading} fetchData={fetchData} initialPageSize={5} columns={columns} />
                </div>
              ) : (
                <div>
                  {loading ? <Loading /> : <DynamicForm formConfig={formConfig} values={formValues} setValues={setFormValues} onSubmit={handleSave} onClose={handleCancel} />}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default Table;