import React, { useState, useEffect } from 'react';
import { getDataFromBackend, sendDataToBackend, updateDataInDb } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import '../styles/itemlist.css';

const ItemList = ({event_id}) => {
    const { user } = UserAuth();
    const [initialValues, setInitialValues] = useState({ items: [] });
    const [userItemCount, setUserItemCount] = useState({});
    const navigate = useNavigate();
    const [redirect, setRedirect] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const itemCountData = await getDataFromBackend(`http://localhost:3001/api/events/itemlist/${event_id}`);
                    const distributedItemCount = await getDataFromBackend(`http://localhost:3001/api/events/itemslist/get/count/${user.uid}/${event_id}`);
                    const distributedItemCountParsed = distributedItemCount.reduce((acc, item) => {
                        acc[item.label] = parseInt(item.user_item_count, 10);                                         
                        return acc;
                    }, {});
                    
                    console.log("Loaded User Item Count:", distributedItemCount);
                    console.log("Loaded Items from server:", itemCountData);
                    setInitialValues({ items: itemCountData });
                    setUserItemCount(distributedItemCountParsed);
                }  
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user, event_id]);

    useEffect(() => {
        if (redirect) {
            setTimeout(() => window.location.reload(), 1000);    
        }
    }, [redirect,event_id, navigate]);

    const validationSchema = Yup.object({
        items: Yup.array().of(
            Yup.object({
                count: Yup.number().min(0, 'Count cannot be negative').required('Count is required'),  
            })
        )
    });

    if (!initialValues.items || initialValues.items.length === 0) {
        return (
            <div>
                <h1>No Items Available</h1>
                <p>There are currently no items available for this event.</p>
            </div>
        );
    }
    
    return (
        <div>
        <h1>Item List</h1>
        <Formik
            enableReinitialize 
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={async (values) => {
                try {
                    if (user) {      
                        const itemData = values.items.map(item => ({
                            label: item.label,
                            count: item.count
                        })); 

                        const userItemCountPayload = values.items.map(item => ({
                            uid: user.uid,
                            label: item.label,
                            user_distributed_count: userItemCount[item.label] || 0
                        }));

                        const hasChanged = itemData.some((item, index) => 
                            item.count !== initialValues.items[index].count
                        );

                        if (hasChanged) {
                            await sendDataToBackend(userItemCountPayload,`http://localhost:3001/api/events/itemslist/add/count`);
                            await updateDataInDb(JSON.stringify(itemData),`http://localhost:3001/api/events/itemlist/update/${event_id}`);
                            setTimeout(() => {
                                setRedirect(true);
                            }, 1000);
                            console.log(userItemCountPayload);
                        } else {
                            console.log('No changes detected, nothing to submit.');
                        }
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
                        {() => (
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
                                                    disabled 
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

                                                            setUserItemCount(prevData => ({
                                                                ...prevData,
                                                                [item.label]: Math.max((prevData[item.label] || 0) - 1, 0)
                                                            }));
                                                        }}
                                                        disabled={Object.keys(userItemCount).length === 0 || userItemCount[item.label] <= 0}
                                                    >
                                                        -
                                                    </button>
                                                    <span>{item.count}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newCount = Math.min(item.count + 1, item.max_count);
                                                            setFieldValue(`items.${index}.count`, newCount);                                    
                                                            setUserItemCount(prevData => ({
                                                                ...prevData,
                                                                [item.label]: (prevData[item.label] || 0) + 1
                                                            }));
                                                        }}
                                                        disabled={item.count >= item.max_count}
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
                                                <label htmlFor={`items.${index}.min_count`}>Min Count</label>
                                                <Field
                                                    name={`items.${index}.min_count`}
                                                    placeholder="Min Count"
                                                    type="text"
                                                    disabled 
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
                                                    type="text"
                                                    disabled 
                                                />
                                                <ErrorMessage
                                                    name={`items.${index}.max_count`}
                                                    component="div"
                                                    className="field-error"
                                                />
                                            </div>                                           
                                        </div>
                                    ))}                       
                            </div>
                        )}
                    </FieldArray>
                    <button type="submit" disabled={values.items.length === 0}>Save</button>
                </Form>
            )}
        </Formik>
    </div>
    );
};

export default ItemList;
