import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, InputNumber, Radio, Row, Select, TimePicker, TreeSelect } from "antd";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useMemo } from "react";
import { AiOutlineClose, AiOutlineSend } from "react-icons/ai";
import InputMask from "react-input-mask";
import DropzoneComponent from "./FileUpload";

dayjs.locale("pt-br"); // Define o locale do dayjs para português

const { Option } = Select;

// Funções de validação de CPF e CNPJ permanecem iguais

const validateCPF = (value) => {
    const cpf = value.replace(/\D/g, "");
    if (cpf.length !== 11) return false;
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++)
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++)
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cpf.substring(10, 11));
};

const validateCNPJ = (value) => {
    const cnpj = value.replace(/\D/g, "");
    if (cnpj.length !== 14) return false;
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    let digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(1));
};

const DynamicForm = ({ formConfig, values, setValues, submitText = "Enviar", onSubmit, onClose, submitOnSide = false }) => {
    const [form] = Form.useForm();

    const debouncedSetValues = useMemo(
        () =>
            debounce((id, inputValue) => {
                setValues((prevValues) => ({ ...prevValues, [id]: inputValue }));
            }, 300),
        [setValues]
    );

    const handleInputChange = useCallback(
        (id, inputValue) => {
            // Atualiza apenas se o valor for diferente do atual
            if (values?.[id] !== inputValue) {
                debouncedSetValues(id, inputValue);
                // Atualiza manualmente o valor no form para não chamar `setFieldsValue`
                form.setFieldValue(id, inputValue);
            }
        },
        [values, debouncedSetValues, form]
    );

    useEffect(() => {
        if (values && Object.keys(values).length > 0) {
            const formattedValues = { ...values };

            formConfig.forEach(section => {
                section.questions.forEach(question => {
                    if (["date", "datetime", "time", "range-date"].includes(question.type)) {
                        if (formattedValues[question.id]) {
                            if (question.type === "range-date") {
                                formattedValues[question.id] = [
                                    dayjs(formattedValues[question.id][0]),
                                    dayjs(formattedValues[question.id][1])
                                ];
                            } else {
                                if (!dayjs.isDayjs(formattedValues[question.id])) {
                                    formattedValues[question.id] = dayjs(formattedValues[question.id]);
                                }
                            }
                        }
                    }
                });
            });

            form.setFieldsValue(formattedValues);
        }
    }, [form, values, formConfig]);

    const renderInput = (question) => {
        const { type, id, placeholder = "", left = "", format, precision = 2, step = 0.01, options = [], treeData = [] } = question;

        switch (type) {
            case "textarea":
                return (
                    <Input.TextArea
                        autoComplete="off"
                        placeholder={placeholder}
                        value={values[id] || ""}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                    />
                );
            case "password":
                return (
                    <Input.Password
                        autoComplete="off"
                        placeholder={placeholder}
                        value={values[id] || ""}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                        iconRender={(visible) =>
                            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                    />
                );
            case "integer":
                return (
                    <InputNumber
                        autoComplete="off"
                        placeholder={placeholder}
                        value={values[id]}
                        onChange={(value) => handleInputChange(id, value)}
                        style={{ width: "100%" }}
                    />
                );
            case "decimal":
                return (
                    <InputNumber
                        autoComplete="off"
                        placeholder={placeholder}
                        value={values[id]}
                        onChange={(value) => handleInputChange(id, value)}
                        style={{ width: "100%" }}
                        step={step}
                        precision={precision}
                        formatter={(value) =>
                            value !== undefined
                                ? `${new Intl.NumberFormat("pt-BR", {
                                    minimumFractionDigits: precision,
                                    maximumFractionDigits: precision,
                                }).format(value)}`
                                : ""
                        }
                        parser={(value) =>
                            value ? value.replace(/\D/g, "") / Math.pow(10, precision) : ""
                        }
                    />
                );
            case "currency":
                return (
                    <InputNumber
                        autoComplete="off"
                        placeholder={placeholder}
                        value={values[id]}
                        onChange={(value) => handleInputChange(id, value)}
                        style={{ width: "100%" }}
                        step={step}
                        precision={precision}
                        formatter={(value) =>
                            value !== undefined
                                ? `${left} ${new Intl.NumberFormat("pt-BR", {
                                    minimumFractionDigits: precision,
                                    maximumFractionDigits: precision,
                                }).format(value)}`
                                : ""
                        }
                        parser={(value) =>
                            value ? value.replace(/\D/g, "") / Math.pow(10, precision) : ""
                        }
                    />
                );
            case "datetime":
                return (
                    <DatePicker
                        autoComplete="off"
                        placeholder={placeholder}
                        value={dayjs.isDayjs(values[id]) ? values[id] : dayjs(values[id])}
                        onChange={(date) => handleInputChange(id, date)}
                        showTime
                        style={{ width: "100%" }}
                        format={format}
                    />
                );
            case "date":
                return (
                    <DatePicker
                        autoComplete="off"
                        placeholder={placeholder}
                        value={dayjs.isDayjs(values[id]) ? values[id] : dayjs(values[id])}
                        onChange={(date) => handleInputChange(id, date)}
                        style={{ width: "100%" }}
                        format={format || "DD/MM/YYYY"}
                    />
                );
            case "time":
                return (
                    <TimePicker
                        autoComplete="off"
                        placeholder={placeholder}
                        value={dayjs.isDayjs(values[id]) ? values[id] : dayjs(values[id])}
                        onChange={(time) => handleInputChange(id, time)}
                        style={{ width: "100%" }}
                        format={format}
                    />
                );
            case "select":
                return (
                    <Select
                        placeholder={placeholder}
                        value={values[id]}
                        onChange={(value) => handleInputChange(id, value)}
                        style={{ width: "100%" }}
                    >
                        {options.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                );
            case "multiselect":
                return (
                    <Select
                        mode="multiple"
                        placeholder={placeholder}
                        value={values[id]}
                        onChange={(value) => handleInputChange(id, value)}
                        style={{ width: "100%" }}
                    >
                        {options.map((option) => (
                            <Option key={option.value} value={option.value}>
                                {option.label}
                            </Option>
                        ))}
                    </Select>
                );
            case "phone":
                return (
                    <InputMask
                        mask="(99) 99999-9999"
                        value={values[id] || ""}
                        onChange={(e) => {
                            const maskedValue = e.target.value;
                            let cleanedValue = maskedValue.replace(/\D/g, "");
                            if (cleanedValue.length > 11)
                                cleanedValue = cleanedValue.slice(0, 11);
                            handleInputChange(id, cleanedValue);
                        }}
                    >
                        {(inputProps) => (
                            <Input
                                autoComplete="off"
                                {...inputProps}
                                placeholder={placeholder}
                                style={{ width: "100%" }}
                                type="tel"
                            />
                        )}
                    </InputMask>
                );
            case "checkbox":
                return (
                    <Checkbox
                        checked={values[id] || false}
                        onChange={(e) => handleInputChange(id, e.target.checked)}
                    >
                        {placeholder}
                    </Checkbox>
                );
            case "radio":
                return (
                    <Radio.Group
                        value={values[id]}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                    >
                        {options.map((option) => (
                            <Radio key={option.value} value={option.value}>
                                {option.label}
                            </Radio>
                        ))}
                    </Radio.Group>
                );
            case "email":
                return (
                    <Input
                        autoComplete="off"
                        placeholder={placeholder}
                        value={values[id] || ""}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                        style={{ width: "100%" }}
                        type="email"
                    />
                );
            case "cpf":
                return (
                    <InputMask
                        mask="999.999.999-99"
                        value={values[id] || ""}
                        onChange={(e) => {
                            const maskedValue = e.target.value;
                            let cleanedValue = maskedValue.replace(/\D/g, "");
                            if (cleanedValue.length > 11)
                                cleanedValue = cleanedValue.slice(0, 11);
                            handleInputChange(id, cleanedValue);
                        }}
                    >
                        {(inputProps) => (
                            <Input
                                autoComplete="off"
                                {...inputProps}
                                placeholder={placeholder}
                                style={{ width: "100%" }}
                                type="tel"
                            />
                        )}
                    </InputMask>
                );
            case "cnpj":
                return (
                    <InputMask
                        mask="99.999.999/9999-99"
                        value={values[id] || ""}
                        onChange={(e) => {
                            const maskedValue = e.target.value;
                            let cleanedValue = maskedValue.replace(/\D/g, "");
                            if (cleanedValue.length > 14)
                                cleanedValue = cleanedValue.slice(0, 14);
                            handleInputChange(id, cleanedValue);
                        }}
                    >
                        {(inputProps) => (
                            <Input
                                autoComplete="off"
                                {...inputProps}
                                placeholder={placeholder}
                                style={{ width: "100%" }}
                                type="tel"
                            />
                        )}
                    </InputMask>
                );
            case "checkbox-group":
                return (
                    <Checkbox.Group
                        options={options.map((option) => ({
                            label: option.label,
                            value: option.value,
                        }))}
                        value={values[id] || []}
                        onChange={(checkedValues) => handleInputChange(id, checkedValues)}
                    />
                );
            case "range-date":
                return (
                    <DatePicker.RangePicker
                        autoComplete="off"
                        placeholder={placeholder ? [placeholder, placeholder] : undefined}
                        value={
                            values[id]
                                ? [dayjs(values[id][0]), dayjs(values[id][1])]
                                : [null, null]
                        }
                        onChange={(dates) => handleInputChange(id, dates)}
                        style={{ width: "100%" }}
                        format={format}
                    />
                );
            case "tree-select":
                return (
                    <TreeSelect
                        treeData={treeData}
                        value={values[id] || []}
                        onChange={(value) => handleInputChange(id, value)}
                        treeCheckable={true}
                        showCheckedStrategy={TreeSelect.SHOW_ALL}
                        placeholder={placeholder}
                        style={{ width: "100%" }}
                    />
                );
            case "images":
                return (
                    <DropzoneComponent
                        onFileUpload={(uploadedFiles) => handleInputChange(id, uploadedFiles)} // Callback para receber URLs dos arquivos
                        preUploadedFiles={values[id]} // Passa os arquivos já existentes
                        inputType="images"
                    />
                );
            case "files":
                return (
                    <DropzoneComponent
                        onFileUpload={(uploadedFiles) => handleInputChange(id, uploadedFiles)} // Callback para receber URLs dos arquivos
                        preFilesIds={values[id]} // Passa os arquivos já existentes
                        inputType="files"
                    />
                );
            default:
                return (
                    <Input
                        autoComplete="off"
                        placeholder={placeholder}
                        value={values[id] || ""}
                        onChange={(e) => handleInputChange(id, e.target.value)}
                    />
                );
        }
    };

    const renderQuestions = (questions, columns) => {
        const colSpan = 24 / columns;

        return (
            <Row gutter={[8, 8]}>
                {questions.map((question) => (
                    <Col span={colSpan} key={question.id}>
                        <Form.Item
                            label={question.label}
                            name={question.id}
                            rules={[
                                {
                                    required: question.required,
                                    message: `${question.label} é obrigatório!`,
                                },
                                ...(question.rules || []),
                                ...(question.type === "phone"
                                    ? [
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();
                                                let cleanedValue = value.replace(/\D/g, "");
                                                if (cleanedValue.length > 11)
                                                    cleanedValue = cleanedValue.slice(0, 11);
                                                if (cleanedValue.length === 11) return Promise.resolve();
                                                return Promise.reject(new Error("Número de telefone incompleto."));
                                            },
                                        },
                                    ]
                                    : []),
                                ...(question.type === "email"
                                    ? [
                                        {
                                            type: "email",
                                            message: "Por favor, insira um e-mail válido!",
                                        },
                                    ]
                                    : []),
                                ...(question.type === "cpf"
                                    ? [
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();
                                                if (!validateCPF(value)) return Promise.reject(new Error("CPF inválido."));
                                                return Promise.resolve();
                                            },
                                        },
                                    ]
                                    : []),
                                ...(question.type === "cnpj"
                                    ? [
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();
                                                if (!validateCNPJ(value)) return Promise.reject(new Error("CNPJ inválido."));
                                                return Promise.resolve();
                                            },
                                        },
                                    ]
                                    : []),
                            ]}
                        >
                            {renderInput(question)}
                        </Form.Item>
                    </Col>
                ))}
            </Row>
        );
    };

    const handleSubmit = () => {
        form
            .validateFields()
            .then((values) => {
                onSubmit(values);
            })
            .catch((errorInfo) => {
                console.log("Erro de validação:", errorInfo);
            });
    };

    return (
        <Form form={form} layout="vertical" style={{ marginBottom: 10 }}>
            {submitOnSide ? (
                <Row gutter={16} align="bottom" justify="end">
                    <Col flex="auto">
                        {formConfig?.map((section, index) => (
                            <div key={index}>
                                {section.title && (
                                    <h3 style={{ marginTop: index > 0 ? 25 : 0, marginBottom: 5 }}>{section.title}</h3>
                                )}
                                {renderQuestions(section.questions, section.columns)}
                            </div>
                        ))}
                    </Col>
                    <Col flex="none">
                        <Button type="primary" icon={<AiOutlineSend />} onClick={handleSubmit} style={{ marginBottom: 10 }}>
                            {submitText}
                        </Button>
                    </Col>
                </Row>
            ) : (
                <>
                    {formConfig?.map((section, index) => (
                        <div key={index}>
                            {section.title && (
                                <h3 style={{ marginTop: index > 0 ? 25 : 0, marginBottom: 5 }}>{section.title}</h3>
                            )}
                            {renderQuestions(section.questions, section.columns)}
                        </div>
                    ))}
                    <Divider />
                    <Row gutter={8} justify={"end"}>
                        {onClose && (
                            <Col>
                                <Button onClick={onClose} icon={<AiOutlineClose />}>
                                    Fechar
                                </Button>
                            </Col>
                        )}
                        <Col>
                            <Button type="primary" icon={<AiOutlineSend />} onClick={handleSubmit}>
                                {submitText}
                            </Button>
                        </Col>
                    </Row>
                </>
            )}
        </Form>
    );
};

export default DynamicForm;
