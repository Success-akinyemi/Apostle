import { useEffect, useState } from "react";
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL

//FETCH CATEGORIES
export function useFetchCategories(query){
    const [ categories, setCategories] = useState({ isFetching: true, data: null, status: null, serverError: null, })
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const { data, status} = !query ? await axios.get(`/category/getAllCategory`, {withCredentials: true}) : await axios.get(`/category/getCategory/${query}`, {withCredentials: true})
                //console.log('Data from Hooks>>>', data, 'STATUS', status)

                if(status === 200){
                    setCategories({ isFetching: false, data: data, status: status, serverError: null})
                } else{
                    setCategories({ isFetching: false, data: null, status: status, serverError: null})
                }
            } catch (error) {
                setCategories({ isFetching: false, data: null, status: null, serverError: error})
            }
        }
        fetchCategoriesData()
    }, [query])

    return categories
}

//FETCH SONGS
export function useFetchSongs(query){
    const [ songs, setSongs] = useState({ isFetching: true, data: null, status: null, serverError: null, })
    useEffect(() => {
        const fetchSongsData = async () => {
            try {
                const { data, status} = !query ? await axios.get(`/song/getAdminAllSongs`, {withCredentials: true}) : await axios.get(`/song/getAdminASongs/${query}`, {withCredentials: true})
                //console.log('Data from Hooks>>>', data, 'STATUS', status)

                if(status === 200){
                    setSongs({ isFetching: false, data: data, status: status, serverError: null})
                } else{
                    setSongs({ isFetching: false, data: null, status: status, serverError: null})
                }
            } catch (error) {
                setSongs({ isFetching: false, data: null, status: null, serverError: error})
            }
        }
        fetchSongsData()
    }, [query])

    return songs
}