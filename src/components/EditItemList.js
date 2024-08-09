import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; 
import { getDataFromBackend, deleteDataFromBackend, sendDataToBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import Button from '@mui/material/Button';
import '../styles/itemlist.css';

const EditItemList = () => {
    const { user } = UserAuth();
    const { event_id } = useParams(); 
    const navigate = useNavigate();
    const [initialValues, setInitialValues] = useState({ items: [] });
    console.log(initialValues)

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const initialData = await getDataFromBackend(`http://localhost:3001/api/events/itemlist/${event_id}`);
                    console.log("Loaded data from server:", initialData);
                    setInitialValues({ items: initialData || [] });
                }  
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user, event_id]);

    const validationSchema = Yup.object({
        items: Yup.array().of(
            Yup.object({
                label: Yup.string().required('Label is required'),
                count: Yup.number().min(0, 'Count cannot be negative').required('Count is required'),
                min_count: Yup.number().min(0, 'Min count cannot be negative').required('Min count is required'),
                max_count: Yup.number().min(1, 'Max count must be at least 1').required('Max count is required')
            })
        )
    });

    const handleDeleteItem = async (label) => { 
        try {
            if (user) {
                await deleteDataFromBackend(`http://localhost:3001/api/events/itemslist/delete/${label}/${event_id}`); 
            } else {
                console.log("Item not found!");
            }
        } catch (error) {
            console.error('Error deleting Item:', error);
        }
    }; 

    return (
        <div>
        <h1>Your Item List for </h1>
        <Formik
            enableReinitialize 
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                try {
                    if (user) {      
                        const itemData = values.items.map(item => ({
                            Label: item.label,
                            Count: item.count,
                            min_count: item.min_count,
                            max_count: item.max_count,
                        }));

                        console.log(itemData);
                        await sendDataToBackend(itemData,`http://localhost:3001/api/events/itemlist/edit/${event_id}`);     
                        setTimeout(() => navigate(`/EventPage/EventDetailPage/${event_id}`), 1000);    
                    } else {
                        console.log("Event not found!");
                    }
                } catch (error) {
                    console.error('Error updating Event data:', error);
                }
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
                                                    <Button variant='contained'
                                                        type="button"
                                                        onClick={() => {
                                                            const newCount = Math.max(item.count - 1,0);
                                                            setFieldValue(`items.${index}.count`, newCount);
                                                        }}
                                                    >
                                                        -
                                                    </Button>
                                                    <span>{item.count}</span>
                                                    <Button variant='contained'
                                                        type="button"
                                                        onClick={() => {
                                                            const newCount = Math.min(item.count + 1, item.max_count);
                                                            setFieldValue(`items.${index}.count`, newCount);
                                                        }}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                                <ErrorMessage
                                                    name={`items.${index}.count`}
                                                    component="div"
                                                    className="field-error"
                                                />
                                            </div>
                                            <div className="col">
                                                <label htmlFor={`items.${index}.min_count`}>Min Count</label>
                                                <Field
                                                    name={`items.${index}.min_count`}
                                                    placeholder="Min Count"
                                                    type="number"
                                                />
                                                <ErrorMessage
                                                    name={`items.${index}.min_count`}
                                                    component="div"
                                                    className="field-error"
                                                />
                                            </div>
                                            <div className="col">
                                                <label htmlFor={`items.${index}.max_count`}>Max Count</label>
                                                <Field
                                                    name={`items.${index}.max_count`}
                                                    placeholder="Max Count"
                                                    type="number"
                                                />
                                                <ErrorMessage
                                                    name={`items.${index}.max_count`}
                                                    component="div"
                                                    className="field-error"
                                                />
                                            </div>
                                            <div className="col">
                                                <Button variant='contained'
                                                    type="button"
                                                    className="secondary"
                                                    onClick={() => { 
                                                        remove(index)
                                                        handleDeleteItem(item.label); 
                                                    }}
                                                >
                                                    X
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                <Button variant='contained'
                                    type="button"
                                    className="secondary"
                                    onClick={() =>
                                        push({ label: '', count: 0, min_count: 0, max_count: 1 })
                                    }
                                >
                                    Add Item
                                </Button>
                            </div>
                        )}
                    </FieldArray>
                    <Button variant='contained' type="submit">Save</Button>
                </Form>
            )}
        </Formik>
    </div>
    );
};

export default EditItemList;
