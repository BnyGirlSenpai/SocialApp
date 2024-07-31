import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom'; 
import { updateDataInDb, getDataFromBackend, deleteDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import '../styles/itemlist.css';


const EditItemList = () => {
    const { user } = UserAuth();
    const { event_id } = useParams(); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const data = await getDataFromBackend(`http://localhost:3001/api/events/itemList/edit/${event_id}`);
                   
                    console.log("Loaded data from server:", data);
                }  
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user, event_id]);

    const initialData = [
        { id: 0, label: 'First item', count: 0, maxCount: 10 },
        { id: 1, label: 'Second item', count: 0, maxCount: 5 },
        { id: 2, label: 'Third item', count: 0, maxCount: 8 }
    ];

    const initialValues = { items: initialData };

    const validationSchema = Yup.object({
        items: Yup.array().of(
            Yup.object({
                label: Yup.string().required('Label is required'),
                count: Yup.number().min(0, 'Count cannot be negative').required('Count is required'),
                maxCount: Yup.number().min(1, 'Max count must be at least 1').required('Max count is required')
            })
        )
    });

    return (
        <div>
            <h1>Your Item List for </h1>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={async (values) => {
                    await new Promise((r) => setTimeout(r, 500));
                    alert(JSON.stringify(values, null, 2));
                    // Add your API call here, e.g., sendDataToBackend(values);
                }}
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        <FieldArray name="items">
                            {({ insert, remove, push }) => (
                                <div>
                                    {values.items.length > 0 &&
                                        values.items.map((item, index) => (
                                            <div className="row" key={index}>
                                                <div className="col">
                                                    <label htmlFor={`items.${index}.label`}>Label</label>
                                                    <Field
                                                        name={`items.${index}.label`}
                                                        placeholder="Item Label"
                                                        type="text"
                                                    />
                                                    <ErrorMessage
                                                        name={`items.${index}.label`}
                                                        component="div"
                                                        className="field-error"
                                                    />
                                                </div>
                                                <div className="col">
                                                    <label>Count</label>
                                                    <div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newCount = Math.max(item.count - 1, 0);
                                                                setFieldValue(`items.${index}.count`, newCount);
                                                            }}
                                                        >
                                                            -
                                                        </button>
                                                        <span>{item.count}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newCount = Math.min(item.count + 1, item.maxCount);
                                                                setFieldValue(`items.${index}.count`, newCount);
                                                            }}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <ErrorMessage
                                                        name={`items.${index}.count`}
                                                        component="div"
                                                        className="field-error"
                                                    />
                                                </div>
                                                <div className="col">
                                                    <label htmlFor={`items.${index}.maxCount`}>Max Count</label>
                                                    <Field
                                                        name={`items.${index}.maxCount`}
                                                        placeholder="Max Count"
                                                        type="number"
                                                    />
                                                    <ErrorMessage
                                                        name={`items.${index}.maxCount`}
                                                        component="div"
                                                        className="field-error"
                                                    />
                                                </div>
                                                <div className="col">
                                                    <button
                                                        type="button"
                                                        className="secondary"
                                                        onClick={() => remove(index)}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    <button
                                        type="button"
                                        className="secondary"
                                        onClick={() =>
                                            push({ id: values.items.length, label: '', count: 0, maxCount: 1 })
                                        }
                                    >
                                        Add Item
                                    </button>
                                </div>
                            )}
                        </FieldArray>
                        <button type="submit">Save</button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default EditItemList;
