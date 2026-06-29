import axios from 'axios';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const apiClient = axios.create({
    baseURL: backendUrl,
});

apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const userRole = localStorage.getItem('userRole');
        let token = null;

        if (userRole === 'admin') {
            token = localStorage.getItem('adminJwtToken');
        } else if (userRole === 'faculty') {
            token = localStorage.getItem('facultyJwtToken');
        } else if (userRole === 'student') {
            token = localStorage.getItem('studentJwtToken');
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});


const nonSubjectKeys = ["rollno", "sgpa", "cgpa", "section", "roll_no"];

const knownSubjects: { [key: string]: string } = {
    datastructures: "Data Structures",
    theoryofcomputation: "Theory Of Computation",
    computernetworks: "Computer Networks",
    operatingsystems: "Operating Systems",
    probabilityandstatist: "Probability and Statistics",
    javaprogrammingpracti: "Java Programming Practice",
    datastructureslab: "Data Structures Lab",
    computernetwo: "Computer Networks", 
    logicalreasoning: "Logical Reasoning",
    financialliteracy: "Financial Literacy",
};

export const formatSubjectName = (subjectKey: string): string => {
    const cleanedKey = subjectKey.toLowerCase().replace(/_/g, '').replace(/grad/g, '').trim();
    
    if (knownSubjects[cleanedKey]) {
        return knownSubjects[cleanedKey];
    }
    
    return cleanedKey
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export const getStudentResults = async (rollNo: string, branch: string): Promise<any> => {
    try {
        const response = await apiClient.get(`/api/student/get-results`, {
            params: { 
                roll_no: rollNo,
                branch: branch,
            }
        });
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Failed to fetch student results. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the API request. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred.');
    }
};


export const getStudentDetails = async (rollNo: string, department: string): Promise<any> => {
    try {
        const response = await apiClient.get(`/api/admin/student/get-student`, {
            params: {
                roll_no: rollNo,
                department: department,
            }
        });
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Failed to fetch student details. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the API request. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred.');
    }
};

export const getStudentListForAdmin = async (batch: string, semester: string, branch: string): Promise<any> => {
    try {
        const response = await apiClient.get(`/api/admin/student/get-students`, {
            params: { batch, semester, branch }
        });
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Failed to fetch student list. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the API request. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred.');
    }
};

export const uploadResultsFile = async (file: File, batch: string, semester: string, branch: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('batch', batch);
    formData.append('semester', semester);
    formData.append('branch', branch);

    try {
        const response = await apiClient.post(`/api/admin/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `File upload failed. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the file upload. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during file upload.');
    }
};

export const uploadSupplementaryResultsFile = async (file: File, batch: string, semester: string, branch: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('batch', batch);
    formData.append('semester', semester);
    formData.append('branch', branch);

    try {
        const response = await apiClient.post(`/api/admin/upload-supply`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Supplementary file upload failed. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the supplementary upload. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during supplementary file upload.');
    }
};


export const uploadStudentDetailsFile = async (file: File, batch: string, branch: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('batch', batch);
    formData.append('branch', branch);

    try {
        const response = await apiClient.post(`/api/admin/upload-student`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `File upload failed. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the file upload. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during file upload.');
    }
};

export const uploadFacultyDetailsFile = async (file: File, branch: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('branch', branch);

    try {
        const response = await apiClient.post(`/api/admin/upload-faculty-details`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `File upload failed. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the file upload. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during file upload.');
    }
};


export const uploadFacultyPerformanceFile = async (file: File, batch: string, branch: string, semester: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('batch', batch);
    formData.append('branch', branch);
    formData.append('semester', semester);

    try {
        const response = await apiClient.post(`/api/admin/upload/faculty-performance`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Faculty performance file upload failed. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the file upload. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during file upload.');
    }
};

export const uploadNewFacultyPerformanceFile = async (file: File, batch: string, branch: string, semester: string): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('batch', batch);
    formData.append('branch', branch);
    formData.append('semester', semester);

    try {
        const response = await apiClient.post(`/api/admin/upload/student-performance`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Faculty performance file upload failed. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the file upload. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during file upload.');
    }
};


export const getFacultyPerformance = async (batch: string, semester: string, branch: string): Promise<any> => {
    try {
        const params = new URLSearchParams();
        params.append('batch', batch);
        params.append('semester', semester);
        params.append('branch', branch);

        const response = await apiClient.post(`/api/get-faculty/performance`, params);
        
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Failed to fetch faculty performance. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the API request. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred.');
    }
}

export const getStudentPerformanceForFacultyView = async (batch: string, semester: string, branch: string): Promise<any> => {
    try {
        const params = new URLSearchParams();
        params.append('batch', batch);
        params.append('semester', semester);
        params.append('branch', branch);

        const response = await apiClient.get(`/api/admin/get/student-performance`, { params });
        
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Failed to fetch student performance. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the API request. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred.');
    }
}

export const getSpecificStudentPerformance = async (batch: string, branch: string, semester: string, email: string): Promise<any> => {
    try {
        const response = await apiClient.get(`/api/admin/get/specific-student-performance`, {
            params: { batch, branch, semester, email }
        });
        
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(response.data.message || `Failed to fetch specific student performance. Status: ${response.status}`);
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred during the API request. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred.');
    }
};

export const signupStudent = async (data: { email: string; roll: string; password: string; department: string; }) => {
    try {
        const response = await apiClient.post(`/api/signup/student`, data);
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Student registration failed.');
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during registration.');
    }
};

export const signupFaculty = async (data: { username: string, email: string; password: string; department: string; }) => {
    try {
        const response = await apiClient.post(`/api/signup/faculty`, data);
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Faculty registration failed.');
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during registration.');
    }
};


export const loginStudent = async (data: { roll: string; email: string; password: string; department: string; }) => {
    try {
        const response = await apiClient.post(`/api/login/student`, data);
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Student login failed.');
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during login.');
    }
};

export const loginFaculty = async (data: { username: string; email: string; password: string; department: string; }) => {
    try {
        const response = await apiClient.post(`/api/login/faculty`, data);
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Faculty login failed.');
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during login.');
    }
};

export const loginAdmin = async (data: { username: string; email: string; password: string; }) => {
    try {
        const response = await apiClient.post(`/api/login/admin`, data);
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || 'Admin login failed.');
        }
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || `An error occurred. Status: ${error.response.status}`);
        }
        throw new Error(error.message || 'An unknown error occurred during login.');
    }
};
