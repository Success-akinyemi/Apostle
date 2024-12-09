import axios from "axios"


axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL
//axios.defaults.baseURL = 'https://apostle.onrender.com/api'


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

export async function deleteCategory({ id }){
    try {
        const res = await axios.post('/category/deleteCategory', { id }, {withCredentials: true})
        if(res.data.success){
            return res.data
        }
    } catch (error) {
        const res = error.response.data || { data: 'Unable to delete category'}
        return res
    }
}

//new song
export async function newSong(formData){
    try {
        const res = await axios.post(
            '/song/newSong',
            formData,
            { 
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" }
            }
          );
        if(res.data.success){
            return res.data
        }
    } catch (error) {
        const res = error.response.data || { data: 'Unable to create new song'}
        return res
    }
}

//update song
export async function updateSong(formData){
    try {
        const res = await axios.post(
            '/song/updateSong',
            formData,
            { 
              withCredentials: true,
              headers: { "Content-Type": "multipart/form-data" }
            }
          );
        if(res.data.success){
            return res.data
        }
    } catch (error) {
        const res = error.response.data || { data: 'Unable to update song'}
        return res
    }
}

//delete song
export async function deleteSong({ id }){
    console.log('object axios', id)

    try {
        const res = await axios.post(
            '/song/deleteSongs',
            { id },
            { 
              withCredentials: true,
              //headers: { "Content-Type": "multipart/form-data" }
            }
          );
        if(res.data.success){
            return res.data
        }
    } catch (error) {
        const res = error.response.data || { data: 'Unable to delete song'}
        return res
    }
}
