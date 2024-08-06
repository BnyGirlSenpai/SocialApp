import React, { useState, useEffect } from 'react';
import { getDataFromBackend, sendDataToBackend, updateDataInDb } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import '../styles/itemlist.css';

const ItemList = ({event_id}) => {
    const { user } = UserAuth();
    const [initialValues, setInitialValues] = useState({ items: [] });
    const [userItemCountData, setUserItemCountData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const initialData = await getDataFromBackend(`http://localhost:3001/api/events/itemlist/${event_id}`);
                    const itemCountData = await getDataFromBackend(`http://localhost:3001/api/events/itemslist/add/count/${event_id}`);
                    console.log("Loaded Item Count Data:", itemCountData);
                    console.log("Loaded data from server:", initialData);
                    setInitialValues({ items: initialData });
                    setUserItemCountData(itemCountData);
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
                count: Yup.number().min(0, 'Count cannot be negative').required('Count is required'),  
            })
        )
    });

    if (!initialValues.items || initialValues.items.length === 0) {
        return null;
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
                            distributed_count: userItemCountData
                        }));

                        await updateDataInDb(JSON.stringify(itemData),`http://localhost:3001/api/events/itemlist/update/${event_id}`); 
                        await sendDataToBackend(JSON.stringify(userItemCountPayload),`http://localhost:3001/api/events/itemslist/add/count`);
                        console.log(userItemCountPayload); 
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
                                                            const newCount = Math.max(item.count - 1, item.min_count);
                                                            setFieldValue(`items.${index}.count`, newCount);

                                                            if (userItemCountData > 0) {
                                                                const itemCount = userItemCountData - 1;
                                                                setUserItemCountData(itemCount);
                                                                console.log(itemCount);
                                                                console.log("Max removable Items:", itemCount - 1);
                                                            }
                                                        }}
                                                        disabled={userItemCountData <= 0}
                                                    >
                                                        -
                                                    </button>
                                                    <span>{item.count}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newCount = Math.min(item.count + 1, item.max_count);
                                                            setFieldValue(`items.${index}.count`, newCount);                                    
                                                            if(item.max_count - item.count > 0){
                                                                const itemCount =  userItemCountData + 1;
                                                                setUserItemCountData(itemCount);
                                                                console.log(itemCount)
                                                                console.log("Max addeble Items:",item.max_count - item.count -1)
                                                            }
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
                    <button type="submit">Save</button>
                </Form>
            )}
        </Formik>
    </div>
    );
};

export default ItemList;
