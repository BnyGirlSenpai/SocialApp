import React, { useState, useEffect } from 'react';
import '../styles/eventDetailView.css';
import { updateDataInDb,getDataFromBackend } from '../apis/UserDataApi';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import validateInput from '../utils/UserInputValidator';