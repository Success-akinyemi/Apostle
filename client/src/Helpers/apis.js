import axios from "axios"


axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL

export async function signup(formData){
    try {
        const res = await axios.post('/admin/register', formData, {withCredentials: true})
        if(res.data.success){
            return res.data
        }
    } catch (error) {
        const res = error.response.data || 'Unable to register user'
        return res
    }
}

export async function login(formData){
    try {
        const res = await axios.post('/admin/login', formData, {withCredentials: true})
        if(res.data.success){
            return res.data
        }
    } catch (error) {
        const res = error.response.data || 'Unable to login user'
        return res
    }
}

//new category
export async function newCategory(formData){
    try {
        const res = await axios.post('/category/createCategory', formData, {withCredentials: true})
        if(res.data.success){
            return res.data
        }
    } catch (error) {
        const res = error.response.data || { data: 'Unable to create new category'}
        return res
    }
}

export async function updateCategory(formData){
    try {
        const res = await axios.post('/category/updateCategory', formData, {withCredentials: true})
        if(res.data.success){
            return res.data
        }
    } catch (error) {
        const res = error.response.data || { data: 'Unable to update category'}
        return res
    }
}