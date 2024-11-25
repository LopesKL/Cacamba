import { Button, Card, Col, Layout, Modal, Row, message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { AiOutlineArrowLeft, AiOutlinePlus } from 'react-icons/ai';
import DynamicForm from '../../components/Form';
import Loading from '../../components/Loading';
import Api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; // Importação necessária para redefinir o ícone padrão
import { Pin } from '../../components/Pin';
import PaginatedTable from '../../components/PaginatedTable';

const { confirm } = Modal;
const { Content } = Layout;

const Table = () => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('list');
  const [editingRecord, setEditingRecord] = useState(null);

  

  const [formValues, setFormValues] = useState({});

  const columns = [
    { title: 'Tipo', dataIndex: 'text', key: 'text' },
  ];

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
        { type: "select", id: "te234234xt", required: true, label: "Entrada", options: [{ label: "Vazio", value: "vazio" }, { label: "Areia", value: "areia" }, { label: "Brita", value: "brita" }] },
        { type: "select", id: "tex23423t", required: true, label: "Saida", options: [{ label: "Vazio", value: "vazio" }, { label: "Entulho", value: "Entulho" }] },
      ],
    },

  ]);

  const [filters, setFilters] = useState({ text: '', integer: '' }); // Estado para armazenar os filtros
  const [filterFormConfig] = useState([
    {
      columns: 2,
      questions: [
        {
          type: 'checkbox-group',
          id: 'checkbox-group',
          required: false,
          label: 'Combo Checkbox',
          options: [
            { label: 'Entrega', value: 'opcao1' },
            { label: 'Troca', value: 'opcao2' },
            { label: 'Retirada', value: 'opcao3' },
          ],
        },
        {
          type: "text",
          id: "text",
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

  return (
    <Layout>
      <Content>
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Card
              title="Mapa"
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
              {view === "list" ? (
                <Col span={24}>

                  <DynamicForm
                    formConfig={filterFormConfig}
                    values={filters}
                    submitOnSide
                    setValues={setFilters}
                  />
                  <Row gutter={[16, 16]}>
                    {/* Coluna do mapa */}
                    <Col span={19}>
                      <MapContainer
                        center={[-29.724075937307113, -52.436042493691474]}
                        zoom={13}
                        style={{ height: "70vh", width: "100%", borderRadius: 20 }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker position={[-29.69757011010847, -52.4351490262282]}>
                          <Pin />
                        </Marker>
                        <Marker position={[-29.70905959444056, -52.42959036162733]}>
                          <Pin />
                        </Marker>
                        <Marker position={[-29.702565168228038, -52.43756449262523]}>
                          <Pin />
                        </Marker>
                      </MapContainer>
                    </Col>
                    {/* Coluna da div ao lado */}
                    <Col span={5}>
                      <div>
                      <PaginatedTable ref={tableRef} disabled={loading} fetchData={fetchData} initialPageSize={20} columns={columns} />
                      </div>
                    </Col>
                  </Row>
                </Col>
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