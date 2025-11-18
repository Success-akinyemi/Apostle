import { useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL
//axios.defaults.baseURL = 'https://apostle.onrender.com/api'

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
                const errorMsg = error.response.data.data
                toast.error(errorMsg || 'Request Failed')
                setCategories({ isFetching: false, data: null, status: null, serverError: error})
            }
        }
        fetchCategoriesData()
    }, [query])

    return categories
}

//FETCH SONGS
export function useFetchSongs({ page, limit }) {
    const [songs, setSongs] = useState({
        isFetching: true,
        data: null,
        status: null,
        serverError: null,
    });

    useEffect(() => {
        const fetchSongsData = async () => {
            try {
                const { data, status } = await axios.get(
                    `/song/getAdminAllSongs?page=${page}&limit=${limit}`,
                    { withCredentials: true }
                );

                if (status === 200) {
                    setSongs({
                        isFetching: false,
                        data: data,
                        status: status,
                        serverError: null,
                    });
                } else {
                    setSongs({
                        isFetching: false,
                        data: null,
                        status: status,
                        serverError: null,
                    });
                }
            } catch (error) {
                const errorMsg = error.response?.data?.data || "Request Failed";
                toast.error(errorMsg);
                setSongs({
                    isFetching: false,
                    data: null,
                    status: null,
                    serverError: error,
                });
            }
        };
        fetchSongsData();
    }, [page, limit]); // Re-fetch data when `page` or `limit` changes

    return songs;
}

//FETCH SONGS
export function useFetchSongData(query){
    const [ categories, setCategories] = useState({ isFetching: true, data: null, status: null, serverError: null, })
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const { data, status} = !query ? await axios.get(`/song/getAdminASongs`, {withCredentials: true}) : await axios.get(`/song/getAdminASongs/${query}`, {withCredentials: true})
                //console.log('Data from Hooks>>>', data, 'STATUS', status)

                if(status === 200){
                    setCategories({ isFetching: false, data: data, status: status, serverError: null})
                } else{
                    setCategories({ isFetching: false, data: null, status: status, serverError: null})
                }
            } catch (error) {
                const errorMsg = error.response.data.data
                toast.error(errorMsg || 'Request Failed')
                setCategories({ isFetching: false, data: null, status: null, serverError: error})
            }
        }
        fetchCategoriesData()
    }, [query])

    return categories
}

//FETCH CATEGORIES
export function useFetchMyArtist(query){
    const [ data, setData] = useState({ isFetching: true, data: null, status: null, serverError: null, })
    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const { data, status} = !query ? await axios.get(`/artist/getMyArtists`, {withCredentials: true}) : await axios.get(`/artist/getArtistById/${query}`, {withCredentials: true})
                //console.log('Data from Hooks>>>', data, 'STATUS', status)

                if(status === 200){
                    setData({ isFetching: false, data: data, status: status, serverError: null})
                } else{
                    setData({ isFetching: false, data: null, status: status, serverError: null})
                }
            } catch (error) {
                const errorMsg = error.response.data.data
                toast.error(errorMsg || 'Request Failed')
                setData({ isFetching: false, data: null, status: null, serverError: error})
            }
        }
        fetchArtist()
    }, [query])

    return data
}