import React, { useEffect, useRef  } from 'react';
import { UserAuth } from '../context/AuthContext';
import { getDataFromBackend, updateDataInDb } from '../apis/UserDataApi';
import { formatLocalDateTime } from '../utils/DateUtils'; 
import { useFormik } from 'formik';
import * as Yup from 'yup';

const ProfileSettings = () => {
    const { user } = UserAuth();

    const validationSchema = Yup.object().shape({
        username: Yup.string().required('Username is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        dateOfBirth: Yup.date().required('Date of Birth is required')
            .test('is-over-16', 'You must be 16 years old!', function (value) {
                const currentDate = new Date();
                const selectedDate = new Date(value);
                const age = currentDate.getFullYear() - selectedDate.getFullYear();
                const monthDifference = currentDate.getMonth() - selectedDate.getMonth();
                const dayDifference = currentDate.getDate() - selectedDate.getDate();
                return age > 16 || (age === 16 && monthDifference > 0) || (age === 16 && monthDifference === 0 && dayDifference >= 0);
            }),
        phoneNumber: Yup.string().matches(/^[0-9]+$/, 'Must be only digits').required('Phone number is required'),
    });

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            dateOfBirth: '',
            address: '',
            country: '',
            region: '',
            phoneNumber: '',
            description: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                if (user) {
                    const updatedData = [
                        values.username,
                        values.email,
                        values.dateOfBirth,
                        values.address,
                        values.country,
                        values.region,
                        values.phoneNumber,
                        values.description,
                        user.uid
                    ];
                    console.log('Data to server:', updatedData);
                    await updateDataInDb(JSON.stringify(updatedData), 'http://localhost:3001/api/users/update');
                } else {
                    console.log("User not found!");
                }
            } catch (error) {
                console.error('Error updating profile data:', error);
            }
        },
    });

    const formikRef = useRef(formik);

    useEffect(() => {
        formikRef.current = formik;
    }, [formik]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user) {
                    const data = await getDataFromBackend(`http://localhost:3001/api/users/${user.uid}`);
                    formikRef.current.setValues({
                        username: data[0]?.username || '',
                        email: data[0]?.email || '',
                        dateOfBirth: formatLocalDateTime(data[0]?.date_of_birth || '').split(',')[0].split('.').reverse().join('-'),
                        address: data[0]?.address || '',
                        country: data[0]?.country || '',
                        region: data[0]?.region || '',
                        phoneNumber: data[0]?.phone_number || '',
                        description: data[0]?.description || '',
                    });
                    console.log("Loaded data from server:", data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [user]);

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="container d-flex justify-content-center align-items-center">
                <div className="card">
                    <div className="upper">
                    </div>
                    <div className="user text-center">
                        <div className="profile">
                            <img src={user?.photoURL} className="rounded-circle" width="80" alt="Profile" />
                        </div>
                        <p>{user?.displayName}</p>
                    </div>
                    <div className="p-3 py-5">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h4 className="text-right">Profile Settings</h4>
                        </div>
                        <div className="row mt-2">
                            <div className="col-md-6">
                                <label className="labels">Username</label>
                                <input type="text" className="form-control" placeholder="Enter Username" name="username" value={formik.values.username} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.username && formik.errors.username ? (
                                    <div className="error">{formik.errors.username}</div>
                                ) : null}
                            </div>
                            <div className="col-md-6">
                                <label className="labels">Email</label>
                                <input type="text" className="form-control" placeholder="Enter Email" name="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.email && formik.errors.email ? (
                                    <div className="error">{formik.errors.email}</div>
                                ) : null}
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-md-6">
                                <label className="labels">Date of Birth</label>
                                <input type="date" className="form-control" placeholder="Select Date of Birth" name="dateOfBirth" value={formik.values.dateOfBirth} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.dateOfBirth && formik.errors.dateOfBirth ? (
                                    <div className="error">{formik.errors.dateOfBirth}</div>
                                ) : null}
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-6">
                                <label className="labels">Address</label>
                                <input type="text" className="form-control" placeholder="Enter Address" name="address" value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.address && formik.errors.address ? (
                                    <div className="error">{formik.errors.address}</div>
                                ) : null}
                            </div>
                            <div className="col-md-6">
                                <label className="labels">Phone Number</label>
                                <input type="text" className="form-control" placeholder="Enter Phone Number" name="phoneNumber" value={formik.values.phoneNumber} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                                    <div className="error">{formik.errors.phoneNumber}</div>
                                ) : null}
                            </div>
                            <div className="col-md-6">
                                <label className="labels">Country</label>
                                <input type="text" className="form-control" placeholder="Enter Country" name="country" value={formik.values.country} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.country && formik.errors.country ? (
                                    <div className="error">{formik.errors.country}</div>
                                ) : null}
                            </div>
                            <div className="col-md-6">
                                <label className="labels">State/Region</label>
                                <input type="text" className="form-control" placeholder="Enter State/Region" name="region" value={formik.values.region} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.region && formik.errors.region ? (
                                    <div className="error">{formik.errors.region}</div>
                                ) : null}
                            </div>
                            <div className="col-md-12">
                                <label className="labels">Description</label>
                                <textarea className="form-control" placeholder="Enter Description" name="description" value={formik.values.description} onChange={formik.handleChange} onBlur={formik.handleBlur} />
                                {formik.touched.description && formik.errors.description ? (
                                    <div className="error">{formik.errors.description}</div>
                                ) : null}
                            </div>
                        </div>
                        <div className="mt-5 text-center">
                            <button
                                className={`btn ${formik.isSubmitting ? 'btn-success' : 'btn-primary'} profile-button`}
                                type="submit"
                                disabled={formik.isSubmitting}>
                                {formik.isSubmitting ? 'Saving...' : 'Save Profile'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default ProfileSettings;
