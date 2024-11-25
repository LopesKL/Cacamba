import { DeleteOutlined, FileOutlined, UploadOutlined } from "@ant-design/icons";
import { Button, Card, Col, message, Modal, Row, Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { AiFillEye } from "react-icons/ai";
import Api from "../services/api";

const DropzoneComponent = ({ onFileUpload, preFilesIds = [], inputType = "images" }) => {
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]); // Lista de arquivos que foram enviados ou carregados via ID

    const [previewVisible, setPreviewVisible] = useState(false); // Controle do modal de preview
    const [currentPreview, setCurrentPreview] = useState(null); // Objeto atual para o preview

    // Função para buscar arquivos por IDs, evitando re-buscas de arquivos existentes
    const fetchFilesByIds = async (fileIdsInput) => {
        const fileIds = Array.isArray(fileIdsInput) ? fileIdsInput : [fileIdsInput];
        const uniqueFileIds = Array.from(new Set(fileIds));

        const existingIds = uploadedFiles.map((file) => file.id);
        const idsToFetch = uniqueFileIds.filter((id) => !existingIds.includes(id));

        if (idsToFetch.length === 0) {
            return; // Nenhum novo arquivo para buscar
        }

        setLoading(true);
        try {
            const responses = await Promise.all(
                idsToFetch.map((id) => Api.get(`/crud/getFile/${id}`, { responseType: 'blob' }))
            );

            const filesFromServer = responses.map((response, index) => {
                const blob = response.data;
                const url = URL.createObjectURL(blob);

                return {
                    id: idsToFetch[index],
                    name: `${idsToFetch[index]}`,
                    type: blob.type,
                    preview: url,
                    uploaded: true,
                    lastModified: Date.now(),
                };
            });

            setUploadedFiles((prevFiles) => {
                const allFiles = [...prevFiles, ...filesFromServer];
                const uniqueFiles = Array.from(new Map(allFiles.map(file => [file.id, file])).values());
                return uniqueFiles;
            });
        } catch (error) {
            message.error("Erro ao carregar arquivos.");
        } finally {
            setLoading(false);
        }
    };

    // Revoga URLs criadas com createObjectURL quando o componente é desmontado
    useEffect(() => {
        return () => {
            uploadedFiles.forEach((file) => {
                if (file.preview) {
                    URL.revokeObjectURL(file.preview);
                }
            });
        };
    }, [uploadedFiles]);

    // useEffect para carregar preFilesIds quando o componente é montado ou atualizado
    useEffect(() => {
        if (preFilesIds && preFilesIds.length > 0) {
            fetchFilesByIds(preFilesIds);
        }
    }, [preFilesIds]);

    // Função para fazer upload de um novo arquivo
    const uploadFile = async (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("files", file);

        try {
            const response = await Api.post("/crud/uploadFile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                let newFileId = response.data.response;

                if (Array.isArray(newFileId)) {
                    newFileId = newFileId[0];
                }

                const preview = {
                    id: newFileId,
                    name: newFileId, // Usar o nome real do arquivo
                    preview: URL.createObjectURL(file),
                    uploaded: true,
                    type: file.type,
                };

                setUploadedFiles((prevFiles) => {
                    const allFiles = [...prevFiles, preview];
                    const uniqueFiles = Array.from(new Map(allFiles.map((file) => [file.id, file])).values());

                    const distinctFileNames = Array.from(new Set(uniqueFiles.map((file) => file.name)));
                    console.log(distinctFileNames);

                    if (onFileUpload) {
                        onFileUpload(distinctFileNames);
                    }

                    return uniqueFiles;
                });

                message.success("Arquivo enviado com sucesso!");
            } else {
                message.error("Erro ao enviar o arquivo.");
            }
        } catch (error) {
            console.error('Upload error:', error);
            message.error("Erro ao enviar o arquivo.");
        } finally {
            setLoading(false);
        }
    };

    // Função chamada quando um arquivo é solto ou selecionado na dropzone
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0]; // Aceitar apenas um arquivo por vez
            uploadFile(file);
        }
    }, []);

    // Hook useDropzone para lidar com arquivos soltos ou selecionados na área de drop
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
        accept:
            inputType === "images"
                ? "image/*"
                : "application/pdf, .doc, .docx, .xls, .xlsx",
    });

    // Função para remover um arquivo
    const handleRemoveFile = async (fileId) => {
        setLoading(true);
        try {
            await Api.post(`/crud/removeFile/${fileId}`);
            const updatedFiles = uploadedFiles.filter((file) => file.id !== fileId);
            setUploadedFiles(updatedFiles);

            if (onFileUpload) {
                onFileUpload({ removedFileId: fileId });
            }

            message.success("Arquivo removido com sucesso!");
        } catch (error) {
            message.error("Erro ao remover o arquivo.");
        } finally {
            setLoading(false);
        }
    };

    // Função para lidar com a visualização do preview
    const handlePreview = (file) => {
        setCurrentPreview(file);
        setPreviewVisible(true);
    };

    return (
        <div>
            {/* Dropzone com estilo do Ant Design */}
            <Card
                {...getRootProps()}
                style={{
                    border: "2px dashed #d9d9d9",
                    padding: "20px",
                    textAlign: "center",
                    cursor: "pointer",
                    backgroundColor: isDragActive ? "#e6f7ff" : "#fafafa",
                }}
            >
                <input {...getInputProps()} />
                <p>
                    <UploadOutlined style={{ fontSize: "24px" }} />{" "}
                    {isDragActive ? "Solte o arquivo aqui..." : "Arraste e solte um arquivo ou clique aqui"}
                </p>
                <p>{inputType === "images" ? "Suporta apenas imagens" : "Suporta todos os tipos de arquivo"}</p>
            </Card>

            <div style={{ padding: "20px" }}>
                {/* Exibir um spinner de carregamento se estiver no estado de loading */}
                {loading && <Spin style={{ margin: "20px 0", display: "block" }} />}

                {/* Organizar arquivos em grid com Row e Col */}
                <Row gutter={8} justify="center">
                    {uploadedFiles.map((file) => (
                        <Col
                            xs={24}
                            sm={12}
                            md={8}
                            key={file.id}
                            style={{ display: "flex", justifyContent: "center" }}
                        >
                            <Card
                                style={{
                                    width: 200,
                                    textAlign: "center",
                                    borderRadius: "8px",
                                }}
                                bodyStyle={{ padding: 5 }}
                                actions={[
                                    <Button
                                        type="link"
                                        icon={<AiFillEye />}
                                        onClick={() => handlePreview(file)}
                                        key="view"
                                        size="small"
                                    >
                                        Ver
                                    </Button>,
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveFile(file.id)}
                                        size="small"
                                        key="remove"
                                    >
                                        Remover
                                    </Button>,
                                ]}
                            >
                                {file.type.includes("image") ? (
                                    <div>
                                        <img
                                            src={file.preview}
                                            alt={file.name}
                                            style={{
                                                maxWidth: "100px",
                                                maxHeight: "100px",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => handlePreview(file)}
                                        />
                                    </div>
                                ) : (
                                    <p>
                                        <a href={file.preview} target="_blank" rel="noopener noreferrer">
                                            <FileOutlined /> {file.name}
                                        </a>
                                    </p>
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Modal para visualização do preview */}
            <Modal
                open={previewVisible}
                onCancel={() => setPreviewVisible(false)}
                centered
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setPreviewVisible(false)}>
                        Cancelar
                    </Button>
                ]}
            >
                {currentPreview && currentPreview.type.startsWith("image") ? (
                    <img
                        alt="Preview"
                        style={{ width: "100%" }}
                        src={currentPreview.preview}
                    />
                ) : (
                    currentPreview && (
                        <a href={currentPreview.preview} target="_blank" rel="noopener noreferrer">
                            Abrir arquivo
                        </a>
                    )
                )}
            </Modal>
        </div>
    );
};

export default DropzoneComponent;
